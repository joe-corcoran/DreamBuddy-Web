# backend/app/api/auth_routes.py

from flask import Blueprint, request, jsonify
import logging
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

# Set up logging
logging.basicConfig(level=logging.INFO)
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
   logger.info(f"Login attempt with data: {request.json}")
   logger.info(f"CSRF token in cookies: {request.cookies.get('csrf_token')}")
   
   form = LoginForm()
   form['csrf_token'].data = request.cookies['csrf_token']
   
   if form.validate_on_submit():
       logger.info(f"Form validated successfully for email: {form.data['email']}")
       user = User.query.filter(User.email == form.data['email']).first()
       
       if not user:
           logger.error(f"No user found with email: {form.data['email']}")
           return {'errors': {'email': 'Email not found'}}, 401
           
       if not user.check_password(form.data['password']):
           logger.error("Invalid password provided")
           return {'errors': {'password': 'Invalid password'}}, 401
           
       login_user(user)
       logger.info(f"User {user.id} logged in successfully")
       return user.to_dict()
   
   logger.error(f"Form validation failed with errors: {form.errors}")
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
   logger.info(f"Signup attempt with data: {request.json}")
   logger.info(f"CSRF token in cookies: {request.cookies.get('csrf_token')}")
   
   form = SignUpForm()
   form['csrf_token'].data = request.cookies['csrf_token']
   
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

# Add error handlers
@auth_routes.errorhandler(500)
def internal_server_error(e):
   logger.error(f"Internal server error: {str(e)}")
   return {'errors': {'server': 'An internal server error occurred'}}, 500

@auth_routes.errorhandler(404)
def not_found_error(e):
   logger.error(f"Route not found: {request.url}")
   return {'errors': {'server': 'Route not found'}}, 404