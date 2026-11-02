with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "r", encoding="utf-8") as f:
    text = f.read()

# Fix BOD block
old_bod_block = """# ============================================================================
# BOD PREDICTION
# ============================================================================
print("\\n[7/8] Training BOD Range Classifier...")
y_bod = df['BOD_category']
X_train, X_test, y_train, y_test = train_test_split(df[bod_features], y_bod, test_size=0.2, random_state=42, stratify=y_bod)

# Use best model from TDS
best_rf_bod = RandomForestClassifier(
    n_estimators=300,
    max_depth=25,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)"""

new_bod_block = """# ============================================================================
# BOD PREDICTION (Features excluding BOD and direct derivatives)
# ============================================================================
print("\\n[7/8] Training BOD Range Classifier...")
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
)"""

# Fix COD block
old_cod_block = """# ============================================================================
# COD PREDICTION
# ============================================================================
print("\\n[8/8] Training COD Range Classifier...")
y_cod = df['COD_category']
X_train, X_test, y_train, y_test = train_test_split(df[cod_features], y_cod, test_size=0.2, random_state=42, stratify=y_cod)

best_rf_cod = RandomForestClassifier(
    n_estimators=300,
    max_depth=25,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)"""

new_cod_block = """# ============================================================================
# COD PREDICTION (Features excluding COD and direct derivatives)
# ============================================================================
print("\\n[8/8] Training COD Range Classifier...")
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
)"""

if old_bod_block in text:
    text = text.replace(old_bod_block, new_bod_block)
    print("Replaced BOD block")
else:
    print("old_bod_block not found")

if old_cod_block in text:
    text = text.replace(old_cod_block, new_cod_block)
    print("Replaced COD block")
else:
    print("old_cod_block not found")

with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "w", encoding="utf-8") as f:
    f.write(text)

