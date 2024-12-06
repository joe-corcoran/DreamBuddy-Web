// frontend/src/components/Dreamscapes/DreamscapeViewer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import './DreamscapeViewer.css';

const DreamscapeViewer = ({ dream, onClose }) => {
  const dreamscape = useSelector(state => state.dreamscapes.byDreamId[dream.id]);

  return (
    <div className="dreamscape-viewer-overlay" onClick={onClose}>
      <div className="dreamscape-viewer-content" onClick={e => e.stopPropagation()}>
        <div className="dreamscape-viewer-header">
          <h2>{new Date(dream.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="dreamscape-viewer-body">
          <div className="dreamscape-image-container">
            <img
              src={dreamscape.image_url}
              alt="Dreamscape"
              className="dreamscape-full-image"
            />
          </div>
          
          <div className="dream-details">
            <div className="dream-content">
              <h3>Dream Description</h3>
              <p>{dream.content}</p>
            </div>
            
            {dream.tags && dream.tags.length > 0 && (
              <div className="dream-tags">
                <h3>Dream Tags</h3>
                <div className="tags-container">
                  {dream.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* {dreamscape.optimized_prompt && (
              <div className="dream-prompt">
                <h3>Dreamscape Inspiration</h3>
                <p>{dreamscape.optimized_prompt}</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamscapeViewer;