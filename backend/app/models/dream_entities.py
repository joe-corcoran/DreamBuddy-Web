# backend/app/models/dream_entities.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class DreamEntity(db.Model):
    __tablename__ = 'dream_entities'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)  # person, place, object, symbol
    description = db.Column(db.Text, nullable=True)
    personal_significance = db.Column(db.Text, nullable=True)
    frequency = db.Column(db.Integer, default=0)  # Track how often this appears
    last_appeared = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='dream_entities')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'entity_type': self.entity_type,
            'description': self.description,
            'personal_significance': self.personal_significance,
            'frequency': self.frequency,
            'last_appeared': self.last_appeared.isoformat() if self.last_appeared else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }