from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamInterpretation, DreamJournal
from app.services.openai_service import OpenAIService
from datetime import datetime
import os
import logging

interpretation_routes = Blueprint('interpretations', __name__)
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

def get_interpretation_prompt(type):
    prompts = {
        'spiritual': "Analyze these dreams spiritually, focusing on deeper meaning and growth:",
        'practical': "Provide practical insights applicable to daily life:",
        'emotional': "Examine emotional themes and patterns:",
        'actionable': "Suggest specific actions or changes:",
        'lucid': "Provide insights for lucid dreaming development:"
    }
    return prompts.get(type, prompts['practical'])

@interpretation_routes.route('/generate', methods=['POST'])
@login_required
def generate_interpretation():
    # Validate CSRF token
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code
        
    try:
        data = request.get_json()
        dream_ids = data.get('dreamIds')
        interp_type = data.get('type')

        if not dream_ids:
            return jsonify({'errors': {'validation': 'No dreams provided'}}), 400

        # Verify dreams belong to current user
        dreams = DreamJournal.query.filter(
            DreamJournal.id.in_(dream_ids),
            DreamJournal.user_id == current_user.id
        ).all()

        if len(dreams) != len(dream_ids):
            return jsonify({'errors': {'auth': 'Unauthorized access to dreams'}}), 403

        if not dreams:
            return jsonify({'errors': {'validation': 'Dreams not found'}}), 404

        # Check for existing interpretation
        existing_interpretation = DreamInterpretation.query.filter(
            DreamInterpretation.user_id == current_user.id,
            DreamInterpretation.interpretation_type == interp_type,
            DreamInterpretation.dreams.any(DreamJournal.id.in_(dream_ids))
        ).first()

        if existing_interpretation:
            return jsonify(existing_interpretation.to_dict())

        dream_content = " ".join(dream.content for dream in dreams)
        
        # Use OpenAIService instead of direct client call
        try:
            interpretation_text = OpenAIService.generate_interpretation(dream_content, interp_type)
        except Exception as e:
            logger.error(f"OpenAI interpretation generation error: {str(e)}")
            return jsonify({'errors': {'server': 'Failed to generate interpretation'}}), 500

        interpretation = DreamInterpretation(
            user_id=current_user.id,
            interpretation_text=interpretation_text,
            interpretation_type=interp_type,
            date=datetime.utcnow()
        )

        interpretation.dreams.extend(dreams)
        db.session.add(interpretation)
        db.session.commit()

        return jsonify(interpretation.to_dict())

    except Exception as e:
        logger.error(f"Error generating interpretation: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@interpretation_routes.route('/dream/<int:dream_id>', methods=['GET'])
@login_required
def get_dream_interpretations(dream_id):
    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403

        interpretations = DreamInterpretation.query.filter(
            DreamInterpretation.user_id == current_user.id,
            DreamInterpretation.dreams.any(DreamJournal.id == dream_id)
        ).all()

        return jsonify([interp.to_dict() for interp in interpretations])

    except Exception as e:
        logger.error(f"Error fetching interpretations: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500