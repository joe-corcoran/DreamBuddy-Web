# backend/app/models/dream_interpretation.py
from .db import db
from datetime import datetime

class DreamInterpretation(db.Model):
    __tablename__ = 'dream_interpretations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    interpretation_text = db.Column(db.Text, nullable=False)
    interpretation_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', back_populates='interpretations')
    dreams = db.relationship(
        'DreamJournal',
        secondary='dream_interpretations_dreams',
        primaryjoin='DreamInterpretation.id==dream_interpretations_dreams.c.interpretation_id',
        secondaryjoin='and_(DreamJournal.id==dream_interpretations_dreams.c.dream_id, DreamJournal.user_id==DreamInterpretation.user_id)',
        viewonly=True
    )

    def to_dict(self):
        return {
            'id': self.id,
            'interpretation_text': self.interpretation_text,
            'interpretation_type': self.interpretation_type,
            'date': self.date.isoformat()
        }

dream_interpretations_dreams = db.Table('dream_interpretations_dreams',
    db.Column('interpretation_id', db.Integer, 
              db.ForeignKey('dream_interpretations.id', ondelete='CASCADE'), 
              primary_key=True),
    db.Column('dream_id', db.Integer, 
              db.ForeignKey('dream_journals.id', ondelete='CASCADE'), 
              primary_key=True)
)