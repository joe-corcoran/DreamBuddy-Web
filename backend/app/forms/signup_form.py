# signup_form.py
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from app.models import User
import logging

logger = logging.getLogger(__name__)

def user_exists(form, field):
    email = field.data
    logger.debug(f"Checking if email already exists: {email}")
    user = User.query.filter(User.email == email).first()
    if user:
        logger.error(f"Email {email} is already in use")
        raise ValidationError('Email address is already in use.')
    logger.debug(f"Email {email} is available")

def username_exists(form, field):
    username = field.data
    logger.debug(f"Checking if username already exists: {username}")
    user = User.query.filter(User.username == username).first()
    if user:
        logger.error(f"Username {username} is already in use")
        raise ValidationError('Username is already in use.')
    logger.debug(f"Username {username} is available")

class SignUpForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), username_exists])
    email = StringField('email', validators=[DataRequired(), user_exists])
    password = StringField('password', validators=[DataRequired()])

    def validate_on_submit(self):
        logger.debug("=== Starting SignUpForm Validation ===")
        logger.debug(f"Form Data: {self.data}")
        logger.debug(f"CSRF Token: {self.csrf_token.data}")
        valid = super().validate_on_submit()
        logger.debug(f"Form validation result: {valid}")
        if not valid:
            logger.error(f"Form validation errors: {self.errors}")
        return valid