# backend/app/models/dream_interpretation.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

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

    user = db.relationship('User', back_populates='interpretations')
    dreams = db.relationship(
        'DreamJournal',
        secondary=add_prefix_for_prod('dream_interpretations_dreams'),
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
              db.ForeignKey(add_prefix_for_prod('dream_interpretations.id'), ondelete='CASCADE'), 
              primary_key=True),
    db.Column('dream_id', db.Integer, 
              db.ForeignKey(add_prefix_for_prod('dream_journals.id'), ondelete='CASCADE'), 
              primary_key=True),
    schema=SCHEMA if environment == "production" else None
)