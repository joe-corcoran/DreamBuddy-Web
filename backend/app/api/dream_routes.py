# backend/app/api/dream_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask_wtf.csrf import validate_csrf
from app.models import db, DreamJournal, DreamTags 
from app.forms.dream_form import DreamForm
from datetime import datetime, timezone
from sqlalchemy import func
import logging
from dateutil import parser

dream_routes = Blueprint('dreams', __name__)
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

def parse_client_date(date_str):
    """Parse date string from client with timezone handling"""
    try:
        return parser.parse(date_str)
    except:
        return datetime.now(timezone.utc)

@dream_routes.route('/')
@login_required
def get_dreams():
    """Get all dreams for current user"""
    try:
        dreams = DreamJournal.query\
            .filter_by(user_id=current_user.id)\
            .order_by(DreamJournal.dream_date.desc(), DreamJournal.created_at.desc())\
            .all()
        
        # Include dreamscape data if available
        dream_data = []
        for dream in dreams:
            dream_dict = dream.to_dict()
            if dream.dreamscape:
                dream_dict['dreamscape'] = dream.dreamscape.to_dict()
            dream_data.append(dream_dict)
            
        return jsonify(dream_data)
    except Exception as e:
        logger.error(f"Error fetching dreams: {str(e)}")
        return {'errors': {'server': 'An error occurred while fetching dreams'}}, 500

@dream_routes.route('/today')
@login_required
def get_today_dream():
    try:
        client_date_str = request.args.get('clientDate')
        if not client_date_str:
            return jsonify(None)
            
        # Parse client date with timezone awareness
        client_date = parse_client_date(client_date_str)
        target_date = client_date.date()
        
        dream = DreamJournal.get_dream_for_date(current_user.id, target_date)
        if not dream:
            return jsonify(None)
            
        response = dream.to_dict()
        if dream.dreamscape:
            response['dreamscape'] = dream.dreamscape.to_dict()
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error getting today's dream: {str(e)}")
        return {'errors': {'server': 'An error occurred'}}, 500


@dream_routes.route('/<int:dream_id>')
@login_required
def get_dream(dream_id):
    """Get a specific dream"""
    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return {'errors': {'unauthorized': 'Dream not found'}}, 404
            
        response = dream.to_dict()
        if dream.dreamscape:
            response['dreamscape'] = dream.dreamscape.to_dict()
        return response
    except Exception as e:
        logger.error(f"Error fetching dream {dream_id}: {str(e)}")
        return {'errors': {'server': 'An error occurred'}}, 500

@dream_routes.route('/quick', methods=['POST'])
@login_required
def quick_dream():
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        data = request.json
        client_date_str = data.get('clientDate')
        if not client_date_str:
            return {'errors': {'date': 'Client date is required'}}, 400

        target_date = parse_client_date(client_date_str)
        target_date_only = target_date.date()

        # Only check for existing dream if not explicitly allowing multiple dreams
        if not data.get('allowMultiple'):
            existing_dream = DreamJournal.get_dream_for_date(current_user.id, target_date_only)
            if existing_dream:
                return {'errors': {'date': 'You have already logged a dream for this date'}}, 400

        new_dream = DreamJournal(
            user_id=current_user.id,
            title=data.get('title', f"Dream on {target_date.strftime('%B %d, %Y at %I:%M %p')}"),
            content=data['content'],
            is_lucid=data.get('is_lucid', False),
            date=target_date
        )
        db.session.add(new_dream)
        db.session.commit()

        return jsonify(new_dream.to_dict())
    except Exception as e:
        logger.error(f"Error saving dream: {str(e)}")
        db.session.rollback()
        return {'errors': {'server': 'An error occurred while saving the dream'}}, 500

@dream_routes.route('/<int:dream_id>', methods=['PUT'])
@login_required
def update_dream(dream_id):
    """Update an existing dream"""
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return {'errors': {'unauthorized': 'Dream not found'}}, 404

        data = request.json
        dream.title = data.get('title', dream.title)
        dream.content = data.get('content', dream.content)
        dream.is_lucid = data.get('is_lucid', dream.is_lucid)
        dream.updated_at = datetime.now(timezone.utc)

        # Update tags if provided
        if 'tags' in data:
            DreamTags.query.filter_by(dream_id=dream_id).delete()
            for tag in data['tags']:
                new_tag = DreamTags(
                    dream_id=dream_id,
                    tag=tag,
                    is_auto_generated=False
                )
                db.session.add(new_tag)

        db.session.commit()
        response = dream.to_dict()
        if dream.dreamscape:
            response['dreamscape'] = dream.dreamscape.to_dict()
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error updating dream: {str(e)}")
        db.session.rollback()
        return {'errors': {'server': 'An error occurred while updating the dream'}}, 500

@dream_routes.route('/<int:dream_id>', methods=['DELETE'])
@login_required
def delete_dream(dream_id):
    """Delete a dream entry"""
    is_valid, error_response, error_code = validate_csrf_token()
    if not is_valid:
        return error_response, error_code

    try:
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return {'errors': {'unauthorized': 'Dream not found'}}, 404

        DreamTags.query.filter_by(dream_id=dream_id).delete()
        db.session.delete(dream)
        db.session.commit()
        return {'message': 'Dream deleted successfully'}
    except Exception as e:
        logger.error(f"Error deleting dream: {str(e)}")
        db.session.rollback()
        return {'errors': {'server': 'An error occurred while deleting the dream'}}, 500

@dream_routes.route('/month/<int:year>/<int:month>')
@login_required
def get_dreams_by_month(year, month):
    """Get all dreams for a specific month"""
    try:
        client_date_str = request.args.get('clientDate')
        client_timezone = parse_client_date(client_date_str).tzinfo if client_date_str else timezone.utc

        start_date = datetime(year, month, 1, tzinfo=client_timezone)
        if month == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=client_timezone)
        else:
            end_date = datetime(year, month + 1, 1, tzinfo=client_timezone)

        dreams = DreamJournal.query.filter(
            DreamJournal.user_id == current_user.id,
            DreamJournal.date >= start_date,
            DreamJournal.date < end_date
        ).order_by(DreamJournal.date.desc()).all()

        dream_data = []
        for dream in dreams:
            dream_dict = dream.to_dict()
            if dream.dreamscape:
                dream_dict['dreamscape'] = dream.dreamscape.to_dict()
            dream_data.append(dream_dict)

        return jsonify(dream_data)
    except Exception as e:
        logger.error(f"Error fetching dreams for month: {str(e)}")
        return {'errors': {'server': 'An error occurred while fetching dreams'}}, 500

@dream_routes.route('/popular_tags')
@login_required
def get_popular_tags():
    """Get most frequently used words in dreams as tags"""
    try:
        dreams = DreamJournal.query.filter_by(user_id=current_user.id).all()
        all_content = ' '.join(dream.content for dream in dreams)
        words = all_content.lower().split()
        word_freq = {}
        
        for word in words:
            if len(word) > 3:  # Only count words longer than 3 characters
                word_freq[word] = word_freq.get(word, 0) + 1
        
        popular_tags = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return jsonify([{'tag': tag, 'count': count} for tag, count in popular_tags])
    except Exception as e:
        logger.error(f"Error getting popular tags: {str(e)}")
        return {'errors': {'server': 'An error occurred while fetching popular tags'}}, 500