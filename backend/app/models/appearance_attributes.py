# backend/app/models/appearance_attributes.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class UserAppearance(db.Model):
    __tablename__ = 'user_appearances'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    age_range = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    height_range = db.Column(db.String(20), nullable=False)
    build = db.Column(db.String(20), nullable=False)
    hair_color = db.Column(db.String(20), nullable=False)
    hair_style = db.Column(db.String(20), nullable=False)
    eye_color = db.Column(db.String(20), nullable=False)
    skin_tone = db.Column(db.String(20), nullable=False)
    facial_hair = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='appearance')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'age_range': self.age_range,
            'gender': self.gender,
            'height_range': self.height_range,
            'build': self.build,
            'hair_color': self.hair_color,
            'hair_style': self.hair_style,
            'eye_color': self.eye_color,
            'skin_tone': self.skin_tone,
            'facial_hair': self.facial_hair,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class RecurringCharacter(db.Model):
    __tablename__ = 'recurring_characters'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    relationship = db.Column(db.String(30), nullable=False)
    age_range = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    height_range = db.Column(db.String(20), nullable=False)
    build = db.Column(db.String(20), nullable=False)
    hair_color = db.Column(db.String(20), nullable=False)
    hair_style = db.Column(db.String(20), nullable=False)
    eye_color = db.Column(db.String(20), nullable=False)
    skin_tone = db.Column(db.String(20), nullable=False)
    facial_hair = db.Column(db.String(20), nullable=True)
    appearance_count = db.Column(db.Integer, default=0)
    last_appeared = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='recurring_characters')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
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
            'last_appeared': self.last_appeared.isoformat() if self.last_appeared else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }