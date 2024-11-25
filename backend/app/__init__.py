#backend/app/___init___.py
import os
from flask import Flask, request, redirect, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .seeds import seed_commands
from .config import Config
from .api.dream_routes import dream_routes
from .api.interpretation_routes import interpretation_routes
from .api.dreamscape_routes import dreamscape_routes
import logging 

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

allowed_origins = [
    "https://dreambuddy-frontend.onrender.com", 
    "http://localhost:5173",                    
    "http://localhost:3000"                      
]


app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='')
app.config.from_object(Config)


CORS(app, 
    resources={r"/api/*": {
        "origins": [
            "https://dreambuddy-frontend.onrender.com", 
            "http://localhost:5173",               
            "http://localhost:3000"                
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "X-CSRF-Token"],
        "expose_headers": ["Content-Type", "X-CSRF-Token"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }},
    expose_headers=["Content-Type", "X-CSRF-Token"],
    supports_credentials=True
)

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'
csrf = CSRFProtect(app)

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

app.cli.add_command(seed_commands)

db.init_app(app)
Migrate(app, db)


# Register blueprints
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(dream_routes, url_prefix='/api/dreams')
app.register_blueprint(interpretation_routes, url_prefix='/api/interpretations')
app.register_blueprint(dreamscape_routes, url_prefix='/api/dreamscapes')


@app.after_request
def after_request(response):
    logger.debug("=== Processing After Request ===")
    logger.debug(f"Request Path: {request.path}")
    logger.debug(f"Request Method: {request.method}")
    logger.debug(f"Current Response Headers: {dict(response.headers)}")
    
    if request.path.startswith('/api/'):
        origin = request.headers.get('Origin')
        logger.debug(f"Request Origin: {origin}")
        
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            logger.debug(f"Setting Allow-Origin to: {origin}")
        else:
            logger.warning(f"Received request from unauthorized origin: {origin}")
            
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-CSRF-Token"

        if request.method != 'OPTIONS' and 'csrf_token' not in request.cookies:
            token = generate_csrf()
            logger.debug(f"Generated new CSRF token: {token}")
            response.set_cookie(
                "csrf_token",
                token,
                secure=True,
                samesite='Lax',
                httponly=False 
            )
            logger.debug("Set CSRF cookie in response")
    
    return response

# Health check endpoint
@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.errorhandler(401)
def unauthorized_error(e):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found_error(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(f"{app.static_folder}/{path}"):
        return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')