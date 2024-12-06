//frontend/src/components/Character/CharacterDetails.jsx
import React, { useState } from 'react';
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
  stageName: initialStageName,
  happiness: initialHappiness,
  health: initialHealth,
  streakDays: initialStreakDays,
  onClose
}) => {
  // Local state for demo controls
  const [localStreak, setLocalStreak] = useState(initialStreakDays);
  
  // Animation mappings
  const animations = {
    aether,
    drifty,
    lumos,
    phantom,
    shimmer,
    wisp
  };

  // Calculate stats and stage based on local streak
  const calculateStats = (streakDays) => {
    const streakPercentage = (streakDays / 14) * 100;
    const statsValue = Math.min(100, streakPercentage);
    
    // Determine stage based on stats value
    let newStage = 'drifty';
    if (statsValue >= CHARACTER_STAGES.aether.minHappiness) newStage = 'aether';
    else if (statsValue >= CHARACTER_STAGES.lumos.minHappiness) newStage = 'lumos';
    else if (statsValue >= CHARACTER_STAGES.phantom.minHappiness) newStage = 'phantom';
    else if (statsValue >= CHARACTER_STAGES.shimmer.minHappiness) newStage = 'shimmer';
    else if (statsValue >= CHARACTER_STAGES.wisp.minHappiness) newStage = 'wisp';

    return {
      happiness: statsValue,
      health: statsValue,
      stage: newStage
    };
  };

  // Get current stats based on local streak
  const currentStats = calculateStats(localStreak);

  // Get next stage information
  const getNextStage = () => {
    const stages = Object.entries(CHARACTER_STAGES);
    const currentIndex = stages.findIndex(([key]) => key === currentStats.stage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1][1] : null;
  };

  // Handle streak controls
  const handleIncreaseStreak = () => {
    if (localStreak < 14) {
      setLocalStreak(prev => prev + 1);
    }
  };

  const handleDecreaseStreak = () => {
    if (localStreak > 0) {
      setLocalStreak(prev => prev - 1);
    }
  };

  const currentStage = CHARACTER_STAGES[currentStats.stage];
  const nextStage = getNextStage();

  return (
    <div className="character-modal-overlay">
      <div className="character-modal">
        <button onClick={onClose} className="character-modal-close">×</button>

        <div className="character-header">
          <h2 className="character-name">{currentStage.name}</h2>
          <p className="character-streak">Day {localStreak} Streak</p>
          <div className="streak-controls">
            <button 
              onClick={handleDecreaseStreak}
              className="streak-button"
              disabled={localStreak === 0}
            >
              -
            </button>
            <button 
              onClick={handleIncreaseStreak}
              className="streak-button"
              disabled={localStreak === 14}
            >
              +
            </button>
          </div>
        </div>

        <div className="character-animation">
          <Player
            src={animations[currentStats.stage]}
            loop
            autoplay
            key={currentStats.stage}
          />
        </div>

        <StatusBars 
          happiness={currentStats.happiness} 
          health={currentStats.health} 
        />

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