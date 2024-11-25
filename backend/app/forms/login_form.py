# login_form.py
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from app.models import User
import logging

logger = logging.getLogger(__name__)

def user_exists(form, field):
    email = field.data
    logger.debug(f"Checking if user exists with email: {email}")
    user = User.query.filter(User.email == email).first()
    if not user:
        logger.error(f"User with email {email} not found")
        raise ValidationError('Email provided not found.')
    logger.debug(f"User found with email: {email}")

def password_matches(form, field):
    password = field.data
    email = form.data['email']
    logger.debug(f"Checking password for email: {email}")
    user = User.query.filter(User.email == email).first()
    if not user:
        logger.error(f"No user exists with email: {email}")
        raise ValidationError('No such user exists.')
    if not user.check_password(password):
        logger.error(f"Invalid password for email: {email}")
        raise ValidationError('Password was incorrect.')
    logger.debug("Password validation successful")

class LoginForm(FlaskForm):
    email = StringField('email', validators=[DataRequired(), user_exists])
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