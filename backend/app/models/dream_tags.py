# backend/app/models/dream_tags.py

from .db import db
from datetime import datetime  # Add this import

class DreamTags(db.Model):
    __tablename__ = 'dream_tags'

    id = db.Column(db.Integer, primary_key=True)
    dream_id = db.Column(db.Integer, db.ForeignKey('dream_journals.id'), nullable=False)
    tag = db.Column(db.String(255), nullable=False)
    is_auto_generated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    dream = db.relationship('DreamJournal', back_populates='tags')

    def to_dict(self):
        return {
            'id': self.id,
            'dream_id': self.dream_id,
            'tag': self.tag,
            'is_auto_generated': self.is_auto_generated,
            'created_at': self.created_at.isoformat(),
        }
