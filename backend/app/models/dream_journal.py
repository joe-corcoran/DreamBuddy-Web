from .db import db
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property

class DreamJournal(db.Model):
    __tablename__ = 'dream_journals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    is_lucid = db.Column(db.Boolean, default=False)
    date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    user = db.relationship('User', back_populates='dreams')
    tags = db.relationship('DreamTags', back_populates='dream', cascade='all, delete-orphan')
    dreamscape = db.relationship('Dreamscape', back_populates='dream', uselist=False, cascade='all, delete-orphan')


    @hybrid_property
    def dream_date(self):
        return func.date(self.date)

    @dream_date.expression
    def dream_date(cls):
        return func.date(cls.date)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'title': self.title,
            'is_lucid': self.is_lucid,
            'date': self.date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'tags': [tag.to_dict() for tag in self.tags],
            'dreamscape': self.dreamscape.to_dict() if self.dreamscape else None
        }

    @classmethod
    def get_dream_for_date(cls, user_id, target_date):
        """Get dream for a specific date in user's local timezone"""
        return cls.query.filter(
            cls.user_id == user_id,
            cls.dream_date == target_date
        ).first()