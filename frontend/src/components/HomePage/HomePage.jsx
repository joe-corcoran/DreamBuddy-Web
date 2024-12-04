// frontend/src/components/HomePage/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import QuickDreamEntry from "../QuickDreamEntry/QuickDreamEntry";
import GhostView from "../Character/GhostView";
import CharacterDetails from "../Character/CharacterDetails";
import { getCharacter } from "../../redux/character";
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
      dispatch(getCharacter());
    }
  }, [dispatch, sessionUser]);

  const handleCharacterClick = () => {
    setShowCharacterDetails(true);
  };

  return (
    <div className="home-container">
      {/* Animated stars background */}
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
        <div className="main-content">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : sessionUser ? (
            <>
              {/* Ghost Character */}
              <GhostView
                stageName={character.stage_name}
                streakDays={character.streak_days}
                happiness={character.happiness}
                onCharacterClick={handleCharacterClick}
              />

              {/* Quick Dream Entry */}
              <QuickDreamEntry />

              {/* Character Details Modal */}
              {showCharacterDetails && (
                <CharacterDetails
                  stageName={character.stage_name}
                  happiness={character.happiness}
                  health={character.health}
                  streakDays={character.streak_days}
                  onClose={() => setShowCharacterDetails(false)}
                />
              )}
            </>
          ) : (
            <div className="auth-prompt">
              <h2>Welcome to DreamBuddy</h2>
              <p>Please log in or sign up to start journaling your dreams</p>
              <div className="auth-buttons">
                <button
                  className="auth-button"
                  onClick={() => setModalContent(<LoginFormModal />)}
                >
                  Log In
                </button>
                <button
                  className="auth-button"
                  onClick={() => setModalContent(<SignupFormModal />)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;