from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class DreamTags(db.Model):
    __tablename__ = 'dream_tags'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    dream_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('dream_journals.id')), nullable=False)
    tag = db.Column(db.String(255), nullable=False)
    is_auto_generated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    dream = db.relationship('DreamJournal', back_populates='tags')

    def to_dict(self):
        return {
            'id': self.id,
            'dream_id': self.dream_id,
            'tag': self.tag,
            'is_auto_generated': self.is_auto_generated,
            'created_at': self.created_at.isoformat(),
        }