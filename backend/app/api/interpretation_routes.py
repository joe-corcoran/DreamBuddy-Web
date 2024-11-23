# backend/app/api/interpretation_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DreamInterpretation, DreamJournal
from datetime import datetime
from openai import OpenAI
import os

interpretation_routes = Blueprint('interpretations', __name__)
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_interpretation_prompt(type):
    prompts = {
        'spiritual': "Analyze these dreams spiritually, focusing on deeper meaning and growth:",
        'practical': "Provide practical insights applicable to daily life:",
        'emotional': "Examine emotional themes and patterns:",
        'actionable': "Suggest specific actions or changes:",
        'lucid': "Provide insights for lucid dreaming development:"
    }
    return prompts.get(type, prompts['practical'])

@interpretation_routes.route('/generate', methods=['POST'])
@login_required
def generate_interpretation():
    try:
        data = request.get_json()
        dream_ids = data.get('dreamIds')
        interp_type = data.get('type')

        if not dream_ids:
            return jsonify({'error': 'No dreams provided'}), 400

        # Verify dreams belong to current user
        dreams = DreamJournal.query.filter(
            DreamJournal.id.in_(dream_ids),
            DreamJournal.user_id == current_user.id
        ).all()

        if len(dreams) != len(dream_ids):
            return jsonify({'error': 'Unauthorized access to dreams'}), 403

        if not dreams:
            return jsonify({'error': 'Dreams not found'}), 404

        # Check for existing interpretation
        existing_interpretation = DreamInterpretation.query.filter(
            DreamInterpretation.user_id == current_user.id,
            DreamInterpretation.interpretation_type == interp_type,
            DreamInterpretation.dreams.any(DreamJournal.id.in_(dream_ids))
        ).first()

        if existing_interpretation:
            return jsonify(existing_interpretation.to_dict())

        dream_content = " ".join(dream.content for dream in dreams)
        prompt = get_interpretation_prompt(interp_type)

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a skilled dream interpreter."},
                {"role": "user", "content": f"{prompt}\n\n{dream_content}"}
            ]
        )

        interpretation = DreamInterpretation(
            user_id=current_user.id,
            interpretation_text=response.choices[0].message.content,
            interpretation_type=interp_type,
            date=datetime.utcnow()
        )

        interpretation.dreams.extend(dreams)
        db.session.add(interpretation)
        db.session.commit()

        return jsonify(interpretation.to_dict())

    except Exception as e:
        print(f"Error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Add route to get interpretations for a dream
@interpretation_routes.route('/dream/<int:dream_id>', methods=['GET'])
@login_required
def get_dream_interpretations(dream_id):
    try:
        # Verify dream belongs to current user
        dream = DreamJournal.query.get_or_404(dream_id)
        if dream.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        interpretations = DreamInterpretation.query.filter(
            DreamInterpretation.user_id == current_user.id,
            DreamInterpretation.dreams.any(DreamJournal.id == dream_id)
        ).all()

        return jsonify([interp.to_dict() for interp in interpretations])

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500