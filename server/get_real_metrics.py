import sys
import os
sys.path.append(r'd:\waterqualityanalysis\server')
os.chdir(r'd:\waterqualityanalysis\server')

import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, mean_squared_error, r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

print("="*80)
print("LOADING ACTUAL ML MODELS AND COMPUTING REAL METRICS")
print("="*80)

# Load models
try:
    regression_models = joblib.load('mithi_regression_models.pkl')
    regression_scalers = joblib.load('mithi_regression_scalers.pkl')
    classifier_model = joblib.load('mithi_classifier_model.pkl')
    classifier_scaler = joblib.load('mithi_classifier_scaler.pkl')
    location_encoder = joblib.load('location_encoder.pkl')
    print("✓ Models loaded successfully\n")
except Exception as e:
    print(f"Error loading models: {e}")
    sys.exit(1)

# Load dataset
try:
    df = pd.read_csv('mithi_river_data.csv')
    print(f"✓ Dataset loaded: {len(df)} samples\n")
except Exception as e:
    print(f"Error loading dataset: {e}")
    sys.exit(1)

# Encode location
le = LabelEncoder()
df['Location_encoded'] = le.fit_transform(df['Location'])  # lowercase to match training

# Features and targets
feature_cols_clf = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
feature_cols_reg = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH']

X_clf = df[feature_cols_clf]
y_clf = df['WQI']

X_reg = df[feature_cols_reg]
y_tds = df['TDS']
y_bod = df['BOD']
y_cod = df['COD']

# Train-test split
X_train_clf, X_test_clf, y_train_clf, y_test_clf = train_test_split(X_clf, y_clf, test_size=0.2, random_state=42)
X_train_reg, X_test_reg, y_train_tds, y_test_tds = train_test_split(X_reg, y_tds, test_size=0.2, random_state=42)
_, _, y_train_bod, y_test_bod = train_test_split(X_reg, y_bod, test_size=0.2, random_state=42)
_, _, y_train_cod, y_test_cod = train_test_split(X_reg, y_cod, test_size=0.2, random_state=42)

print("="*80)
print("CLASSIFICATION MODEL METRICS (Random Forest)")
print("="*80)

# Classification metrics
X_test_clf_scaled = classifier_scaler.transform(X_test_clf)
y_pred_clf = classifier_model.predict(X_test_clf_scaled)
y_pred_proba = classifier_model.predict_proba(X_test_clf_scaled)

accuracy = accuracy_score(y_test_clf, y_pred_clf)
f1_weighted = f1_score(y_test_clf, y_pred_clf, average='weighted')
f1_macro = f1_score(y_test_clf, y_pred_clf, average='macro')

print(f"Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"F1-Score (Weighted): {f1_weighted:.4f}")
print(f"F1-Score (Macro): {f1_macro:.4f}")
print(f"\nModel Configuration:")
print(f"  - N Estimators: {classifier_model.n_estimators}")
print(f"  - Max Depth: {classifier_model.max_depth}")
print(f"  - Classes: {classifier_model.classes_}")
print(f"  - Training Samples: {len(X_train_clf)}")
print(f"  - Testing Samples: {len(X_test_clf)}")

print("\nClassification Report:")
clf_report = classification_report(y_test_clf, y_pred_clf, output_dict=True)
for cls in classifier_model.classes_:
    if cls in clf_report:
        print(f"\n  {cls}:")
        print(f"    Precision: {clf_report[cls]['precision']:.4f}")
        print(f"    Recall: {clf_report[cls]['recall']:.4f}")
        print(f"    F1-Score: {clf_report[cls]['f1-score']:.4f}")
        print(f"    Support: {int(clf_report[cls]['support'])}")

print("\nWeighted Averages:")
print(f"  Precision: {clf_report['weighted avg']['precision']:.4f}")
print(f"  Recall: {clf_report['weighted avg']['recall']:.4f}")
print(f"  F1-Score: {clf_report['weighted avg']['f1-score']:.4f}")

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test_clf, y_pred_clf, labels=classifier_model.classes_)
print("                Predicted")
header = "              " + "  ".join([f"{cls:8s}" for cls in classifier_model.classes_])
print(header)
for i, cls in enumerate(classifier_model.classes_):
    row = f"Actual {cls:8s} "
    for j in range(len(classifier_model.classes_)):
        row += f"{cm[i][j]:8d}  "
    print(row)

print("\n" + "="*80)
print("REGRESSION MODELS METRICS")
print("="*80)

targets = {
    'TDS': (y_test_tds, 'Total Dissolved Solids', 'ppm'),
    'BOD': (y_test_bod, 'Biological Oxygen Demand', 'mg/L'),
    'COD': (y_test_cod, 'Chemical Oxygen Demand', 'mg/L')
}

all_r2 = []
all_acc = []
all_rmse = []

for target_name, (y_test, full_name, unit) in targets.items():
    print(f"\n{target_name} ({full_name}):")
    print("-" * 40)
    
    # Scale and predict
    X_test_scaled = regression_scalers[target_name].transform(X_test_reg)
    y_pred = regression_models[target_name].predict(X_test_scaled)
    
    # Metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    accuracy_pct = (1 - mape/100) * 100
    
    all_r2.append(r2)
    all_acc.append(accuracy_pct)
    all_rmse.append(rmse)
    
    print(f"  R² Score: {r2:.4f}")
    print(f"  RMSE: {rmse:.4f} {unit}")
    print(f"  MAE: {mae:.4f} {unit}")
    print(f"  MAPE: {mape:.2f}%")
    print(f"  Accuracy: {accuracy_pct:.2f}%")

print("\n" + "="*80)
print("OVERALL REGRESSION PERFORMANCE")
print("="*80)
print(f"Average R² Score: {np.mean(all_r2):.4f}")
print(f"Average Accuracy: {np.mean(all_acc):.2f}%")
print(f"Average RMSE: {np.mean(all_rmse):.2f}")

print("\n" + "="*80)
print("FEATURE IMPORTANCE (Classification)")
print("="*80)
if hasattr(classifier_model, 'feature_importances_'):
    importances = classifier_model.feature_importances_
    feature_names = feature_cols_clf
    
    # Sort by importance
    indices = np.argsort(importances)[::-1]
    
    print("\nTop Features by Importance:")
    for i, idx in enumerate(indices, 1):
        print(f"{i}. {feature_names[idx]}: {importances[idx]:.4f} ({importances[idx]*100:.2f}%)")

print("\n" + "="*80)
print("DATASET INFORMATION")
print("="*80)
print(f"Total Records: {len(df)}")
print(f"Unique Locations: {df['Location'].nunique()}")
print(f"Location Names: {', '.join(df['Location'].unique())}")
print(f"Year Range: {df['Year'].min()} - {df['Year'].max()}")
print(f"WQI Distribution:")
for wqi_class, count in df['WQI'].value_counts().items():
    print(f"  {wqi_class}: {count} samples ({count/len(df)*100:.1f}%)")

print("\n" + "="*80)
print("METRICS EXTRACTION COMPLETE")
print("="*80)
