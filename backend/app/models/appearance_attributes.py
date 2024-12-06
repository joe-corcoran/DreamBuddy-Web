# backend/app/models/appearance_attributes.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class UserAppearance(db.Model):
    __tablename__ = 'user_appearances'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    
    # Basic Physical Attributes
    age_range = db.Column(db.String(20), nullable=False)  # '18-25', '26-35', '36-45', etc.
    gender = db.Column(db.String(20), nullable=False)
    height_range = db.Column(db.String(20), nullable=False)  # '5\'0"-5\'4"', '5\'5"-5\'9"', etc.
    build = db.Column(db.String(20), nullable=False)  # 'slim', 'average', 'athletic', 'full'
    
    # Facial Features
    hair_color = db.Column(db.String(20), nullable=False)
    hair_style = db.Column(db.String(20), nullable=False)  # 'short', 'medium', 'long', 'bald'
    eye_color = db.Column(db.String(20), nullable=False)
    skin_tone = db.Column(db.String(20), nullable=False)
    facial_hair = db.Column(db.String(20), nullable=True)  # 'none', 'beard', 'mustache', 'goatee'

    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='appearance')

    def to_dict(self):
        return {
            'id': self.id,
            'age_range': self.age_range,
            'gender': self.gender,
            'height_range': self.height_range,
            'build': self.build,
            'hair_color': self.hair_color,
            'hair_style': self.hair_style,
            'eye_color': self.eye_color,
            'skin_tone': self.skin_tone,
            'facial_hair': self.facial_hair
        }

class RecurringCharacter(db.Model):
    __tablename__ = 'recurring_characters'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    relationship = db.Column(db.String(30), nullable=False)  # 'family', 'friend', 'partner', etc.
    
    # Physical Attributes (same standardized options as UserAppearance)
    age_range = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    height_range = db.Column(db.String(20), nullable=False)
    build = db.Column(db.String(20), nullable=False)
    hair_color = db.Column(db.String(20), nullable=False)
    hair_style = db.Column(db.String(20), nullable=False)
    eye_color = db.Column(db.String(20), nullable=False)
    skin_tone = db.Column(db.String(20), nullable=False)
    facial_hair = db.Column(db.String(20), nullable=True)

    # Frequency tracking
    appearance_count = db.Column(db.Integer, default=0)
    last_appeared = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='recurring_characters')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'relationship': self.relationship,
            'age_range': self.age_range,
            'gender': self.gender,
            'height_range': self.height_range,
            'build': self.build,
            'hair_color': self.hair_color,
            'hair_style': self.hair_style,
            'eye_color': self.eye_color,
            'skin_tone': self.skin_tone,
            'facial_hair': self.facial_hair,
            'appearance_count': self.appearance_count,
            'last_appeared': self.last_appeared.isoformat() if self.last_appeared else None
        }

# Constants for standardized attribute options
APPEARANCE_ATTRIBUTES = {
    'age_ranges': [
        '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
    ],
    'genders': [
        'male', 'female', 'non-binary', 'other'
    ],
    'height_ranges': [
        'under 5\'0"', '5\'0"-5\'4"', '5\'5"-5\'9"', '5\'10"-6\'2"', 'over 6\'2"'
    ],
    'builds': [
        'slim', 'average', 'athletic', 'full'
    ],
    'hair_colors': [
        'black', 'brown', 'blonde', 'red', 'gray', 'white', 'other'
    ],
    'hair_styles': [
        'short', 'medium', 'long', 'bald', 'buzzed'
    ],
    'eye_colors': [
        'brown', 'blue', 'green', 'hazel', 'gray'
    ],
    'skin_tones': [
        'very light', 'light', 'medium', 'olive', 'brown', 'dark brown'
    ],
    'facial_hair': [
        'none', 'beard', 'mustache', 'goatee', 'stubble'
    ],
    'relationships': [
        'family', 'friend', 'partner', 'coworker', 'acquaintance', 'other'
    ]
}