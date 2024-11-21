# backend/app/api/dream_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, DreamTags
from datetime import datetime
import logging

dream_routes = Blueprint('dreams', __name__)
logger = logging.getLogger(__name__)

@dream_routes.route('/quick', methods=['POST'])
@login_required
def quick_dream():
    """
    Quick dream entry from home page
    """
    logger.info(f"Quick dream entry attempt by user {current_user.id}")
    data = request.json

    if not data.get('content'):
        logger.error("No dream content provided")
        return {'errors': {'content': 'Dream content is required'}}, 400

    try:
        new_dream = DreamJournal(
            user_id=current_user.id,
            title=data.get('title', f"Dream on {datetime.now().strftime('%B %d, %Y')}"),
            content=data['content'],
            is_lucid=data.get('is_lucid', False),
            date=datetime.utcnow()
        )

        db.session.add(new_dream)
        db.session.commit()

        # Add tags if provided
        if data.get('tags'):
            for tag in data['tags']:
                new_tag = DreamTags(
                    dream_id=new_dream.id,
                    tag=tag,
                    is_auto_generated=False
                )
                db.session.add(new_tag)
            db.session.commit()

        logger.info(f"Dream {new_dream.id} saved successfully")
        return new_dream.to_dict()

    except Exception as e:
        logger.error(f"Error saving dream: {str(e)}")
        db.session.rollback()
        return {'errors': {'server': 'An error occurred while saving the dream'}}, 500