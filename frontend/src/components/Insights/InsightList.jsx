// frontend/src/components/Insights/InsightList.jsx
// frontend/src/components/Insights/InsightList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllInterpretations, interpretationTypes } from '../../redux/interpretations';
import InsightCard from './InsightCard';
import './Insights.css';

const InsightList = () => {
    const dispatch = useDispatch();
    const [selectedType, setSelectedType] = useState(null);
  
    // Selectors
    const interpretations = useSelector(state => state.interpretations.allInterpretations);
    const isLoading = useSelector(state => state.interpretations.isLoading);
    const error = useSelector(state => state.interpretations.error);
  
    useEffect(() => {
      console.log('Component mounted, dispatching getAllInterpretations');
      dispatch(getAllInterpretations());
    }, [dispatch]);
  
    // Debug log whenever interpretations change
    useEffect(() => {
      console.log('Current interpretations:', interpretations);
    }, [interpretations]);
  
    const filteredInterpretations = selectedType
      ? interpretations.filter(interp => interp.interpretation_type === selectedType)
      : interpretations;

  const typeColors = {
    [interpretationTypes.SPIRITUAL]: '#9b59b6',
    [interpretationTypes.PRACTICAL]: '#3498db',
    [interpretationTypes.EMOTIONAL]: '#e74c3c',
    [interpretationTypes.ACTIONABLE]: '#2ecc71',
    [interpretationTypes.LUCID]: '#f1c40f'
  };

  if (isLoading) {
    return (
      <div className="insights-container">
        <div className="insights-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dream insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* Rest of your component remains the same */}
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

      <div className="insights-content">
        <div className="insights-header">
          <h1>Dream Insights</h1>
          
          <div className="type-filters">
            <button
              className={`type-filter ${selectedType === null ? 'active' : ''}`}
              onClick={() => setSelectedType(null)}
            >
              All
            </button>
            {Object.entries(interpretationTypes).map(([key, type]) => (
              <button
                key={type}
                className={`type-filter ${selectedType === type ? 'active' : ''}`}
                style={{
                  '--type-color': typeColors[type],
                  borderColor: selectedType === type ? typeColors[type] : 'transparent'
                }}
                onClick={() => setSelectedType(type)}
              >
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="insights-error">
            <p>{error}</p>
            <button onClick={() => dispatch(getAllInterpretations())}>
              Try Again
            </button>
          </div>
        ) : filteredInterpretations.length === 0 ? (
          <div className="no-insights">
            <p>No insights available. Generate your first interpretation in your dream journal!</p>
          </div>
        ) : (
          <div className="insights-grid">
            {filteredInterpretations.map(interpretation => (
              <InsightCard
                key={interpretation.id}
                interpretation={interpretation}
                color={typeColors[interpretation.interpretation_type]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightList;