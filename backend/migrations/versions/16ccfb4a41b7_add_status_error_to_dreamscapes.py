"""add_status_error_to_dreamscapes

Revision ID: 16ccfb4a41b7
Revises: 20241125153000
Create Date: 2024-11-25
"""
from alembic import op
import sqlalchemy as sa
from app.models import environment, SCHEMA

# revision identifiers, used by Alembic.
revision = '16ccfb4a41b7'
down_revision = '20241125153000'
branch_labels = None
depends_on = None

def upgrade():
    # Add columns to the table
    with op.batch_alter_table('dreamscapes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(50), nullable=False, server_default='pending'))
        batch_op.add_column(sa.Column('error_message', sa.Text(), nullable=True))

    if environment == "production":
        op.execute(f"ALTER TABLE IF EXISTS {SCHEMA}.dreamscapes ALTER COLUMN status SET DEFAULT 'pending'")

def downgrade():
    # Remove columns from the table
    with op.batch_alter_table('dreamscapes', schema=None) as batch_op:
        batch_op.drop_column('error_message')
        batch_op.drop_column('status')

    if environment == "production":
        op.execute(f"ALTER TABLE IF EXISTS {SCHEMA}.dreamscapes ALTER COLUMN status DROP DEFAULT")