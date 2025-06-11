import json
import os

# 1. On détermine le dossier où se trouve ce script (compte.py)
base_dir = os.path.dirname(os.path.abspath(__file__))

# 2. On construit le chemin vers data/
data_dir = os.path.join(base_dir, 'data')

# 3. On liste les fichiers JSON à charger
input_files = [
    os.path.join(data_dir, 'article_depense.json'),
    os.path.join(data_dir, 'article_recette.json')
]

seed_data = []

for filepath in input_files:
    if not os.path.isfile(filepath):
        print(f"⚠️  Fichier introuvable : {filepath}")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    for entry in payload.get('datas', []):
        compte = entry.get('Compte', {})
        seed_data.append({
            "compteid":   compte.get("Oid", 0),
            "mnem":       entry.get("Mnem", ""),
            "caseCerfa":  compte.get("Case", "") or ""
        })

# 4. On écrit le résultat
output_file = os.path.join(base_dir, 'prisma_seed.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(seed_data, f, ensure_ascii=False, indent=2)

print(f"✅ Généré {output_file} avec {len(seed_data)} entrées.")
