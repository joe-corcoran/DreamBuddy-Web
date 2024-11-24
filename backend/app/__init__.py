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

app = Flask(__name__)

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
        "allow_headers": ["Content-Type", "X-CSRF-Token", "Authorization", "XSRF-TOKEN"],
        "expose_headers": ["Content-Type", "X-CSRF-Token"],
        "supports_credentials": True
    }
})
# HTTPS redirect
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)

# CSRF Token
@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Lax' if os.environ.get('FLASK_ENV') == 'production' else None,  # Changed from 'Strict' to 'Lax'
        httponly=True,
        domain=".onrender.com" if os.environ.get('FLASK_ENV') == 'production' else None  # Add this line
    )
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