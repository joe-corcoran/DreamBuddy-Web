import os
from flask import Flask, request, redirect, jsonify
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

app = Flask(__name__)
app.config.from_object(Config)


CORS(app, 
    resources={r"/api/*": {
        "origins": [
            "https://dreambuddy-web.onrender.com",  # Your frontend production URL
            "http://localhost:5173",                # Your frontend development URL
            "http://localhost:3000"                 # Add any other development URLs
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

# Initialize CSRF protection AFTER app configuration

# Register blueprints
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(dream_routes, url_prefix='/api/dreams')
app.register_blueprint(interpretation_routes, url_prefix='/api/interpretations')
app.register_blueprint(dreamscape_routes, url_prefix='/api/dreamscapes')

# Initialize database


@app.after_request
def after_request(response):
    # Only add CORS headers for API routes
    if request.path.startswith('/api/'):
        response.headers["Access-Control-Allow-Origin"] = "https://dreambuddy-web.onrender.com"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-CSRF-Token"

        # Set CSRF token only if not present AND this is not a preflight request
        if request.method != 'OPTIONS' and 'csrf_token' not in request.cookies:
            token = generate_csrf()
            response.set_cookie(
                "csrf_token",
                token,
                secure=True,
                samesite='Lax',
                httponly=False,  # Allow JavaScript access
                domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None
            )
    
    return response

@app.errorhandler(401)
def unauthorized_error(e):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found_error(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Health check endpoint
@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy"}), 200