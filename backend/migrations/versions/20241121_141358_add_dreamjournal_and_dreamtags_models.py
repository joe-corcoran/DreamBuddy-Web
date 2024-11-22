"""Add DreamJournal and DreamTags models

Revision ID: 7c706cc3657d
Revises: ffdc0a98111c
Create Date: 2024-11-21 14:13:58.881567

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c706cc3657d'
down_revision = 'ffdc0a98111c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('dream_journals',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('is_lucid', sa.Boolean(), nullable=True),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('dream_tags',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('dream_id', sa.Integer(), nullable=False),
    sa.Column('tag', sa.String(length=255), nullable=False),
    sa.Column('is_auto_generated', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['dream_id'], ['dream_journals.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('dream_tags')
    op.drop_table('dream_journals')
    # ### end Alembic commands ###