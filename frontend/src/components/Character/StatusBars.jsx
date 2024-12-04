//frontend/src/components/Character/StatusBars.jsx
import React from 'react';
import './StatusBars.css';

const StatusBars = ({ happiness, health }) => {
  return (
    <div className="status-bars-container">
      {/* Happiness Bar */}
      <div className="status-bar">
        <div className="status-bar-header">
          <span className="status-bar-label">Happiness</span>
          <span className="status-bar-label">{Math.round(happiness)}%</span>
        </div>
        <div className="status-bar-track">
          <div 
            className="status-bar-progress happiness"
            style={{ width: `${happiness}%` }}
          />
        </div>
      </div>

      {/* Health Bar */}
      <div className="status-bar">
        <div className="status-bar-header">
          <span className="status-bar-label">Health</span>
          <span className="status-bar-label">{Math.round(health)}%</span>
        </div>
        <div className="status-bar-track">
          <div 
            className="status-bar-progress health"
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusBars;