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

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

app.cli.add_command(seed_commands)
app.config.from_object(Config)

# Initialize CSRF protection AFTER app configuration
csrf = CSRFProtect(app)

# Register blueprints
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(dream_routes, url_prefix='/api/dreams')
app.register_blueprint(interpretation_routes, url_prefix='/api/interpretations')
app.register_blueprint(dreamscape_routes, url_prefix='/api/dreamscapes')

# Initialize database
db.init_app(app)
Migrate(app, db)

# Setup CORS - THIS IS THE KEY CHANGE
CORS(app, 
     origins=["https://dreambuddy-frontend.onrender.com", "http://localhost:5173"],
     supports_credentials=True,
     allow_headers=["Content-Type", "X-CSRF-Token"],
     expose_headers=["Content-Type", "X-CSRF-Token"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://dreambuddy-frontend.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    
    # Set CSRF token
    token = generate_csrf()
    response.set_cookie('csrf_token',
                       token,
                       secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
                       samesite='Lax',
                       httponly=True,
                       domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None)
    
    return response