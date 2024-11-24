"""Initial migration

Revision ID: fb57bc79d708
Revises: 
Create Date: 2024-11-23 14:50:41.436058

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fb57bc79d708'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=40), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('dream_interpretations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('interpretation_text', sa.Text(), nullable=False),
    sa.Column('interpretation_type', sa.String(length=50), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
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
    op.create_table('dream_interpretations_dreams',
    sa.Column('interpretation_id', sa.Integer(), nullable=False),
    sa.Column('dream_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['dream_id'], ['dream_journals.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['interpretation_id'], ['dream_interpretations.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('interpretation_id', 'dream_id')
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
    op.create_table('dreamscapes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('dream_id', sa.Integer(), nullable=False),
    sa.Column('image_url', sa.String(length=500), nullable=True),
    sa.Column('optimized_prompt', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['dream_id'], ['dream_journals.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('dreamscapes')
    op.drop_table('dream_tags')
    op.drop_table('dream_interpretations_dreams')
    op.drop_table('dream_journals')
    op.drop_table('dream_interpretations')
    op.drop_table('users')
    # ### end Alembic commands ###