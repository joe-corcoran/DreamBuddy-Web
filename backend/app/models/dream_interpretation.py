# backend/app/models/dream_interpretation.py
from .db import db
from datetime import datetime

class DreamInterpretation(db.Model):
    __tablename__ = 'dream_interpretations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interpretation_text = db.Column(db.Text, nullable=False)
    interpretation_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    dreams = db.relationship('DreamJournal', secondary='dream_interpretations_dreams')

    def to_dict(self):
        return {
            'id': self.id,
            'interpretation_text': self.interpretation_text,
            'interpretation_type': self.interpretation_type,
            'date': self.date.isoformat(),
            'dreams': [dream.to_dict() for dream in self.dreams]
        }

# Association table
dream_interpretations_dreams = db.Table('dream_interpretations_dreams',
    db.Column('interpretation_id', db.Integer, db.ForeignKey('dream_interpretations.id'), primary_key=True),
    db.Column('dream_id', db.Integer, db.ForeignKey('dream_journals.id'), primary_key=True)
)