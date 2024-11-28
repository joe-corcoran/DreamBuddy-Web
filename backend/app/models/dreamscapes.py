#backend/app/models/dreamscapes.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime, timezone

class Dreamscape(db.Model):
    __tablename__ = 'dreamscapes'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    dream_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('dream_journals.id'), ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(500))
    optimized_prompt = db.Column(db.Text)
    status = db.Column(db.String(50), nullable=False, default='pending')
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    dream = db.relationship('DreamJournal', back_populates='dreamscape')

    def to_dict(self):
        return {
            'id': self.id,
            'dream_id': self.dream_id,
            'imageUrl': self.image_url,
            'optimized_prompt': self.optimized_prompt,
            'status': self.status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }