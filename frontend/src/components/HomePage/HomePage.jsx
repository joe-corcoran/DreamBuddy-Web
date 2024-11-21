// frontend/src/components/HomePage/HomePage.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import QuickDreamEntry from "../QuickDreamEntry/QuickDreamEntry";
import { useDispatch } from "react-redux";
import { thunkLogout } from "../../redux/session";
import "./HomePage.css";

const HomePage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const [isLoading, setIsLoading] = useState(false);
  const { setModalContent } = useModal();
  const dispatch = useDispatch();

  // Character stats (we'll implement these later)
  const characterStats = {
    happiness: 50,
    health: 50,
    streakDays: 0,
  };

  const openLoginModal = () => {
    setModalContent(<LoginFormModal />);
  };

  const openSignupModal = () => {
    setModalContent(<SignupFormModal />);
  };

  const handleProfileClick = () => {
    if (sessionUser) {
      if (confirm("Are you sure you want to log out?")) {
        dispatch(thunkLogout());
      }
    } else {
      openLoginModal();
    }
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
        {/* Header Section */}
        <div className="header-section">
          <div
            className="profile-icon"
            onClick={handleProfileClick}
            title={
              sessionUser ? `Logged in as ${sessionUser.username}` : "Log In"
            }
          >
            <i
              className={`fas fa-user-circle ${sessionUser ? "logged-in" : ""}`}
            ></i>
          </div>
          <h1 className="app-title">DreamBuddy</h1>
          <div className="reality-check-icon">
            <i className="fas fa-eye"></i>
          </div>
        </div>

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
                <button onClick={openLoginModal} className="auth-button">
                  Log In
                </button>
                <button onClick={openSignupModal} className="auth-button">
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
