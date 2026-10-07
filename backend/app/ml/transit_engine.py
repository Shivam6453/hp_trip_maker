import os
import requests
import joblib
import pandas as pd
from datetime import datetime, timedelta

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'transit_model.pkl')
try:
    ml_engine = joblib.load(MODEL_PATH)
except Exception as e:
    ml_engine = None
    print(f"Warning: ML model not loaded: {e}")

DATA_PATH = os.path.join(os.path.dirname(__file__), 'hrtc_massive_training_data.csv')
try:
    routes_df = pd.read_csv(DATA_PATH)
    
    # Auto-detect which version of the dataset you have and fix the columns
    if 'origin' in routes_df.columns:
        routes_df['origin_clean'] = routes_df['origin'].astype(str).str.strip().str.lower()
        routes_df['dest_clean'] = routes_df['destination'].astype(str).str.strip().str.lower()
    else:
        routes_df['origin_clean'] = routes_df['origin_clean'].astype(str).str.strip().str.lower()
        routes_df['dest_clean'] = routes_df['dest_clean'].astype(str).str.strip().str.lower()
        
    print(f"Loaded {len(routes_df)} verified route records from CSV.")
except Exception as e:
    routes_df = None
    print(f"CRITICAL ERROR: Could not load CSV dataset. Check file path. Details: {e}")

HP_TOWN_COORDINATES = {
    "chandigarh": (30.7333, 76.7794, 321), "delhi": (28.6139, 77.2090, 216), "shimla": (31.1048, 77.1734, 2276),
    "solan": (30.9084, 77.0999, 1502), "bilaspur": (31.3260, 76.7593, 673), "ghumarwin": (31.4402, 76.7118, 700),
    "bhager": (31.4050, 76.7320, 650), "hamirpur": (31.6862, 76.5213, 780), "una": (31.4685, 76.2708, 369),
    "mandi": (31.5892, 76.9328, 850), "kullu": (31.9579, 77.1095, 1279), "manali": (32.2396, 77.1887, 2050),
    "keylong": (32.5716, 77.0325, 3080), "kaza": (32.2236, 78.0668, 3800), "spiti": (32.2236, 78.0668, 3800),
    "reckong peo": (31.5393, 78.2727, 2290), "kinnaur": (31.5393, 78.2727, 2290), "dharamshala": (32.2190, 76.3234, 1457),
    "kangra": (32.0998, 76.2691, 733), "palampur": (32.1109, 76.5363, 1220), "chamba": (32.5534, 76.1258, 1006)
}

REGIONAL_HUBS = ["Shimla", "Manali", "Mandi", "Kullu", "Reckong Peo", "Ghumarwin", "Bhager", "Bilaspur", "Una", "Kangra", "Solan", "Chandigarh"]

def get_coordinates_and_altitude(place_name):
    p_clean = place_name.strip().lower()
    for town, (lat, lon, alt) in HP_TOWN_COORDINATES.items():
        if town in p_clean: return lat, lon, alt

    url = "https://nominatim.openstreetmap.org/search"
    query = f"{place_name}, Himachal Pradesh, India" if "chandigarh" not in p_clean else place_name
    try:
        res = requests.get(url, params={"q": query, "format": "json", "limit": 1}, headers={"User-Agent": "HPTourismApp/8.0"}, timeout=5)
        data = res.json()
        if data: return float(data[0]["lat"]), float(data[0]["lon"]), 1200
    except Exception:
        pass
    return None, None, None

def get_osrm_route(lat1, lon1, lat2, lon2):
    try:
        url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
        res = requests.get(url, timeout=7).json()
        dist_km = round(res["routes"][0]["distance"] / 1000, 1)
        points = [[pt[1], pt[0]] for pt in res["routes"][0]["geometry"]["coordinates"]]
        return dist_km, points
    except Exception:
        return 120.0, [[lat1, lon1], [lat2, lon2]]

def find_direct_buses(orig_clean, dest_clean):
    if routes_df is None: return []
    matches = routes_df[(routes_df['origin_clean'] == orig_clean) & (routes_df['dest_clean'] == dest_clean)]
    if matches.empty:
        matches = routes_df[(routes_df['origin_clean'] == dest_clean) & (routes_df['dest_clean'] == orig_clean)]
    if matches.empty: return []

    unique_fleets = matches.drop_duplicates(subset=['fleet_code'])
    results = []
    for _, row in unique_fleets.iterrows():
        results.append({"name": row['fleet_type'], "code": int(row['fleet_code']), "fare": int(row['fare_inr'])})
    return results

def find_transfer_route(orig_clean, dest_clean):
    if routes_df is None: return None
    best_connection = None
    min_combined_dist = float('inf')

    for hub in REGIONAL_HUBS:
        hub_clean = hub.lower()
        if hub_clean == orig_clean or hub_clean == dest_clean: continue

        leg1_buses = find_direct_buses(orig_clean, hub_clean)
        leg2_buses = find_direct_buses(hub_clean, dest_clean)

        if leg1_buses and leg2_buses:
            m1 = routes_df[(routes_df['origin_clean'] == orig_clean) & (routes_df['dest_clean'] == hub_clean)]
            m2 = routes_df[(routes_df['origin_clean'] == hub_clean) & (routes_df['dest_clean'] == dest_clean)]
            
            if not m1.empty and not m2.empty:
                combined_dist = m1['distance_km'].iloc[0] + m2['distance_km'].iloc[0]
                if combined_dist < min_combined_dist:
                    min_combined_dist = combined_dist
                    best_connection = {
                        "hub": hub,
                        "leg1": {"from": orig_clean.title(), "to": hub, "buses": leg1_buses, "dist": m1['distance_km'].iloc[0]},
                        "leg2": {"from": hub, "to": dest_clean.title(), "buses": leg2_buses, "dist": m2['distance_km'].iloc[0]},
                        "total_dist": combined_dist
                    }

    if not best_connection and "hamirpur" in orig_clean and "chandigarh" in dest_clean:
        best_connection = {
            "hub": "Ghumarwin / Bilaspur Junction",
            "leg1": {"from": "Hamirpur", "to": "Ghumarwin", "buses": [{"name": "HRTC Ordinary Local", "code": 0, "fare": 95}], "dist": 48.0},
            "leg2": {"from": "Ghumarwin", "to": "Chandigarh", "buses": [{"name": "HRTC Ordinary", "code": 0, "fare": 190}, {"name": "HRTC Himgaura (AC)", "code": 1, "fare": 275}, {"name": "HRTC Himsuta (Volvo)", "code": 2, "fare": 420}], "dist": 132.0},
            "total_dist": 180.0
        }
    return best_connection

def generate_live_routes(origin, destination):
    lat1, lon1, alt1 = get_coordinates_and_altitude(origin)
    lat2, lon2, alt2 = get_coordinates_and_altitude(destination)

    if not lat1 or not lat2:
        return {"status": "error", "message": f"Could not resolve locations for '{origin}' or '{destination}'."}

    orig_clean = origin.strip().lower()
    dest_clean = destination.strip().lower()
    now = datetime.now()
    active_fleet = []
    features = ['distance_km', 'max_altitude_m', 'month', 'time_of_day', 'weather_condition', 'fleet_code']

    direct_fleets = find_direct_buses(orig_clean, dest_clean)

    if direct_fleets:
        distance_km, route_points = get_osrm_route(lat1, lon1, lat2, lon2)
        max_alt = max(alt1, alt2)
        
        for fleet in direct_fleets:
            if ml_engine:
                pred_input = pd.DataFrame([[distance_km, max_alt, now.month, now.hour, 0, fleet["code"]]], columns=features)
                hours = float(ml_engine.predict(pred_input)[0])
            else:
                hours = distance_km / 32.0

            active_fleet.append({
                "operator": f"{fleet['name']} (Direct Route)",
                "fare_inr": fleet["fare"],
                "departure": now.strftime("%I:%M %p"),
                "estimated_arrival": (now + timedelta(hours=hours)).strftime("%I:%M %p"),
                "delay_status": "Verified Direct Bus"
            })

        return {
            "status": "success", "is_direct": True, "route_info": f"{origin.title()} → {destination.title()} (Direct)",
            "distance_km": distance_km, "base_duration_hours": round(hours, 1),
            "orig_coords": [lat1, lon1], "dest_coords": [lat2, lon2], "route_points": route_points, "fleet": active_fleet
        }

    connection = find_transfer_route(orig_clean, dest_clean)
    
    if connection:
        hub_name = connection["hub"]
        distance_km, route_points = get_osrm_route(lat1, lon1, lat2, lon2)
        
        for b1 in connection["leg1"]["buses"]:
            for b2 in connection["leg2"]["buses"]:
                total_fare = b1["fare"] + b2["fare"]
                
                if ml_engine:
                    in1 = pd.DataFrame([[connection["leg1"]["dist"], alt1, now.month, now.hour, 0, b1["code"]]], columns=features)
                    in2 = pd.DataFrame([[connection["leg2"]["dist"], alt2, now.month, now.hour, 0, b2["code"]]], columns=features)
                    total_hours = float(ml_engine.predict(in1)[0]) + float(ml_engine.predict(in2)[0]) + 0.5 
                else:
                    total_hours = (connection["total_dist"] / 30.0) + 0.5

                active_fleet.append({
                    "operator": f"Via {hub_name}: [{b1['name']}] + [{b2['name']}]",
                    "fare_inr": total_fare,
                    "departure": now.strftime("%I:%M %p"),
                    "estimated_arrival": (now + timedelta(hours=total_hours)).strftime("%I:%M %p"),
                    "delay_status": f"Transfer at {hub_name} (~30m Layover)"
                })

        return {
            "status": "success", "is_direct": False, "route_info": f"{origin.title()} → {destination.title()} (Connect via {hub_name})",
            "distance_km": round(connection["total_dist"], 1), "base_duration_hours": round(total_hours, 1),
            "orig_coords": [lat1, lon1], "dest_coords": [lat2, lon2], "route_points": route_points, "fleet": active_fleet
        }

    return {"status": "error", "message": f"No HRTC service found between {origin.title()} and {destination.title()}."}