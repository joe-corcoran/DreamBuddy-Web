//frontend/src/components/Character/CharacterDetails.jsx
import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { CHARACTER_STAGES } from '../../redux/character';
import StatusBars from './StatusBars';
import './CharacterDetails.css';
import aether from '../../assets/animations/aether.json';
import drifty from '../../assets/animations/drifty.json';
import lumos from '../../assets/animations/lumos.json';
import phantom from '../../assets/animations/phantom.json';
import shimmer from '../../assets/animations/shimmer.json';
import wisp from '../../assets/animations/wisp.json';

const CharacterDetails = ({
  stageName,
  happiness,
  health,
  streakDays,
  onClose
}) => {
  const currentStage = CHARACTER_STAGES[stageName];
  const animations = {
    aether,
    drifty,
    lumos,
    phantom,
    shimmer,
    wisp
  };
  
  const getNextStage = () => {
    const stages = Object.entries(CHARACTER_STAGES);
    const currentIndex = stages.findIndex(([key]) => key === stageName);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1][1] : null;
  };

  const nextStage = getNextStage();

  return (
    <div className="character-modal-overlay">
      <div className="character-modal">
        <button onClick={onClose} className="character-modal-close">×</button>

        <div className="character-header">
          <h2 className="character-name">{currentStage.name}</h2>
          <p className="character-streak">Day {streakDays} Streak</p>
        </div>

        <div className="character-animation">
          <Player
            src={animations[stageName]}
            loop
            autoplay
          />
        </div>

        <StatusBars happiness={happiness} health={health} />

        <div className="character-traits">
          <h3 className="character-traits-title">Traits:</h3>
          <ul className="character-traits-list">
            {currentStage.traits.map((trait, index) => (
              <li key={index} className="character-trait-item">
                <span className="character-trait-bullet">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </div>

        {nextStage && (
          <div className="character-evolution">
            <h3 className="character-evolution-title">Next Evolution:</h3>
            <p className="character-evolution-text">
              {nextStage.name} unlocks at {nextStage.minHappiness}% happiness
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterDetails;