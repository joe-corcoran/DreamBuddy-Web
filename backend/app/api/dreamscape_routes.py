from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, Dreamscape
from app.services.openai_service import OpenAIService
from app.aws.aws_helpers import upload_dalle_image_to_s3
from datetime import datetime, timezone
import logging
from threading import Thread

dreamscape_routes = Blueprint('dreamscapes', __name__)
logger = logging.getLogger(__name__)

# Add new status constants
GENERATION_STATUS = {
    'PENDING': 'pending',
    'GENERATING': 'generating',
    'UPLOADING': 'uploading',
    'COMPLETED': 'completed',
    'FAILED': 'failed'
}

def validate_csrf_token():
    try:
        csrf_token = request.cookies.get('csrf_token')
        if not csrf_token:
            return False, {'errors': {'csrf': 'Missing CSRF token'}}, 400
        return True, None, None
    except Exception as e:
        logger.error(f"CSRF validation error: {str(e)}")
        return False, {'errors': {'csrf': 'Invalid CSRF token'}}, 400
    
    pass

def handle_s3_upload(dreamscape, dalle_url):
    """Background handler for S3 upload"""
    try:
        dreamscape.status = GENERATION_STATUS['UPLOADING']
        db.session.commit()

        s3_upload = upload_dalle_image_to_s3(dalle_url)
        if "url" in s3_upload:
            dreamscape.image_url = s3_upload["url"]
            dreamscape.status = GENERATION_STATUS['COMPLETED']
            db.session.commit()
            logger.info(f"Successfully updated dreamscape {dreamscape.id} with S3 URL")
        else:
            dreamscape.status = GENERATION_STATUS['FAILED']
            dreamscape.error_message = s3_upload.get('errors')
            db.session.commit()
            logger.error(f"Failed to upload to S3: {s3_upload.get('errors')}")
    except Exception as e:
        dreamscape.status = GENERATION_STATUS['FAILED']
        dreamscape.error_message = str(e)
        db.session.commit()
        logger.error(f"Error in S3 upload handler: {str(e)}")

@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required
def generate_dreamscape(dream_id):
    """Generate a new dreamscape for a dream"""
    logger.info(f"Starting dreamscape generation for dream {dream_id}")
    
    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        # Create new dreamscape with generating status
        new_dreamscape = Dreamscape(
            dream_id=dream_id,
            status=GENERATION_STATUS['GENERATING'],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.session.add(new_dreamscape)
        db.session.commit()

        try:
            # Generate dreamscape using OpenAIService
            dreamscape_data = OpenAIService.generate_dreamscape(dream.content)
            
            # Update status to uploading
            new_dreamscape.status = GENERATION_STATUS['UPLOADING']
            new_dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
            db.session.commit()

            # Upload to S3
            s3_upload = upload_dalle_image_to_s3(dreamscape_data['image_url'])
            
            if "errors" in s3_upload:
                raise Exception(s3_upload["errors"])

            # Update with S3 URL
            new_dreamscape.image_url = s3_upload["url"]
            new_dreamscape.status = GENERATION_STATUS['COMPLETED']
            db.session.commit()

            return jsonify({
                'status': GENERATION_STATUS['COMPLETED'],
                'image_url': s3_upload["url"],
                'optimized_prompt': dreamscape_data['optimized_prompt']
            })

        except Exception as e:
            new_dreamscape.status = GENERATION_STATUS['FAILED']
            new_dreamscape.error_message = str(e)
            db.session.commit()
            raise e

    except Exception as e:
        logger.error(f"Error in dreamscape generation: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/status/<int:dream_id>', methods=['GET'])
@login_required
def get_generation_status(dream_id):
    """Get the current status of dreamscape generation"""
    try:
        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if not dreamscape:
            return jsonify({'status': 'not_found'}), 404

        return jsonify({
            'status': dreamscape.status,
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt,
            'error_message': dreamscape.error_message
        })

    except Exception as e:
        logger.error(f"Error getting generation status: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/dream/<int:dream_id>', methods=['GET'])
@login_required
def get_dreamscape(dream_id):
    """Get existing dreamscape for a dream"""
    logger.info(f"Fetching dreamscape for dream {dream_id}")
    
    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            logger.warning(f"Unauthorized access attempt for dream {dream_id}")
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if not dreamscape:
            logger.info(f"No dreamscape found for dream {dream_id}")
            return jsonify({'message': 'No dreamscape found'}), 404

        if dreamscape.status != GENERATION_STATUS['COMPLETED']:
            return jsonify({
                'status': dreamscape.status,
                'message': 'Dreamscape generation in progress'
            }), 202

        logger.info(f"Successfully fetched dreamscape for dream {dream_id}")
        return jsonify({
            'status': dreamscape.status,
            'image_url': dreamscape.image_url,
            'optimized_prompt': dreamscape.optimized_prompt
        })

    except Exception as e:
        logger.error(f"Error fetching dreamscape for dream {dream_id}: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

@dreamscape_routes.route('/regenerate/<int:dream_id>', methods=['POST'])
@login_required
def regenerate_dreamscape(dream_id):
    """Regenerate dreamscape for a dream"""
    logger.info(f"Starting dreamscape regeneration for dream {dream_id}")
    
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            logger.warning(f"Unauthorized access attempt for dream {dream_id}")
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        try:
            dreamscape_data = OpenAIService.generate_dreamscape(dream.content)
            logger.info(f"Successfully generated new dreamscape data for dream {dream_id}")
        except Exception as e:
            logger.error(f"OpenAI dreamscape regeneration error: {str(e)}")
            return jsonify({'errors': {'server': 'Failed to regenerate dreamscape'}}), 500

        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if dreamscape:
            dreamscape.image_url = dreamscape_data['image_url']
            dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
            dreamscape.updated_at = datetime.now(timezone.utc)
        else:
            dreamscape = Dreamscape(
                dream_id=dream_id,
                image_url=dreamscape_data['image_url'],
                optimized_prompt=dreamscape_data['optimized_prompt'],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.session.add(dreamscape)

        db.session.commit()
        logger.info(f"Successfully saved regenerated dreamscape for dream {dream_id}")

        # Start async S3 upload
        asyncio.create_task(handle_s3_upload(dreamscape, dreamscape_data['image_url']))

        return jsonify({
            'image_url': dreamscape_data['image_url'],
            'optimized_prompt': dreamscape_data['optimized_prompt']
        })

    except Exception as e:
        logger.error(f"Error in dreamscape regeneration route: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500