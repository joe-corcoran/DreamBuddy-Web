#backend/app/api/dreamscape_routes.py
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

# Status constants
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

def handle_generation_process(dreamscape):
    """Handle the complete generation process with proper status updates"""
    try:
        # Start generation
        update_dreamscape_status(dreamscape, GENERATION_STATUS['GENERATING'])
        dreamscape_data = OpenAIService.generate_dreamscape(dreamscape.dream.content)
        
        # Start upload
        update_dreamscape_status(dreamscape, GENERATION_STATUS['UPLOADING'])
        s3_upload = upload_dalle_image_to_s3(dreamscape_data['image_url'])
        
        if "errors" in s3_upload:
            raise Exception(s3_upload["errors"])
            
        # Update with success
        dreamscape.image_url = s3_upload["url"]
        dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
        update_dreamscape_status(dreamscape, GENERATION_STATUS['COMPLETED'])
        
    except Exception as e:
        logger.error(f"Generation process failed: {str(e)}")
        update_dreamscape_status(dreamscape, GENERATION_STATUS['FAILED'], str(e))
        raise


def update_dreamscape_status(dreamscape, status, error_message=None, commit=True):
    """Atomic status update for dreamscape"""
    try:
        dreamscape.status = status
        dreamscape.error_message = error_message
        dreamscape.updated_at = datetime.now(timezone.utc)
        if commit:
            db.session.commit()
        logger.info(f"Updated dreamscape {dreamscape.id} status to {status}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to update dreamscape status: {str(e)}")
        raise        

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
    
@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required
def generate_dreamscape(dream_id):
    """Generate a new dreamscape for a dream"""
    logger.info(f"Starting dreamscape generation for dream {dream_id}")
    
    try:
        # Verify dream ownership
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        # Handle existing dreamscape
        dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        
        if dreamscape:
            # Check for stuck processes
            time_diff = datetime.now(timezone.utc) - dreamscape.updated_at
            if time_diff.total_seconds() > 300 and dreamscape.status in ['generating', 'uploading']:
                update_dreamscape_status(dreamscape, GENERATION_STATUS['FAILED'], "Generation timed out")
            elif dreamscape.status in ['generating', 'uploading']:
                return jsonify({
                    'status': dreamscape.status,
                    'message': 'Generation in progress'
                }), 202

        # Create new dreamscape if needed
        if not dreamscape:
            dreamscape = Dreamscape(
                dream_id=dream_id,
                status=GENERATION_STATUS['PENDING'],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.session.add(dreamscape)
            db.session.commit()

        # Start generation in background thread
        Thread(target=handle_generation_process, args=(dreamscape,)).start()
        
        return jsonify({
            'status': GENERATION_STATUS['GENERATING'],
            'message': 'Generation started'
        }), 202

    except Exception as e:
        logger.error(f"Failed to start generation: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500
    

@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required
def generate_dreamscape(dream_id):
    """Generate a new dreamscape for a dream"""
    logger.info(f"Starting dreamscape generation for dream {dream_id}")
    
    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized access'}}), 403

        # Check if there's already a dreamscape in progress
        existing_dreamscape = Dreamscape.query.filter_by(dream_id=dream_id).first()
        if existing_dreamscape:
            if existing_dreamscape.status in ['generating', 'uploading']:
                # If stuck for more than 5 minutes, mark as failed
                time_diff = datetime.now(timezone.utc) - existing_dreamscape.updated_at
                if time_diff.total_seconds() > 300:
                    existing_dreamscape.status = 'failed'
                    existing_dreamscape.error_message = "Generation timed out"
                    db.session.commit()
                else:
                    return jsonify({
                        'status': existing_dreamscape.status,
                        'message': 'Dreamscape generation in progress'
                    }), 202

        # Create or update dreamscape
        dreamscape = existing_dreamscape or Dreamscape(dream_id=dream_id)
        dreamscape.status = 'generating'
        dreamscape.error_message = None
        dreamscape.updated_at = datetime.now(timezone.utc)
        if not existing_dreamscape:
            dreamscape.created_at = datetime.now(timezone.utc)
            db.session.add(dreamscape)
        db.session.commit()

        try:
            # Generate dreamscape
            dreamscape_data = OpenAIService.generate_dreamscape(dream.content)
            
            # Upload to S3
            s3_upload = upload_dalle_image_to_s3(dreamscape_data['image_url'])
            if "errors" in s3_upload:
                raise Exception(s3_upload["errors"])

            # Update dreamscape
            dreamscape.status = 'completed'
            dreamscape.image_url = s3_upload["url"]
            dreamscape.optimized_prompt = dreamscape_data['optimized_prompt']
            db.session.commit()

            return jsonify({
                'status': 'completed',
                'image_url': s3_upload["url"],
                'optimized_prompt': dreamscape_data['optimized_prompt']
            })

        except Exception as e:
            logger.error(f"Generation error: {str(e)}")
            dreamscape.status = 'failed'
            dreamscape.error_message = str(e)
            db.session.commit()
            return jsonify({'errors': {'server': str(e)}}), 500

    except Exception as e:
        logger.error(f"Route error: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500