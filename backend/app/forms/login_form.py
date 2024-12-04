# login_form.py
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, ValidationError
from app.models import User
import logging

logger = logging.getLogger(__name__)

def user_exists(form, field):
    credential = field.data
    logger.debug(f"Checking if user exists with credential: {credential}")
    
    # Check if credential is email or username
    user = User.query.filter(
        (User.email == credential) | (User.username == credential)
    ).first()
    
    if not user:
        logger.error(f"No user found with credential: {credential}")
        raise ValidationError('No user found with this email or username.')
    logger.debug(f"User found with credential: {credential}")

def password_matches(form, field):
    password = field.data
    credential = form.data['credential']
    logger.debug(f"Checking password for credential: {credential}")
    
    user = User.query.filter(
        (User.email == credential) | (User.username == credential)
    ).first()
    
    if not user:
        logger.error(f"No user exists with credential: {credential}")
        raise ValidationError('No such user exists.')
    if not user.check_password(password):
        logger.error(f"Invalid password for credential: {credential}")
        raise ValidationError('Password was incorrect.')
    logger.debug("Password validation successful")

class LoginForm(FlaskForm):
    credential = StringField('credential', validators=[DataRequired(), user_exists])
    password = StringField('password', validators=[DataRequired(), password_matches])

    def validate_on_submit(self):
        logger.debug("=== Starting LoginForm Validation ===")
        logger.debug(f"Form Data: {self.data}")
        logger.debug(f"CSRF Token: {self.csrf_token.data}")
        valid = super().validate_on_submit()
        logger.debug(f"Form validation result: {valid}")
        if not valid:
            logger.error(f"Form validation errors: {self.errors}")
        return valid