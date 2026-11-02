with open(r"d:\waterqualityanalysis\server\compare_models.py", "r", encoding="utf-8") as f:
    text = f.read()

target_str = 'report_lines.append("Task: Predict TDS, BOD, and COD values")\nreport_lines.append("")\n\nreport_lines.append("Linear Regression (with Polynomial Features):")'

replacement_str = '''report_lines.append("Task: Predict TDS, BOD, and COD values")
report_lines.append("")

for target in ['TDS', 'BOD', 'COD']:
    lr = regression_results[target]['linear']
    xgb_r = regression_results[target]['xgboost']
    report_lines.append(f"--- {target} PREDICTION ---")
    report_lines.append("Linear Regression (with Polynomial Features):")'''

if target_str in text:
    text = text.replace(target_str, replacement_str, 1)
    with open(r"d:\waterqualityanalysis\server\compare_models.py", "w", encoding="utf-8") as f:
        f.write(text)
    print("Fixed regression loop in compare_models.py")
else:
    print("target_str not found!")

