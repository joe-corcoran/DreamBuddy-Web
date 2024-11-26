#backend/app/models/associations.py
from .db import db, environment, SCHEMA, add_prefix_for_prod

dream_interpretations_dreams = db.Table(
    'dream_interpretations_dreams',
    db.Column('interpretation_id', db.Integer, 
              db.ForeignKey(add_prefix_for_prod('dream_interpretations.id'), ondelete='CASCADE'), 
              primary_key=True),
    db.Column('dream_id', db.Integer, 
              db.ForeignKey(add_prefix_for_prod('dream_journals.id'), ondelete='CASCADE'), 
              primary_key=True),
    schema=SCHEMA if environment == "production" else None
)