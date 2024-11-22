# backend/app/api/dream_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamJournal, DreamTags
from app.forms.dream_form import DreamForm
from datetime import datetime
from sqlalchemy import func
import logging

dream_routes = Blueprint('dreams', __name__)
logger = logging.getLogger(__name__)

@dream_routes.route('/')
@login_required
def get_dreams():
    """
    Get all dreams for current user
    """
    dreams = DreamJournal.query.filter_by(user_id=current_user.id)\
        .order_by(DreamJournal.date.desc()).all()
    return jsonify([dream.to_dict() for dream in dreams])

@dream_routes.route('/today')
@login_required
def get_today_dream():
    """
    Check if user has already logged a dream today
    """
    today = datetime.utcnow().date()
    dream = DreamJournal.query\
        .filter(
            DreamJournal.user_id == current_user.id,
            func.date(DreamJournal.date) == today
        ).first()
    
    return jsonify(dream.to_dict() if dream else None)

@dream_routes.route('/<int:dream_id>')
@login_required
def get_dream(dream_id):
    """
    Get a specific dream
    """
    dream = DreamJournal.query.get_or_404(dream_id)
    if dream.user_id != current_user.id:
        return {'errors': {'unauthorized': 'Dream not found'}}, 404
    return dream.to_dict()

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

    # Check if dream already exists for today
    today = datetime.utcnow().date()
    existing_dream = DreamJournal.query\
        .filter(
            DreamJournal.user_id == current_user.id,
            func.date(DreamJournal.date) == today
        ).first()

    if existing_dream:
        return {'errors': {'date': 'You have already logged a dream today'}}, 400

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

@dream_routes.route('/<int:dream_id>', methods=['PUT'])
@login_required
def update_dream(dream_id):
    dream = DreamJournal.query.get_or_404(dream_id)
    if dream.user_id != current_user.id:
        return {'errors': {'unauthorized': 'Dream not found'}}, 404

    form = DreamForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    
    if form.validate_on_submit():
        try:
            dream.title = form.title.data
            dream.content = form.content.data
            dream.is_lucid = form.is_lucid.data
            dream.updated_at = datetime.utcnow()
            # Don't update dream.date - keep original date

            # Update tags
            DreamTags.query.filter_by(dream_id=dream_id).delete()
            
            if form.tags.data:
                tags = [tag.strip() for tag in form.tags.data.split(',')]
                for tag in tags:
                    new_tag = DreamTags(
                        dream_id=dream_id,
                        tag=tag,
                        is_auto_generated=False
                    )
                    db.session.add(new_tag)

            db.session.commit()
            return dream.to_dict()

        except Exception as e:
            logger.error(f"Error updating dream: {str(e)}")
            db.session.rollback()
            return {'errors': {'server': 'An error occurred while updating the dream'}}, 500
    
    return {'errors': form.errors}, 400

@dream_routes.route('/<int:dream_id>', methods=['DELETE'])
@login_required
def delete_dream(dream_id):
    """
    Delete a dream entry
    """
    dream = DreamJournal.query.get_or_404(dream_id)
    if dream.user_id != current_user.id:
        return {'errors': {'unauthorized': 'Dream not found'}}, 404

    try:
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
    """
    Get all dreams for a specific month
    """
    try:
        # Get the first and last day of the month
        start_date = date(year, month, 1)
        # Handle December
        if month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, month + 1, 1)

        dreams = DreamJournal.query.filter(
            DreamJournal.user_id == current_user.id,
            func.date(DreamJournal.date) >= start_date,
            func.date(DreamJournal.date) < next_month
        ).all()

        return jsonify([dream.to_dict() for dream in dreams])
    except Exception as e:
        logger.error(f"Error fetching dreams for month: {str(e)}")
        return {'errors': {'server': 'An error occurred while fetching dreams'}}, 500

@dream_routes.route('/popular_tags')
@login_required
def get_popular_tags():
    """
    Get most frequently used words in dreams as tags
    """
    try:
        # Get all dreams for the user
        dreams = DreamJournal.query.filter_by(user_id=current_user.id).all()
        
        # Combine all dream content
        all_content = ' '.join(dream.content for dream in dreams)
        
        # Simple word frequency analysis
        words = all_content.lower().split()
        word_freq = {}
        
        for word in words:
            if len(word) > 3:  # Only count words longer than 3 characters
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and get top 10
        popular_tags = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return jsonify([{'tag': tag, 'count': count} for tag, count in popular_tags])
    except Exception as e:
        logger.error(f"Error getting popular tags: {str(e)}")
        return {'errors': {'server': 'An error occurred while fetching popular tags'}}, 500