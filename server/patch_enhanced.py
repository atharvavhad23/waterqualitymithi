with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "r", encoding="utf-8") as f:
    text = f.read()

# Let's inspect where X is defined before TDS prediction
old_pattern = """X = df[feature_cols]
print(f"\\n[OK] Total features for modeling: {X.shape[1]}")

print("\\n" + "=" * 80)
print("TRAINING ENHANCED MODELS WITH HYPERPARAMETER TUNING")
print("=" * 80)

# ============================================================================
# TDS PREDICTION
# ============================================================================
print("\\n[6/8] Training TDS Range Classifier...")
y_tds = df['TDS_category']
X_train, X_test, y_train, y_test = train_test_split(X, y_tds, test_size=0.2, random_state=42)"""

new_pattern = """print("\\n" + "=" * 80)
print("TRAINING ENHANCED MODELS (LEAKAGE-FREE FEATURE SETS)")
print("=" * 80)

# ============================================================================
# TDS PREDICTION (Features strictly excluding TDS and TDS-derivatives)
# ============================================================================
print("\\n[6/8] Training TDS Range Classifier...")
tds_leak_features = ['TDS', 'TDS_log', 'TDS_lag1', 'TDS_lag2', 'TDS_rolling_mean', 'TDS_Temp_ratio', 'Dissolved_solids_temp']
tds_features = [c for c in feature_cols if c not in tds_leak_features]
y_tds = df['TDS_category']
X_train, X_test, y_train, y_test = train_test_split(df[tds_features], y_tds, test_size=0.2, random_state=42, stratify=y_tds)"""

if old_pattern in text:
    text = text.replace(old_pattern, new_pattern, 1)

# Now check BOD prediction feature leakage
old_bod = """print("\\n[7/8] Training BOD Range Classifier...")
y_bod = df['BOD_category']
X_train_bod, X_test_bod, y_train_bod, y_test_bod = train_test_split(X, y_bod, test_size=0.2, random_state=42)"""

new_bod = """print("\\n[7/8] Training BOD Range Classifier...")
bod_leak_features = ['BOD', 'BOD_log', 'BOD_lag1', 'BOD_lag2', 'BOD_rolling_mean', 'BOD_COD_ratio', 'Pollution_index']
bod_features = [c for c in feature_cols if c not in bod_leak_features]
y_bod = df['BOD_category']
X_train_bod, X_test_bod, y_train_bod, y_test_bod = train_test_split(df[bod_features], y_bod, test_size=0.2, random_state=42, stratify=y_bod)"""

if old_bod in text:
    text = text.replace(old_bod, new_bod, 1)

# Now check COD prediction feature leakage
old_cod = """print("\\n[8/8] Training COD Range Classifier...")
y_cod = df['COD_category']
X_train_cod, X_test_cod, y_train_cod, y_test_cod = train_test_split(X, y_cod, test_size=0.2, random_state=42)"""

new_cod = """print("\\n[8/8] Training COD Range Classifier...")
cod_leak_features = ['COD', 'COD_log', 'COD_lag1', 'COD_lag2', 'COD_rolling_mean', 'BOD_COD_ratio', 'Pollution_index']
cod_features = [c for c in feature_cols if c not in cod_leak_features]
y_cod = df['COD_category']
X_train_cod, X_test_cod, y_train_cod, y_test_cod = train_test_split(df[cod_features], y_cod, test_size=0.2, random_state=42, stratify=y_cod)"""

if old_cod in text:
    text = text.replace(old_cod, new_cod, 1)

with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated train_enhanced_models.py with clean leakage-free feature subsets!")

