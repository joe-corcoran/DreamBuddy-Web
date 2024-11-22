// frontend/src/components/Navigation/BottomNavigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNavigation.css';

const BottomNavigation = () => {
    const navItems = [
        { path: '/journal', label: 'Journal dream', icon: 'fa-book-open' },
        { path: '/calendar', label: 'Dream Calendar', icon: 'fa-calendar' },
        { path: '/dreamscapes', label: 'Dreamscapes', icon: 'fa-image' },
        { path: '/interpret', label: 'Interpret', icon: 'fa-brain' }
    ];

    return (
        <nav className="bottom-navigation">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                        `bottom-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <div className="bottom-nav-content">
                        <i className={`fas ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </div>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNavigation;