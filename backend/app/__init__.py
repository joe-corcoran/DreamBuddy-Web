#backend/app/__init__.py
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
from .api.character_routes import character_routes
from .api.profile_routes import profile_routes
from app.aws import aws_helpers
from .api.dream_entity_routes import dream_entity_routes
from .api.appearance_routes import appearance_routes

import logging 

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Simplify allowed origins since we're serving frontend from backend
allowed_origins = [
    "https://dreambuddy-web.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
]

app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='')
app.config.from_object(Config)

# Simplify CORS configuration since we're serving frontend from backend
CORS(app, 
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=True,
    expose_headers=["Content-Type", "X-CSRF-Token"]
)

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
app.register_blueprint(character_routes, url_prefix='/api/character')
app.register_blueprint(profile_routes, url_prefix='/api/profile')
app.register_blueprint(dream_entity_routes, url_prefix='/api/dream-entities')
app.register_blueprint(appearance_routes, url_prefix='/api/appearances')



@app.after_request
def after_request(response):
    # Set CSRF cookie for all requests
    if 'csrf_token' not in request.cookies:
        response.set_cookie(
            'csrf_token',
            generate_csrf(),
            secure=True,
            samesite='Lax',
            httponly=False,
            path='/'
        )
    
    # Handle CORS
    if request.path.startswith('/api/'):
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authentication,X-CSRF-Token')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    
    return response

# Add OPTIONS handling for CSRF
@app.route('/api/csrf/token', methods=['GET'])
def get_csrf():
    token = generate_csrf()
    response = jsonify({'csrf_token': token})
    response.set_cookie('csrf_token', token, secure=True, samesite='Lax', httponly=False)
    return response

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Error Handlers
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"error": "API endpoint not found"}), 404
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500