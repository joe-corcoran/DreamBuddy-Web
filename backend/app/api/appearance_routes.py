# backend/app/api/appearance_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, UserAppearance, RecurringCharacter
import logging

appearance_routes = Blueprint('appearances', __name__)
logger = logging.getLogger(__name__)

@appearance_routes.route('/user', methods=['GET'])
@login_required
def get_user_appearance():
    """Get current user's appearance settings"""
    try:
        appearance = UserAppearance.query.filter_by(user_id=current_user.id).first()
        return jsonify(appearance.to_dict() if appearance else {})
    except Exception as e:
        logger.error(f"Error fetching user appearance: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

# backend/app/api/appearance_routes.py
@appearance_routes.route('/user', methods=['POST', 'PUT'])
@login_required
def update_user_appearance():
    """Create or update user appearance"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'age_range', 'gender', 'height_range', 'build',
            'hair_color', 'hair_style', 'eye_color', 'skin_tone'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'errors': {
                        'validation': f'Missing required field: {field}'
                    }
                }), 400

        appearance = UserAppearance.query.filter_by(user_id=current_user.id).first()
        
        if not appearance:
            appearance = UserAppearance(
                user_id=current_user.id,
                facial_hair=data.get('facial_hair', 'none')
            )
            db.session.add(appearance)

        # Update fields
        for field in required_fields + ['facial_hair']:
            if field in data:
                setattr(appearance, field, data[field])

        db.session.commit()
        return jsonify(appearance.to_dict())

    except Exception as e:
        logger.error(f"Error updating user appearance: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@appearance_routes.route('/characters', methods=['GET'])
@login_required
def get_recurring_characters():
    """Get all recurring characters"""
    try:
        characters = RecurringCharacter.query.filter_by(user_id=current_user.id).all()
        return jsonify([char.to_dict() for char in characters])
    except Exception as e:
        logger.error(f"Error fetching recurring characters: {str(e)}")
        return jsonify({'errors': {'server': str(e)}}), 500

@appearance_routes.route('/characters', methods=['POST'])
@login_required
def create_character():
    """Create a new recurring character"""
    try:
        data = request.get_json()
        character = RecurringCharacter(
            user_id=current_user.id,
            name=data['name'],
            relationship=data['relationship']
        )

        for field in [
            'age_range', 'gender', 'height_range', 'build',
            'hair_color', 'hair_style', 'eye_color', 'skin_tone',
            'facial_hair'
        ]:
            if field in data:
                setattr(character, field, data[field])

        db.session.add(character)
        db.session.commit()
        return jsonify(character.to_dict())

    except Exception as e:
        logger.error(f"Error creating character: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@appearance_routes.route('/characters/<int:id>', methods=['PUT'])
@login_required
def update_character(id):
    """Update a recurring character"""
    try:
        character = RecurringCharacter.query.get_or_404(id)
        if character.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403

        data = request.get_json()
        for field in [
            'name', 'relationship', 'age_range', 'gender', 'height_range',
            'build', 'hair_color', 'hair_style', 'eye_color', 'skin_tone',
            'facial_hair'
        ]:
            if field in data:
                setattr(character, field, data[field])

        db.session.commit()
        return jsonify(character.to_dict())

    except Exception as e:
        logger.error(f"Error updating character: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@appearance_routes.route('/characters/<int:id>', methods=['DELETE'])
@login_required
def delete_character(id):
    """Delete a recurring character"""
    try:
        character = RecurringCharacter.query.get_or_404(id)
        if character.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403

        db.session.delete(character)
        db.session.commit()
        return jsonify({'message': 'Character deleted successfully'})

    except Exception as e:
        logger.error(f"Error deleting character: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500