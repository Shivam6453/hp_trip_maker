from flask import Blueprint, jsonify, request
from app.models import db, Vendor, TransitSchedule, Product
from app.ml.trip_optimizer import plan_itinerary
from app.ml.transit_engine import generate_live_routes

api_bp = Blueprint('api', __name__)

@api_bp.route('/portal-meta', methods=['GET'])
def get_portal_meta():
    return jsonify({
        "state_name": "Himachal Pradesh",
        "tagline": "Dev Bhoomi - Land of the Gods",
        "emergency_helpline_matrix": [
            {"agency": "State Disaster Management (SDMA)", "contact": "1070", "type": "Toll Free / 24x7"},
            {"agency": "Police Assistance & Control Room", "contact": "112", "type": "Universal Emergency"},
            {"agency": "Medical & Trauma Ambulance", "contact": "108", "type": "Paramedic Support"}
        ],
        "mandatory_regulations": [
            "Mandatory vehicle registration pass required during peak monsoon & winter snowfall alerts.",
            "Single-use plastic items are strictly prohibited under the HP Non-Biodegradable Garbage Control Act."
        ],
        "state_heritage_chronicles": {
            "ancient_era": "Recorded in Vedic texts as Kuluta, Trigarta, and Audumbara republics with distinct Kath-Kuni architectural traditions.",
            "statehood": "Granted complete statehood on 25 January 1971."
        }
    })

@api_bp.route('/optimize-trip', methods=['POST'])
def optimize_trip():
    payload = request.get_json() or {}
    origin = payload.get("origin", "Chandigarh")
    destination = payload.get("destination", "Shimla")
    days = int(payload.get("days", 3))
    budget = float(payload.get("budget", 15000))
    transit_mode = payload.get("transit_mode", "hrtc_volvo")
    
    result = plan_itinerary(origin, destination, days, budget, transit_mode)
    return jsonify(result)

@api_bp.route('/transit-live', methods=['GET'])
def get_transit_status():
    schedules = TransitSchedule.query.all()
    data = [{"route": s.route, "operator": s.operator, "status": s.status, "delay_min": s.delay_min, "road_condition": s.road_condition} for s in schedules]
    return jsonify(data)

@api_bp.route('/transit-tracker', methods=['POST'])
def track_transit():
    payload = request.get_json() or {}
    origin = payload.get("origin", "Chandigarh")
    destination = payload.get("destination", "Shimla")
    
    result = generate_live_routes(origin, destination)
    return jsonify(result)

@api_bp.route('/local-vendors', methods=['GET'])
def get_local_vendors():
    vendors = Vendor.query.all()
    data = [{"id": v.id, "name": v.name, "location": v.location, "specialty": v.specialty, "contact": v.contact, "local_dialects": v.local_dialects, "survival_guidelines": v.survival_guidelines} for v in vendors]
    return jsonify(data)

@api_bp.route('/marketplace', methods=['GET'])
def get_marketplace_products():
    products = Product.query.all()
    data = [{"id": p.id, "title": p.title, "category": p.category, "price_inr": p.price_inr, "origin": p.origin, "in_stock": p.in_stock} for p in products]
    return jsonify(data)