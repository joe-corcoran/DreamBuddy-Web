// frontend/src/components/HomePage/HomePage.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import QuickDreamEntry from "../QuickDreamEntry/QuickDreamEntry";
import "./HomePage.css";

const HomePage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const [isLoading, setIsLoading] = useState(false);
  const { setModalContent } = useModal(); 

  const characterStats = {
    happiness: 50,
    health: 50,
    streakDays: 0,
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
              {/* Character Status Section */}
              <div className="character-status">
                <div className="status-bar">
                  <label>Happiness</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill happiness"
                      style={{ width: `${characterStats.happiness}%` }}
                    />
                  </div>
                </div>
                <div className="status-bar">
                  <label>Health</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill health"
                      style={{ width: `${characterStats.health}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Dream Entry */}
              <QuickDreamEntry />
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
