from __future__ import with_statement

import logging
import os
from logging.config import fileConfig

from flask import current_app

from alembic import context

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

schema = os.environ.get("SCHEMA")

def get_engine():
    try:
        return current_app.extensions['migrate'].db.get_engine()
    except TypeError:
        return current_app.extensions['migrate'].db.engine

# Set the database URL in the config
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
    
    # Configure context with all necessary options
    context.configure(
        url=url,
        target_metadata=get_metadata(),
        literal_binds=True,
        include_schemas=True,
        compare_type=True
    )

    with context.begin_transaction():
        # Handle schema creation based on database type
        if schema is not None:
            if url.startswith('postgresql'):
                context.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
                context.execute(f'SET search_path TO {schema}')
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    
    def process_revision_directives(context, revision, directives):
        # Handle empty migrations
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected.')
            
            # Add schema-specific operations for PostgreSQL
            elif script.upgrade_ops.ops and schema is not None:
                if str(get_engine().url).startswith('postgresql'):
                    script.upgrade_ops.ops.insert(0, 
                        SqlText(f'CREATE SCHEMA IF NOT EXISTS {schema}')
                    )

    connectable = get_engine()

    with connectable.connect() as connection:
        # Configure context with connection and all necessary options
        context.configure(
            connection=connection,
            target_metadata=get_metadata(),
            process_revision_directives=process_revision_directives,
            include_schemas=True,
            compare_type=True,
            transaction_per_migration=True,
            compare_server_default=True
        )

        with context.begin_transaction():
            # Handle schema creation based on database type
            if schema is not None:
                if str(connectable.url).startswith('postgresql'):
                    context.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
                    context.execute(f'SET search_path TO {schema}')
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()