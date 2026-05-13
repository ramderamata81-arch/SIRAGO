import re

# ============================
# FIX 1: DriverMap.js
# Bouton DEVIATION NORMALE : phase 'trip' -> 'normal', runSimulation 'danger' -> 'normal'
# ============================
with open('screens/DriverMap.js', 'r', encoding='utf-8', errors='replace') as f:
    dm = f.read()

# Replace phase 'trip' with 'normal' in the normal detour button (only that specific occurrence)
dm = dm.replace(
    "phase: 'trip',\r\n                               reason: 'manual_driver_deviation'",
    "phase: 'normal',\r\n                               reason: 'traffic_detour'"
)

# Replace runSimulation 'danger' -> 'normal' for the normal detour (line ~2210)
# We use a unique suffix comment to target only this specific call
old_sim = "runSimulation(points, 'danger'); // \U0001f6a8 [SIM_PRO] Phase 'danger' pour d\u00e9clencher l'alerte admin"
new_sim = "runSimulation(points, 'normal'); // \u2705 Phase 'normal' = recalcul sans alerte securite"
dm = dm.replace(old_sim, new_sim)

with open('screens/DriverMap.js', 'w', encoding='utf-8') as f:
    f.write(dm)

print("DriverMap.js patched")
count_normal = dm.count("phase: 'normal'")
print(f"  phase 'normal' occurrences: {count_normal}")

# ============================
# FIX 2: PassengerMap.js
# - Supprimer le pourcentage de risque de l'UI passager
# - Le passager voit juste "Alerte securite" sans le chiffre
# ============================
with open('screens/PassengerMap.js', 'r', encoding='utf-8', errors='replace') as f:
    pm = f.read()

# Remove percentage from risk banner
pm = pm.replace(
    "RISQUE DE D\u00c9VIATION : {pRiskLevel}%",
    "\u26a0\ufe0f Alerte s\u00e9curit\u00e9 d\u00e9tect\u00e9e"
)

with open('screens/PassengerMap.js', 'w', encoding='utf-8') as f:
    f.write(pm)

print("PassengerMap.js patched")
print("Done!")
