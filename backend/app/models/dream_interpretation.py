#backend/app/models/dream_interpretation.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from .associations import dream_interpretations_dreams

class DreamInterpretation(db.Model):
    __tablename__ = 'dream_interpretations'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'), nullable=False)
    interpretation_text = db.Column(db.Text, nullable=False)
    interpretation_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    dreams = db.relationship(
        'DreamJournal',
        secondary=dream_interpretations_dreams,
        back_populates='interpretations'
    )
    user = db.relationship('User', back_populates='interpretations')

    def to_dict(self):
        return {
            'id': self.id,
            'interpretation_text': self.interpretation_text,
            'interpretation_type': self.interpretation_type,
            'date': self.date.isoformat(),
            'dream_ids': [dream.id for dream in self.dreams]
        }