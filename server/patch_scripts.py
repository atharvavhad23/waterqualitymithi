import os

server_dir = r"d:\waterqualityanalysis\server"

def update_file(filename, old_str, new_str):
    p = os.path.join(server_dir, filename)
    if not os.path.exists(p):
        return
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Pattern not found in {filename}")

# train_mithi_models.py
update_file(
    "train_mithi_models.py",
    'csv_file = "mithi_river_data.csv"',
    'csv_file = "mithi_river_genuine_data.csv" if os.path.exists("mithi_river_genuine_data.csv") else "mithi_river_data.csv"'
)

# train_enhanced_models.py
update_file(
    "train_enhanced_models.py",
    "df = pd.read_csv('mithi_river_data.csv')",
    "csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'\ndf = pd.read_csv(csv_path)"
)

# deep_learning_mithi_models.py
update_file(
    "deep_learning_mithi_models.py",
    'DATA_PATH = os.path.join(os.path.dirname(__file__), "mithi_river_data.csv")',
    'gen_path = os.path.join(os.path.dirname(__file__), "mithi_river_genuine_data.csv")\nDATA_PATH = gen_path if os.path.exists(gen_path) else os.path.join(os.path.dirname(__file__), "mithi_river_data.csv")'
)

# train_hybrid_ceemdan_attention_bilstm_xgboost.py
update_file(
    "train_hybrid_ceemdan_attention_bilstm_xgboost.py",
    'DATA_PATH = os.path.join(BASE_DIR, "mithi_river_data.csv")',
    'gen_path = os.path.join(BASE_DIR, "mithi_river_genuine_data.csv")\nDATA_PATH = gen_path if os.path.exists(gen_path) else os.path.join(BASE_DIR, "mithi_river_data.csv")'
)

# compare_models.py
update_file(
    "compare_models.py",
    "df = pd.read_csv('mithi_river_data.csv')",
    "csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'\ndf = pd.read_csv(csv_path)"
)

# train_improved_models.py
update_file(
    "train_improved_models.py",
    "df = pd.read_csv('mithi_river_data.csv')",
    "csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'\ndf = pd.read_csv(csv_path)"
)

# train_classification_approach.py
update_file(
    "train_classification_approach.py",
    "df = pd.read_csv('mithi_river_data.csv')",
    "csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'\ndf = pd.read_csv(csv_path)"
)

# train_rf_models.py
update_file(
    "train_rf_models.py",
    "df = pd.read_csv('mithi_river_data.csv')",
    "csv_path = 'mithi_river_genuine_data.csv' if os.path.exists('mithi_river_genuine_data.csv') else 'mithi_river_data.csv'\ndf = pd.read_csv(csv_path)"
)

