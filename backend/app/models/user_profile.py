# backend/app/models/user_profile.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    
    # Basic Personal Context
    birth_year = db.Column(db.Integer, nullable=True)
    cultural_background = db.Column(db.String(100), nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    
    # Dream Preferences
    dream_goals = db.Column(db.String(100), nullable=True)  # 'spiritual', 'problem-solving', 'lucid', etc.
    preferred_interpretation_type = db.Column(db.String(50), nullable=True)
    
    # Dream Journal Context
    significant_life_events = db.Column(db.Text, nullable=True)
    recurring_themes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', back_populates='profile')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'birth_year': self.birth_year,
            'cultural_background': self.cultural_background,
            'occupation': self.occupation,
            'dream_goals': self.dream_goals,
            'preferred_interpretation_type': self.preferred_interpretation_type,
            'significant_life_events': self.significant_life_events,
            'recurring_themes': self.recurring_themes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }