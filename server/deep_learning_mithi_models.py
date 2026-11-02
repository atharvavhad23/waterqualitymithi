"""
Deep learning comparison for Mithi River water quality prediction.

This script implements a shared time-series preprocessing pipeline and trains
four model families for both classification and regression tasks:
- ANN
- CNN
- RNN
- LSTM

It compares their performance on the same windowed input data and saves the
best-performing configuration for each task.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score, classification_report, f1_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset


gen_path = os.path.join(os.path.dirname(__file__), "mithi_river_genuine_data.csv")
DATA_PATH = gen_path if os.path.exists(gen_path) else os.path.join(os.path.dirname(__file__), "mithi_river_data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "deep_learning_models")


@dataclass
class TrainingConfig:
    window_size: int = 6
    batch_size: int = 64
    epochs: int = 6
    learning_rate: float = 1e-3
    sample_rows: int = 20000
    random_seed: int = 42
    val_ratio: float = 0.15
    test_ratio: float = 0.15


class SequenceDataset:
    def __init__(self, X: np.ndarray, y: np.ndarray):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32 if y.ndim > 1 else torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


class ANNClassifier(nn.Module):
    def __init__(self, input_size: int, num_classes: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(input_size, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        return self.net(x)


class CNNClassifier(nn.Module):
    def __init__(self, input_size: int, num_classes: int):
        super().__init__()
        num_features = 8
        self.conv = nn.Sequential(
            nn.Conv1d(num_features, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.conv(x)
        return self.head(x)


class RNNClassifier(nn.Module):
    def __init__(self, input_size: int, num_classes: int):
        super().__init__()
        hidden_size = 32
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True, nonlinearity="tanh")
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.fc(out[:, -1, :])


class LSTMClassifier(nn.Module):
    def __init__(self, input_size: int, num_classes: int):
        super().__init__()
        hidden_size = 32
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class ANNRegressor(nn.Module):
    def __init__(self, input_size: int, output_size: int = 3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(input_size, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, output_size),
        )

    def forward(self, x):
        return self.net(x)


class CNNRegressor(nn.Module):
    def __init__(self, input_size: int, output_size: int = 3):
        super().__init__()
        num_features = 8
        self.conv = nn.Sequential(
            nn.Conv1d(num_features, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32, 32),
            nn.ReLU(),
            nn.Linear(32, output_size),
        )

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.conv(x)
        return self.head(x)


class RNNRegressor(nn.Module):
    def __init__(self, input_size: int, output_size: int = 3):
        super().__init__()
        hidden_size = 32
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True, nonlinearity="tanh")
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.fc(out[:, -1, :])


class LSTMRegressor(nn.Module):
    def __init__(self, input_size: int, output_size: int = 3):
        super().__init__()
        hidden_size = 32
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


def set_seed(seed: int):
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def create_windowed_sequences(df: pd.DataFrame, feature_cols: List[str], target_name: str, window_size: int = 6, task: str = "classification"):
    if df.empty:
        raise ValueError("Input dataframe is empty.")

    X_list, y_list = [], []
    for idx in range(window_size - 1, len(df)):
        seq = df.iloc[idx - window_size + 1: idx + 1][feature_cols].values
        X_list.append(seq)
        if task == "classification":
            y_list.append(df.iloc[idx][target_name])
        else:
            y_list.append(df.iloc[idx][["TDS", "BOD", "COD"]].values)

    X = np.asarray(X_list, dtype=np.float32)
    y = np.asarray(y_list)
    return X, y


def build_classification_dataset(df: pd.DataFrame, config: TrainingConfig):
    feature_cols = ["Year", "Location_Encoded", "Temp", "DO", "pH", "TDS", "BOD", "COD"]
    X, y_labels = create_windowed_sequences(df, feature_cols, target_name="WQI", window_size=config.window_size, task="classification")

    encoder = LabelEncoder()
    y_enc = encoder.fit_transform(y_labels)
    class_counts = np.bincount(y_enc)
    class_weights = torch.tensor(np.max(class_counts) / np.maximum(class_counts, 1), dtype=torch.float32)

    scaler = MinMaxScaler()
    X_2d = X.reshape(X.shape[0], -1)
    X_scaled = scaler.fit_transform(X_2d).reshape(X.shape[0], config.window_size, len(feature_cols))

    return X_scaled, y_enc, encoder, scaler, class_weights


def build_regression_dataset(df: pd.DataFrame, config: TrainingConfig):
    feature_cols = ["Year", "Location_Encoded", "Temp", "DO", "pH", "TDS", "BOD", "COD"]
    X, y = create_windowed_sequences(df, feature_cols, target_name="WQI", window_size=config.window_size, task="regression")

    scaler = MinMaxScaler()
    X_2d = X.reshape(X.shape[0], -1)
    X_scaled = scaler.fit_transform(X_2d).reshape(X.shape[0], config.window_size, len(feature_cols))
    y = y.astype(np.float32)
    return X_scaled, y, scaler


def make_loaders(X: np.ndarray, y: np.ndarray, batch_size: int, val_ratio: float, test_ratio: float):
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=(val_ratio + test_ratio), shuffle=False)
    val_size = int(len(X_temp) * (val_ratio / (val_ratio + test_ratio)))
    X_val, X_test = X_temp[:val_size], X_temp[val_size:]
    y_val, y_test = y_temp[:val_size], y_temp[val_size:]

    train_loader = DataLoader(TensorDataset(torch.tensor(X_train), torch.tensor(y_train)), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(TensorDataset(torch.tensor(X_val), torch.tensor(y_val)), batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(TensorDataset(torch.tensor(X_test), torch.tensor(y_test)), batch_size=batch_size, shuffle=False)
    return train_loader, val_loader, test_loader


def train_epoch(model, loader, criterion, optimizer, device, task):
    model.train()
    total_loss = 0.0
    for x_batch, y_batch in loader:
        x_batch = x_batch.to(device)
        y_batch = y_batch.to(device)
        optimizer.zero_grad()
        logits = model(x_batch)
        loss = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()
        total_loss += float(loss.item()) * len(x_batch)
    return total_loss / len(loader.dataset)


def evaluate_classification(model, loader, device):
    model.eval()
    all_pred = []
    all_true = []
    with torch.no_grad():
        for x_batch, y_batch in loader:
            x_batch = x_batch.to(device)
            pred = model(x_batch)
            all_pred.extend(torch.argmax(pred, dim=1).cpu().numpy())
            all_true.extend(y_batch.cpu().numpy())
    y_true = np.asarray(all_true)
    y_pred = np.asarray(all_pred)
    acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average="macro")
    weighted_f1 = f1_score(y_true, y_pred, average="weighted")
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    return {"accuracy": acc, "macro_f1": macro_f1, "weighted_f1": weighted_f1, "report": report}


def evaluate_regression(model, loader, device):
    model.eval()
    all_pred, all_true = [], []
    with torch.no_grad():
        for x_batch, y_batch in loader:
            x_batch = x_batch.to(device)
            pred = model(x_batch)
            all_pred.extend(pred.cpu().numpy())
            all_true.extend(y_batch.cpu().numpy())
    y_true = np.asarray(all_true)
    y_pred = np.asarray(all_pred)
    mae = mean_absolute_error(y_true, y_pred, multioutput="raw_values") if y_true.ndim > 1 else mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred, multioutput="raw_values") if y_true.ndim > 1 else mean_squared_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred, multioutput="raw_values") if y_true.ndim > 1 else r2_score(y_true, y_pred)
    result = {
        "mae": np.asarray(mae).mean() if isinstance(mae, np.ndarray) else float(mae),
        "rmse": np.sqrt(np.asarray(mse).mean()) if isinstance(mse, np.ndarray) else float(np.sqrt(mse)),
        "r2": np.asarray(r2).mean() if isinstance(r2, np.ndarray) else float(r2),
    }
    return result


def train_classification_model(model_name: str, X: np.ndarray, y: np.ndarray, class_weights: torch.Tensor, config: TrainingConfig, device: torch.device):
    train_loader, val_loader, test_loader = make_loaders(X, y, config.batch_size, config.val_ratio, config.test_ratio)
    model_map = {
        "ann": ANNClassifier(X.shape[1] * X.shape[2], len(np.unique(y))),
        "cnn": CNNClassifier(X.shape[1] * X.shape[2], len(np.unique(y))),
        "rnn": RNNClassifier(X.shape[2], len(np.unique(y))),
        "lstm": LSTMClassifier(X.shape[2], len(np.unique(y))),
    }
    model = model_map[model_name.lower()].to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)

    best_val = -np.inf
    best_state = None
    for _ in range(config.epochs):
        train_epoch(model, train_loader, criterion, optimizer, device, "classification")
        val_metrics = evaluate_classification(model, val_loader, device)
        if val_metrics["macro_f1"] > best_val:
            best_val = val_metrics["macro_f1"]
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}

    if best_state is not None:
        model.load_state_dict(best_state)

    test_metrics = evaluate_classification(model, test_loader, device)
    return model, test_metrics


def train_regression_model(model_name: str, X: np.ndarray, y: np.ndarray, config: TrainingConfig, device: torch.device):
    train_loader, val_loader, test_loader = make_loaders(X, y, config.batch_size, config.val_ratio, config.test_ratio)
    model_map = {
        "ann": ANNRegressor(X.shape[1] * X.shape[2], y.shape[1]),
        "cnn": CNNRegressor(X.shape[1] * X.shape[2], y.shape[1]),
        "rnn": RNNRegressor(X.shape[2], y.shape[1]),
        "lstm": LSTMRegressor(X.shape[2], y.shape[1]),
    }
    model = model_map[model_name.lower()].to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)

    best_val = np.inf
    best_state = None
    for _ in range(config.epochs):
        train_epoch(model, train_loader, criterion, optimizer, device, "regression")
        val_metrics = evaluate_regression(model, val_loader, device)
        if val_metrics["rmse"] < best_val:
            best_val = val_metrics["rmse"]
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}

    if best_state is not None:
        model.load_state_dict(best_state)

    test_metrics = evaluate_regression(model, test_loader, device)
    return model, test_metrics


def save_results(result_path: str, payload: Dict):
    os.makedirs(os.path.dirname(result_path), exist_ok=True)
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)


def run_deep_learning_pipeline():
    set_seed(42)
    config = TrainingConfig()
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    df = df.sort_values(["Year", "Location"]).reset_index(drop=True)
    if len(df) > config.sample_rows:
        df = df.head(config.sample_rows).copy()

    # Encode location in a chronological-friendly way for time-series windowing
    location_map = {loc: idx for idx, loc in enumerate(sorted(df["Location"].unique().tolist()))}
    df["Location_Encoded"] = df["Location"].map(location_map)

    # Classification tasks
    X_clf, y_clf, label_encoder, clf_scaler, class_weights = build_classification_dataset(df, config)
    class_results = {}
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    for model_name in ["ann", "cnn", "rnn", "lstm"]:
        model, metrics = train_classification_model(model_name, X_clf, y_clf, class_weights, config, device)
        class_results[model_name.upper()] = metrics
        torch.save(model.state_dict(), os.path.join(MODEL_DIR, f"classification_{model_name}.pt"))

    best_class_model = max(class_results.items(), key=lambda item: item[1]["macro_f1"])[0].lower()
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, "classification_label_encoder.pkl"))
    joblib.dump(clf_scaler, os.path.join(MODEL_DIR, "classification_scaler.pkl"))

    # Regression tasks
    X_reg, y_reg, reg_scaler = build_regression_dataset(df, config)
    reg_results = {}
    for model_name in ["ann", "cnn", "rnn", "lstm"]:
        model, metrics = train_regression_model(model_name, X_reg, y_reg, config, device)
        reg_results[model_name.upper()] = metrics
        torch.save(model.state_dict(), os.path.join(MODEL_DIR, f"regression_{model_name}.pt"))

    best_reg_model = min(reg_results.items(), key=lambda item: item[1]["rmse"])[0].lower()
    joblib.dump(reg_scaler, os.path.join(MODEL_DIR, "regression_scaler.pkl"))

    payload = {
        "config": asdict(config),
        "classification": {
            "best_model": best_class_model,
            "results": class_results,
            "labels": label_encoder.classes_.tolist(),
        },
        "regression": {
            "best_model": best_reg_model,
            "results": reg_results,
            "targets": ["TDS", "BOD", "COD"],
        },
    }
    save_results(os.path.join(MODEL_DIR, "deep_learning_summary.json"), payload)

    print("\n===== DEEP LEARNING WATER QUALITY PIPELINE COMPLETE =====")
    print(f"Best classification model: {best_class_model.upper()}")
    print(f"Best regression model: {best_reg_model.upper()}")
    for key, value in class_results.items():
        print(f"[{key}] Accuracy={value['accuracy']:.4f}, Macro-F1={value['macro_f1']:.4f}, Weighted-F1={value['weighted_f1']:.4f}")
    for key, value in reg_results.items():
        print(f"[{key}] RMSE={value['rmse']:.4f}, R2={value['r2']:.4f}, MAE={value['mae']:.4f}")
    print("Artifacts saved in:", MODEL_DIR)
    return payload


class DeepLearningWaterQualityPipeline:
    def __init__(self, model_dir: str = MODEL_DIR):
        self.model_dir = model_dir
        self.classification_scaler = joblib.load(os.path.join(model_dir, "classification_scaler.pkl"))
        self.regression_scaler = joblib.load(os.path.join(model_dir, "regression_scaler.pkl"))
        self.label_encoder = joblib.load(os.path.join(model_dir, "classification_label_encoder.pkl"))
        self.classification_config = json.load(open(os.path.join(model_dir, "deep_learning_summary.json"), "r", encoding="utf-8"))
        self.classification_model_name = self.classification_config["classification"]["best_model"]
        self.regression_model_name = self.classification_config["regression"]["best_model"]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.classifier = self._load_model("classification", self.classification_model_name)
        self.regressor = self._load_model("regression", self.regression_model_name)

    def _load_model(self, task: str, model_name: str):
        if task == "classification":
            model = ANNClassifier(6 * 8, len(self.label_encoder.classes_)) if model_name == "ann" else (
                CNNClassifier(6 * 8, len(self.label_encoder.classes_)) if model_name == "cnn" else (
                    RNNClassifier(8, len(self.label_encoder.classes_)) if model_name == "rnn" else LSTMClassifier(8, len(self.label_encoder.classes_))
                )
            )
            model.load_state_dict(torch.load(os.path.join(self.model_dir, f"classification_{model_name}.pt"), map_location=self.device))
            model.to(self.device)
            model.eval()
            return model

        output_size = 3
        model = ANNRegressor(6 * 8, output_size) if model_name == "ann" else (
            CNNRegressor(6 * 8, output_size) if model_name == "cnn" else (
                RNNRegressor(8, output_size) if model_name == "rnn" else LSTMRegressor(8, output_size)
            )
        )
        model.load_state_dict(torch.load(os.path.join(self.model_dir, f"regression_{model_name}.pt"), map_location=self.device))
        model.to(self.device)
        model.eval()
        return model

    def predict_class(self, record: Dict[str, float], model_name: str | None = None):
        feature_cols = ["Year", "Location_Encoded", "Temp", "DO", "pH", "TDS", "BOD", "COD"]
        row = pd.DataFrame([record] * 6)
        row["Location_Encoded"] = 0
        window = row[feature_cols].values.astype(np.float32)
        window = self.classification_scaler.transform(window.reshape(1, -1)).reshape(1, 6, len(feature_cols))
        x = torch.tensor(window, dtype=torch.float32).to(self.device)
        classifier = self.classifier if model_name is None else self._load_model("classification", model_name)
        with torch.no_grad():
            logits = classifier(x)
            pred_idx = torch.argmax(logits, dim=1).item()
        return self.label_encoder.inverse_transform([pred_idx])[0]

    def predict_regression(self, record: Dict[str, float], model_name: str | None = None):
        feature_cols = ["Year", "Location_Encoded", "Temp", "DO", "pH", "TDS", "BOD", "COD"]
        row = pd.DataFrame([record] * 6)
        row["Location_Encoded"] = 0
        window = row[feature_cols].values.astype(np.float32)
        window = self.regression_scaler.transform(window.reshape(1, -1)).reshape(1, 6, len(feature_cols))
        x = torch.tensor(window, dtype=torch.float32).to(self.device)
        regressor = self.regressor if model_name is None else self._load_model("regression", model_name)
        with torch.no_grad():
            pred = regressor(x).cpu().numpy()[0]
        return {"TDS": float(pred[0]), "BOD": float(pred[1]), "COD": float(pred[2])}


if __name__ == "__main__":
    run_deep_learning_pipeline()
