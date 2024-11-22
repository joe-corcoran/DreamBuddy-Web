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

        dreams = DreamJournal.query.filter(
            DreamJournal.id.in_(dream_ids),
            DreamJournal.user_id == current_user.id
        ).all()

        if not dreams:
            return jsonify({'error': 'Dreams not found'}), 404

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

        return jsonify({
            'id': interpretation.id,
            'interpretation_text': interpretation.interpretation_text,
            'interpretation_type': interpretation.interpretation_type,
            'date': interpretation.date.isoformat()
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500