import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal';
import './DreamDetailsModal.css';

const DreamDetailsModal = ({ date, dreams }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [isDreamDetailsExpanded, setIsDreamDetailsExpanded] = useState(true);
  const [isDreamscapeExpanded, setIsDreamscapeExpanded] = useState(false);
  const [isInterpretationsExpanded, setIsInterpretationsExpanded] = useState(false);

  const handlePreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    // Update dreams for new date - implement this after checking your preferences
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    // Update dreams for new date - implement this after checking your preferences
  };

  return (
    <div className="dream-details-modal">
      <div className="stars-background">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="modal-content">
        {/* Date Navigation */}
        <div className="date-navigation">
          <button onClick={handlePreviousDay}>
            <i className="fas fa-chevron-left" />
          </button>
          <h2>{date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>
          <button onClick={handleNextDay}>
            <i className="fas fa-chevron-right" />
          </button>
        </div>

        {/* Dream Details Section */}
        <div className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => setIsDreamDetailsExpanded(!isDreamDetailsExpanded)}
          >
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

        {/* Dreamscape Section */}
        <div className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => setIsDreamscapeExpanded(!isDreamscapeExpanded)}
          >
            <h3>Dreamscape</h3>
            <i className={`fas fa-chevron-${isDreamscapeExpanded ? 'up' : 'down'}`} />
          </div>
          {isDreamscapeExpanded && (
            <div className="section-content dreamscape-section">
              <button className="generate-button">
                Generate Dreamscape
              </button>
            </div>
          )}
        </div>

        {/* Interpretations Section */}
        <div className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => setIsInterpretationsExpanded(!isInterpretationsExpanded)}
          >
            <h3>Interpretations</h3>
            <i className={`fas fa-chevron-${isInterpretationsExpanded ? 'up' : 'down'}`} />
          </div>
          {isInterpretationsExpanded && (
            <div className="section-content interpretations-section">
              <button className="generate-button">
                Generate Interpretation
              </button>
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