// frontend/src/components/AppearanceModal/AppearanceModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import { 
    fetchUserAppearance, 
    updateUserAppearance, 
    fetchRecurringCharacters,
    createCharacter,
    updateCharacterThunk,
    deleteCharacter 
} from '../../redux/appearances';
import './AppearanceModal.css';

const APPEARANCE_OPTIONS = {
    age_range: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    gender: ['male', 'female', 'non-binary', 'other'],
    height_range: ['under 5\'0"', '5\'0"-5\'4"', '5\'5"-5\'9"', '5\'10"-6\'2"', 'over 6\'2"'],
    build: ['slim', 'average', 'athletic', 'full'],
    hair_color: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'other'],
    hair_style: ['short', 'medium', 'long', 'bald', 'buzzed'],
    eye_color: ['brown', 'blue', 'green', 'hazel', 'gray'],
    skin_tone: ['very light', 'light', 'medium', 'olive', 'brown', 'dark brown'],
    facial_hair: ['none', 'beard', 'mustache', 'goatee', 'stubble']
};

function AppearanceModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const userAppearance = useSelector(state => state.appearances?.userAppearance);
    const characters = useSelector(state => state.appearances?.characters || []);
    const [showCharacterForm, setShowCharacterForm] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    
    const [userForm, setUserForm] = useState({
        age_range: '',
        gender: '',
        height_range: '',
        build: '',
        hair_color: '',
        hair_style: '',
        eye_color: '',
        skin_tone: '',
        facial_hair: 'none'
    });

    const [characterForm, setCharacterForm] = useState({
        name: '',
        relationship: '',
        age_range: '',
        gender: '',
        height_range: '',
        build: '',
        hair_color: '',
        hair_style: '',
        eye_color: '',
        skin_tone: '',
        facial_hair: ''
    });

    useEffect(() => {
        dispatch(fetchUserAppearance());
        dispatch(fetchRecurringCharacters());
    }, [dispatch]);

    useEffect(() => {
        if (userAppearance) {
            setUserForm(userAppearance);
        }
    }, [userAppearance]);
    
    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Field change:', name, value); // Add this log
        
        // Remove the plural 's' from field names
        const fieldName = name.endsWith('s') ? name.slice(0, -1) : name;
        
        setUserForm(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCharacterInputChange = (e) => {
        setCharacterForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

   // In AppearanceModal.jsx
const handleUserSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting user appearance form data:', userForm); // Add this log
    const response = await dispatch(updateUserAppearance(userForm));
    console.log('Update response:', response); // Add this log
    if (response.success) {
        closeModal();
    }
};

    const handleCharacterSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting character form:', characterForm);  // Add this
        const action = selectedCharacter
            ? updateCharacterThunk(selectedCharacter.id, characterForm)
            : createCharacter(characterForm);
            
        const response = await dispatch(action);
        console.log('Character submission response:', response);  // Add this
        
        if (response.success) {
            setShowCharacterForm(false);
            setSelectedCharacter(null);
            setCharacterForm({
                name: '',
                relationship: '',
                age_range: '',
                gender: '',
                height_range: '',
                build: '',
                hair_color: '',
                hair_style: '',
                eye_color: '',
                skin_tone: '',
                facial_hair: ''
            });
        }
    };

    const handleEditCharacter = (character) => {
        setSelectedCharacter(character);
        setCharacterForm(character);
        setShowCharacterForm(true);
    };

    const handleDeleteCharacter = async (characterId) => {
        if (window.confirm('Are you sure you want to delete this character?')) {
            await dispatch(deleteCharacter(characterId));
        }
    };

    const renderSelectOptions = (options) => {
        return options.map(option => (
            <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
        ));
    };

    return (
        <div className="appearance-modal">
            <h2>Appearance Settings</h2>
            
            <div className="tabs">
                <button 
                    className={!showCharacterForm ? 'active' : ''} 
                    onClick={() => setShowCharacterForm(false)}
                >
                    Your Appearance
                </button>
                {/* <button 
                    className={showCharacterForm ? 'active' : ''} 
                    onClick={() => setShowCharacterForm(true)}
                >
                    Recurring Characters
                </button> */}
            </div>

            {!showCharacterForm ? (
                <form onSubmit={handleUserSubmit} className="appearance-form">
                   <div className="form-title">
                    <h3>Your Physical Appearance</h3>
                    </div> 
                    {Object.entries(APPEARANCE_OPTIONS).map(([field, options]) => {
    const fieldName = field.endsWith('s') ? field.slice(0, -1) : field;
    return (
        <div key={field} className="form-group">
            <label>
                {fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <select
                name={fieldName}
                value={userForm[fieldName] || ''}
                onChange={handleUserInputChange}
                required={fieldName !== 'facial_hair'}
            >
                <option value="">
                    Select {fieldName.replace('_', ' ')}
                </option>
                {renderSelectOptions(options)}
            </select>
        </div>
    );
})}

                    <div className="form-actions">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={closeModal}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="characters-section">
    {!characterForm.name ? (
        <>
            <div className="characters-list">
                {characters.map(character => (
                    <div key={character.id} className="character-card">
                        <h4>{character.name}</h4>
                        <p>{character.relationship}</p>
                        <div className="character-actions">
                            <button onClick={() => handleEditCharacter(character)}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteCharacter(character.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className="add-character-button"
                onClick={() => {
                    setCharacterForm({
                        name: '',
                        relationship: '',
                        age_range: '',
                        gender: '',
                        height_range: '',
                        build: '',
                        hair_color: '',
                        hair_style: '',
                        eye_color: '',
                        skin_tone: '',
                        facial_hair: ''
                    });
                    setShowCharacterForm(true);  // Add this line
                }}
            >
                Add New Character
            </button>
        </>
    ) : (
                        <form onSubmit={handleCharacterSubmit} className="character-form">
                            <h3>{selectedCharacter ? 'Edit' : 'Add'} Character</h3>
                            
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={characterForm.name}
                                    onChange={handleCharacterInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Relationship</label>
                                <input
                                    type="text"
                                    name="relationship"
                                    value={characterForm.relationship}
                                    onChange={handleCharacterInputChange}
                                    required
                                />
                            </div>
                            
                            {Object.entries(APPEARANCE_OPTIONS).map(([field, options]) => {
    const fieldName = field.endsWith('s') ? field.slice(0, -1) : field;
    return (
        <div key={field} className="form-group">
            <label>
                {fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <select
                name={fieldName}
                value={characterForm[fieldName] || ''}
                onChange={handleCharacterInputChange}
                required={fieldName !== 'facial_hair'}
            >
                <option value="">
                    Select {fieldName.replace('_', ' ')}
                </option>
                {renderSelectOptions(options)}
            </select>
        </div>
    );
})}

                            <div className="form-actions">
                                <button type="submit">
                                    {selectedCharacter ? 'Update' : 'Create'} Character
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setCharacterForm({ name: '' });
                                        setSelectedCharacter(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default AppearanceModal;