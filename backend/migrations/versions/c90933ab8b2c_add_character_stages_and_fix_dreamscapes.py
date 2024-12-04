"""add_character_stages_and_fix_dreamscapes

Revision ID: c90933ab8b2c
Revises: 16ccfb4a41b7
Create Date: 2024-12-04 09:13:51.810443
"""
from alembic import op
import sqlalchemy as sa
from app.models import environment, SCHEMA


# revision identifiers, used by Alembic.
revision = 'c90933ab8b2c'
down_revision = '16ccfb4a41b7'
branch_labels = None
depends_on = None


def upgrade():
    # First: Fix stuck dreamscapes
    op.execute("""
        UPDATE dreamscapes 
        SET status = 'failed', 
            error_message = 'Dreamscape generation timed out' 
        WHERE status = 'pending' 
        OR status = 'generating' 
        OR status = 'uploading'
    """)

    # Second: Create character_stages table
    character_stages = op.create_table('character_stages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('stage_name', sa.String(50), nullable=False),
        sa.Column('happiness', sa.Float(), nullable=False, server_default='50.0'),
        sa.Column('health', sa.Float(), nullable=False, server_default='50.0'),
        sa.Column('streak_days', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_dream_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(
            ['user_id'], 
            ['users.id'] if environment != "production" else [f'{SCHEMA}.users.id'],
            name='fk_character_user_id',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id')
    )

    if environment == "production":
        op.execute(f"ALTER TABLE character_stages SET SCHEMA {SCHEMA}")


def downgrade():
    # No need to undo the dreamscapes status update in downgrade
    
    # Drop character_stages table
    if environment == "production":
        op.execute(f"DROP TABLE IF EXISTS {SCHEMA}.character_stages CASCADE")
    else:
        op.drop_table('character_stages')