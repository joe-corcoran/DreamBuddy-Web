"""add_notes_to_interpretations

Revision ID: 8f5d75b6cdd9
Revises: c90933ab8b2c
Create Date: 2024-12-04 14:13:14.421696

"""
from alembic import op
import sqlalchemy as sa
from app.models import environment, SCHEMA


# revision identifiers, used by Alembic.
revision = '8f5d75b6cdd9'
down_revision = 'c90933ab8b2c'
branch_labels = None
depends_on = None


def upgrade():
    # Add the user_notes column
    op.add_column('dream_interpretations', 
        sa.Column('user_notes', sa.Text, nullable=True)
    )

    if environment == "production":
        op.execute(f"ALTER TABLE dream_interpretations SET SCHEMA {SCHEMA}")


def downgrade():
    # Remove the user_notes column if we need to roll back
    op.drop_column('dream_interpretations', 'user_notes')