// HomePage.jsx
// HomePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import QuickDreamEntry from "../QuickDreamEntry/QuickDreamEntry";
import GhostView from "../Character/GhostView";
import CharacterDetails from "../Character/CharacterDetails";
import StatusBars from "../Character/StatusBars";
import { getCharacter, CHARACTER_STAGES } from "../../redux/character";
import "./HomePage.css";

const HomePage = () => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const character = useSelector((state) => state.character);
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterDetails, setShowCharacterDetails] = useState(false);
  const { setModalContent } = useModal();

  useEffect(() => {
    if (sessionUser) {
      setIsLoading(true);
      dispatch(getCharacter()).finally(() => {
        setIsLoading(false);
      });
    }
  }, [dispatch, sessionUser]);

  const renderAuthContent = () => (
    <div className="auth-prompt">
      <h2>Welcome to DreamBuddy</h2>
      <p>Please log in or sign up to start journaling your dreams</p>
      <div className="auth-buttons">
        <button onClick={() => setModalContent(<LoginFormModal />)}>
          Log In
        </button>
        <button onClick={() => setModalContent(<SignupFormModal />)}>
          Sign Up
        </button>
      </div>
    </div>
  );

  const renderAuthenticatedContent = () => (
    <div className="authenticated-content">
      <div className="ghost-status-wrapper">
        <div className="ghost-view-wrapper">
          <h2 className="character-name">
            {character.stage_name ? 
              CHARACTER_STAGES[character.stage_name].name : 
              "Drifty"}
          </h2>
          <GhostView
            stageName={character.stage_name}
            streakDays={character.streak_days}
            happiness={character.happiness}
            onCharacterClick={() => setShowCharacterDetails(true)}
          />
        </div>
        <StatusBars 
          happiness={character.happiness} // Use actual happiness
          health={character.health} // Use actual health
        />
      </div>
      <div className="dream-entry-section">
        <div className="dream-entry-header">
          <h2>Record Today's Dream</h2>
          <p>Share your nightly adventures and unlock dream insights</p>
        </div>
        <QuickDreamEntry />
      </div>
      {showCharacterDetails && (
        <CharacterDetails
          stageName={character.stage_name}
          happiness={character.happiness}
          health={character.health}
          streakDays={character.streak_days}
          onClose={() => setShowCharacterDetails(false)}
        />
      )}
    </div>
  );

  return (
    <div className="home-container">
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

      <div className="content-container">
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : sessionUser ? (
          renderAuthenticatedContent()
        ) : (
          renderAuthContent()
        )}
      </div>
    </div>
  );
};

export default HomePage;