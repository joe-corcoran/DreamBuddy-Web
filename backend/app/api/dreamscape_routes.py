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
    """
    Background handler for S3 upload
    Updates dreamscape with permanent URL once complete
    """
    try:
        s3_upload = upload_dalle_image_to_s3(dalle_url)
        if "url" in s3_upload:
            dreamscape.image_url = s3_upload["url"]
            db.session.commit()
            logger.info(f"Successfully updated dreamscape {dreamscape.id} with S3 URL")
        else:
            logger.error(f"Failed to upload to S3: {s3_upload.get('errors')}")
    except Exception as e:
        logger.error(f"Error in S3 upload handler: {str(e)}")


# backend/app/api/dreamscapes_routes.py

@dreamscape_routes.route('/generate/<int:dream_id>', methods=['POST'])
@login_required 
def generate_dreamscape(dream_id):
    try:
        # Add timeout handling
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return {'errors': {'unauthorized': 'Dream not found'}}, 404

        # Check if dreamscape already exists
        if dream.dreamscape:
            return dream.dreamscape.to_dict()

        # Generate optimized prompt from dream content
        prompt = f"""Create a surreal, dream-like image based on this dream content: {dream.content}
                    Make it dreamlike, ethereal, and fantastical with rich colors and soft lighting."""

        try:
            # Add timeout to OpenAI call
            response = openai.Image.create(
                prompt=prompt,
                n=1,
                size="1024x1024",
                timeout=30  # 30 second timeout
            )
            
            image_url = response['data'][0]['url']
            
            # Upload to S3 with error handling
            s3_response = upload_dalle_image_to_s3(image_url)
            if 'errors' in s3_response:
                return {'errors': s3_response['errors']}, 500
                
            # Create dreamscape with S3 URL
            dreamscape = Dreamscape(
                dream_id=dream_id,
                image_url=s3_response['url'],
                optimized_prompt=prompt
            )
            
            db.session.add(dreamscape)
            db.session.commit()
            
            return dreamscape.to_dict()

        except Exception as e:
            db.session.rollback()
            print(f"Error generating dreamscape: {str(e)}")
            return {'errors': {'server': 'Failed to generate dreamscape'}}, 500

    except Exception as e:
        print(f"Error in generate_dreamscape: {str(e)}")
        return {'errors': {'server': 'An error occurred'}}, 500

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

        logger.info(f"Successfully fetched dreamscape for dream {dream_id}")
        return jsonify({
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