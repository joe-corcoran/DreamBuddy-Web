"""recreate_dream_interpretation_relationships

Revision ID: 20241125153000
Revises: fb57bc79d708
Create Date: 2024-11-25
"""
from alembic import op
import sqlalchemy as sa
from app.models import environment, SCHEMA

# revision identifiers, used by Alembic
revision = '20241125153000'
down_revision = 'fb57bc79d708'
branch_labels = None
depends_on = None

def upgrade():
    # Try to drop the table if it exists
    try:
        if environment == "production":
            op.execute(f"DROP TABLE IF EXISTS {SCHEMA}.dream_interpretations_dreams CASCADE")
        else:
            op.drop_table('dream_interpretations_dreams')
    except Exception:
        pass

    # Create association table
    dream_interpretations_dreams = op.create_table(
        'dream_interpretations_dreams',
        sa.Column('interpretation_id', sa.Integer(), nullable=False),
        sa.Column('dream_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['interpretation_id'], 
            ['dream_interpretations.id'] if environment != "production" else [f'{SCHEMA}.dream_interpretations.id'],
            name='fk_interpretation_id',
            ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['dream_id'], 
            ['dream_journals.id'] if environment != "production" else [f'{SCHEMA}.dream_journals.id'],
            name='fk_dream_id',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('interpretation_id', 'dream_id')
    )

    if environment == "production":
        op.execute(f"ALTER TABLE dream_interpretations_dreams SET SCHEMA {SCHEMA}")

def downgrade():
    if environment == "production":
        op.execute(f"DROP TABLE IF EXISTS {SCHEMA}.dream_interpretations_dreams CASCADE")
    else:
        op.drop_table('dream_interpretations_dreams')