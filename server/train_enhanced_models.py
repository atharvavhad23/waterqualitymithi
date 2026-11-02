import os
"""
Enhanced ML Model for Water Quality Prediction
Target: Achieve 70%+ accuracy through advanced feature engineering and model optimization
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, f1_score
import warnings
warnings.filterwarnings('ignore')

print("=" * 80)
print("ENHANCED ML MODEL - WATER QUALITY PREDICTION")
print("Target: 70%+ Accuracy")
print("=" * 80)

# Load data
print("\n[1/8] Loading dataset...")
csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'
df = pd.read_csv(csv_path)
print(f"[OK] Loaded {len(df):,} samples")

# Encode location
le = LabelEncoder()
df['Location_encoded'] = le.fit_transform(df['Location'])

print("\n[2/8] Engineering temporal features...")
# Add temporal features (from Year)
df['Year_normalized'] = (df['Year'] - df['Year'].min()) / (df['Year'].max() - df['Year'].min())

# Simulate month from year (cyclic encoding)
# Since we don't have exact dates, create representative seasonal patterns
np.random.seed(42)
df['Month'] = np.random.randint(1, 13, len(df))
df['Quarter'] = (df['Month'] - 1) // 3 + 1
df['Is_Monsoon'] = df['Month'].isin([6, 7, 8, 9]).astype(int)  # June-Sept monsoon season

# Cyclic encoding for month (captures seasonality)
df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)

print(f"[OK] Added temporal features: Month, Quarter, Monsoon, Cyclic encoding")

print("\n[3/8] Engineering interaction features...")
# Advanced feature interactions
df['Temp_DO_interaction'] = df['Temp'] * df['DO']
df['pH_DO_interaction'] = df['pH'] * df['DO']
df['TDS_Temp_ratio'] = df['TDS'] / (df['Temp'] + 1)
df['BOD_COD_ratio'] = df['BOD'] / (df['COD'] + 0.1)
df['Pollution_index'] = (df['BOD'] + df['COD']) / (df['DO'] + 0.1)
df['Dissolved_solids_temp'] = df['TDS'] * df['Temp']

# Polynomial features for key parameters
df['DO_squared'] = df['DO'] ** 2
df['pH_squared'] = df['pH'] ** 2
df['Temp_squared'] = df['Temp'] ** 2

# Log transformations for skewed features
df['TDS_log'] = np.log1p(df['TDS'])
df['BOD_log'] = np.log1p(df['BOD'])
df['COD_log'] = np.log1p(df['COD'])

print(f"[OK] Added {15} interaction and polynomial features")

print("\n[4/8] Sorting data and creating lag features...")
# Sort by Location and Year for lag features
df = df.sort_values(['Location_encoded', 'Year']).reset_index(drop=True)

# Create lag features (previous readings)
lag_features = ['DO', 'pH', 'TDS', 'BOD', 'COD', 'Temp']
for feature in lag_features:
    df[f'{feature}_lag1'] = df.groupby('Location_encoded')[feature].shift(1)
    df[f'{feature}_lag2'] = df.groupby('Location_encoded')[feature].shift(2)

# Rolling averages (simulate moving averages)
for feature in ['DO', 'TDS', 'BOD', 'COD']:
    df[f'{feature}_rolling_mean'] = df.groupby('Location_encoded')[feature].transform(
        lambda x: x.rolling(window=3, min_periods=1).mean()
    )

# Fill NaN values from lag features
df = df.fillna(df.mean(numeric_only=True))

print(f"[OK] Added {len(lag_features)*2 + 4} lag and rolling features")

print("\n[5/8] Creating target range categories...")
# Define ranges
def create_tds_categories(tds):
    if tds < 1500:
        return 'Low'
    elif tds < 3000:
        return 'Medium'
    else:
        return 'High'

def create_bod_categories(bod):
    if bod < 5:
        return 'Low'
    elif bod < 15:
        return 'Medium'
    else:
        return 'High'

def create_cod_categories(cod):
    if cod < 50:
        return 'Low'
    elif cod < 150:
        return 'Medium'
    else:
        return 'High'

df['TDS_category'] = df['TDS'].apply(create_tds_categories)
df['BOD_category'] = df['BOD'].apply(create_bod_categories)
df['COD_category'] = df['COD'].apply(create_cod_categories)

print("[OK] Categories created for TDS, BOD, COD")

# Select features for modeling
feature_cols = [
    # Basic features
    'Year_normalized', 'Location_encoded', 'Temp', 'DO', 'pH',
    # Temporal features
    'Quarter', 'Is_Monsoon', 'Month_sin', 'Month_cos',
    # Interaction features
    'Temp_DO_interaction', 'pH_DO_interaction', 'TDS_Temp_ratio', 
    'BOD_COD_ratio', 'Pollution_index', 'Dissolved_solids_temp',
    # Polynomial features
    'DO_squared', 'pH_squared', 'Temp_squared',
    # Log features
    'TDS_log', 'BOD_log', 'COD_log',
    # Lag features
    'DO_lag1', 'pH_lag1', 'TDS_lag1', 'BOD_lag1', 'COD_lag1', 'Temp_lag1',
    'DO_lag2', 'pH_lag2', 'TDS_lag2', 'BOD_lag2', 'COD_lag2', 'Temp_lag2',
    # Rolling features
    'DO_rolling_mean', 'TDS_rolling_mean', 'BOD_rolling_mean', 'COD_rolling_mean'
]

print("\n" + "=" * 80)
print("TRAINING ENHANCED MODELS (LEAKAGE-FREE FEATURE SETS)")
print("=" * 80)

# ============================================================================
# TDS PREDICTION (Features strictly excluding TDS and TDS-derivatives)
# ============================================================================
print("\n[6/8] Training TDS Range Classifier...")
tds_leak_features = ['TDS', 'TDS_log', 'TDS_lag1', 'TDS_lag2', 'TDS_rolling_mean', 'TDS_Temp_ratio', 'Dissolved_solids_temp']
tds_features = [c for c in feature_cols if c not in tds_leak_features]
y_tds = df['TDS_category']
X_train, X_test, y_train, y_test = train_test_split(df[tds_features], y_tds, test_size=0.2, random_state=42, stratify=y_tds)

# Hyperparameter tuning for Random Forest
print("  -> Tuning Random Forest hyperparameters...")
rf_params = {
    'n_estimators': [100],
    'max_depth': [15],
    'min_samples_split': [2],
    'min_samples_leaf': [1],
    'max_features': ['sqrt']
}

rf_grid = GridSearchCV(
    RandomForestClassifier(random_state=42, n_jobs=-1),
    rf_params,
    cv=3,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=0
)
rf_grid.fit(X_train, y_train)
best_rf_tds = rf_grid.best_estimator_

y_pred_rf = best_rf_tds.predict(X_test)
rf_tds_acc = accuracy_score(y_test, y_pred_rf)
rf_tds_f1 = f1_score(y_test, y_pred_rf, average='weighted')

print(f"  [OK] Random Forest TDS: {rf_tds_acc*100:.2f}% (F1: {rf_tds_f1:.4f})")
print(f"    Best params: {rf_grid.best_params_}")

# Try Gradient Boosting
print("  -> Training Gradient Boosting...")
gb_tds = GradientBoostingClassifier(
    n_estimators=200,
    max_depth=10,
    learning_rate=0.1,
    random_state=42
)
gb_tds.fit(X_train, y_train)
y_pred_gb = gb_tds.predict(X_test)
gb_tds_acc = accuracy_score(y_test, y_pred_gb)
gb_tds_f1 = f1_score(y_test, y_pred_gb, average='weighted')

print(f"  [OK] Gradient Boosting TDS: {gb_tds_acc*100:.2f}% (F1: {gb_tds_f1:.4f})")

best_tds_acc = max(rf_tds_acc, gb_tds_acc)
best_tds_model = "Random Forest" if rf_tds_acc > gb_tds_acc else "Gradient Boosting"

# ============================================================================
# BOD PREDICTION (Features excluding BOD and direct derivatives)
# ============================================================================
print("\n[7/8] Training BOD Range Classifier...")
bod_leak_features = ['BOD', 'BOD_log', 'BOD_lag1', 'BOD_lag2', 'BOD_rolling_mean', 'BOD_COD_ratio', 'Pollution_index']
bod_features = [c for c in feature_cols if c not in bod_leak_features]
y_bod = df['BOD_category']
X_train, X_test, y_train, y_test = train_test_split(df[bod_features], y_bod, test_size=0.2, random_state=42, stratify=y_bod)

best_rf_bod = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
best_rf_bod.fit(X_train, y_train)
y_pred_bod = best_rf_bod.predict(X_test)
bod_acc = accuracy_score(y_test, y_pred_bod)
bod_f1 = f1_score(y_test, y_pred_bod, average='weighted')

print(f"  [OK] Random Forest BOD: {bod_acc*100:.2f}% (F1: {bod_f1:.4f})")

# ============================================================================
# COD PREDICTION (Features excluding COD and direct derivatives)
# ============================================================================
print("\n[8/8] Training COD Range Classifier...")
cod_leak_features = ['COD', 'COD_log', 'COD_lag1', 'COD_lag2', 'COD_rolling_mean', 'BOD_COD_ratio', 'Pollution_index']
cod_features = [c for c in feature_cols if c not in cod_leak_features]
y_cod = df['COD_category']
X_train, X_test, y_train, y_test = train_test_split(df[cod_features], y_cod, test_size=0.2, random_state=42, stratify=y_cod)

best_rf_cod = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
best_rf_cod.fit(X_train, y_train)
y_pred_cod = best_rf_cod.predict(X_test)
cod_acc = accuracy_score(y_test, y_pred_cod)
cod_f1 = f1_score(y_test, y_pred_cod, average='weighted')

print(f"  [OK] Random Forest COD: {cod_acc*100:.2f}% (F1: {cod_f1:.4f})")

# ============================================================================
# FINAL RESULTS
# ============================================================================
print("\n" + "=" * 80)
print("ENHANCED MODEL RESULTS")
print("=" * 80)

avg_accuracy = (best_tds_acc + bod_acc + cod_acc) / 3

print(f"\n[RESULTS] PARAMETER RANGE CLASSIFICATION:")
print(f"  • TDS:  {best_tds_acc*100:.2f}% ({best_tds_model})")
print(f"  • BOD:  {bod_acc*100:.2f}% (Random Forest)")
print(f"  • COD:  {cod_acc*100:.2f}% (Random Forest)")
print(f"\n[AVERAGE] ACCURACY: {avg_accuracy*100:.2f}%")

# Calculate improvement
baseline_acc = 48.71
improvement = avg_accuracy * 100 - baseline_acc
print(f"\n[IMPROVEMENT] +{improvement:.2f}% over baseline")

if avg_accuracy * 100 >= 70:
    print(f"\n[SUCCESS] Target of 70% ACHIEVED!")
else:
    print(f"\n[WARNING] Current: {avg_accuracy*100:.2f}% | Target: 70%")
    print(f"   Gap: {70 - avg_accuracy*100:.2f}%")

# Feature importance
print(f"\n[FEATURE IMPORTANCE] TOP 10 FEATURES (TDS model):")
feature_importance = pd.DataFrame({
    'feature': tds_features,
    'importance': best_rf_tds.feature_importances_
}).sort_values('importance', ascending=False).head(10)

for idx, row in feature_importance.iterrows():
    print(f"   {row['feature']:30s} -> {row['importance']:.4f}")

print("\n" + "=" * 80)
print("RECOMMENDATIONS FOR FURTHER IMPROVEMENT:")
print("=" * 80)
print("""
1. COLLECT REAL TEMPORAL DATA:
   • Exact measurement dates/times
   • Seasonal rainfall data
   • Industrial discharge schedules
   
2. ADD EXTERNAL DATA SOURCES:
   • Weather data (temperature, humidity, rainfall)
   • Industrial activity near each location
   • River flow rate measurements
   • Upstream pollution events
   
3. ADVANCED MODELS:
   • LSTM/GRU for time series patterns
   • XGBoost/LightGBM/CatBoost
   • Ensemble stacking (combine multiple models)
   
4. DATA QUALITY:
   • More frequent measurements
   • More locations along river
   • Calibrate sensors regularly
   
5. FEATURE ENGINEERING:
   • Weather patterns (7-day rainfall before measurement)
   • Distance from pollution sources
   • Population density near location
   • Time since last major rainfall event
""")

print("\n[DONE] Enhanced model training complete!")
