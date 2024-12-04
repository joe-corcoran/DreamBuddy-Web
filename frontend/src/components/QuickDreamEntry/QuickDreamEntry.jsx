// frontend/src/components/QuickDreamEntry/QuickDreamEntry.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkQuickDream, thunkCheckTodayDream, thunkUpdateDream } from '../../redux/dreams';
import { updateCharacterStats } from '../../redux/character';
import './QuickDreamEntry.css';

const QuickDreamEntry = () => {
  const dispatch = useDispatch();
  const todayDream = useSelector(state => state.dreams.todayDream);
  const user = useSelector(state => state.session.user);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const getUserLocalDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { 
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
    }));
  };

  const getDefaultTitle = () => {
    return `Dream on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  };

  useEffect(() => {
    if (!user) return;

    const checkTodayDream = async () => {
      setIsLoading(true);
      try {
        const clientDate = getUserLocalDate().toISOString();
        await dispatch(thunkCheckTodayDream(clientDate));
      } catch (err) {
        console.error('Error checking today\'s dream:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkTodayDream();
  }, [dispatch, user]);

  useEffect(() => {
    if (todayDream) {
      setTitle(todayDream.title);
      setContent(todayDream.content);
      setIsLucid(todayDream.is_lucid);
    } else {
      setTitle(getDefaultTitle());
      setContent('');
      setIsLucid(false);
    }
  }, [todayDream]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    if (!title.trim()) {
      setTitle(getDefaultTitle());
    }

    setIsLoading(true);
    setError(null);

    try {
      const localDate = getUserLocalDate();
      const dreamData = {
        title: title.trim(),
        content: content.trim(),
        is_lucid: isLucid,
        clientDate: localDate.toISOString(),
        tags: []
      };

      let result;
      if (todayDream) {
        const dreamDate = new Date(todayDream.date);
        const today = getUserLocalDate();
        const isDreamFromToday = 
          dreamDate.getFullYear() === today.getFullYear() &&
          dreamDate.getMonth() === today.getMonth() &&
          dreamDate.getDate() === today.getDate();

        if (!isDreamFromToday) {
          setError('Can only update dreams from the current day');
          setIsLoading(false);
          return;
        }
        result = await dispatch(thunkUpdateDream(todayDream.id, dreamData));
      } else {
        result = await dispatch(thunkQuickDream(dreamData));
        if (!result.errors) {
          await dispatch(updateCharacterStats());
        }
      }

      if (result.errors) {
        setError(typeof result.errors === 'string' ? result.errors : Object.values(result.errors)[0]);
      } else {
        setShowSuccess(true);
        setSuccessMessage(todayDream ? 'Dream updated successfully!' : 'Dream saved successfully!');
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to save dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="quick-dream-entry">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={getDefaultTitle()}
        className="dream-title-input"
        disabled={isLoading}
      />
      
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