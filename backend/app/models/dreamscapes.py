# backend/app/models/dreamscapes.py
from .db import db
from datetime import datetime

class Dreamscape(db.Model):
    __tablename__ = 'dreamscapes'

    id = db.Column(db.Integer, primary_key=True)
    dream_id = db.Column(db.Integer, db.ForeignKey('dream_journals.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(500))
    optimized_prompt = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    dream = db.relationship('DreamJournal', back_populates='dreamscape')

    def to_dict(self):
        return {
            'id': self.id,
            'dream_id': self.dream_id,
            'image_url': self.image_url,
            'optimized_prompt': self.optimized_prompt,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }