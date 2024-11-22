import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../../context/Modal';
import { generateInterpretation, setTypeInterpretation } from '../../../redux/interpretations';
import './DreamDetailsModal.css';

const InterpretationType = {
  SPIRITUAL: 'spiritual',
  PRACTICAL: 'practical',
  EMOTIONAL: 'emotional',
  ACTIONABLE: 'actionable',
  LUCID: 'lucid'
};

const DreamDetailsModal = ({ date, dreams }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [isDreamDetailsExpanded, setIsDreamDetailsExpanded] = useState(true);
  const [isDreamscapeExpanded, setIsDreamscapeExpanded] = useState(false);
  const [isInterpretationsExpanded, setIsInterpretationsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState(InterpretationType.ACTIONABLE);
  
  const interpretations = useSelector(state => state.interpretations.byType);
  const isLoading = useSelector(state => state.interpretations.isLoading);

  const handleGenerateInterpretation = async () => {
    if (dreams.length === 0) return;

    const dreamIds = dreams.map(dream => dream.id);
    const result = await dispatch(generateInterpretation(dreamIds, selectedType));
    
    if (result?.interpretation) {
      dispatch(setTypeInterpretation(selectedType, result.interpretation));
    }
  };

  const getCurrentInterpretation = () => interpretations[selectedType];

  const typeColors = {
    [InterpretationType.SPIRITUAL]: '#9b59b6',
    [InterpretationType.PRACTICAL]: '#3498db',
    [InterpretationType.EMOTIONAL]: '#e74c3c',
    [InterpretationType.ACTIONABLE]: '#2ecc71',
    [InterpretationType.LUCID]: '#f1c40f'
  };

  return (
    <div className="dream-details-modal">
      <div className="stars-background">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }} />
        ))}
      </div>

      <div className="modal-content">
        {/* Date Navigation */}
        <div className="date-navigation">
          <h2>{date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>
        </div>

        {/* Dream Details Section */}
        <div className="collapsible-section">
          <div className="section-header" onClick={() => setIsDreamDetailsExpanded(!isDreamDetailsExpanded)}>
            <h3>Dream Details</h3>
            <i className={`fas fa-chevron-${isDreamDetailsExpanded ? 'up' : 'down'}`} />
          </div>
          {isDreamDetailsExpanded && (
            <div className="section-content">
              {dreams.map(dream => (
                <div key={dream.id} className="dream-entry">
                  <h4>{dream.title}</h4>
                  <p>{dream.content}</p>
                  {dream.is_lucid && <span className="lucid-badge">Lucid</span>}
                  {dream.tags?.length > 0 && (
                    <div className="tags">
                      {dream.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interpretations Section */}
        <div className="collapsible-section">
          <div className="section-header" onClick={() => setIsInterpretationsExpanded(!isInterpretationsExpanded)}>
            <h3>Interpretations</h3>
            <i className={`fas fa-chevron-${isInterpretationsExpanded ? 'up' : 'down'}`} />
          </div>
          {isInterpretationsExpanded && (
            <div className="section-content interpretations-section">
              <div className="interpretation-types">
                {Object.values(InterpretationType).map(type => (
                  <button
                    key={type}
                    className={`type-button ${selectedType === type ? 'selected' : ''}`}
                    style={{ 
                      '--type-color': typeColors[type],
                      opacity: selectedType === type ? 1 : 0.6 
                    }}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="loading">Generating {selectedType} interpretation...</div>
              ) : getCurrentInterpretation() ? (
                <div className="interpretation-content">
                  <p>{getCurrentInterpretation().interpretation_text}</p>
                </div>
              ) : (
                <button 
                  className="generate-button"
                  onClick={handleGenerateInterpretation}
                >
                  Generate {selectedType} Interpretation
                </button>
              )}
            </div>
          )}
        </div>

        <button className="close-button" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default DreamDetailsModal;