// frontend/src/components/Insights/InsightCard.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveInterpretationNotes, removeInterpretation } from '../../redux/interpretations';

const InsightCard = ({ interpretation, color, onDeleteSuccess = async () => await dispatch(getAllInterpretations()) }) => {
  const dispatch = useDispatch();
  const [notes, setNotes] = useState(interpretation.user_notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const getTypeIcon = (type) => {
    const icons = {
      spiritual: 'fa-pray',
      practical: 'fa-tools',
      emotional: 'fa-heart',
      actionable: 'fa-tasks',
      lucid: 'fa-moon'
    };
    return icons[type] || 'fa-star';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to format interpretation text with Markdown-style formatting
  const formatInterpretationText = (text) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a list item
      if (paragraph.includes('**') && paragraph.includes(':')) {
        // Format as a list item with title
        const [title, ...content] = paragraph.split(':');
        return (
          <div key={index} className="interpretation-section">
            <h5>{title.replace(/\*\*/g, '')}</h5>
            <p>{content.join(':').trim()}</p>
          </div>
        );
      }
      // Regular paragraph
      return <p key={index} className="interpretation-paragraph">{paragraph}</p>;
    });
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
        const result = await dispatch(saveInterpretationNotes(interpretation.id, notes));
        if (result.success) {
            setIsEditing(false);
            onSaveSuccess?.(); // Call the success handler if provided
        } else {
            console.error('Failed to save notes:', result.error);
        }
    } catch (error) {
        console.error('Error in handleSaveNotes:', error);
    } finally {
        setIsSaving(false);
    }
};


const handleDelete = async () => {
  if (window.confirm('Are you sure you want to delete this interpretation?')) {
    try {
      const result = await dispatch(removeInterpretation(interpretation.id));
      if (result.success) {
        onDeleteSuccess?.(); // Call the success handler passed from parent
      } else {
        console.error('Failed to delete interpretation:', result.error);
      }
    } catch (error) {
      console.error('Error deleting interpretation:', error);
    }
  }
};



  return (
    <div className="insight-card" style={{ 
      '--card-color': color,
      borderColor: color 
    }}>
      <div className="insight-header" style={{ backgroundColor: color }}>
        <div className="insight-type">
          <i className={`fas ${getTypeIcon(interpretation.interpretation_type)}`}></i>
          <span>{interpretation.interpretation_type.charAt(0).toUpperCase() + 
                interpretation.interpretation_type.slice(1)}</span>
        </div>
        <div className="insight-date">
          {formatDate(interpretation.date)}
        </div>
      </div>
      
      <div className="insight-content">
        <div className="dream-contents">
          {interpretation.dreams?.map(dream => (
            <div key={dream.id} className="dream-content">
              <h4>Dream Description</h4>
              <p className="dream-text">{dream.content}</p>
              {dream.tags && dream.tags.length > 0 && (
                <div className="dream-tags">
                  {dream.tags.map(tag => (
                    <span key={tag} className="dream-tag" style={{ backgroundColor: color }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="interpretation-text">
          <h4>Interpretation:</h4>
          {formatInterpretationText(interpretation.interpretation_text)}
        </div>
        <div className="insight-footer">
        <div className="user-notes-section">
          <div className="notes-header">
            <h4>Your Notes</h4>
            <div className="notes-actions">
              {isEditing ? (
                <>
                  <button 
                    className="save-button"
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setNotes(interpretation.user_notes || '');
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  {notes ? 'Edit Notes' : 'Add Notes'}
                </button>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              className="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal notes about this interpretation..."
            />
          ) : notes ? (
            <p className="notes-content">{notes}</p>
          ) : (
            <p className="notes-placeholder">No notes added yet</p>
          )}
        </div>
        
        <button 
          className="delete-button"
          onClick={handleDelete}
        >
          Delete Interpretation
        </button>
      </div>
    </div>
      </div>
  );
};

export default InsightCard;