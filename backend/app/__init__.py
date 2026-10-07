from flask import Flask
from flask_cors import CORS
from config import Config
from app.models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    CORS(app)

    from app.api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def root():
        return {"status": "online", "portal": "Himachal Pradesh Tourism Gateway"}

    return app