#backend/app/api/dreamscape_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, Dreamscape
from datetime import datetime, timezone
import logging

dreamscape_routes = Blueprint('dreamscapes', __name__)
logger = logging.getLogger(__name__)

@dreamscape_routes.route('/<int:dream_id>', methods=['POST'])
@login_required
def create_dreamscape(dream_id):
    """Create a new dreamscape for a dream"""
    dream = DreamJournal.query.get_or_404(dream_id)
    if dream.user_id != current_user.id:
        return {'errors': {'unauthorized': 'Dream not found'}}, 404

    data = request.json
    if not data or 'imageUrl' not in data or 'optimizedPrompt' not in data:
        return {'errors': {'validation': 'Image URL and optimized prompt required'}}, 400

    try:
        # Check if dreamscape already exists
        existing_dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if existing_dreamscape:
            existing_dreamscape.image_url = data['imageUrl']
            existing_dreamscape.optimized_prompt = data['optimizedPrompt']
            existing_dreamscape.updated_at = datetime.now(timezone.utc)
        else:
            new_dreamscape = Dreamscape(
                dream_id=dream_id,
                image_url=data['imageUrl'],
                optimized_prompt=data['optimizedPrompt']
            )
            db.session.add(new_dreamscape)

        db.session.commit()
        return jsonify({
            'id': dream_id,
            'image_url': data['imageUrl'],
            'optimized_prompt': data['optimizedPrompt']
        })

    except Exception as e:
        logger.error(f"Error saving dreamscape: {str(e)}")
        db.session.rollback()
        return {'errors': {'server': str(e)}}, 500