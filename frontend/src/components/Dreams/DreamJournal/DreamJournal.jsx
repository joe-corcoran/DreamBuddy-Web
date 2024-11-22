// frontend/src/components/Dreams/DreamJournal/DreamJournal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadDreams, thunkUpdateDream, thunkDeleteDream } from '../../../redux/dreams';
import { useModal } from '../../../context/Modal';
import './DreamJournal.css';

const DeleteConfirmModal = ({ onConfirm, onClose }) => (
    <div className="delete-confirm-modal">
        <h2>Delete Dream?</h2>
        <p>Are you sure you want to delete this dream? This action cannot be undone.</p>
        <div className="delete-modal-buttons">
            <button onClick={onConfirm} className="confirm-delete-button">
                Delete
            </button>
            <button onClick={onClose} className="cancel-button">
                Cancel
            </button>
        </div>
    </div>
);

const DreamJournal = () => {
    const dispatch = useDispatch();
    const { setModalContent, closeModal } = useModal();
    const dreams = useSelector(state => Object.values(state.dreams.allDreams));
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDream, setSelectedDream] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_lucid: false,
        tags: ''
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadDreams();
    }, [dispatch]);

    const loadDreams = async () => {
        setIsLoading(true);
        const response = await dispatch(thunkLoadDreams());
        if (response.errors) {
            setErrorMessage(response.errors);
        }
        setIsLoading(false);
    };

    const handleDreamSelect = (dream) => {
        setSelectedDream(dream);
        setFormData({
            title: dream.title,
            content: dream.content,
            is_lucid: dream.is_lucid,
            tags: dream.tags?.join(', ') || ''
        });
        setEditMode(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const dreamData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        const response = await dispatch(thunkUpdateDream(selectedDream.id, dreamData));
        
        if (response.errors) {
            setErrorMessage(response.errors);
        } else {
            showSuccessMessage('Dream saved successfully!');
            setEditMode(false);
        }
        setIsLoading(false);
    };

    const handleDelete = async (dreamId) => {
        setModalContent(
            <DeleteConfirmModal
                onConfirm={async () => {
                    setIsLoading(true);
                    const response = await dispatch(thunkDeleteDream(dreamId));
                    if (response.errors) {
                        setErrorMessage(response.errors);
                    } else {
                        if (selectedDream?.id === dreamId) {
                            setSelectedDream(null);
                            setEditMode(false);
                        }
                        showSuccessMessage('Dream deleted successfully!');
                    }
                    closeModal();
                    setIsLoading(false);
                }}
                onClose={closeModal}
            />
        );
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
    };

    return (
        <div className="dream-journal-container">
            <div className="stars-background">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className="star" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`
                    }} />
                ))}
            </div>

            <div className="content-container">
                <h1 className="page-title">Dream Journal</h1>

                {isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <div className="dream-journal-layout">
                        {/* Dreams List */}
                        <div className="dreams-list">
                            {dreams.map(dream => (
                                <div 
                                    key={dream.id} 
                                    className={`dream-item ${selectedDream?.id === dream.id ? 'selected' : ''}`}
                                >
                                    <div className="dream-item-content" onClick={() => handleDreamSelect(dream)}>
                                        <h3>{dream.title}</h3>
                                        <p>{new Date(dream.date).toLocaleDateString()}</p>
                                        {dream.is_lucid && (
                                            <span className="lucid-indicator">Lucid</span>
                                        )}
                                    </div>
                                    <button 
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(dream.id);
                                        }}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Dream Editor */}
                        {editMode && selectedDream && (
                            <form onSubmit={handleSubmit} className="dream-editor">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Dream Title"
                                    className="dream-input"
                                />

                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="What did you dream about?"
                                    className="dream-textarea"
                                />

                                <div className="dream-controls">
                                    <label className="lucid-toggle">
                                        <input
                                            type="checkbox"
                                            name="is_lucid"
                                            checked={formData.is_lucid}
                                            onChange={handleInputChange}
                                        />
                                        Lucid Dream
                                    </label>

                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="Tags (comma-separated)"
                                        className="dream-input"
                                    />
                                </div>

                                <button type="submit" className="save-button">
                                    Save Dream
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {errorMessage && (
                    <div className="error-message">
                        {typeof errorMessage === 'string' ? errorMessage : 'An error occurred'}
                    </div>
                )}

                {showSuccessPopup && (
                    <div className="success-popup">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DreamJournal;