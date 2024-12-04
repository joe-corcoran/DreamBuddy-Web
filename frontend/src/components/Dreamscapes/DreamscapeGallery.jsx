// frontend/src/components/Dreamscapes/DreamscapeGallery.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadDreams } from '../../redux/dreams';
import { getAllDreamscapes } from '../../redux/dreamscapes';
import DreamscapeViewer from './DreamscapeViewer';
import './DreamscapeGallery.css';

const DreamscapeGallery = () => {
  const dispatch = useDispatch();
  const [selectedDream, setSelectedDream] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dreams = useSelector(state => state.dreams.allDreams);
  const dreamscapes = useSelector(state => state.dreamscapes.byDreamId);
  const dreamscapesLoading = useSelector(state => state.dreamscapes.isLoading);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load both dreams and dreamscapes in parallel
        const [dreamsResult, dreamscapesResult] = await Promise.all([
          dispatch(thunkLoadDreams()),
          dispatch(getAllDreamscapes())
        ]);

        if (dreamsResult?.errors) {
          throw new Error('Failed to load dreams');
        }
        if (dreamscapesResult?.error) {
          throw new Error(dreamscapesResult.error);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading dreamscapes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleDreamscapeClick = (dream) => {
    setSelectedDream(dream);
    setIsViewerOpen(true);
  };

  const sortedDreams = Object.values(dreams)
    .filter(dream => dreamscapes[dream.id]?.image_url)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isLoading || dreamscapesLoading) {
    return (
      <div className="dreamscape-gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dreamscapes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dreamscape-gallery-error">
        <p>Error loading dreamscapes: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dreamscape-gallery">
      {sortedDreams.length === 0 ? (
        <div className="no-dreamscapes">
          <p>No dreamscapes yet. Generate your first dreamscape in your dream journal!</p>
        </div>
      ) : (
        <div className="dreamscape-grid">
          {sortedDreams.map((dream) => (
            <div
              key={dream.id}
              className="dreamscape-card"
              onClick={() => handleDreamscapeClick(dream)}
            >
              <div className="dreamscape-image-wrapper">
                <img
                  src={dreamscapes[dream.id]?.image_url}
                  alt="Dreamscape"
                  className="dreamscape-thumbnail"
                />
                <div className="dreamscape-date">
                  {new Date(dream.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isViewerOpen && selectedDream && (
        <DreamscapeViewer
          dream={selectedDream}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default DreamscapeGallery;