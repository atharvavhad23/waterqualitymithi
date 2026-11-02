with open(r"d:\waterqualityanalysis\server\api\ml_views.py", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("df['Location_Encoded'] = le.fit_transform(df['Location'])", "df['Location_encoded'] = le.fit_transform(df['Location'])")
text = text.replace("feature_columns = ['Year', 'Location_Encoded', 'Temp', 'DO', 'pH']", "feature_columns = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH']")
text = text.replace("feature_columns_classification = ['Year', 'Location_Encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']", "feature_columns_classification = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']")

with open(r"d:\waterqualityanalysis\server\api\ml_views.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed Location_encoded casing in ml_views.py!")

