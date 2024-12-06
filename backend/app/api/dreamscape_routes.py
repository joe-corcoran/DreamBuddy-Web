#backend/app/api/dreamscape_route.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, Dreamscape
from app.services.openai_service import OpenAIService
from app.aws.aws_helpers import upload_dalle_image_to_s3
from datetime import datetime
import logging

dreamscape_routes = Blueprint('dreamscapes', __name__)
logger = logging.getLogger(__name__)

@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required
def generate_dreamscape(dream_id):
    """Generate a new dreamscape for a dream"""
    try:
        # Verify dream ownership
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403

        # Generate dreamscape using OpenAI
        dreamscape_data = OpenAIService.generate_dreamscape(
            dream.content,
            current_user.id  # Add user_id parameter
        )
        if not dreamscape_data or 'image_url' not in dreamscape_data:
            return jsonify({'errors': {'server': 'Failed to generate image'}}), 500

        # Upload to S3
        s3_result = upload_dalle_image_to_s3(dreamscape_data['image_url'])
        if 'errors' in s3_result:
            return jsonify({'errors': {'server': s3_result['errors']}}), 500

        # Save to database
        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if not dreamscape:
            dreamscape = Dreamscape(dream_id=dream_id)
            db.session.add(dreamscape)

        dreamscape.image_url = s3_result['url']
        dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
        db.session.commit()

        return jsonify({
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt
        })

    except Exception as e:
        logger.error(f"Failed to generate dreamscape: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500
    
@dreamscape_routes.route('/all', methods=['GET'])
@login_required
def get_all_dreamscapes():
    """Get all dreamscapes for the current user"""
    try:
        dreamscapes = (Dreamscape.query
            .join(DreamJournal)
            .filter(DreamJournal.user_id == current_user.id)
            .all())
        
        return jsonify([{
            'dream_id': dreamscape.dream_id,
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt
        } for dreamscape in dreamscapes])

    except Exception as e:
        logger.error(f"Error fetching all dreamscapes: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/dream/<int:dream_id>', methods=['GET'])
@login_required
def get_dreamscape(dream_id):
    """Get existing dreamscape for a dream"""
    try:
        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if not dreamscape:
            return jsonify({'message': 'No dreamscape found'}), 404

        return jsonify({
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt
        })

    except Exception as e:
        logger.error(f"Error fetching dreamscape: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500