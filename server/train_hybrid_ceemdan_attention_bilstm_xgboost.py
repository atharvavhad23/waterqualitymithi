"""
CEEMDAN-Attention-BiLSTM-XGBoost hybrid for Mithi River water quality.

The pipeline uses chronological, location-aware windows and supports both:
- WQI classification (Good/Moderate/Poor)
- TDS/BOD/COD multi-output regression

CEEMDAN is used when PyEMD/EMD-signal is installed. A deterministic
moving-average plus residual decomposition is used as a lightweight fallback,
so the training and inference pipeline remains executable on CPU.
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset
from xgboost import XGBClassifier, XGBRegressor

try:
    from PyEMD import CEEMDAN
except ImportError:
    CEEMDAN = None


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
gen_path = os.path.join(BASE_DIR, "mithi_river_genuine_data.csv")
DATA_PATH = gen_path if os.path.exists(gen_path) else os.path.join(BASE_DIR, "mithi_river_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "deep_learning_models", "hybrid")
FEATURES = ["Temp", "DO", "pH", "TDS", "BOD", "COD"]
TARGETS = ["TDS", "BOD", "COD"]


@dataclass
class HybridConfig:
    window_size: int = 6
    sample_rows: int = 20000
    epochs: int = 8
    batch_size: int = 128
    learning_rate: float = 1e-3
    hidden_size: int = 32
    attention_size: int = 32
    selected_features: int = 5
    random_seed: int = 42


class AttentionBiLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, attention_size: int):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True, bidirectional=True)
        self.attention = nn.Sequential(
            nn.Linear(hidden_size * 2, attention_size),
            nn.Tanh(),
            nn.Linear(attention_size, 1),
        )

    def forward(self, x):
        sequence_output, _ = self.lstm(x)
        attention_scores = self.attention(sequence_output).squeeze(-1)
        attention_weights = torch.softmax(attention_scores, dim=1)
        context = torch.sum(sequence_output * attention_weights.unsqueeze(-1), dim=1)
        return context, attention_weights


class AttentionBiLSTMHead(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, attention_size: int, output_size: int, classification: bool):
        super().__init__()
        self.encoder = AttentionBiLSTM(input_size, hidden_size, attention_size)
        self.head = nn.Linear(hidden_size * 2, output_size)
        self.classification = classification

    def forward(self, x):
        context, attention = self.encoder(x)
        return self.head(context), context, attention


def set_seed(seed: int):
    np.random.seed(seed)
    torch.manual_seed(seed)


def decomposition_method() -> str:
    return "CEEMDAN" if CEEMDAN is not None else "moving_average_residual_fallback"


def decompose_series(values: np.ndarray, max_imf: int = 2) -> np.ndarray:
    """Return two stable components for one short feature series."""
    values = np.asarray(values, dtype=np.float64)
    if CEEMDAN is not None and len(values) >= 4:
        try:
            imfs = CEEMDAN(trials=10, parallel=False).ceemdan(values, max_imf=max_imf)
            components = np.asarray(imfs[:max_imf], dtype=np.float64)
            if components.shape[0] == max_imf:
                return components
        except Exception:
            pass

    kernel = min(3, len(values))
    trend = np.convolve(values, np.ones(kernel) / kernel, mode="same")
    if len(values) > 1:
        trend[0] = values[0]
        trend[-1] = values[-1]
    residual = values - trend
    return np.vstack([trend, residual])


def decompose_window(window: np.ndarray) -> np.ndarray:
    components = [decompose_series(window[:, feature_index]) for feature_index in range(window.shape[1])]
    # Each timestep contains the trend/residual pair for every selected feature.
    return np.concatenate(components, axis=0).T.astype(np.float32)


def prepare_dataframe(config: HybridConfig) -> Tuple[pd.DataFrame, Dict[str, int]]:
    df = pd.read_csv(DATA_PATH)
    df = df.sort_values(["Location", "Year"]).reset_index(drop=True)
    if len(df) > config.sample_rows:
        per_location = max(1, config.sample_rows // df["Location"].nunique())
        df = df.groupby("Location", group_keys=False).head(per_location).reset_index(drop=True)
    location_map = {value: index for index, value in enumerate(sorted(df["Location"].unique()))}
    df["Location_Encoded"] = df["Location"].map(location_map)
    df[FEATURES] = df[FEATURES].interpolate().ffill().bfill()
    return df, location_map


def make_windows(df: pd.DataFrame, feature_names: List[str], config: HybridConfig):
    X, y_class, y_reg, groups = [], [], [], []
    for location, group in df.groupby("Location", sort=False):
        group = group.sort_values("Year")
        if len(group) < config.window_size:
            continue
        for end in range(config.window_size, len(group)):
            window = group.iloc[end - config.window_size:end][feature_names].to_numpy(dtype=np.float32)
            X.append(decompose_window(window))
            y_class.append(group.iloc[end]["WQI"])
            y_reg.append(group.iloc[end][TARGETS].to_numpy(dtype=np.float32))
            groups.append(location)
    return np.asarray(X), np.asarray(y_class), np.asarray(y_reg), groups


def select_features(df: pd.DataFrame, config: HybridConfig, classification: bool) -> List[str]:
    X = df[FEATURES].to_numpy(dtype=np.float32)
    if classification:
        y = LabelEncoder().fit_transform(df["WQI"])
        scores = mutual_info_classif(X, y, random_state=config.random_seed)
    else:
        scores = np.mean([
            mutual_info_regression(X, df[target].to_numpy(), random_state=config.random_seed)
            for target in TARGETS
        ], axis=0)
    order = np.argsort(scores)[::-1][:config.selected_features]
    return [FEATURES[index] for index in order]


def chronological_split(X, y_class, y_reg):
    train_end = int(len(X) * 0.70)
    val_end = int(len(X) * 0.85)
    return (
        (X[:train_end], y_class[:train_end], y_reg[:train_end]),
        (X[train_end:val_end], y_class[train_end:val_end], y_reg[train_end:val_end]),
        (X[val_end:], y_class[val_end:], y_reg[val_end:]),
    )


def train_bilstm(X_train, y_train, X_val, y_val, config: HybridConfig, classification: bool, num_classes: int = 3):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    output_size = num_classes if classification else len(TARGETS)
    model = AttentionBiLSTMHead(X_train.shape[2], config.hidden_size, config.attention_size, output_size, classification).to(device)
    if classification:
        counts = np.bincount(y_train, minlength=num_classes)
        weights = torch.tensor(np.max(counts) / np.maximum(counts, 1), dtype=torch.float32, device=device)
        criterion = nn.CrossEntropyLoss(weight=weights)
    else:
        criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)
    train_loader = DataLoader(TensorDataset(torch.tensor(X_train), torch.tensor(y_train)), batch_size=config.batch_size, shuffle=True)
    best_state, best_score = None, -np.inf if classification else np.inf

    for _ in range(config.epochs):
        model.train()
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            output, _, _ = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            val_output, _, _ = model(torch.tensor(X_val).to(device))
        if classification:
            score = f1_score(y_val, val_output.argmax(1).cpu(), average="macro", zero_division=0)
            improved = score > best_score
        else:
            score = float(torch.sqrt(torch.mean((val_output.cpu() - torch.tensor(y_val)) ** 2)))
            improved = score < best_score
        if improved:
            best_score = score
            best_state = {key: value.detach().cpu().clone() for key, value in model.state_dict().items()}

    if best_state:
        model.load_state_dict(best_state)
    return model, device


def embeddings(model, X, device):
    model.eval()
    with torch.no_grad():
        output, context, attention = model(torch.tensor(X).to(device))
    return output.cpu().numpy(), context.cpu().numpy(), attention.cpu().numpy()


def train_xgb_classifier(X_train, y_train, X_val, y_val, X_test, y_test, num_classes: int):
    model = XGBClassifier(
        n_estimators=180,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="multi:softprob",
        num_class=num_classes,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=2,
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    prediction = model.predict(X_test)
    return model, {
        "accuracy": float(accuracy_score(y_test, prediction)),
        "macro_f1": float(f1_score(y_test, prediction, average="macro", zero_division=0)),
        "weighted_f1": float(f1_score(y_test, prediction, average="weighted", zero_division=0)),
        "report": classification_report(y_test, prediction, output_dict=True, zero_division=0),
    }


def train_xgb_regressor(X_train, y_train, X_val, y_val, X_test, y_test):
    models, predictions = [], []
    for target_index in range(len(TARGETS)):
        model = XGBRegressor(
            n_estimators=180,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.85,
            colsample_bytree=0.85,
            objective="reg:squarederror",
            random_state=42,
            n_jobs=2,
        )
        model.fit(X_train, y_train[:, target_index], eval_set=[(X_val, y_val[:, target_index])], verbose=False)
        models.append(model)
        predictions.append(model.predict(X_test))
    prediction = np.column_stack(predictions)
    return models, {
        "mae": float(mean_absolute_error(y_test, prediction)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, prediction))),
        "r2": float(r2_score(y_test, prediction, multioutput="uniform_average")),
    }


def run_hybrid_pipeline():
    config = HybridConfig()
    np.random.seed(config.random_seed)
    torch.manual_seed(config.random_seed)
    os.makedirs(MODEL_DIR, exist_ok=True)
    df, location_map = prepare_dataframe(config)

    selected_class = select_features(df, config, classification=True)
    selected_reg = select_features(df, config, classification=False)
    selected = sorted(set(selected_class + selected_reg))
    selected_indices = [FEATURES.index(feature) for feature in selected]

    X, y_class_labels, y_reg, _ = make_windows(df, selected, config)
    label_encoder = LabelEncoder()
    y_class = label_encoder.fit_transform(y_class_labels)
    (train, val, test) = chronological_split(X, y_class, y_reg)
    X_train, y_train_class, y_train_reg = train
    X_val, y_val_class, y_val_reg = val
    X_test, y_test_class, y_test_reg = test

    # Fit preprocessing on the training period only to avoid future leakage.
    scaler = MinMaxScaler()
    X_train = scaler.fit_transform(X_train.reshape(len(X_train), -1)).reshape(X_train.shape)
    X_val = scaler.transform(X_val.reshape(len(X_val), -1)).reshape(X_val.shape)
    X_test = scaler.transform(X_test.reshape(len(X_test), -1)).reshape(X_test.shape)

    class_model, device = train_bilstm(X_train, y_train_class, X_val, y_val_class, config, True, len(label_encoder.classes_))
    _, class_train_embedding, _ = embeddings(class_model, X_train, device)
    _, class_val_embedding, _ = embeddings(class_model, X_val, device)
    _, class_test_embedding, class_attention = embeddings(class_model, X_test, device)
    class_xgb, class_metrics = train_xgb_classifier(
        np.column_stack([class_train_embedding, X_train[:, -1, :]]), y_train_class,
        np.column_stack([class_val_embedding, X_val[:, -1, :]]), y_val_class,
        np.column_stack([class_test_embedding, X_test[:, -1, :]]), y_test_class,
        len(label_encoder.classes_),
    )

    reg_model, _ = train_bilstm(X_train, y_train_reg, X_val, y_val_reg, config, False)
    _, reg_train_embedding, _ = embeddings(reg_model, X_train, device)
    _, reg_val_embedding, _ = embeddings(reg_model, X_val, device)
    _, reg_test_embedding, _ = embeddings(reg_model, X_test, device)
    reg_models, reg_metrics = train_xgb_regressor(
        np.column_stack([reg_train_embedding, X_train[:, -1, :]]), y_train_reg,
        np.column_stack([reg_val_embedding, X_val[:, -1, :]]), y_val_reg,
        np.column_stack([reg_test_embedding, X_test[:, -1, :]]), y_test_reg,
    )

    torch.save(class_model.state_dict(), os.path.join(MODEL_DIR, "attention_bilstm_classifier.pt"))
    torch.save(reg_model.state_dict(), os.path.join(MODEL_DIR, "attention_bilstm_regressor.pt"))
    joblib.dump(class_xgb, os.path.join(MODEL_DIR, "xgboost_classifier.pkl"))
    joblib.dump(reg_models, os.path.join(MODEL_DIR, "xgboost_regressors.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "hybrid_scaler.pkl"))
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, "hybrid_label_encoder.pkl"))
    joblib.dump({"locations": location_map, "features": selected, "window_size": config.window_size}, os.path.join(MODEL_DIR, "hybrid_metadata.pkl"))

    summary = {
        "architecture": "CEEMDAN-Attention-BiLSTM-XGBoost",
        "decomposition": decomposition_method(),
        "config": asdict(config),
        "selected_features_classification": selected_class,
        "selected_features_regression": selected_reg,
        "labels": label_encoder.classes_.tolist(),
        "classification": class_metrics,
        "regression": reg_metrics,
        "selection_rule": "XGBoost classification by macro-F1; XGBoost regression by lowest RMSE and highest R2.",
    }
    with open(os.path.join(MODEL_DIR, "hybrid_summary.json"), "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, default=str)

    print("===== HYBRID PIPELINE COMPLETE =====")
    print("Architecture:", summary["architecture"])
    print("Decomposition:", summary["decomposition"])
    print("Selected classification features:", selected_class)
    print("Selected regression features:", selected_reg)
    print("Classification:", {key: class_metrics[key] for key in ["accuracy", "macro_f1", "weighted_f1"]})
    print("Regression:", reg_metrics)
    print("Artifacts saved in:", MODEL_DIR)
    return summary


class HybridWaterQualityPipeline:
    """Load saved hybrid artifacts and predict from prior readings."""

    def __init__(self, model_dir: str = MODEL_DIR):
        self.model_dir = model_dir
        with open(os.path.join(model_dir, "hybrid_summary.json"), "r", encoding="utf-8") as handle:
            self.summary = json.load(handle)
        metadata = joblib.load(os.path.join(model_dir, "hybrid_metadata.pkl"))
        self.features = metadata["features"]
        self.window_size = metadata["window_size"]
        self.scaler = joblib.load(os.path.join(model_dir, "hybrid_scaler.pkl"))
        self.label_encoder = joblib.load(os.path.join(model_dir, "hybrid_label_encoder.pkl"))
        self.classifier = joblib.load(os.path.join(model_dir, "xgboost_classifier.pkl"))
        self.regressors = joblib.load(os.path.join(model_dir, "xgboost_regressors.pkl"))
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        derived_features = len(self.features) * 2
        config = self.summary["config"]
        self.class_lstm = AttentionBiLSTMHead(
            derived_features, config["hidden_size"], config["attention_size"], len(self.label_encoder.classes_), True
        ).to(self.device)
        self.reg_lstm = AttentionBiLSTMHead(
            derived_features, config["hidden_size"], config["attention_size"], len(TARGETS), False
        ).to(self.device)
        self.class_lstm.load_state_dict(torch.load(os.path.join(model_dir, "attention_bilstm_classifier.pt"), map_location=self.device))
        self.reg_lstm.load_state_dict(torch.load(os.path.join(model_dir, "attention_bilstm_regressor.pt"), map_location=self.device))
        self.class_lstm.eval()
        self.reg_lstm.eval()

    def _features_from_history(self, history: List[Dict]) -> np.ndarray:
        if len(history) < self.window_size:
            raise ValueError(f"At least {self.window_size} prior readings are required.")
        frame = pd.DataFrame(history[-self.window_size:])
        missing = [feature for feature in self.features if feature not in frame.columns]
        if missing:
            raise ValueError(f"Missing history fields: {', '.join(missing)}")
        window = frame[self.features].astype(float).to_numpy(dtype=np.float32)
        derived = decompose_window(window)[None, ...]
        scaled = self.scaler.transform(derived.reshape(1, -1)).reshape(derived.shape)
        return scaled

    def predict(self, history: List[Dict]) -> Dict:
        X = self._features_from_history(history)
        with torch.no_grad():
            class_output, class_context, attention = self.class_lstm(torch.tensor(X).to(self.device))
            _, reg_context, _ = self.reg_lstm(torch.tensor(X).to(self.device))
        class_input = np.column_stack([class_context.cpu().numpy(), X[:, -1, :]])
        reg_input = np.column_stack([reg_context.cpu().numpy(), X[:, -1, :]])
        class_index = int(self.classifier.predict(class_input)[0])
        probabilities = self.classifier.predict_proba(class_input)[0]
        regression_values = [float(model.predict(reg_input)[0]) for model in self.regressors]
        return {
            "classification": {
                "prediction": self.label_encoder.inverse_transform([class_index])[0],
                "probabilities": {
                    label: float(probability)
                    for label, probability in zip(self.label_encoder.classes_, probabilities)
                },
            },
            "regression": dict(zip(TARGETS, regression_values)),
            "attention_weights": attention.cpu().numpy()[0].tolist(),
            "architecture": self.summary["architecture"],
            "decomposition": self.summary["decomposition"],
        }


if __name__ == "__main__":
    run_hybrid_pipeline()
