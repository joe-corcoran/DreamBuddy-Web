import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDreamscape } from '../../../redux/dreamscapes';
import { getDreamInterpretations } from '../../../redux/interpretations';
import { thunkLoadDreams } from '../../../redux/dreams';
import { ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import "./DreamJournal.css";

const DreamJournal = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  
  const dreams = useSelector(state => Object.values(state.dreams.allDreams));
  const dreamscapes = useSelector(state => state.dreamscapes.byDreamId);
  const interpretations = useSelector(state => state.interpretations.byType);
  
  // Sort dreams by date in ascending order for consistent book layout
  const sortedDreams = [...dreams].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  useEffect(() => {
    dispatch(thunkLoadDreams());
  }, [dispatch]);

  useEffect(() => {
    // Pre-fetch dreamscapes and interpretations for visible pages
    const visibleDreams = getCurrentPageDreams();
    visibleDreams.forEach(dream => {
      if (dream) {
        dispatch(getDreamscape(dream.id));
        dispatch(getDreamInterpretations(dream.id));
      }
    });
  }, [currentPage]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePageTurn = async (direction) => {
    if (isFlipping) return;
    
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage < Math.ceil(sortedDreams.length / 2)) {
      setIsFlipping(true);
      setFlipDirection(direction);
      
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  };

  const getCurrentPageDreams = () => {
    const startIndex = currentPage * 2;
    return [sortedDreams[startIndex], sortedDreams[startIndex + 1]];
  };

  const renderDreamContent = (dream, isLeftPage) => {
    if (!dream) return (
      <div className="empty-page">
        <span>This page is waiting for your dreams...</span>
      </div>
    );
    
    return (
      <div className="dream-page-content">
        <h2 className="dream-date">{formatDate(dream.date)}</h2>
        
        <div className="dream-text">
          {dream.is_lucid && (
            <div className="lucid-indicator">
              <Moon className="moon-icon" size={16} />
              <span>Lucid Dream</span>
            </div>
          )}
          <p>{dream.content}</p>
        </div>
        
        {dreamscapes[dream.id]?.image_url && (
          <div className="dreamscape-wrapper">
            <img 
              src={dreamscapes[dream.id].image_url}
              alt="Dreamscape"
              className="dreamscape-image"
            />
          </div>
        )}
        
        {interpretations?.spiritual && (
          <div className="interpretation-text">
            <p>{interpretations.spiritual.interpretation_text}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dream-journal-container">
      <div className="stars-background">
        {[...Array(75)].map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`
            }}
          />
        ))}
      </div>

      <div className="journal-content">
        <div className={`journal-book ${isFlipping ? 'flipping' : ''}`}>
          <div className="book-spine"></div>
          <div className="book-binding"></div>
          
          <div className="page-navigation">
            <button 
              className="nav-button"
              onClick={() => handlePageTurn(-1)}
              disabled={currentPage === 0 || isFlipping}
            >
              <ChevronLeft />
            </button>
            <h1 className="page-title">Dream Journal</h1>
            <button 
              className="nav-button"
              onClick={() => handlePageTurn(1)}
              disabled={currentPage >= Math.ceil(sortedDreams.length / 2) - 1 || isFlipping}
            >
              <ChevronRight />
            </button>
          </div>

          <div className="book-pages">
            <div className={`page left-page ${flipDirection === -1 ? 'flip-left' : ''}`}>
              <div className="page-lines"></div>
              {renderDreamContent(getCurrentPageDreams()[0], true)}
            </div>
            <div className={`page right-page ${flipDirection === 1 ? 'flip-right' : ''}`}>
              <div className="page-lines"></div>
              {renderDreamContent(getCurrentPageDreams()[1], false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamJournal;