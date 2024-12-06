import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import ProfileModal from "../ProfileModal/ProfileModal";
import DreamEntitiesModal from "../DreamEntitiesModal/DreamEntitiesModal";
import AppearanceModal from "../AppearanceModal/AppearanceModal";
import dbLogo from "../../assets/images/db_logo.png";
import appStoreButton from "../../assets/images/app_store_button.png";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <nav className="top-navigation">
      <div className="nav-left">
        <NavLink to="/" className="home-link">
          <img src={dbLogo} alt="DreamBuddy Logo" className="nav-logo" />
        </NavLink>
      </div>

      <div className="nav-center">
        <a 
          href="https://testflight.apple.com/join/UZEMZGd5" 
          target="_blank" 
          rel="noopener noreferrer"
          className="app-store-link"
        >
          <img 
            src={appStoreButton} 
            alt="Download on App Store" 
            className="app-store-button"
          />
        </a>
      </div>

      <div className="nav-right">
        {user && (
          <>
            <OpenModalButton
              buttonText={<i className="fas fa-eye"></i>}
              modalComponent={<ProfileModal />}
              className="nav-icon"
            />
            <OpenModalButton
              buttonText={<i className="fas fa-star"></i>}
              modalComponent={<DreamEntitiesModal />}
              className="nav-icon"
            />
            <OpenModalButton
              buttonText={<i className="fas fa-user-edit"></i>}
              modalComponent={<AppearanceModal />}
              className="nav-icon"
            />
          </>
        )}
        <ProfileButton user={user} />
      </div>
    </nav>
  );
}

export default Navigation;