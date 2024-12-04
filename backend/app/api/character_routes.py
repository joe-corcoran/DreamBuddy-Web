from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, CharacterStage
from datetime import datetime, timedelta

character_routes = Blueprint('character', __name__)

@character_routes.route('/')
@login_required
def get_character():
    """Get current user's character stage"""
    character = CharacterStage.query.filter_by(user_id=current_user.id).first()
    
    if not character:
        # Create initial character if none exists
        character = CharacterStage(
            user_id=current_user.id,
            stage_name='drifty',
            happiness=50.0,
            health=50.0,
            streak_days=0
        )
        db.session.add(character)
        db.session.commit()
    
    return jsonify(character.to_dict())

@character_routes.route('/update', methods=['PUT'])
@login_required
def update_character():
    """Update character stats based on dream entry"""
    character = CharacterStage.query.filter_by(user_id=current_user.id).first()
    
    if not character:
        return jsonify({'error': 'Character not found'}), 404

    current_date = datetime.utcnow()
    
    # Check if this is a consecutive day
    if character.last_dream_date:
        last_dream = character.last_dream_date
        days_diff = (current_date.date() - last_dream.date()).days
        
        if days_diff == 1:  # Consecutive day
            character.streak_days += 1
        elif days_diff > 1:  # Streak broken
            character.streak_days = 1
        # If days_diff == 0, it's the same day, don't update streak
    else:
        character.streak_days = 1

    # Update happiness and health based on streak
    base_increase = min(7.0, character.streak_days * 0.5)  # Cap daily increase
    character.happiness = min(100.0, character.happiness + base_increase)
    character.health = min(100.0, character.health + base_increase)
    
    # Update stage name based on new happiness level
    character.stage_name = CharacterStage.get_stage_name(character.happiness)
    character.last_dream_date = current_date
    
    try:
        db.session.commit()
        return jsonify(character.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500