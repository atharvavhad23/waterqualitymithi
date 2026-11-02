import os
import re

client_dir = r"d:\waterqualityanalysis\client"
endpoints = set()

for root, dirs, files in os.walk(client_dir):
    for f in files:
        if f.endswith(('.tsx', '.jsx', '.ts', '.js')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                matches = re.findall(r'fetch\([\'"]([^\'"]+)[\'"]', c)
                for m in matches:
                    endpoints.add((f, m))

for f, ep in sorted(endpoints):
    print(f"{f:30s} -> {ep}")

