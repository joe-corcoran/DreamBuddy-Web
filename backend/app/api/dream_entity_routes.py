# backend/app/api/dream_entity_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamEntity
import logging
from datetime import datetime

dream_entity_routes = Blueprint('dream_entities', __name__)
logger = logging.getLogger(__name__)

@dream_entity_routes.route('', methods=['GET'])
@login_required
def get_all_entities():
    """Get all dream entities for current user"""
    entities = DreamEntity.query.filter_by(user_id=current_user.id).all()
    return jsonify([entity.to_dict() for entity in entities])

@dream_entity_routes.route('', methods=['POST'])
@login_required
def create_entity():
    """Create a new dream entity"""
    try:
        data = request.get_json()
        
        entity = DreamEntity(
            user_id=current_user.id,
            name=data['name'],
            entity_type=data['entity_type'],
            description=data.get('description'),
            personal_significance=data.get('personal_significance')
        )
        
        db.session.add(entity)
        db.session.commit()
        
        return jsonify(entity.to_dict())

    except KeyError as e:
        return jsonify({'errors': {'validation': f'Missing required field: {str(e)}'}}), 400
    except Exception as e:
        logger.error(f"Error creating dream entity: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@dream_entity_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_entity(id):
    """Update a dream entity"""
    try:
        entity = DreamEntity.query.get_or_404(id)
        
        if entity.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403
            
        data = request.get_json()
        
        for field in ['name', 'entity_type', 'description', 'personal_significance']:
            if field in data:
                setattr(entity, field, data[field])
                
        db.session.commit()
        return jsonify(entity.to_dict())

    except Exception as e:
        logger.error(f"Error updating dream entity: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@dream_entity_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_entity(id):
    """Delete a dream entity"""
    try:
        entity = DreamEntity.query.get_or_404(id)
        
        if entity.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403
            
        db.session.delete(entity)
        db.session.commit()
        
        return jsonify({'message': 'Entity deleted successfully'})

    except Exception as e:
        logger.error(f"Error deleting dream entity: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500

@dream_entity_routes.route('/<int:id>/increment', methods=['POST'])
@login_required
def increment_frequency(id):
    """Increment the frequency counter for an entity"""
    try:
        entity = DreamEntity.query.get_or_404(id)
        
        if entity.user_id != current_user.id:
            return jsonify({'errors': {'auth': 'Unauthorized'}}), 403
            
        entity.frequency += 1
        entity.last_appeared = datetime.utcnow()
        db.session.commit()
        
        return jsonify(entity.to_dict())

    except Exception as e:
        logger.error(f"Error incrementing entity frequency: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500