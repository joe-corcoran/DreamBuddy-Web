#backend/app/models/character_stages.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class CharacterStage(db.Model):
    __tablename__ = 'character_stages'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    stage_name = db.Column(db.String(50), nullable=False)
    happiness = db.Column(db.Float, nullable=False, default=50.0)
    health = db.Column(db.Float, nullable=False, default=50.0)
    streak_days = db.Column(db.Integer, nullable=False, default=0)
    last_dream_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = db.relationship('User', back_populates='character_stage')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stage_name': self.stage_name,
            'happiness': self.happiness,
            'health': self.health,
            'streak_days': self.streak_days,
            'last_dream_date': self.last_dream_date.isoformat() if self.last_dream_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @staticmethod
    def get_stage_name(happiness):
        if happiness >= 75:
            return "aether"
        elif happiness >= 60:
            return "lumos"
        elif happiness >= 45:
            return "phantom"
        elif happiness >= 30:
            return "shimmer"
        elif happiness >= 15:
            return "wisp"
        else:
            return "drifty"