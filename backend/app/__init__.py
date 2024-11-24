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
csrf = CSRFProtect(app)

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(dream_routes, url_prefix='/api/dreams')
app.register_blueprint(interpretation_routes, url_prefix='/api/interpretations')
app.register_blueprint(dreamscape_routes, url_prefix='/api/dreamscapes')

db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["https://dreambuddy-frontend.onrender.com", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-CSRF-Token", "Authorization"],
        "expose_headers": ["Content-Type", "X-CSRF-Token"],
        "supports_credentials": True
    }
})

@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)

@app.after_request
def after_request(response):
    # CSRF Token
    if request.path.startswith('/api/'):
        token = generate_csrf()
        response.set_cookie(
            'csrf_token',
            token,
            secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
            samesite='Lax',
            httponly=False,  # Allow JavaScript access
            domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None
        )
        response.headers['X-CSRF-Token'] = token

    # Security headers
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    return response

@app.route("/api/csrf/refresh", methods=["GET"])
def refresh_csrf():
    """Endpoint to get a new CSRF token"""
    token = generate_csrf()
    response = jsonify({"status": "success", "csrf_token": token})
    response.set_cookie(
        'csrf_token',
        token,
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Lax',
        httponly=False,  # Allow JavaScript access
        domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None
    )
    return response

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return jsonify({"error": "CSRF token missing or invalid"}), 400