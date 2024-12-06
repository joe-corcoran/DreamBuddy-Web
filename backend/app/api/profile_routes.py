# backend/app/api/profile_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, UserProfile
import logging

profile_routes = Blueprint('profiles', __name__)
logger = logging.getLogger(__name__)

@profile_routes.route('', methods=['GET'])
@login_required
def get_profile():
    """Get current user's profile"""
    profile = UserProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'message': 'No profile found'}), 404
    return jsonify(profile.to_dict())

@profile_routes.route('', methods=['POST', 'PUT'])
@login_required
def upsert_profile():
    """Create or update user profile"""
    try:
        data = request.get_json()
        
        profile = UserProfile.query.filter_by(user_id=current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.session.add(profile)
        
        # Update fields
        for field in [
            'birth_year', 'cultural_background', 'occupation',
            'dream_goals', 'preferred_interpretation_type',
            'significant_life_events', 'recurring_themes'
        ]:
            if field in data:
                setattr(profile, field, data[field])
        
        db.session.commit()
        return jsonify(profile.to_dict())

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        db.session.rollback()
        return jsonify({'errors': {'server': str(e)}}), 500