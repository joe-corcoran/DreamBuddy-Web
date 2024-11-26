// frontend/src/components/Dreams/DreamDetailsModal/DreamDetailsModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

const DreamDetailsModal = ({ date, dreams }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [isDreamDetailsExpanded, setIsDreamDetailsExpanded] = useState(true);
  const [isDreamscapeExpanded, setIsDreamscapeExpanded] = useState(false);
  const [isInterpretationsExpanded, setIsInterpretationsExpanded] =
    useState(false);
  const [selectedType, setSelectedType] = useState(
    InterpretationType.ACTIONABLE
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFetchAttempted, setInitialFetchAttempted] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);


  const interpretations = useSelector((state) => state.interpretations.byType);
  const interpretationsLoading = useSelector(
    (state) => state.interpretations.isLoading
  );
  const interpretationsError = useSelector(
    (state) => state.interpretations.error
  );

  const dreamscapes = useSelector((state) => state.dreamscapes.byDreamId);
  const dreamscapesLoading = useSelector(
    (state) => state.dreamscapes.isLoading
  );
  const dreamscapesError = useSelector((state) => state.dreamscapes.error);

  const dream = dreams[0];

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
            console.error(
              "Error fetching interpretations:",
              interpretationsResult.error
            );
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

  const handleGenerateInterpretation = async () => {
    if (!dream) return;
    setErrorMessage("");

    const dreamIds = [dream.id];
    const result = await dispatch(
      generateInterpretation(dreamIds, selectedType)
    );

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
      setErrorMessage(
        error.message || "Failed to generate dreamscape. Please try again."
      );
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
          <h2>
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
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
              {dreams.map((dream) => (
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
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>
          {dreamscapes[dream.id]?.status === 'uploading' 
            ? 'Uploading dreamscape to storage...' 
            : 'Generating dreamscape...'}
        </p>
      </div>
    ) : dreamscapes[dream.id] ? (
      <div className="dreamscape-image-container">
        <img
          src={dreamscapes[dream.id].imageUrl}
          alt="Dreamscape"
          className="dreamscape-image"
          onError={(e) => {
            console.error("Image failed to load:", e);
            e.target.style.display = "none";
            setErrorMessage("Failed to load dreamscape image");
          }}
        />
        <div className="prompt-text">
          <small>Prompt: {dreamscapes[dream.id].prompt}</small>
        </div>
      </div>
    ) : (
      <button
        className="generate-button"
        onClick={handleGenerateDreamscape}
        disabled={dreamscapesLoading}
      >
        Generate Dreamscape
      </button>
    )}
    {(dreamscapesError || errorMessage) && (
      <div className="error">
        {errorMessage ||
          (typeof dreamscapesError === "string"
            ? dreamscapesError
            : "Failed to generate dreamscape")}
      </div>
    )}
  </div>
)}
        </div>

        {/* Interpretations Section */}
        <div className="collapsible-section">
          <div
            className="section-header"
            onClick={() =>
              setIsInterpretationsExpanded(!isInterpretationsExpanded)
            }
          >
            <h3>Interpretations</h3>
            <i
              className={`fas fa-chevron-${
                isInterpretationsExpanded ? "up" : "down"
              }`}
            />
          </div>
          {isInterpretationsExpanded && (
            <div className="section-content interpretations-section">
              <div className="interpretation-types">
                {Object.values(InterpretationType).map((type) => (
                  <button
                    key={type}
                    className={`type-button ${
                      selectedType === type ? "selected" : ""
                    }`}
                    style={{
                      "--type-color": typeColors[type],
                      opacity: selectedType === type ? 1 : 0.6,
                    }}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {interpretationsLoading ? (
                <div className="loading">
                  Generating {selectedType} interpretation...
                </div>
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
              {(interpretationsError || errorMessage) && (
                <div className="error">
                  {errorMessage ||
                    (typeof interpretationsError === "string"
                      ? interpretationsError
                      : "Failed to generate interpretation")}
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
