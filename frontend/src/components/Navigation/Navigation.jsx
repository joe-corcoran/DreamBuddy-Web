// frontend/src/components/Navigation/Navigation.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux"; 
import ProfileButton from "./ProfileButton";
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
        <button className="nav-icon">
          <i className="fas fa-eye"></i>
        </button>
        <ProfileButton user={user} /> {/* Pass user as a prop */}
      </div>
    </nav>
  );
}

export default Navigation;
