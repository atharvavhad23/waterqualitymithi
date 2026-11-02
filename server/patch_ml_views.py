with open(r"d:\waterqualityanalysis\server\api\ml_views.py", "r", encoding="utf-8") as f:
    text = f.read()

target = "csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'mithi_river_data.csv')"
replacement = """server_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        gen_csv = os.path.join(server_root, 'mithi_river_genuine_data.csv')
        csv_path = gen_csv if os.path.exists(gen_csv) else os.path.join(server_root, 'mithi_river_data.csv')"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open(r"d:\waterqualityanalysis\server\api\ml_views.py", "w", encoding="utf-8") as f:
        f.write(text)
    print("Updated csv_path in ml_views.py successfully!")
else:
    print("Target not found in ml_views.py")

