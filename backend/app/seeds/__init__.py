from flask.cli import AppGroup
from .users import seed_users, undo_users
from app.models.db import db, environment, SCHEMA
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

seed_commands = AppGroup('seed')

@seed_commands.command('all')
def seed():
    logger.info(f"Starting seeding in {environment} environment...")
    try:
        if environment == 'production':
            logger.info("Production environment detected. Running undo first...")
            undo_users()
            logger.info("Undo completed successfully.")
        
        logger.info("Starting to seed users...")
        seed_users()
        logger.info("User seeding completed successfully.")
                
        logger.info("All seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"An error occurred during seeding: {str(e)}")
        raise e

@seed_commands.command('undo')
def undo():
    logger.info(f"Starting undo in {environment} environment...")
    try:
        logger.info("Undoing users...")
        undo_users()
        logger.info("User undo completed successfully.")
        
        logger.info("All undo operations completed successfully!")
        
    except Exception as e:
        logger.error(f"An error occurred during undo: {str(e)}")
        raise e