"""add_user_profiles

Revision ID: e1194c93f009
Revises: 8f5d75b6cdd9
Create Date: 2024-12-05 19:31:19.288064

"""
from alembic import op
import sqlalchemy as sa

# Add these required variables
revision = 'e1194c93f009'
down_revision = '8f5d75b6cdd9'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('user_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('birth_year', sa.Integer(), nullable=True),
        sa.Column('cultural_background', sa.String(length=100), nullable=True),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('dream_goals', sa.String(length=100), nullable=True),
        sa.Column('preferred_interpretation_type', sa.String(length=50), nullable=True),
        sa.Column('significant_life_events', sa.Text(), nullable=True),
        sa.Column('recurring_themes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('user_profiles')