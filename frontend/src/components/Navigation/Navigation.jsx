// frontend/src/components/Navigation/Navigation.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import ProfileModal from "../ProfileModal/ProfileModal";
import DreamEntitiesModal from "../DreamEntitiesModal/DreamEntitiesModal";
import AppearanceModal from "../AppearanceModal/AppearanceModal";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <nav className="top-navigation">
      <div className="nav-left">
        <NavLink to="/" className="home-link">
          <h1 className="app-title">DreamBuddy</h1>
        </NavLink>
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