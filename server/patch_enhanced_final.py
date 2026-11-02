with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "r", encoding="utf-8") as f:
    text = f.read()

# Replace line 206 for BOD
text = text.replace(
    "X_train, X_test, y_train, y_test = train_test_split(X, y_bod, test_size=0.2, random_state=42)",
    "X_train, X_test, y_train, y_test = train_test_split(df[bod_features], y_bod, test_size=0.2, random_state=42, stratify=y_bod)"
)

# Replace line 230 for COD
text = text.replace(
    "X_train, X_test, y_train, y_test = train_test_split(X, y_cod, test_size=0.2, random_state=42)",
    "X_train, X_test, y_train, y_test = train_test_split(df[cod_features], y_cod, test_size=0.2, random_state=42, stratify=y_cod)"
)

# Replace line 277 for TDS feature importance
text = text.replace(
    "'feature': feature_cols,",
    "'feature': tds_features,"
)

with open(r"d:\waterqualityanalysis\server\train_enhanced_models.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Cleaned feature inputs in train_enhanced_models.py successfully!")

