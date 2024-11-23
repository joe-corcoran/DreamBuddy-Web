"""Add cascade deletions to interpretations

Revision ID: 0ebe9cbf217d
Revises: d06d3a66d9cf
Create Date: 2024-11-22 19:31:56.485285

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0ebe9cbf217d'
down_revision = 'd06d3a66d9cf'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('dream_interpretations', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('dream_interpretations_dreams', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'dream_journals', ['dream_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key(None, 'dream_interpretations', ['interpretation_id'], ['id'], ondelete='CASCADE')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('dream_interpretations_dreams', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'dream_interpretations', ['interpretation_id'], ['id'])
        batch_op.create_foreign_key(None, 'dream_journals', ['dream_id'], ['id'])

    with op.batch_alter_table('dream_interpretations', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])

    # ### end Alembic commands ###
