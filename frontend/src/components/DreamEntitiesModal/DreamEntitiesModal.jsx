// frontend/src/components/DreamEntitiesModal/DreamEntitiesModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import { 
    fetchDreamEntities, 
    createDreamEntity, 
    updateDreamEntityThunk, 
    deleteDreamEntity 
} from '../../redux/dreamEntities';
import './DreamEntitiesModal.css';

const ENTITY_TYPES = ['person', 'place', 'object', 'symbol'];

function DreamEntitiesModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const entities = useSelector(state => state.dreamEntities?.entities || []);    const [showForm, setShowForm] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        entity_type: '',
        description: '',
        personal_significance: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchDreamEntities());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            entity_type: '',
            description: '',
            personal_significance: ''
        });
        setSelectedEntity(null);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = selectedEntity 
            ? updateDreamEntityThunk(selectedEntity.id, formData)
            : createDreamEntity(formData);

        const response = await dispatch(action);
        if (response.error) {
            setErrors({ submit: response.error });
        } else {
            setShowForm(false);
            resetForm();
        }
    };

    const handleEdit = (entity) => {
        setSelectedEntity(entity);
        setFormData({
            name: entity.name,
            entity_type: entity.entity_type,
            description: entity.description || '',
            personal_significance: entity.personal_significance || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (entityId) => {
        if (window.confirm('Are you sure you want to delete this entity?')) {
            const response = await dispatch(deleteDreamEntity(entityId));
            if (response.error) {
                setErrors({ delete: response.error });
            }
        }
    };

    return (
        <div className="dream-entities-modal">
              <div className="elements-title">
            <h2>Dream Elements Library</h2>
            </div>
            {!showForm ? (
                <div className="entities-list">
                    {entities.map(entity => (
                        <div key={entity.id} className="entity-card">
                            <div className="entity-header">
                                <h3>{entity.name}</h3>
                                <span className="entity-type">{entity.entity_type}</span>
                            </div>
                            <p className="entity-description">{entity.description}</p>
                            <div className="entity-stats">
                                <span>Appeared {entity.frequency} times</span>
                                {entity.last_appeared && (
                                    <span>Last: {new Date(entity.last_appeared).toLocaleDateString()}</span>
                                )}
                            </div>
                            <div className="entity-actions">
                                <button onClick={() => handleEdit(entity)}>Edit</button>
                                <button onClick={() => handleDelete(entity.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    <button 
                        className="add-entity-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        Add New Element
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="entity-form">
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Type:</label>
                        <select
                            name="entity_type"
                            value={formData.entity_type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a type</option>
                            {ENTITY_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe this recurring element..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Personal Significance:</label>
                        <textarea
                            name="personal_significance"
                            value={formData.personal_significance}
                            onChange={handleInputChange}
                            placeholder="What does this element mean to you?"
                        />
                    </div>

                    {errors.submit && <p className="error">{errors.submit}</p>}

                    <div className="form-actions">
                        <button type="submit">
                            {selectedEntity ? 'Update' : 'Create'} Element
                        </button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            resetForm();
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default DreamEntitiesModal;