import pandas as pd
import numpy as np
import os

print("Initializing Hotel & Homestay Dataset Generator...")

DESTINATION_BASE_COSTS = {
    "shimla": 2500, "manali": 2800, "dharamshala": 2200, "dalhousie": 2400,
    "kaza": 2000, "spiti": 2000, "reckong peo": 1800, "kinnaur": 1800,
    "keylong": 1900, "kullu": 1800, "palampur": 1700, "chamba": 1600,
    "solan": 1500, "mandi": 1200, "bilaspur": 1100, "hamirpur": 1000, "una": 1000, "kangra": 1400
}

DESTINATION_CODES = {dest: idx for idx, dest in enumerate(DESTINATION_BASE_COSTS.keys())}
dataset = []
np.random.seed(42)

for dest, base_cost in DESTINATION_BASE_COSTS.items():
    dest_code = DESTINATION_CODES[dest]
    for traveler_style in [0, 1, 2]:
        style_multiplier = 0.55 if traveler_style == 0 else (1.0 if traveler_style == 1 else 2.5)

        for month in range(1, 13):
            if month in [5, 6]: season_multiplier = 1.6
            elif month in [12, 1]: season_multiplier = 1.4
            elif month in [7, 8]: season_multiplier = 0.75
            else: season_multiplier = 1.0
            
            for _ in range(50):
                variance = np.random.uniform(0.85, 1.15) 
                daily_cost = int(base_cost * style_multiplier * season_multiplier * variance)
                daily_cost = max(daily_cost, 600)
                
                dataset.append({
                    "destination": dest,
                    "destination_code": dest_code,
                    "month": month,
                    "traveler_style": traveler_style,
                    "daily_cost_inr": daily_cost
                })

df = pd.DataFrame(dataset)
csv_path = os.path.join(os.path.dirname(__file__), "hp_lodging_dataset.csv")
df.to_csv(csv_path, index=False)

print(f"Optimizer dataset built! {len(df)} hotel/homestay pricing records saved to: {csv_path}")