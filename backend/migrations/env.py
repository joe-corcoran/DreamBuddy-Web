from __future__ import with_statement

import logging
import os
from logging.config import fileConfig

from flask import current_app

from alembic import context

config = context.config

fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

schema = os.environ.get("SCHEMA")

def get_engine():
    try:
        return current_app.extensions['migrate'].db.get_engine()
    except TypeError:
        return current_app.extensions['migrate'].db.engine

config.set_main_option(
    'sqlalchemy.url', str(get_engine().url).replace('%', '%%'))
target_db = current_app.extensions['migrate'].db

def get_metadata():
    if hasattr(target_db, 'metadatas'):
        return target_db.metadatas[None]
    return target_db.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=get_metadata(),
        literal_binds=True,
        include_schemas=True,
        compare_type=True
    )

    with context.begin_transaction():
        if schema is not None:
            context.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
            context.execute(f'SET search_path TO {schema}')
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected.')

    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=get_metadata(),
            process_revision_directives=process_revision_directives,
            include_schemas=True,
            compare_type=True
        )

        with context.begin_transaction():
            if schema is not None:
                context.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
                context.execute(f'SET search_path TO {schema}')
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()