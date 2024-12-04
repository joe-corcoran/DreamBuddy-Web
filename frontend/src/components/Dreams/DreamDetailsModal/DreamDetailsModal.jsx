// frontend/src/components/Dreams/DreamDetailsModal/DreamDetailsModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkGetDreamsByMonth } from "../../../redux/dreams";
import { useModal } from "../../../context/Modal";
import {
  generateInterpretation,
  getDreamInterpretations,
  setTypeInterpretation,
} from "../../../redux/interpretations";
import { generateDreamscape, getDreamscape } from "../../../redux/dreamscapes";
import "./DreamDetailsModal.css";

const InterpretationType = {
  SPIRITUAL: "spiritual",
  PRACTICAL: "practical",
  EMOTIONAL: "emotional",
  ACTIONABLE: "actionable",
  LUCID: "lucid",
};

const getTypeIcon = (type) => {
  const icons = {
    spiritual: 'fa-pray',
    practical: 'fa-tools',
    emotional: 'fa-heart',
    actionable: 'fa-tasks',
    lucid: 'fa-moon'
  };
  return icons[type] || 'fa-star';
};

const formatInterpretationText = (text) => {
  // Split into paragraphs
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Check if paragraph is a list item
    if (paragraph.includes('**') && paragraph.includes(':')) {
      // Format as a list item with title
      const [title, ...content] = paragraph.split(':');
      return (
        <div key={index} className="interpretation-section">
          <h5>{title.replace(/\*\*/g, '')}</h5>
          <p>{content.join(':').trim()}</p>
        </div>
      );
    }
    // Regular paragraph
    return <p key={index} className="interpretation-paragraph">{paragraph}</p>;
  });
};

const DreamDetailsModal = ({ date: initialDate, dreams: initialDreams }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentDreams, setCurrentDreams] = useState(initialDreams);
  const [isDreamDetailsExpanded, setIsDreamDetailsExpanded] = useState(true);
  const [isDreamscapeExpanded, setIsDreamscapeExpanded] = useState(false);
  const [isInterpretationsExpanded, setIsInterpretationsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState(InterpretationType.ACTIONABLE);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFetchAttempted, setInitialFetchAttempted] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const allDreams = useSelector((state) => state.dreams.allDreams);
  const interpretations = useSelector((state) => state.interpretations.byType);
  const interpretationsLoading = useSelector((state) => state.interpretations.isLoading);
  const interpretationsError = useSelector((state) => state.interpretations.error);
  const dreamscapes = useSelector((state) => state.dreamscapes.byDreamId);
  const dreamscapesLoading = useSelector((state) => state.dreamscapes.isLoading);
  const dreamscapesError = useSelector((state) => state.dreamscapes.error);

  const dream = currentDreams[0];

  useEffect(() => {
    const fetchExistingData = async () => {
      if (dream?.id && !initialFetchAttempted) {
        try {
          const [dreamscapeResult, interpretationsResult] = await Promise.all([
            dispatch(getDreamscape(dream.id)),
            dispatch(getDreamInterpretations(dream.id)),
          ]);

          if (dreamscapeResult?.error) {
            console.error("Error fetching dreamscape:", dreamscapeResult.error);
          }
          if (interpretationsResult?.error) {
            console.error("Error fetching interpretations:", interpretationsResult.error);
          }
        } catch (error) {
          console.error("Error in fetchExistingData:", error);
        } finally {
          setInitialFetchAttempted(true);
        }
      }
    };

    fetchExistingData();
  }, [dream, dispatch, initialFetchAttempted]);

  const handleDateChange = async (newDate) => {
    setIsLoading(true);
    try {
      // Fetch dreams for the new month
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      await dispatch(thunkGetDreamsByMonth(year, month));

      // Filter dreams for the specific date
      const dreamsForDate = Object.values(allDreams).filter((dream) => {
        const dreamDate = new Date(dream.date);
        return (
          dreamDate.getDate() === newDate.getDate() &&
          dreamDate.getMonth() === newDate.getMonth() &&
          dreamDate.getFullYear() === newDate.getFullYear()
        );
      });

      setCurrentDate(newDate);
      setCurrentDreams(dreamsForDate);
      setInitialFetchAttempted(false);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInterpretation = async () => {
    if (!dream) return;
    setErrorMessage("");

    const dreamIds = [dream.id];
    const result = await dispatch(generateInterpretation(dreamIds, selectedType));

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      await dispatch(getDreamInterpretations(dream.id));
    }
  };

  const handleGenerateDreamscape = async () => {
    if (!dream) return;
    setErrorMessage("");

    try {
      const result = await dispatch(generateDreamscape(dream.id, dream.content));

      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.status) {
        setGenerationStatus(result.status);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to generate dreamscape. Please try again.");
      console.error("Error in handleGenerateDreamscape:", error);
    }
  };

  const getCurrentInterpretation = () => interpretations[selectedType];

  const typeColors = {
    [InterpretationType.SPIRITUAL]: "#9b59b6",
    [InterpretationType.PRACTICAL]: "#3498db",
    [InterpretationType.EMOTIONAL]: "#e74c3c",
    [InterpretationType.ACTIONABLE]: "#2ecc71",
    [InterpretationType.LUCID]: "#f1c40f",
  };

  return (
    <div className="dream-details-modal" onClick={(e) => {
      if (e.target.className === 'dream-details-modal') {
        closeModal();
      }
    }}>
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
          <button 
            className="nav-button"
            onClick={() => {
              const prevDate = new Date(currentDate);
              prevDate.setDate(prevDate.getDate() - 1);
              handleDateChange(prevDate);
            }}
            disabled={isLoading}
          >
            <i className="fas fa-chevron-left" />
          </button>

          <h2>
            {new Date(currentDate).toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })}
          </h2>

          <button 
            className="nav-button"
            onClick={() => {
              const nextDate = new Date(currentDate);
              nextDate.setDate(nextDate.getDate() + 1);
              handleDateChange(nextDate);
            }}
            disabled={isLoading}
          >
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
            <i
              className={`fas fa-chevron-${
                isDreamDetailsExpanded ? "up" : "down"
              }`}
            />
          </div>
          {isDreamDetailsExpanded && (
            <div className="section-content">
              {currentDreams.map((dream) => (
                <div key={dream.id} className="dream-entry">
                  <h4>{dream.title}</h4>
                  <p>{dream.content}</p>
                  {dream.is_lucid && <span className="lucid-badge">Lucid</span>}
                  {dream.tags?.length > 0 && (
                    <div className="tags">
                      {dream.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
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
            <i
              className={`fas fa-chevron-${
                isDreamscapeExpanded ? "up" : "down"
              }`}
            />
          </div>
          {isDreamscapeExpanded && dream && (
            <div className="section-content">
              {dreamscapesLoading ? (
                <div className="dreamscape-loading">
                  <div className="loading-spinner-container">
                    <div className="loading-spinner"></div>
                  </div>
                  <div className="loading-text">
                    <p className="loading-primary">Creating your dreamscape visualization</p>
                    <p className="loading-secondary">Channeling your dream into visual form...</p>
                    <p className="loading-hint">This mystical process takes 1-2 minutes</p>
                  </div>
                </div>
              ) : dreamscapes[dream.id]?.image_url ? (
                <div className="dreamscape-image-container">
                  <img
                    src={dreamscapes[dream.id].image_url}
                    alt="Dreamscape Visualization"
                    className="dreamscape-image"
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      setErrorMessage("Your dreamscape encountered a mystical barrier. Please try regenerating it.");
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="prompt-text">
                    <small>Inspiration: {dreamscapes[dream.id].optimized_prompt}</small>
                  </div>
                </div>
              ) : (
                <div className="dreamscape-generate">
                  <button
                    className="generate-button"
                    onClick={handleGenerateDreamscape}
                    disabled={dreamscapesLoading}
                  >
                    Generate Dreamscape
                  </button>
                  <p className="generate-hint">Transform your dream into a visual masterpiece</p>
                </div>
              )}
              {/* Error display */}
              {(dreamscapesError || errorMessage) && (
                <div className="dreamscape-error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>
                    {errorMessage ||
                      (typeof dreamscapesError === "string"
                        ? dreamscapesError
                        : "Failed to generate dreamscape")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Interpretations Section */}
<div className="collapsible-section interpretation-wrapper">
  <div
    className="section-header"
    onClick={() => setIsInterpretationsExpanded(!isInterpretationsExpanded)}
  >
    <h3>Interpretations</h3>
    <i className={`fas fa-chevron-${isInterpretationsExpanded ? "up" : "down"}`} />
  </div>
  {isInterpretationsExpanded && (
    <div className="section-content interpretations-section">
      <div className="interpretation-types">
        {Object.values(InterpretationType).map((type) => (
          <button
            key={type}
            className={`type-filter ${selectedType === type ? 'active' : ''}`}
            style={{
              '--type-color': typeColors[type],
              borderColor: selectedType === type ? typeColors[type] : 'transparent'
            }}
            onClick={() => setSelectedType(type)}
          >
            <i className={`fas ${getTypeIcon(type)}`}></i>
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </button>
        ))}
      </div>

      {interpretationsLoading ? (
        <div className="insights-loading">
          <div className="loading-spinner"></div>
          <p>Generating {selectedType} interpretation...</p>
        </div>
      ) : getCurrentInterpretation() ? (
        <div className="interpretation-content" style={{ '--card-color': typeColors[selectedType] }}>
          <div className="interpretation-text">
            <h4>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Interpretation:</h4>
            {formatInterpretationText(getCurrentInterpretation().interpretation_text)}
          </div>
        </div>
      ) : (
        <div className="generate-interpretation">
          <button
            className="generate-button"
            onClick={handleGenerateInterpretation}
            disabled={interpretationsLoading}
          >
            Generate {selectedType} Interpretation
          </button>
          <p className="generate-hint">Discover the {selectedType} significance of your dream</p>
        </div>
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