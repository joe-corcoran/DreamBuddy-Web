//frontend/src/components/QuickDreamEntry/QuickDreamEntry.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkQuickDream } from '../../redux/dreams';
import './QuickDreamEntry.css';

const QuickDreamEntry = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const formattedDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const dreamData = {
        title: `Dream on ${formattedDate}`,
        content: content.trim(),
        is_lucid: false,
        tags: []
      };

      const result = await dispatch(thunkQuickDream(dreamData));
      if (result?.errors) {
        setError(result.errors);
      } else {
        setContent('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to save dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quick-dream-entry">
      <h3 className="quick-dream-title">Quick Journal</h3>
      <form onSubmit={handleSubmit} className="quick-dream-form">
        <div className="dream-input-container">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you dream about?"
            className="dream-input"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="save-dream-btn"
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? 'Saving...' : 'Save Dream'}
        </button>
      </form>
      
      {showSuccess && (
        <div className="success-message">Dream saved successfully!</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
};

export default QuickDreamEntry;