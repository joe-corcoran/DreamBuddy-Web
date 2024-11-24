# backend/app/__init__.py

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

# HTTPS redirect
@app.route("/api/debug/config")
def debug_config():
    """Debug endpoint to check configuration"""
    if os.environ.get('FLASK_ENV') != 'production':
        return {
            "CORS_origins": app.config.get('CORS_ORIGINS'),
            "cookie_settings": {
                "secure": os.environ.get('FLASK_ENV') == 'production',
                "samesite": 'Lax',
                "domain": ".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None
            },
            "environment": os.environ.get('FLASK_ENV'),
            "database_url_prefix": app.config.get('SQLALCHEMY_DATABASE_URI', 'not-set')[:10] + '...',
        }
    return {"message": "Debug endpoint disabled in production"}, 403

@app.route("/api/csrf/refresh", methods=["GET"])
def refresh_csrf():
    """Endpoint to get a new CSRF token"""
    token = generate_csrf()
    logger.debug(f"Generated new CSRF token")
    
    response = jsonify({"status": "success", "csrf_token": token})
    response.set_cookie(
        'csrf_token',
        token,
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Lax',
        httponly=True,
        domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None
    )
    return response

@app.before_request
def log_request_info():
    """Log details about each request"""
    logger.debug('Headers: %s', dict(request.headers))
    logger.debug('Body: %s', request.get_data())
    logger.debug('Cookies: %s', dict(request.cookies))

@app.after_request
def after_request(response):
    """Log response info and add security headers"""
    logger.debug('Response Headers: %s', dict(response.headers))
    logger.debug('Response Status: %s', response.status)
    
    # Add security headers
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    return response

# API documentation route
@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
                    app.view_functions[rule.endpoint].__doc__ ]
                    for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
    return route_list

# Health check endpoint
@app.route("/api/health")
def health_check():
    """
    Health check endpoint for the API
    """
    return jsonify({"status": "healthy"}), 200

# Handle 404 errors with JSON response
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404