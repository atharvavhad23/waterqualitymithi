"""
Train IMPROVED ML models with better features and compare them
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
import time
from datetime import datetime

print("=" * 80)
print("IMPROVED ML MODELS TRAINING - WATER QUALITY PREDICTION")
print("=" * 80)
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Load dataset
print("Loading dataset...")
csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'
df = pd.read_csv(csv_path)
print(f"✓ Dataset loaded: {len(df)} samples")
print()

# Preprocessing
le = LabelEncoder()
df['Location_encoded'] = le.fit_transform(df['Location'])

# ===========================================================================
# CLASSIFICATION COMPARISON
# ===========================================================================
print("=" * 80)
print("PART 1: CLASSIFICATION - Random Forest vs KNN")
print("=" * 80)
print()

feature_cols_clf = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
X_clf = df[feature_cols_clf]
y_clf = df['WQI']

X_clf_train, X_clf_test, y_clf_train, y_clf_test = train_test_split(
    X_clf, y_clf, test_size=0.2, random_state=42, stratify=y_clf
)

scaler_clf = StandardScaler()
X_clf_train_scaled = scaler_clf.fit_transform(X_clf_train)
X_clf_test_scaled = scaler_clf.transform(X_clf_test)

# Random Forest
print("Training Random Forest...")
rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
rf_model.fit(X_clf_train_scaled, y_clf_train)
rf_pred = rf_model.predict(X_clf_test_scaled)
rf_acc = accuracy_score(y_clf_test, rf_pred)
rf_f1 = f1_score(y_clf_test, rf_pred, average='weighted')

print(f"✓ Random Forest: Accuracy={rf_acc*100:.2f}%, F1={rf_f1:.4f}")

# KNN
print("Training KNN...")
knn_model = KNeighborsClassifier(n_neighbors=9, n_jobs=-1)
knn_model.fit(X_clf_train_scaled, y_clf_train)
knn_pred = knn_model.predict(X_clf_test_scaled)
knn_acc = accuracy_score(y_clf_test, knn_pred)
knn_f1 = f1_score(y_clf_test, knn_pred, average='weighted')

print(f"✓ KNN: Accuracy={knn_acc*100:.2f}%, F1={knn_f1:.4f}")
print()

# ===========================================================================
# REGRESSION COMPARISON - IMPROVED
# ===========================================================================
print("=" * 80)
print("PART 2: REGRESSION - Linear vs XGBoost (IMPROVED)")
print("=" * 80)
print()

results = {}

for target in ['TDS', 'BOD', 'COD']:
    print(f"\n{target} Prediction:")
    print("-" * 80)
    
    # Use more features - include correlated parameters
    if target == 'TDS':
        features = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'BOD', 'COD']
    elif target == 'BOD':
        features = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'COD']
    else:  # COD
        features = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD']
    
    X_reg = df[features]
    y_reg = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_reg, y_reg, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Add polynomial features
    poly = PolynomialFeatures(degree=2, include_bias=False)
    X_train_poly = poly.fit_transform(X_train_scaled)
    X_test_poly = poly.transform(X_test_scaled)
    
    # Linear Regression with polynomial features
    lr = LinearRegression()
    lr.fit(X_train_poly, y_train)
    lr_pred = lr.predict(X_test_poly)
    
    lr_r2 = r2_score(y_test, lr_pred)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
    lr_mae = mean_absolute_error(y_test, lr_pred)
    lr_mape = np.mean(np.abs((y_test - lr_pred) / y_test)) * 100
    lr_acc = 100 - lr_mape
    
    print(f"Linear Regression (Polynomial):")
    print(f"  R²={lr_r2:.4f}, RMSE={lr_rmse:.2f}, MAE={lr_mae:.2f}, Acc={lr_acc:.2f}%")
    
    # XGBoost with improved hyperparameters
    xgb_model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train_scaled, y_train, eval_set=[(X_test_scaled, y_test)], verbose=False)
    xgb_pred = xgb_model.predict(X_test_scaled)
    
    xgb_r2 = r2_score(y_test, xgb_pred)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
    xgb_mae = mean_absolute_error(y_test, xgb_pred)
    xgb_mape = np.mean(np.abs((y_test - xgb_pred) / y_test)) * 100
    xgb_acc = 100 - xgb_mape
    
    print(f"XGBoost (Improved):")
    print(f"  R²={xgb_r2:.4f}, RMSE={xgb_rmse:.2f}, MAE={xgb_mae:.2f}, Acc={xgb_acc:.2f}%")
    
    results[target] = {
        'linear': {'r2': lr_r2, 'rmse': lr_rmse, 'mae': lr_mae, 'acc': lr_acc},
        'xgboost': {'r2': xgb_r2, 'rmse': xgb_rmse, 'mae': xgb_mae, 'acc': xgb_acc}
    }
    
    # Winner
    if xgb_acc > lr_acc:
        print(f"✓ WINNER: XGBoost (+{xgb_acc-lr_acc:.2f}% better)")
    else:
        print(f"✓ WINNER: Linear Regression (+{lr_acc-xgb_acc:.2f}% better)")

# ===========================================================================
# GENERATE REPORT
# ===========================================================================
print("\n" + "=" * 80)
print("GENERATING UPDATED REPORT...")
print("=" * 80)

report = []
report.append("=" * 80)
report.append("    COMPREHENSIVE ML MODEL COMPARISON REPORT - UPDATED")
report.append("    Water Quality Prediction - Mithi River, Mumbai")
report.append("=" * 80)
report.append(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}")
report.append(f"Dataset: 400,000 samples (2000-2024)")
report.append(f"Improvements: More features + Polynomial features + Tuned XGBoost")
report.append("")

# Classification
report.append("=" * 80)
report.append("PART 1: CLASSIFICATION MODELS COMPARISON")
report.append("=" * 80)
report.append("")
report.append("1.1 RANDOM FOREST CLASSIFIER")
report.append("-" * 80)
report.append(f"Accuracy: {rf_acc:.4f} ({rf_acc*100:.2f}%)")
report.append(f"F1-Score (Weighted): {rf_f1:.4f}")
report.append("")

report.append("1.2 K-NEAREST NEIGHBORS (KNN)")
report.append("-" * 80)
report.append(f"Accuracy: {knn_acc:.4f} ({knn_acc*100:.2f}%)")
report.append(f"F1-Score (Weighted): {knn_f1:.4f}")
report.append("")

report.append("1.3 CLASSIFICATION WINNER")
report.append("-" * 80)
if rf_acc > knn_acc:
    report.append(f"✓ WINNER: RANDOM FOREST")
    report.append(f"  - {(rf_acc-knn_acc)*100:.2f}% better accuracy than KNN")
    report.append(f"  - Recommended for production deployment")
else:
    report.append(f"✓ WINNER: KNN")
    report.append(f"  - {(knn_acc-rf_acc)*100:.2f}% better accuracy than RF")
report.append("")

# Regression
report.append("=" * 80)
report.append("PART 2: REGRESSION MODELS COMPARISON (IMPROVED)")
report.append("=" * 80)
report.append("")
report.append("Improvements Made:")
report.append("  • Added correlated features (TDS, BOD, COD cross-dependencies)")
report.append("  • Polynomial features (degree 2) for Linear Regression")
report.append("  • Tuned XGBoost hyperparameters (200 trees, depth 8, lr 0.05)")
report.append("  • Regularization (L1=0.1, L2=1.0) to prevent overfitting")
report.append("")

for target in ['TDS', 'BOD', 'COD']:
    lr_res = results[target]['linear']
    xgb_res = results[target]['xgboost']
    
    report.append(f"2.{['TDS', 'BOD', 'COD'].index(target) + 1} {target} PREDICTION")
    report.append("-" * 80)
    report.append("")
    report.append("Linear Regression (with Polynomial Features):")
    report.append(f"  R² Score: {lr_res['r2']:.4f}")
    report.append(f"  RMSE: {lr_res['rmse']:.2f}")
    report.append(f"  MAE: {lr_res['mae']:.2f}")
    report.append(f"  Accuracy: {lr_res['acc']:.2f}%")
    report.append("")
    report.append("XGBoost Regressor (Improved Hyperparameters):")
    report.append(f"  R² Score: {xgb_res['r2']:.4f}")
    report.append(f"  RMSE: {xgb_res['rmse']:.2f}")
    report.append(f"  MAE: {xgb_res['mae']:.2f}")
    report.append(f"  Accuracy: {xgb_res['acc']:.2f}%")
    report.append("")
    
    # Winner
    if xgb_res['acc'] > lr_res['acc']:
        report.append(f"✓ WINNER for {target}: XGBoost")
        report.append(f"  Improvement: +{xgb_res['acc'] - lr_res['acc']:.2f}%")
    else:
        report.append(f"✓ WINNER for {target}: Linear Regression (Polynomial)")
        report.append(f"  Improvement: +{lr_res['acc'] - xgb_res['acc']:.2f}%")
    report.append("")

# Overall Regression Summary
avg_lr_acc = np.mean([results[t]['linear']['acc'] for t in ['TDS', 'BOD', 'COD']])
avg_xgb_acc = np.mean([results[t]['xgboost']['acc'] for t in ['TDS', 'BOD', 'COD']])
avg_lr_r2 = np.mean([results[t]['linear']['r2'] for t in ['TDS', 'BOD', 'COD']])
avg_xgb_r2 = np.mean([results[t]['xgboost']['r2'] for t in ['TDS', 'BOD', 'COD']])

report.append("2.4 OVERALL REGRESSION RECOMMENDATION")
report.append("-" * 80)
report.append("")
report.append("Overall Performance Summary:")
report.append(f"  Linear Regression (Polynomial): Avg Accuracy = {avg_lr_acc:.2f}%")
report.append(f"  XGBoost (Improved):             Avg Accuracy = {avg_xgb_acc:.2f}%")
report.append("")

if avg_xgb_acc > avg_lr_acc:
    report.append("✓ OVERALL WINNER: XGBoost Regressor")
    report.append(f"  - Average improvement: +{avg_xgb_acc - avg_lr_acc:.2f}%")
    report.append(f"  - Better R² score: {avg_xgb_r2:.4f} vs {avg_lr_r2:.4f}")
    report.append("")
    report.append("✓ RECOMMENDATION: Use XGBoost for all regression tasks")
    report.append("")
    report.append("Benefits:")
    report.append("  • Handles non-linear relationships better")
    report.append("  • Built-in regularization prevents overfitting")
    report.append("  • Captures complex feature interactions")
    report.append("  • Robust to outliers")
else:
    report.append("✓ OVERALL WINNER: Linear Regression with Polynomial Features")
    report.append(f"  - Average improvement: +{avg_lr_acc - avg_xgb_acc:.2f}%")
    report.append("")
    report.append("✓ RECOMMENDATION: Use Linear Regression (Polynomial) for all regression tasks")
    report.append("")
    report.append("Benefits:")
    report.append("  • Simpler and more interpretable")
    report.append("  • Faster training and inference")
    report.append("  • Good performance with polynomial features")

report.append("")
report.append("")

# Final Recommendations
report.append("=" * 80)
report.append("FINAL RECOMMENDATIONS FOR PRODUCTION")
report.append("=" * 80)
report.append("")

report.append("1. CLASSIFICATION:")
if rf_acc > knn_acc:
    report.append("   ✓ Use Random Forest Classifier")
    report.append(f"     - Accuracy: {rf_acc*100:.2f}%")
    report.append(f"     - F1-Score: {rf_f1:.4f}")
else:
    report.append("   ✓ Use K-Nearest Neighbors")
    report.append(f"     - Accuracy: {knn_acc*100:.2f}%")
    report.append(f"     - F1-Score: {knn_f1:.4f}")

report.append("")

report.append("2. REGRESSION:")
if avg_xgb_acc > avg_lr_acc:
    report.append("   ✓ Use XGBoost Regressor")
    report.append(f"     - Average Accuracy: {avg_xgb_acc:.2f}%")
    report.append(f"     - Average R²: {avg_xgb_r2:.4f}")
else:
    report.append("   ✓ Use Linear Regression (Polynomial)")
    report.append(f"     - Average Accuracy: {avg_lr_acc:.2f}%")
    report.append(f"     - Average R²: {avg_lr_r2:.4f}")

report.append("")
report.append("=" * 80)
report.append("END OF REPORT")
report.append("=" * 80)

# Save report
report_text = '\n'.join(report)
with open('../MODEL_COMPARISON_REPORT.txt', 'w', encoding='utf-8') as f:
    f.write(report_text)

print(f"\n✓ Updated report saved: MODEL_COMPARISON_REPORT.txt")
print()

# Print summary
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Classification: RF={rf_acc*100:.2f}% vs KNN={knn_acc*100:.2f}%")
print(f"  Winner: {'Random Forest' if rf_acc > knn_acc else 'KNN'}")
print()
print(f"Regression (Avg Accuracy):")
print(f"  Linear Regression (Polynomial): {avg_lr_acc:.2f}%")
print(f"  XGBoost (Improved):             {avg_xgb_acc:.2f}%")
print(f"  Winner: {'XGBoost' if avg_xgb_acc > avg_lr_acc else 'Linear Regression'}")
print("=" * 80)
