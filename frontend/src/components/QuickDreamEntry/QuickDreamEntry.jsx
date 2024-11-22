// frontend/src/components/QuickDreamEntry/QuickDreamEntry.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkQuickDream, thunkCheckTodayDream, thunkUpdateDream } from '../../redux/dreams';
import './QuickDreamEntry.css';

const QuickDreamEntry = () => {
  const dispatch = useDispatch();
  const todayDream = useSelector(state => state.dreams.todayDream);
  const user = useSelector(state => state.session.user); 
  const [content, setContent] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!user) {
      setContent('');
      setIsLucid(false);
    }
  }, [user]);

   useEffect(() => {
    const checkTodayDream = async () => {
      if (user) {
        setIsLoading(true);
        await dispatch(thunkCheckTodayDream());
        setIsLoading(false);
      }
    };
    checkTodayDream();
  }, [dispatch, user]);

  useEffect(() => {
    if (todayDream) {
      setContent(todayDream.content);
      setIsLucid(todayDream.is_lucid);
    } else {
      setContent('');
      setIsLucid(false);
    }
  }, [todayDream]);

  const generateTitle = () => {
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Dream on ${formattedDate}`;
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const dreamData = {
        title: generateTitle(),
        content: content.trim(),
        is_lucid: isLucid,
        tags: []
      };

      if (todayDream) {
        // Update existing dream
        const result = await dispatch(thunkUpdateDream(todayDream.id, dreamData));
        if (result.errors) {
          setError(result.errors);
        } else {
          showSuccessNotification('Dream updated successfully!');
        }
      } else {
        // Create new dream
        const result = await dispatch(thunkQuickDream(dreamData));
        if (result.errors) {
          setError(result.errors);
        } else {
          showSuccessNotification('Dream saved successfully!');
        }
      }
    } catch (err) {
      setError('Failed to save dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quick-dream-entry">
      <h3 className="quick-dream-title">
        {todayDream ? 'Today\'s Dream Entry' : 'Quick Journal'}
      </h3>
      
      <form onSubmit={handleSubmit} className="quick-dream-form">
        <div className="dream-input-container">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you dream about?"
            className="dream-textarea"
            disabled={isLoading}
          />
        </div>

        <div className="dream-controls">
          <label className="lucid-toggle">
            <input
              type="checkbox"
              checked={isLucid}
              onChange={(e) => setIsLucid(e.target.checked)}
              disabled={isLoading}
            />
            <span className="toggle-label">Lucid Dream</span>
          </label>

          <button 
            type="submit" 
            className="save-dream-btn"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? 'Saving...' : (todayDream ? 'Update Dream' : 'Save Dream')}
          </button>
        </div>
      </form>
      
      {showSuccess && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : 'An error occurred'}
        </div>
      )}
    </div>
  );
};

export default QuickDreamEntry;
