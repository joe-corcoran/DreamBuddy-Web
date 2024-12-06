# backend/migrations/versions/[timestamp]_create_dream_entities.py
"""create_dream_entities

Revision ID: 663b722820ed
Revises: e1194c93f009
Create Date: 2024-12-05 22:42:05.348157

"""
from alembic import op
import sqlalchemy as sa

revision = 'create_dream_entities_001'  # You'll get a different revision ID
down_revision = 'e1194c93f009'  # This should be your last migration's revision ID
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('dream_entities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('personal_significance', sa.Text(), nullable=True),
        sa.Column('frequency', sa.Integer(), nullable=False, default=0),
        sa.Column('last_appeared', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('dream_entities')