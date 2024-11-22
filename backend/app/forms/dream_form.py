# backend/app/forms/dream_form.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, BooleanField, DateTimeField
from wtforms.validators import DataRequired, Length

class DreamForm(FlaskForm):
    title = StringField('Title', validators=[
        DataRequired(),
        Length(min=1, max=255, message="Title must be between 1 and 255 characters")
    ])
    content = TextAreaField('Content', validators=[
        DataRequired(),
        Length(min=1, message="Dream content cannot be empty")
    ])
    is_lucid = BooleanField('Lucid Dream')
    tags = StringField('Tags')  
    date = DateTimeField('Dream Date')