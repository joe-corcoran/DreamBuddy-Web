from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, Dreamscape
from datetime import datetime, timezone
import logging

dreamscape_routes = Blueprint('dreamscapes', __name__)
logger = logging.getLogger(__name__)

def validate_csrf_token():
    try:
        csrf_token = request.cookies.get('csrf_token')
        if not csrf_token:
            return False, {'errors': {'csrf': 'Missing CSRF token'}}, 400
        return True, None, None
    except Exception as e:
        logger.error(f"CSRF validation error: {str(e)}")
        return False, {'errors': {'csrf': 'Invalid CSRF token'}}, 400

@dreamscape_routes.route('/<int:dream_id>', methods=['POST'])
@login_required
def create_dreamscape(dream_id):
    """Create a new dreamscape for a dream"""
    # Validate CSRF token
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return {'errors': {'auth': 'Unauthorized access'}}, 403

        data = request.json
        if not data or 'imageUrl' not in data or 'optimizedPrompt' not in data:
            return {'errors': {'validation': 'Image URL and optimized prompt required'}}, 400

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