import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

print("Loading Lodging & Food dataset...")
df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'hp_lodging_dataset.csv'))

X = df[['destination_code', 'month', 'traveler_style']]
y = df['daily_cost_inr']

print("Training Budget Optimizer Engine...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), 'optimizer_model.pkl')
joblib.dump(model, model_path)

print(f"Optimizer model trained and saved to {model_path}!")