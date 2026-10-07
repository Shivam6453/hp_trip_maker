DESTINATIONS = {
    "shimla": {"base_cost_per_day": 2200, "transit_hours": 3.5, "altitude_m": 2276, "type": "Heritage Circuit"},
    "manali": {"base_cost_per_day": 2800, "transit_hours": 8.0, "altitude_m": 2050, "type": "Adventure Circuit"},
    "dharamshala": {"base_cost_per_day": 2100, "transit_hours": 6.5, "altitude_m": 1457, "type": "Spiritual Circuit"},
    "spiti": {"base_cost_per_day": 3800, "transit_hours": 14.0, "altitude_m": 3800, "type": "High-Altitude Desert"},
    "chamba": {"base_cost_per_day": 1900, "transit_hours": 7.5, "altitude_m": 1006, "type": "Cultural Circuit"},
    "kinnaur": {"base_cost_per_day": 2600, "transit_hours": 10.0, "altitude_m": 2600, "type": "Valley Circuit"},
    "dalhousie": {"base_cost_per_day": 2400, "transit_hours": 7.0, "altitude_m": 1970, "type": "Colonial Hill Station"},
    "jibhi": {"base_cost_per_day": 2000, "transit_hours": 8.0, "altitude_m": 1600, "type": "Eco-Tourism Circuit"},
    "kasol": {"base_cost_per_day": 2200, "transit_hours": 9.0, "altitude_m": 1580, "type": "Parvati Valley"}
}

TRANSIT_MULTIPLIERS = {
    "hrtc_ordinary": {"cost_factor": 1.0, "time_factor": 1.25},
    "hrtc_volvo": {"cost_factor": 2.5, "time_factor": 1.0},
    "private_taxi": {"cost_factor": 5.0, "time_factor": 0.85}
}

def plan_itinerary(origin, destination, days, budget, transit_mode):
    dest_key = destination.lower().strip()
    dest_data = DESTINATIONS.get(dest_key, {
        "base_cost_per_day": 2300,
        "transit_hours": 6.0,
        "altitude_m": 1800,
        "type": "Custom Himalayan Node"
    })
    transit_info = TRANSIT_MULTIPLIERS.get(transit_mode, TRANSIT_MULTIPLIERS["hrtc_volvo"])

    stay_cost = dest_data["base_cost_per_day"] * max(1, days)
    travel_cost = round(800 * transit_info["cost_factor"] * 2, 2)
    buffer_cost = round((stay_cost + travel_cost) * 0.15, 2)

    total_projected = round(stay_cost + travel_cost + buffer_cost, 2)
    feasibility = "Optimal" if total_projected <= budget else "Insufficient Budget"

    return {
        "destination": f"{destination.strip().capitalize()} ({dest_data['type']})",
        "duration_days": days,
        "transit_mode": transit_mode.replace('_', ' ').upper(),
        "estimated_travel_time_hours": round(dest_data["transit_hours"] * transit_info["time_factor"], 1),
        "cost_breakdown": {
            "lodging_food_inr": stay_cost,
            "transit_round_trip_inr": travel_cost,
            "contingency_reserve_inr": buffer_cost,
            "total_estimated_inr": total_projected
        },
        "budget_analysis": {
            "user_budget_inr": budget,
            "status": feasibility
        }
    }