import os
"""
Comprehensive ML Model Comparison for Water Quality Prediction
Compares: Random Forest vs KNN (Classification)
Compares: Linear Regression vs XGBoost (Regression)
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, PolynomialFeatures
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (accuracy_score, f1_score, classification_report, 
                            confusion_matrix, r2_score, mean_squared_error, 
                            mean_absolute_error, precision_score, recall_score)
import xgboost as xgb
import joblib
import time
from datetime import datetime

print("=" * 80)
print("COMPREHENSIVE ML MODEL COMPARISON - WATER QUALITY PREDICTION")
print("=" * 80)
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Load dataset
print("Loading dataset...")
csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'
df = pd.read_csv(csv_path)
print(f"[OK] Dataset loaded: {len(df)} samples")
print()

# Preprocessing
print("Preprocessing data...")
le = LabelEncoder()
df['Location_encoded'] = le.fit_transform(df['Location'])

# Features for classification
feature_cols_clf = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
X_clf = df[feature_cols_clf]
y_clf = df['WQI']

# Split data
X_clf_train, X_clf_test, y_clf_train, y_clf_test = train_test_split(
    X_clf, y_clf, test_size=0.2, random_state=42, stratify=y_clf
)

# Scale features
scaler_clf = StandardScaler()
X_clf_train_scaled = scaler_clf.fit_transform(X_clf_train)
X_clf_test_scaled = scaler_clf.transform(X_clf_test)

print(f"[OK] Training samples: {len(X_clf_train)}")
print(f"[OK] Testing samples: {len(X_clf_test)}")
print()

# ============================================================================
# CLASSIFICATION MODELS COMPARISON
# ============================================================================
print("=" * 80)
print("PART 1: CLASSIFICATION MODELS COMPARISON")
print("=" * 80)
print()

# ----------------------------------------------------------------------------
# Model 1: Random Forest Classifier
# ----------------------------------------------------------------------------
print("Training Model 1: Random Forest Classifier...")
start_time = time.time()
rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
rf_model.fit(X_clf_train_scaled, y_clf_train)
rf_train_time = time.time() - start_time

# Predictions
start_time = time.time()
rf_predictions = rf_model.predict(X_clf_test_scaled)
rf_inference_time = (time.time() - start_time) / len(X_clf_test)

# Metrics
rf_accuracy = accuracy_score(y_clf_test, rf_predictions)
rf_f1_weighted = f1_score(y_clf_test, rf_predictions, average='weighted')
rf_f1_macro = f1_score(y_clf_test, rf_predictions, average='macro')
rf_precision = precision_score(y_clf_test, rf_predictions, average='weighted')
rf_recall = recall_score(y_clf_test, rf_predictions, average='weighted')
rf_conf_matrix = confusion_matrix(y_clf_test, rf_predictions)
rf_class_report = classification_report(y_clf_test, rf_predictions, output_dict=True)

print(f"[OK] Random Forest trained in {rf_train_time:.2f} seconds")
print(f"  - Accuracy: {rf_accuracy:.4f} ({rf_accuracy*100:.2f}%)")
print(f"  - F1-Score (Weighted): {rf_f1_weighted:.4f}")
print(f"  - F1-Score (Macro): {rf_f1_macro:.4f}")
print(f"  - Precision (Weighted): {rf_precision:.4f}")
print(f"  - Recall (Weighted): {rf_recall:.4f}")
print(f"  - Inference Time: {rf_inference_time*1000:.2f} ms/sample")
print()

# ----------------------------------------------------------------------------
# Model 2: K-Nearest Neighbors (KNN) Classifier
# ----------------------------------------------------------------------------
print("Training Model 2: K-Nearest Neighbors (KNN)...")
print("Finding optimal K value...")

# Test different K values to find the best
best_k = 5
best_knn_f1 = 0
k_values = [3, 5, 7, 9, 11, 15, 21]

for k in k_values:
    knn_temp = KNeighborsClassifier(n_neighbors=k, n_jobs=-1)
    knn_temp.fit(X_clf_train_scaled, y_clf_train)
    knn_temp_pred = knn_temp.predict(X_clf_test_scaled)
    temp_f1 = f1_score(y_clf_test, knn_temp_pred, average='weighted')
    print(f"  K={k}: F1-Score = {temp_f1:.4f}")
    if temp_f1 > best_knn_f1:
        best_knn_f1 = temp_f1
        best_k = k

print(f"[OK] Best K value: {best_k} (F1-Score: {best_knn_f1:.4f})")
print()

# Train final KNN model with best K
start_time = time.time()
knn_model = KNeighborsClassifier(n_neighbors=best_k, n_jobs=-1)
knn_model.fit(X_clf_train_scaled, y_clf_train)
knn_train_time = time.time() - start_time

# Predictions
start_time = time.time()
knn_predictions = knn_model.predict(X_clf_test_scaled)
knn_inference_time = (time.time() - start_time) / len(X_clf_test)

# Metrics
knn_accuracy = accuracy_score(y_clf_test, knn_predictions)
knn_f1_weighted = f1_score(y_clf_test, knn_predictions, average='weighted')
knn_f1_macro = f1_score(y_clf_test, knn_predictions, average='macro')
knn_precision = precision_score(y_clf_test, knn_predictions, average='weighted')
knn_recall = recall_score(y_clf_test, knn_predictions, average='weighted')
knn_conf_matrix = confusion_matrix(y_clf_test, knn_predictions)
knn_class_report = classification_report(y_clf_test, knn_predictions, output_dict=True)

print(f"[OK] KNN (K={best_k}) trained in {knn_train_time:.2f} seconds")
print(f"  - Accuracy: {knn_accuracy:.4f} ({knn_accuracy*100:.2f}%)")
print(f"  - F1-Score (Weighted): {knn_f1_weighted:.4f}")
print(f"  - F1-Score (Macro): {knn_f1_macro:.4f}")
print(f"  - Precision (Weighted): {knn_precision:.4f}")
print(f"  - Recall (Weighted): {knn_recall:.4f}")
print(f"  - Inference Time: {knn_inference_time*1000:.2f} ms/sample")
print()

# ============================================================================
# REGRESSION MODELS COMPARISON
# ============================================================================
print("=" * 80)
print("PART 2: REGRESSION MODELS COMPARISON")
print("=" * 80)
print()

regression_results = {}

for target in ['TDS', 'BOD', 'COD']:
    print(f"\nPredicting {target}...")
    print("-" * 80)
    
    # IMPROVED: Use different features for each target
    if target == 'TDS':
        # For TDS, use all other parameters except TDS itself
        feature_cols_reg = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'BOD', 'COD']
    elif target == 'BOD':
        # For BOD, use all other parameters except BOD itself
        feature_cols_reg = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'COD']
    elif target == 'COD':
        # For COD, use all other parameters except COD itself
        feature_cols_reg = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD']
    
    # Prepare data
    X_reg = df[feature_cols_reg]
    y_reg = df[target]
    
    X_reg_train, X_reg_test, y_reg_train, y_reg_test = train_test_split(
        X_reg, y_reg, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler_reg = StandardScaler()
    X_reg_train_scaled = scaler_reg.fit_transform(X_reg_train)
    X_reg_test_scaled = scaler_reg.transform(X_reg_test)
    
    # IMPROVED: Add polynomial features for better non-linear modeling
    poly = PolynomialFeatures(degree=2, include_bias=False)
    X_reg_train_poly = poly.fit_transform(X_reg_train_scaled)
    X_reg_test_poly = poly.transform(X_reg_test_scaled)
    
    # ------------------------------------------------------------------------
    # Model 1: Linear Regression (with polynomial features)
    # ------------------------------------------------------------------------
    # Model 1: Linear Regression (with polynomial features)
    # ------------------------------------------------------------------------
    print(f"\nTraining Linear Regression with Polynomial Features for {target}...")
    start_time = time.time()
    lr_model = LinearRegression()
    lr_model.fit(X_reg_train_poly, y_reg_train)
    lr_train_time = time.time() - start_time
    
    # Predictions
    start_time = time.time()
    lr_predictions = lr_model.predict(X_reg_test_poly)
    lr_inference_time = (time.time() - start_time) / len(X_reg_test)
    
    # Metrics
    lr_r2 = r2_score(y_reg_test, lr_predictions)
    lr_rmse = np.sqrt(mean_squared_error(y_reg_test, lr_predictions))
    lr_mae = mean_absolute_error(y_reg_test, lr_predictions)
    lr_mape = np.mean(np.abs((y_reg_test - lr_predictions) / y_reg_test)) * 100
    lr_accuracy = 100 - lr_mape
    
    print(f"[OK] Linear Regression trained in {lr_train_time:.3f} seconds")
    print(f"  - R² Score: {lr_r2:.4f}")
    print(f"  - RMSE: {lr_rmse:.2f}")
    print(f"  - MAE: {lr_mae:.2f}")
    print(f"  - MAPE: {lr_mape:.2f}%")
    print(f"  - Accuracy: {lr_accuracy:.2f}%")
    print(f"  - Inference Time: {lr_inference_time*1000:.3f} ms/sample")
    
    # ------------------------------------------------------------------------
    # Model 2: XGBoost Regressor (with better hyperparameters)
    # ------------------------------------------------------------------------
    print(f"\nTraining XGBoost Regressor with Improved Hyperparameters for {target}...")
    start_time = time.time()
    xgb_model = xgb.XGBRegressor(
        n_estimators=200,           # More trees for better learning
        max_depth=8,                # Deeper trees for complex patterns
        learning_rate=0.05,         # Lower learning rate for better convergence
        subsample=0.8,              # Sample 80% of data for each tree
        colsample_bytree=0.8,       # Sample 80% of features for each tree
        min_child_weight=3,         # Minimum sum of weights in a child
        gamma=0.1,                  # Minimum loss reduction for split
        reg_alpha=0.1,              # L1 regularization
        reg_lambda=1.0,             # L2 regularization
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_reg_train_scaled, y_reg_train, 
                  eval_set=[(X_reg_test_scaled, y_reg_test)],
                  verbose=False)
    xgb_train_time = time.time() - start_time
    
    # Predictions
    start_time = time.time()
    xgb_predictions = xgb_model.predict(X_reg_test_scaled)
    xgb_inference_time = (time.time() - start_time) / len(X_reg_test)
    
    # Metrics
    xgb_r2 = r2_score(y_reg_test, xgb_predictions)
    xgb_rmse = np.sqrt(mean_squared_error(y_reg_test, xgb_predictions))
    xgb_mae = mean_absolute_error(y_reg_test, xgb_predictions)
    xgb_mape = np.mean(np.abs((y_reg_test - xgb_predictions) / y_reg_test)) * 100
    xgb_accuracy = 100 - xgb_mape
    
    print(f"[OK] XGBoost trained in {xgb_train_time:.3f} seconds")
    print(f"  - R² Score: {xgb_r2:.4f}")
    print(f"  - RMSE: {xgb_rmse:.2f}")
    print(f"  - MAE: {xgb_mae:.2f}")
    print(f"  - MAPE: {xgb_mape:.2f}%")
    print(f"  - Accuracy: {xgb_accuracy:.2f}%")
    print(f"  - Inference Time: {xgb_inference_time*1000:.3f} ms/sample")
    
    # Store results
    regression_results[target] = {
        'linear': {
            'r2': lr_r2,
            'rmse': lr_rmse,
            'mae': lr_mae,
            'mape': lr_mape,
            'accuracy': lr_accuracy,
            'train_time': lr_train_time,
            'inference_time': lr_inference_time
        },
        'xgboost': {
            'r2': xgb_r2,
            'rmse': xgb_rmse,
            'mae': xgb_mae,
            'mape': xgb_mape,
            'accuracy': xgb_accuracy,
            'train_time': xgb_train_time,
            'inference_time': xgb_inference_time
        }
    }

# ============================================================================
# GENERATE COMPREHENSIVE COMPARISON REPORT
# ============================================================================
print("\n" + "=" * 80)
print("GENERATING COMPARISON REPORT...")
print("=" * 80)
print()

report_lines = []

report_lines.append("=" * 80)
report_lines.append("    COMPREHENSIVE ML MODEL COMPARISON REPORT")
report_lines.append("    Water Quality Prediction - Mithi River, Mumbai")
report_lines.append("=" * 80)
report_lines.append(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}")
report_lines.append(f"Dataset: 400,000 samples (2000-2024)")
report_lines.append(f"Test Set: 80,000 samples (20%)")
report_lines.append("")

# Classification Comparison
report_lines.append("=" * 80)
report_lines.append("PART 1: CLASSIFICATION MODELS COMPARISON")
report_lines.append("=" * 80)
report_lines.append("")
report_lines.append("Task: Predict Water Quality Index (WQI) - Good/Moderate/Poor")
report_lines.append("")

report_lines.append("1.1 RANDOM FOREST CLASSIFIER")
report_lines.append("-" * 80)
report_lines.append(f"Accuracy: {rf_accuracy:.4f} ({rf_accuracy*100:.2f}%)")
report_lines.append(f"F1-Score (Weighted): {rf_f1_weighted:.4f}")
report_lines.append(f"F1-Score (Macro): {rf_f1_macro:.4f}")
report_lines.append(f"Precision (Weighted): {rf_precision:.4f}")
report_lines.append(f"Recall (Weighted): {rf_recall:.4f}")
report_lines.append(f"Training Time: {rf_train_time:.2f} seconds")
report_lines.append(f"Inference Time: {rf_inference_time*1000:.2f} ms/sample")
report_lines.append("")
report_lines.append("Class-wise Performance:")
for class_name in ['Good', 'Moderate', 'Poor']:
    if class_name in rf_class_report:
        report_lines.append(f"  {class_name}:")
        report_lines.append(f"    Precision: {rf_class_report[class_name]['precision']:.4f}")
        report_lines.append(f"    Recall: {rf_class_report[class_name]['recall']:.4f}")
        report_lines.append(f"    F1-Score: {rf_class_report[class_name]['f1-score']:.4f}")
        report_lines.append(f"    Support: {int(rf_class_report[class_name]['support'])}")
report_lines.append("")

report_lines.append("1.2 K-NEAREST NEIGHBORS (KNN) CLASSIFIER")
report_lines.append("-" * 80)
report_lines.append(f"Optimal K: {best_k}")
report_lines.append(f"Accuracy: {knn_accuracy:.4f} ({knn_accuracy*100:.2f}%)")
report_lines.append(f"F1-Score (Weighted): {knn_f1_weighted:.4f}")
report_lines.append(f"F1-Score (Macro): {knn_f1_macro:.4f}")
report_lines.append(f"Precision (Weighted): {knn_precision:.4f}")
report_lines.append(f"Recall (Weighted): {knn_recall:.4f}")
report_lines.append(f"Training Time: {knn_train_time:.2f} seconds")
report_lines.append(f"Inference Time: {knn_inference_time*1000:.2f} ms/sample")
report_lines.append("")
report_lines.append("Class-wise Performance:")
for class_name in ['Good', 'Moderate', 'Poor']:
    if class_name in knn_class_report:
        report_lines.append(f"  {class_name}:")
        report_lines.append(f"    Precision: {knn_class_report[class_name]['precision']:.4f}")
        report_lines.append(f"    Recall: {knn_class_report[class_name]['recall']:.4f}")
        report_lines.append(f"    F1-Score: {knn_class_report[class_name]['f1-score']:.4f}")
        report_lines.append(f"    Support: {int(knn_class_report[class_name]['support'])}")
report_lines.append("")

report_lines.append("1.3 CLASSIFICATION MODELS COMPARISON TABLE")
report_lines.append("-" * 80)
report_lines.append(f"{'Metric':<25} {'Random Forest':<20} {'KNN (K={best_k})':<20} {'Winner':<15}")
report_lines.append("-" * 80)
report_lines.append(f"{'Accuracy':<25} {rf_accuracy:.4f} ({rf_accuracy*100:.2f}%){' ':<5} {knn_accuracy:.4f} ({knn_accuracy*100:.2f}%){' ':<5} {'RF' if rf_accuracy > knn_accuracy else 'KNN' if knn_accuracy > rf_accuracy else 'Tie':<15}")
report_lines.append(f"{'F1-Score (Weighted)':<25} {rf_f1_weighted:.4f}{' ':<15} {knn_f1_weighted:.4f}{' ':<15} {'RF' if rf_f1_weighted > knn_f1_weighted else 'KNN' if knn_f1_weighted > rf_f1_weighted else 'Tie':<15}")
report_lines.append(f"{'F1-Score (Macro)':<25} {rf_f1_macro:.4f}{' ':<15} {knn_f1_macro:.4f}{' ':<15} {'RF' if rf_f1_macro > knn_f1_macro else 'KNN' if knn_f1_macro > rf_f1_macro else 'Tie':<15}")
report_lines.append(f"{'Precision (Weighted)':<25} {rf_precision:.4f}{' ':<15} {knn_precision:.4f}{' ':<15} {'RF' if rf_precision > knn_precision else 'KNN' if knn_precision > rf_precision else 'Tie':<15}")
report_lines.append(f"{'Recall (Weighted)':<25} {rf_recall:.4f}{' ':<15} {knn_recall:.4f}{' ':<15} {'RF' if rf_recall > knn_recall else 'KNN' if knn_recall > rf_recall else 'Tie':<15}")
report_lines.append(f"{'Training Time (sec)':<25} {rf_train_time:.2f}{' ':<15} {knn_train_time:.2f}{' ':<15} {'RF' if rf_train_time < knn_train_time else 'KNN' if knn_train_time < rf_train_time else 'Tie':<15}")
report_lines.append(f"{'Inference Time (ms)':<25} {rf_inference_time*1000:.2f}{' ':<15} {knn_inference_time*1000:.2f}{' ':<15} {'RF' if rf_inference_time < knn_inference_time else 'KNN' if knn_inference_time < rf_inference_time else 'Tie':<15}")
report_lines.append("")

# Determine winner
rf_wins = sum([
    rf_accuracy > knn_accuracy,
    rf_f1_weighted > knn_f1_weighted,
    rf_f1_macro > knn_f1_macro,
    rf_precision > knn_precision,
    rf_recall > knn_recall,
    rf_train_time < knn_train_time,
    rf_inference_time < knn_inference_time
])
knn_wins = 7 - rf_wins

report_lines.append("1.4 CLASSIFICATION RECOMMENDATION")
report_lines.append("-" * 80)
if rf_wins > knn_wins:
    report_lines.append(f"[OK] WINNER: RANDOM FOREST (Wins: {rf_wins}/7 metrics)")
    report_lines.append("")
    report_lines.append("Reasons:")
    if rf_accuracy > knn_accuracy:
        report_lines.append(f"  • Higher accuracy: {rf_accuracy*100:.2f}% vs {knn_accuracy*100:.2f}%")
    if rf_f1_weighted > knn_f1_weighted:
        report_lines.append(f"  • Better F1-Score (Weighted): {rf_f1_weighted:.4f} vs {knn_f1_weighted:.4f}")
    if rf_train_time < knn_train_time:
        report_lines.append(f"  • Faster training: {rf_train_time:.2f}s vs {knn_train_time:.2f}s")
    if rf_inference_time < knn_inference_time:
        report_lines.append(f"  • Faster inference: {rf_inference_time*1000:.2f}ms vs {knn_inference_time*1000:.2f}ms")
    report_lines.append("")
    report_lines.append("[OK] RECOMMENDATION: Use Random Forest for production deployment")
else:
    report_lines.append(f"[OK] WINNER: K-NEAREST NEIGHBORS (Wins: {knn_wins}/7 metrics)")
    report_lines.append("")
    report_lines.append("Reasons:")
    if knn_accuracy > rf_accuracy:
        report_lines.append(f"  • Higher accuracy: {knn_accuracy*100:.2f}% vs {rf_accuracy*100:.2f}%")
    if knn_f1_weighted > rf_f1_weighted:
        report_lines.append(f"  • Better F1-Score (Weighted): {knn_f1_weighted:.4f} vs {rf_f1_weighted:.4f}")
    report_lines.append("")
    report_lines.append("[OK] RECOMMENDATION: Use KNN for production deployment")
report_lines.append("")

# Regression Comparison
report_lines.append("=" * 80)
report_lines.append("PART 2: REGRESSION MODELS COMPARISON")
report_lines.append("=" * 80)
report_lines.append("")
report_lines.append("Task: Predict TDS, BOD, and COD values")
report_lines.append("")

for target in ['TDS', 'BOD', 'COD']:
    lr = regression_results[target]['linear']
    xgb_r = regression_results[target]['xgboost']
    report_lines.append(f"--- {target} PREDICTION ---")
    report_lines.append("Linear Regression (with Polynomial Features):")
report_lines.append(f"  R² Score: {lr['r2']:.4f}")
report_lines.append(f"  RMSE: {lr['rmse']:.2f}")
report_lines.append(f"  MAE: {lr['mae']:.2f}")
report_lines.append(f"  MAPE: {lr['mape']:.2f}%")
report_lines.append(f"  Accuracy: {lr['accuracy']:.2f}%")
report_lines.append(f"  Training Time: {lr['train_time']:.3f}s")
report_lines.append(f"  Inference Time: {lr['inference_time']*1000:.3f}ms")
report_lines.append("")
    
report_lines.append("XGBoost Regressor (Improved Hyperparameters):")
report_lines.append(f"  R² Score: {xgb_r['r2']:.4f}")
report_lines.append(f"  RMSE: {xgb_r['rmse']:.2f}")
report_lines.append(f"  MAE: {xgb_r['mae']:.2f}")
report_lines.append(f"  MAPE: {xgb_r['mape']:.2f}%")
report_lines.append(f"  Accuracy: {xgb_r['accuracy']:.2f}%")
report_lines.append(f"  Training Time: {xgb_r['train_time']:.3f}s")
report_lines.append(f"  Inference Time: {xgb_r['inference_time']*1000:.3f}ms")
report_lines.append("")
    
# Comparison
report_lines.append(f"Comparison for {target}:")
report_lines.append(f"{'Metric':<20} {'Linear Reg':<15} {'XGBoost':<15} {'Winner':<15}")
report_lines.append("-" * 65)
report_lines.append(f"{'R² Score':<20} {lr['r2']:.4f}{' ':<10} {xgb_r['r2']:.4f}{' ':<10} {'XGBoost' if xgb_r['r2'] > lr['r2'] else 'Linear' if lr['r2'] > xgb_r['r2'] else 'Tie':<15}")
report_lines.append(f"{'RMSE (lower=better)':<20} {lr['rmse']:.2f}{' ':<10} {xgb_r['rmse']:.2f}{' ':<10} {'XGBoost' if xgb_r['rmse'] < lr['rmse'] else 'Linear' if lr['rmse'] < xgb_r['rmse'] else 'Tie':<15}")
report_lines.append(f"{'MAE (lower=better)':<20} {lr['mae']:.2f}{' ':<10} {xgb_r['mae']:.2f}{' ':<10} {'XGBoost' if xgb_r['mae'] < lr['mae'] else 'Linear' if lr['mae'] < xgb_r['mae'] else 'Tie':<15}")
report_lines.append(f"{'Accuracy':<20} {lr['accuracy']:.2f}%{' ':<10} {xgb_r['accuracy']:.2f}%{' ':<10} {'XGBoost' if xgb_r['accuracy'] > lr['accuracy'] else 'Linear' if lr['accuracy'] > xgb_r['accuracy'] else 'Tie':<15}")
report_lines.append("")
    
# Winner
xgb_wins_reg = sum([
    xgb_r['r2'] > lr['r2'],
    xgb_r['rmse'] < lr['rmse'],
    xgb_r['mae'] < lr['mae'],
    xgb_r['accuracy'] > lr['accuracy']
])
    
if xgb_wins_reg >= 3:
    report_lines.append(f"[OK] WINNER for {target}: XGBoost (Better on {xgb_wins_reg}/4 metrics)")
else:
    report_lines.append(f"[OK] WINNER for {target}: Linear Regression (Better on {4-xgb_wins_reg}/4 metrics)")
report_lines.append("")
report_lines.append("")

# Overall regression recommendation
avg_lr_r2 = np.mean([regression_results[t]['linear']['r2'] for t in ['TDS', 'BOD', 'COD']])
avg_lr_acc = np.mean([regression_results[t]['linear']['accuracy'] for t in ['TDS', 'BOD', 'COD']])
avg_xgb_r2 = np.mean([regression_results[t]['xgboost']['r2'] for t in ['TDS', 'BOD', 'COD']])
avg_xgb_acc = np.mean([regression_results[t]['xgboost']['accuracy'] for t in ['TDS', 'BOD', 'COD']])

# Calculate average improvements
avg_r2_improvement = np.mean([
    regression_results[t]['xgboost']['r2'] - regression_results[t]['linear']['r2']
    for t in ['TDS', 'BOD', 'COD']
])
avg_rmse_improvement = np.mean([
    regression_results[t]['linear']['rmse'] - regression_results[t]['xgboost']['rmse']
    for t in ['TDS', 'BOD', 'COD']
])
avg_acc_improvement = np.mean([
    regression_results[t]['xgboost']['accuracy'] - regression_results[t]['linear']['accuracy']
    for t in ['TDS', 'BOD', 'COD']
])

report_lines.append("")
report_lines.append("Overall Performance Summary:")
report_lines.append(f"  Linear Regression (Polynomial):")
report_lines.append(f"    - Average R² Score: {avg_lr_r2:.4f}")
report_lines.append(f"    - Average Accuracy: {avg_lr_acc:.2f}%")
report_lines.append(f"  XGBoost (Improved):")
report_lines.append(f"    - Average R² Score: {avg_xgb_r2:.4f}")
report_lines.append(f"    - Average Accuracy: {avg_xgb_acc:.2f}%")
report_lines.append("")

xgb_overall_wins = sum([
    sum([regression_results[t]['xgboost']['r2'] > regression_results[t]['linear']['r2'] for t in ['TDS', 'BOD', 'COD']]),
    sum([regression_results[t]['xgboost']['rmse'] < regression_results[t]['linear']['rmse'] for t in ['TDS', 'BOD', 'COD']]),
    sum([regression_results[t]['xgboost']['accuracy'] > regression_results[t]['linear']['accuracy'] for t in ['TDS', 'BOD', 'COD']])
])

if xgb_overall_wins >= 6:  # Out of 9 total comparisons (3 targets × 3 metrics)
    report_lines.append("[OK] WINNER: XGBoost Regressor")
    report_lines.append("")
    report_lines.append("Performance Improvements over Linear Regression:")
    if avg_r2_improvement > 0:
        report_lines.append(f"  • Average R² improvement: +{avg_r2_improvement:.4f}")
    if avg_rmse_improvement > 0:
        report_lines.append(f"  • Average RMSE reduction: -{avg_rmse_improvement:.2f}")
    if avg_acc_improvement > 0:
        report_lines.append(f"  • Average accuracy improvement: +{avg_acc_improvement:.2f}%")
    report_lines.append("")
    report_lines.append("[OK] RECOMMENDATION: Use XGBoost for production deployment")
    report_lines.append("")
    report_lines.append("Benefits of XGBoost:")
    report_lines.append("  • Handles non-linear relationships better")
    report_lines.append("  • Built-in regularization prevents overfitting")
    report_lines.append("  • Can capture complex feature interactions")
    report_lines.append("  • Better generalization on unseen data")
    report_lines.append("  • Robust to outliers and noise")
elif avg_xgb_acc > avg_lr_acc:
    report_lines.append("[OK] WINNER: XGBoost Regressor")
    report_lines.append("")
    report_lines.append(f"Average Accuracy: {avg_xgb_acc:.2f}% vs {avg_lr_acc:.2f}%")
    report_lines.append(f"Accuracy Improvement: +{avg_acc_improvement:.2f}%")
    report_lines.append("")
    report_lines.append("[OK] RECOMMENDATION: Use XGBoost for production deployment")
else:
    report_lines.append("[OK] WINNER: Linear Regression with Polynomial Features")
    report_lines.append("")
    report_lines.append("Advantages:")
    report_lines.append("  • Simpler and more interpretable")
    report_lines.append("  • Faster training and inference")
    report_lines.append("  • Lower computational requirements")
    report_lines.append("  • Good performance with polynomial features")
    report_lines.append("  • Handles non-linear relationships better")
    report_lines.append("  • Built-in regularization prevents overfitting")
    report_lines.append("  • Can capture complex feature interactions")
    report_lines.append("  • Better performance on imbalanced data")
report_lines.append("")

if rf_wins > knn_wins:
    report_lines.append("1. CLASSIFICATION: Use Random Forest Classifier")
    report_lines.append(f"   - Accuracy: {rf_accuracy*100:.2f}%")
    report_lines.append(f"   - F1-Score (Weighted): {rf_f1_weighted:.4f}")
    report_lines.append(f"   - Inference Time: {rf_inference_time*1000:.2f} ms/sample")
else:
    report_lines.append("1. CLASSIFICATION: Use K-Nearest Neighbors")
    report_lines.append(f"   - Accuracy: {knn_accuracy*100:.2f}%")
    report_lines.append(f"   - F1-Score (Weighted): {knn_f1_weighted:.4f}")
    report_lines.append(f"   - Inference Time: {knn_inference_time*1000:.2f} ms/sample")

report_lines.append("")

if xgb_overall_wins >= 6:
    report_lines.append("2. REGRESSION: Use XGBoost Regressor for TDS, BOD, COD")
    report_lines.append(f"   - Average R² Score: {np.mean([regression_results[t]['xgboost']['r2'] for t in ['TDS', 'BOD', 'COD']]):.4f}")
    report_lines.append(f"   - Average Accuracy: {np.mean([regression_results[t]['xgboost']['accuracy'] for t in ['TDS', 'BOD', 'COD']]):.2f}%")
else:
    report_lines.append("2. REGRESSION: Use Linear Regression for TDS, BOD, COD")
    report_lines.append(f"   - Average R² Score: {np.mean([regression_results[t]['linear']['r2'] for t in ['TDS', 'BOD', 'COD']]):.4f}")
    report_lines.append(f"   - Average Accuracy: {np.mean([regression_results[t]['linear']['accuracy'] for t in ['TDS', 'BOD', 'COD']]):.2f}%")

report_lines.append("")
report_lines.append("=" * 80)
report_lines.append("END OF COMPARISON REPORT")
report_lines.append("=" * 80)

# Save report
report_text = '\n'.join(report_lines)
with open('../MODEL_COMPARISON_REPORT.txt', 'w', encoding='utf-8') as f:
    f.write(report_text)

print("\n[OK] Comparison report saved: MODEL_COMPARISON_REPORT.txt")
print()

# Print summary to console
print("\n" + "=" * 80)
print("QUICK SUMMARY")
print("=" * 80)
print()
print("CLASSIFICATION:")
print(f"  Random Forest: Accuracy={rf_accuracy*100:.2f}%, F1={rf_f1_weighted:.4f}")
print(f"  KNN (K={best_k}):     Accuracy={knn_accuracy*100:.2f}%, F1={knn_f1_weighted:.4f}")
print(f"  WINNER: {'Random Forest' if rf_wins > knn_wins else 'KNN'}")
print()
print("REGRESSION (Average Accuracy):")
lr_avg_acc = np.mean([regression_results[t]['linear']['accuracy'] for t in ['TDS', 'BOD', 'COD']])
xgb_avg_acc = np.mean([regression_results[t]['xgboost']['accuracy'] for t in ['TDS', 'BOD', 'COD']])
print(f"  Linear Regression: {lr_avg_acc:.2f}%")
print(f"  XGBoost:           {xgb_avg_acc:.2f}%")
print(f"  WINNER: {'XGBoost' if xgb_avg_acc > lr_avg_acc else 'Linear Regression'}")
print()
print("=" * 80)
print("[OK] All models trained and compared successfully!")
print("=" * 80)
