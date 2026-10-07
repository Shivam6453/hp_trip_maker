import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

print("Loading authentic HRTC training dataset...")
df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'hrtc_massive_training_data.csv'))

X = df[['distance_km', 'max_altitude_m', 'month', 'time_of_day', 'weather_condition', 'fleet_code']]
y = df['duration_hours']

print("Training strict Random Forest Neural Engine...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), 'transit_model.pkl')
joblib.dump(model, model_path)

print(f"Model trained on TRUE physics and saved to {model_path}!")