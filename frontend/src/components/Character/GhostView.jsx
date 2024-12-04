//frontend/src/components/Character/GhostView.jsx
// GhostView.jsx
import React, { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { CHARACTER_STAGES } from '../../redux/character';
import './GhostView.css';
import aether from '../../assets/animations/aether.json';
import drifty from '../../assets/animations/drifty.json';
import lumos from '../../assets/animations/lumos.json';
import phantom from '../../assets/animations/phantom.json';
import shimmer from '../../assets/animations/shimmer.json';
import wisp from '../../assets/animations/wisp.json';

const GhostView = ({ 
  stageName = 'drifty',
  streakDays = 0,
  happiness = 50,
  onCharacterClick,
  isInteractive = true
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const animations = {
    aether,
    drifty,
    lumos,
    phantom,
    shimmer,
    wisp
  };

  const getAccessories = () => {
    if (streakDays >= 14) return <div className="ghost-accessories ghost-crown">👑</div>;
    if (streakDays >= 3) return <div className="ghost-accessories ghost-star">⭐</div>;
    return null;
  };

  return (
    <div 
      className={`ghost-container ${isInteractive ? 'interactive' : ''}`}
      onClick={isInteractive ? onCharacterClick : undefined}
    >
      {isLoading && (
        <div className="ghost-loading">
          <div className="ghost-spinner"></div>
        </div>
      )}
      
      <Player
        src={animations[stageName]}
        className="ghost-animation"
        loop
        autoplay
        onEvent={event => {
          if (event === 'load') setIsLoading(false);
        }}
      />
      
      {getAccessories()}
      
      {CHARACTER_STAGES[stageName] && (
        <div className="ghost-name">
          {CHARACTER_STAGES[stageName].name}
        </div>
      )}
    </div>
  );
};

export default GhostView;