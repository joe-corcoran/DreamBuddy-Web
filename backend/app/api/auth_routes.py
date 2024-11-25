# backend/app/api/auth_routes.py

from flask import Blueprint, request, jsonify, session
import logging
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required
from flask_wtf.csrf import generate_csrf

logging.basicConfig(level=logging.DEBUG) 
logger = logging.getLogger(__name__)

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    logger.info("Authentication check requested")
    if current_user.is_authenticated:
        logger.info(f"User {current_user.id} is authenticated")
        return current_user.to_dict()
    logger.info("No authenticated user")
    return {'errors': {'message': 'Unauthorized'}}, 401

@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    logger.debug("=== Login Request ===")
    logger.debug(f"Request Headers: {dict(request.headers)}")
    logger.debug(f"Request Cookies: {dict(request.cookies)}")
    
    form = LoginForm()
    
    # Get CSRF token from either cookies or headers
    csrf_token = request.headers.get('X-CSRF-Token') or request.cookies.get('csrf_token')
    logger.debug(f"Found CSRF token: {csrf_token}")
    
    if not csrf_token:
        logger.error("No CSRF token found")
        return {'errors': {'csrf': 'CSRF token missing'}}, 400

    form['csrf_token'].data = csrf_token
    
    if form.validate_on_submit():
        user = User.query.filter(User.email == form.data['email']).first()
        login_user(user)
        return user.to_dict()
        
    return form.errors, 401

@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    if current_user.is_authenticated:
        logger.info(f"Logging out user {current_user.id}")
        logout_user()
        return {'message': 'User logged out'}
    
    logger.info("Logout attempted with no authenticated user")
    return {'message': 'No user to logout'}, 401

@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    logger.debug(f"Signup attempt with data: {request.json}")
    logger.debug(f"Request headers: {dict(request.headers)}")
    logger.debug(f"Request cookies: {dict(request.cookies)}")
    
    form = SignUpForm()
    
    # Get CSRF token from either cookies or headers
    csrf_token = request.headers.get('X-CSRF-Token') or request.cookies.get('csrf_token')
    if not csrf_token:
        logger.error("No CSRF token found")
        return {'errors': {'csrf': 'CSRF token missing'}}, 400
        
    form['csrf_token'].data = csrf_token
    
    try:
        if form.validate_on_submit():
            logger.info("Form validated successfully")
            
            # Check if email already exists
            existing_email = User.query.filter(User.email == form.data['email']).first()
            if existing_email:
                logger.error(f"Email already exists: {form.data['email']}")
                return {'errors': {'email': 'Email already exists'}}, 401
                
            # Check if username already exists
            existing_username = User.query.filter(User.username == form.data['username']).first()
            if existing_username:
                logger.error(f"Username already exists: {form.data['username']}")
                return {'errors': {'username': 'Username already exists'}}, 401
            
            user = User(
                username=form.data['username'],
                email=form.data['email'],
                password=form.data['password']
            )
            
            logger.info(f"Creating new user with username: {user.username}")
            db.session.add(user)
            
            try:
                db.session.commit()
                logger.info(f"Successfully created user {user.id}")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Database error during user creation: {str(e)}")
                return {'errors': {'server': 'Error creating user'}}, 500
            
            login_user(user)
            logger.info(f"Successfully logged in new user {user.id}")
            return user.to_dict()
        
        logger.error(f"Form validation failed with errors: {form.errors}")
        return form.errors, 401
        
    except Exception as e:
        logger.error(f"Unexpected error during signup: {str(e)}")
        return {'errors': {'server': 'An unexpected error occurred'}}, 500

@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    logger.info("Unauthorized access attempt")
    return {'errors': {'message': 'Unauthorized'}}, 401

@auth_routes.route('/csrf/refresh', methods=['GET'])
def refresh_csrf():
    """
    Generates a new CSRF token
    """
    token = generate_csrf()
    logger.debug(f"Generated fresh CSRF token: {token}")
    
    response = jsonify({
        "status": "success",
        "token": token
    })
    
    response.set_cookie(
        'csrf_token',
        value=token,
        secure=True,
        httponly=False,
        samesite='Lax',
        domain=None
    )
    
    logger.debug(f"Response cookies: {response.headers.get('Set-Cookie')}")
    return response

@auth_routes.errorhandler(500)
def internal_server_error(e):
    logger.error(f"Internal server error: {str(e)}")
    return {'errors': {'server': 'An internal server error occurred'}}, 500

@auth_routes.errorhandler(404)
def not_found_error(e):
    logger.error(f"Route not found: {request.url}")
    return {'errors': {'server': 'Route not found'}}, 404

# @auth_routes.route('/test-csrf', methods=['POST'])
# def test_csrf():
#     """
#     Test endpoint for CSRF validation
#     """
#     logger.debug("=== CSRF Test Endpoint ===")
#     logger.debug(f"Headers: {dict(request.headers)}")
#     logger.debug(f"Cookies: {dict(request.cookies)}")

#     header_token = request.headers.get('X-CSRF-Token')
#     cookie_token = request.cookies.get('csrf_token')
    
#     logger.debug(f"Header CSRF token: {header_token}")
#     logger.debug(f"Cookie CSRF token: {cookie_token}")
    
#     # Check if we have any token
#     if not header_token:
#         return jsonify({
#             "error": "No CSRF token in headers",
#             "header_token": header_token,
#             "cookie_token": cookie_token
#         }), 400

#     return jsonify({"success": True, "message": "CSRF token validated"})