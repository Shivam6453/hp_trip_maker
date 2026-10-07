from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Vendor(db.Model):
    __tablename__ = 'vendors'
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(255))
    contact = db.Column(db.String(20))
    local_dialects = db.Column(db.String(100))
    survival_guidelines = db.Column(db.Text)

class TransitSchedule(db.Model):
    __tablename__ = 'transit_schedules'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    route = db.Column(db.String(100), nullable=False)
    operator = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default="On Time")
    delay_min = db.Column(db.Integer, default=0)
    road_condition = db.Column(db.String(255))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(20), primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50))
    price_inr = db.Column(db.Float, nullable=False)
    origin = db.Column(db.String(100))
    in_stock = db.Column(db.Boolean, default=True)