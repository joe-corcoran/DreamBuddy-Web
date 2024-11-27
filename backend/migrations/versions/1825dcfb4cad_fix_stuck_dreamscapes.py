"""fix_stuck_dreamscapes

Revision ID: 1825dcfb4
Revises: 16ccfb4a41b7
Create Date: 2024-11-25
"""
from alembic import op
import sqlalchemy as sa
from app.models import environment, SCHEMA

# revision identifiers, used by Alembic
revision = 'fix_stuck_dreamscapes'
down_revision = '16ccfb4a41b7'
branch_labels = None
depends_on = None

def upgrade():
    # Update any stuck dreamscapes to failed status
    op.execute("""
        UPDATE dreamscapes 
        SET status = 'failed', 
            error_message = 'Dreamscape generation timed out' 
        WHERE status = 'pending' 
        OR status = 'generating' 
        OR status = 'uploading'
    """)

def downgrade():
    # No downgrade needed as we don't want to revert the status changes
    pass