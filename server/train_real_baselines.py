from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import balanced_accuracy_score, f1_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import make_pipeline

ROOT = Path(__file__).resolve().parents[1]
LONG_PATH = ROOT / "data" / "real_mithi_water_quality.csv"
WIDE_PATH = ROOT / "data" / "real_mithi_water_quality_wide.csv"
RESULT_PATH = ROOT / "data" / "real_baseline_results.json"
FEATURES = ["pH", "DO", "BOD", "fecal_coliform", "total_coliform"]


def build_wide():
    long = pd.read_csv(LONG_PATH, dtype=str)
    long["value_numeric"] = pd.to_numeric(long["value"], errors="coerce")
    long["quality_status"] = long["notes"].str.extract(r"water quality status: (.*)$", expand=False).replace("", np.nan)
    values = long.pivot_table(index=["date", "station"], columns="parameter", values="value_numeric", aggfunc="first").reset_index()
    status = long.groupby(["date", "station"], as_index=False).agg(
        quality_status=("quality_status", "first"),
        source_document=("source_document", "first"),
        source_url=("source_url", "first"),
        source_pages=("source_page", lambda values: ";".join(sorted(set(values)))),
    )
    wide = status.merge(values, on=["date", "station"], how="left")
    wide = wide.sort_values(["station", "date"]).reset_index(drop=True)
    columns = ["date", "station", *FEATURES, "quality_status", "source_document", "source_url", "source_pages"]
    for column in columns:
        if column not in wide:
            wide[column] = np.nan
    wide[columns].to_csv(WIDE_PATH, index=False)
    return wide[columns]


def chronological_split(frame):
    train_end = max(1, int(len(frame) * 0.70))
    validation_end = max(train_end + 1, int(len(frame) * 0.85))
    return frame.iloc[:train_end], frame.iloc[train_end:validation_end], frame.iloc[validation_end:]


def classification_baseline(wide):
    frame = wide.copy()
    lag_columns = {feature: f"{feature}_lag1" for feature in FEATURES}
    for feature, lag in lag_columns.items():
        frame[lag] = frame.groupby("station")[feature].shift(1)
    frame = frame.dropna(subset=list(lag_columns.values()) + ["quality_status"])
    train, _, test = chronological_split(frame)
    X_train = train[list(lag_columns.values())]
    y_train = train["quality_status"]
    X_test = test[list(lag_columns.values())]
    y_test = test["quality_status"]
    if len(test) == 0:
        return {"status": "not_computable", "reason": "No chronological test rows after lagging."}
    majority = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
    majority_pred = majority.predict(X_test)
    result = {
        "rows": int(len(frame)),
        "train_rows": int(len(train)),
        "test_rows": int(len(test)),
        "classes_train": y_train.value_counts().to_dict(),
        "classes_test": y_test.value_counts().to_dict(),
        "majority_baseline": {
            "balanced_accuracy": float(balanced_accuracy_score(y_test, majority_pred)),
            "macro_f1": float(f1_score(y_test, majority_pred, average="macro", zero_division=0)),
        },
    }
    if y_train.nunique() >= 2:
        model = make_pipeline(SimpleImputer(strategy="median"), LogisticRegression(class_weight="balanced", max_iter=2000))
        model.fit(X_train, y_train)
        prediction = model.predict(X_test)
        result["logistic_regression"] = {
            "balanced_accuracy": float(balanced_accuracy_score(y_test, prediction)),
            "macro_f1": float(f1_score(y_test, prediction, average="macro", zero_division=0)),
        }
    else:
        result["logistic_regression"] = {"status": "not_computable", "reason": "Training period contains one class."}
    return result


def regression_baseline(wide):
    frame = wide.copy()
    frame["BOD_lag1"] = frame.groupby("station")["BOD"].shift(1)
    frame = frame.dropna(subset=["BOD", "BOD_lag1"])
    train, _, test = chronological_split(frame)
    if len(test) == 0:
        return {"status": "not_computable", "reason": "No chronological test rows after lagging."}
    y_train = train["BOD"]
    y_test = test["BOD"]
    persistence = test["BOD_lag1"]
    result = {
        "rows": int(len(frame)),
        "train_rows": int(len(train)),
        "test_rows": int(len(test)),
        "persistence_baseline": {
            "mae": float(mean_absolute_error(y_test, persistence)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, persistence))),
            "r2": float(r2_score(y_test, persistence)),
        },
    }
    model = make_pipeline(SimpleImputer(strategy="median"), Ridge(alpha=1.0))
    model.fit(train[["BOD_lag1"]], y_train)
    prediction = model.predict(test[["BOD_lag1"]])
    result["ridge_regression"] = {
        "mae": float(mean_absolute_error(y_test, prediction)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, prediction))),
        "r2": float(r2_score(y_test, prediction)),
    }
    return result


def main():
    wide = build_wide()
    results = {
        "source": "MPCB_Mithi_River.pdf",
        "station_count": int(wide["station"].nunique()),
        "period_count": int(wide["date"].nunique()),
        "rows": int(len(wide)),
        "missing_by_column": wide.isna().sum().to_dict(),
        "classification": classification_baseline(wide),
        "regression_bod": regression_baseline(wide),
        "model_suitability": {
            "classical_ml": "Suitable for cautious baseline use with chronological validation.",
            "deep_learning": "Not recommended for this single-station, roughly monthly sample without substantially more real stations/years.",
            "hybrid": "Not recommended for final claims; CEEMDAN-BiLSTM-XGBoost would be high variance with this sample size.",
        },
    }
    RESULT_PATH.write_text(json.dumps(results, indent=2, default=str), encoding="utf-8")
    print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    main()
