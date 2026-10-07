import pandas as pd
import numpy as np
import os

print("Initializing Authentic HRTC Route Network...")

# 1. Ground Truth HRTC Corridors (Origin, Dest, Distance_km, Real_Base_Hours, Allowed_Fleets)
VALID_ROUTES = [
    ("Chandigarh", "Shimla", 112, 3.5, [0, 1, 2]),
    ("Chandigarh", "Manali", 310, 8.5, [0, 1, 2]),
    ("Chandigarh", "Dharamshala", 240, 6.0, [0, 1, 2]),
    ("Chandigarh", "Bilaspur", 135, 3.0, [0, 1, 2]),
    ("Chandigarh", "Una", 110, 2.5, [0, 1]),
    ("Chandigarh", "Hamirpur", 180, 5.0, [0, 1]),
    
    ("Shimla", "Solan", 45, 1.5, [0, 1, 2]),
    ("Shimla", "Mandi", 145, 5.5, [0, 1]),
    ("Shimla", "Manali", 250, 9.0, [0, 1]),
    ("Hamirpur", "Ghumarwin", 40, 1.5, [0]),
    ("Ghumarwin", "Bilaspur", 25, 1.0, [0]),
    ("Hamirpur", "Mandi", 75, 3.0, [0]),
    ("Mandi", "Kullu", 70, 2.5, [0, 1, 2]),
    ("Kullu", "Manali", 40, 1.5, [0, 1, 2]),
    ("Dharamshala", "Chamba", 130, 4.5, [0]),

    ("Shimla", "Reckong Peo", 225, 9.0, [0]),
    ("Reckong Peo", "Kaza", 200, 10.0, [0]),
    ("Shimla", "Kaza", 420, 18.0, [0]),
    ("Manali", "Keylong", 71, 2.5, [0]),
    ("Manali", "Kaza", 200, 11.0, [0]),
    ("Chamba", "Dalhousie", 55, 2.0, [0])
]

# Auto-generate reverse routes
ALL_ROUTES = []
for r in VALID_ROUTES:
    ALL_ROUTES.append(r)
    ALL_ROUTES.append((r[1], r[0], r[2], r[3], r[4]))

FLEETS = {
    0: {"name": "HRTC Ordinary", "rate": 1.45},
    1: {"name": "HRTC Himgaura AC", "rate": 2.10},
    2: {"name": "HRTC Himsuta Volvo", "rate": 3.20}
}

dataset = []
np.random.seed(42)

for orig, dest, dist, base_hrs, allowed_fleets in ALL_ROUTES:
    max_alt = 3800 if "Kaza" in [orig, dest] else (2290 if "Peo" in [orig, dest] else 1500)
    
    for fleet_code in allowed_fleets:
        for month in range(1, 13):
            for time in [6, 10, 14, 19]:
                weather_code = 0 
                delay_hrs = 0.0
                
                if month in [7, 8]: 
                    weather_code = int(np.random.choice([0, 1, 2], p=[0.4, 0.4, 0.2]))
                    if weather_code == 1: delay_hrs = 1.0
                    if weather_code == 2: delay_hrs = 3.5 
                elif month in [12, 1, 2] and max_alt > 2000: 
                    weather_code = int(np.random.choice([0, 1, 2], p=[0.3, 0.5, 0.2]))
                    if weather_code == 1: delay_hrs = 1.5
                    if weather_code == 2: delay_hrs = 5.0 
                
                if time >= 18: delay_hrs += 0.5
                fleet_speed_mod = -0.5 if fleet_code == 2 else 0.0
                
                final_hours = max(round(base_hrs + delay_hrs + fleet_speed_mod, 2), dist / 45.0)
                fare = int(dist * FLEETS[fleet_code]["rate"])
                
                dataset.append({
                    "origin_clean": orig.lower(),
                    "dest_clean": dest.lower(),
                    "distance_km": dist,
                    "max_altitude_m": max_alt,
                    "month": month,
                    "time_of_day": time,
                    "weather_condition": weather_code,
                    "fleet_type": FLEETS[fleet_code]["name"],
                    "fleet_code": fleet_code,
                    "duration_hours": final_hours,
                    "fare_inr": fare
                })

df = pd.DataFrame(dataset)
csv_path = os.path.join(os.path.dirname(__file__), "hrtc_massive_training_data.csv")
df.drop_duplicates(inplace=True)
df.to_csv(csv_path, index=False)

print(f"Dataset generated! {len(df)} authentic HRTC permutations saved to: {csv_path}")