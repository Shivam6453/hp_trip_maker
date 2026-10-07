from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
from datetime import datetime
import pandas as pd

# Import the existing transit logic
from app.ml.transit_engine import generate_live_routes

app = Flask(__name__)
CORS(app)

# Load Optimizer Model
OPTIMIZER_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'app', 'ml', 'optimizer_model.pkl')
try:
    optimizer_ml = joblib.load(OPTIMIZER_MODEL_PATH)
except Exception:
    optimizer_ml = None

DESTINATION_CODES = {
    "shimla": 0, "manali": 1, "dharamshala": 2, "dalhousie": 3,
    "kaza": 4, "spiti": 5, "reckong peo": 6, "kinnaur": 7,
    "keylong": 8, "kullu": 9, "palampur": 10, "chamba": 11,
    "solan": 12, "mandi": 13, "bilaspur": 14, "hamirpur": 15, "una": 16, "kangra": 17
}

@app.route('/api/transit-tracker', methods=['POST'])
def transit_tracker():
    data = request.json
    origin = data.get('origin')
    destination = data.get('destination')
    if not origin or not destination:
        return jsonify({"status": "error", "message": "Origin and destination required."}), 400
    return jsonify(generate_live_routes(origin, destination))

@app.route('/api/optimize-trip', methods=['POST'])
def optimize_trip():
    data = request.json
    origin = data.get('origin', 'Chandigarh')
    destination = data.get('destination', 'Shimla')
    days = int(data.get('days', 4))
    budget_ceiling = int(data.get('budget', 15000))
    transit_mode = data.get('transit_mode', 'hrtc_volvo') # 'hrtc_ordinary', 'hrtc_volvo', 'private_taxi'
    
    # 1. Map Transit Mode to Traveler Style & Fleet Code
    if transit_mode == 'hrtc_ordinary':
        traveler_style = 0
        preferred_fleet = "HRTC Ordinary"
    elif transit_mode == 'private_taxi':
        traveler_style = 2
        preferred_fleet = "Private Hill Taxi"
    else:
        traveler_style = 1
        preferred_fleet = "HRTC Himsuta (Volvo)" # Fallback to Himgaura/Ordinary if Volvo not available

    # 2. Get Transit Costs using existing Transit Engine
    transit_data = generate_live_routes(origin, destination)
    
    one_way_fare = 1500 # Fallback
    travel_time = 8.0 # Fallback
    
    if transit_data.get('status') == 'success':
        travel_time = transit_data['base_duration_hours']
        # Find the fare for the preferred fleet, or take the cheapest available
        fares = [f['fare_inr'] for f in transit_data['fleet'] if preferred_fleet in f['operator']]
        if not fares:
            fares = [f['fare_inr'] for f in transit_data['fleet']]
        one_way_fare = min(fares) if fares else 1500

    transit_round_trip = one_way_fare * 2

    # 3. Predict Lodging & Food Costs using ML Optimizer
    dest_clean = destination.strip().lower()
    dest_code = 0 # Default to Shimla if unknown
    for key, val in DESTINATION_CODES.items():
        if key in dest_clean:
            dest_code = val
            break
            
    current_month = datetime.now().month
    
    if optimizer_ml:
        pred_input = pd.DataFrame([[dest_code, current_month, traveler_style]], columns=['destination_code', 'month', 'traveler_style'])
        daily_cost = float(optimizer_ml.predict(pred_input)[0])
    else:
        daily_cost = 2500.0 # Fallback if model not trained

    total_lodging_food = int(daily_cost * days)
    contingency_reserve = int((total_lodging_food + transit_round_trip) * 0.15) # 15% safety buffer
    
    total_estimated = total_lodging_food + transit_round_trip + contingency_reserve
    
    status = "Optimal" if total_estimated <= budget_ceiling else "Budget Alert - Exceeds Ceiling"

    return jsonify({
        "destination": destination.title(),
        "estimated_travel_time_hours": travel_time,
        "duration_days": days,
        "cost_breakdown": {
            "lodging_food_inr": total_lodging_food,
            "transit_round_trip_inr": transit_round_trip,
            "contingency_reserve_inr": contingency_reserve,
            "total_estimated_inr": total_estimated
        },
        "budget_analysis": {
            "status": status
        }
    })

if __name__ == '__main__':
    print("Starting Himachal Tourism AI Backend on Port 5000...")
    app.run(debug=True, port=5000)