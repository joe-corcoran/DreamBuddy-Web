# backend/app/models/dream_insights.py
from .db import db
from datetime import datetime

class DreamInterpretation(db.Model):
    __tablename__ = 'dream_interpretations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interpretation_text = db.Column(db.Text, nullable=False)
    interpretation_type = db.Column(db.String(50), nullable=False)  # spiritual, emotional, etc.
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='interpretations')
    dreams = db.relationship('DreamJournal', 
                           secondary='dream_interpretations_dreams',
                           back_populates='interpretations')
    interpretations = db.relationship('DreamInterpretation',
                                secondary='dream_interpretations_dreams',
                                back_populates='dreams')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'interpretation_text': self.interpretation_text,
            'interpretation_type': self.interpretation_type,
            'date': self.date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'dreams': [dream.to_dict() for dream in self.dreams]
        }

# Association table for dream interpretations
dream_interpretations_dreams = db.Table(
    'dream_interpretations_dreams',
    db.Model.metadata,
    db.Column('interpretation_id', db.Integer, db.ForeignKey('dream_interpretations.id'), primary_key=True),
    db.Column('dream_id', db.Integer, db.ForeignKey('dream_journals.id'), primary_key=True)
)