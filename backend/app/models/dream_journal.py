#backend/app/models/dream_journal.py
from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property
from .associations import dream_interpretations_dreams

class DreamJournal(db.Model):
    __tablename__ = 'dream_journals'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
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

    user = db.relationship('User', back_populates='dreams')
    tags = db.relationship('DreamTags', back_populates='dream', cascade='all, delete-orphan')
    dreamscape = db.relationship('Dreamscape', back_populates='dream', uselist=False, cascade='all, delete-orphan')
    interpretations = db.relationship(
        'DreamInterpretation',
        secondary=dream_interpretations_dreams,
        back_populates='dreams'
    )

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
            'tags': [tag.tag for tag in self.tags],
            'dreamscape': self.dreamscape.to_dict() if self.dreamscape else None,
            'interpretations': [interp.to_dict() for interp in self.interpretations]
        }

    @classmethod
    def get_dream_for_date(cls, user_id, target_date):
        """Get dream for a specific date"""
        return cls.query.filter(
            cls.user_id == user_id,
            func.date(cls.date) == target_date
        ).order_by(cls.created_at.desc()).first()

    @classmethod
    def get_dreams_by_month(cls, user_id, year, month):
        """Get all dreams for a specific month"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
            
        return cls.query.filter(
            cls.user_id == user_id,
            cls.date >= start_date,
            cls.date < end_date
        ).order_by(cls.date.desc()).all()