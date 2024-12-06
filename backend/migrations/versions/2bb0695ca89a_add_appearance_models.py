"""add_appearance_models

Revision ID: 2bb0695ca89a
Revises: create_dream_entities_001
Create Date: 2024-12-05 23:19:29.470019

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2bb0695ca89a'
down_revision = 'create_dream_entities_001'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('user_appearances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('age_range', sa.String(20), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('height_range', sa.String(20), nullable=False),
        sa.Column('build', sa.String(20), nullable=False),
        sa.Column('hair_color', sa.String(20), nullable=False),
        sa.Column('hair_style', sa.String(20), nullable=False),
        sa.Column('eye_color', sa.String(20), nullable=False),
        sa.Column('skin_tone', sa.String(20), nullable=False),
        sa.Column('facial_hair', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('recurring_characters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('relationship', sa.String(30), nullable=False),
        sa.Column('age_range', sa.String(20), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('height_range', sa.String(20), nullable=False),
        sa.Column('build', sa.String(20), nullable=False),
        sa.Column('hair_color', sa.String(20), nullable=False),
        sa.Column('hair_style', sa.String(20), nullable=False),
        sa.Column('eye_color', sa.String(20), nullable=False),
        sa.Column('skin_tone', sa.String(20), nullable=False),
        sa.Column('facial_hair', sa.String(20), nullable=True),
        sa.Column('appearance_count', sa.Integer(), default=0),
        sa.Column('last_appeared', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('recurring_characters')
    op.drop_table('user_appearances')