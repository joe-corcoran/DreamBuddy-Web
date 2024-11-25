from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, Dreamscape
from app.services.openai_service import OpenAIService
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

@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required
def generate_dreamscape(dream_id):
    """Generate a new dreamscape for a dream"""
    # Validate CSRF token
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        # Verify dream belongs to current user
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        # Check for existing dreamscape
        existing_dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if existing_dreamscape:
            return jsonify({
                'image_url': existing_dreamscape.image_url,
                'optimized_prompt': existing_dreamscape.optimized_prompt
            })

        try:
            # Generate dreamscape using OpenAIService
            dreamscape_data = OpenAIService.generate_dreamscape(dream.content)
        except Exception as e:
            logger.error(f"OpenAI dreamscape generation error: {str(e)}")
            return jsonify({'errors': {'server': 'Failed to generate dreamscape'}}), 500

        # Save to database
        new_dreamscape = Dreamscape(
            dream_id=dream_id,
            image_url=dreamscape_data['image_url'],
            optimized_prompt=dreamscape_data['optimized_prompt']
        )
        db.session.add(new_dreamscape)
        db.session.commit()

        return jsonify(dreamscape_data)

    except Exception as e:
        logger.error(f"Error in dreamscape generation route: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/dream/<int:dream_id>', methods=['GET'])
@login_required
def get_dreamscape(dream_id):
    """Get existing dreamscape for a dream"""
    try:
        # Verify dream belongs to current user
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if not dreamscape:
            return jsonify({'errors': {'not_found': 'Dreamscape not found'}}), 404

        return jsonify({
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt
        })

    except Exception as e:
        logger.error(f"Error fetching dreamscape: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/regenerate/<int:dream_id>', methods=['POST'])
@login_required
def regenerate_dreamscape(dream_id):
    """Regenerate dreamscape for a dream"""
    # Validate CSRF token
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        # Verify dream belongs to current user
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        try:
            # Generate new dreamscape using OpenAIService
            dreamscape_data = OpenAIService.generate_dreamscape(dream.content)
        except Exception as e:
            logger.error(f"OpenAI dreamscape regeneration error: {str(e)}")
            return jsonify({'errors': {'server': 'Failed to regenerate dreamscape'}}), 500

        # Update or create dreamscape
        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if dreamscape:
            dreamscape.image_url = dreamscape_data['image_url']
            dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
            dreamscape.updated_at = datetime.now(timezone.utc)
        else:
            dreamscape = Dreamscape(
                dream_id=dream_id,
                image_url=dreamscape_data['image_url'],
                optimized_prompt=dreamscape_data['optimized_prompt']
            )
            db.session.add(dreamscape)

        db.session.commit()
        return jsonify(dreamscape_data)

    except Exception as e:
        logger.error(f"Error in dreamscape regeneration route: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500