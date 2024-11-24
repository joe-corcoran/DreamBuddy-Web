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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: userTimeZone,
      timeZoneName: 'short'
    });
  };

  useEffect(() => {
    setContent('');
    setIsLucid(false);
    
    if (user) {
      const checkTodayDream = async () => {
        setIsLoading(true);
        try {
          const clientDate = new Date().toISOString();
          const response = await dispatch(thunkCheckTodayDream(clientDate));
          
          if (!response || response.errors) {
            setContent('');
            setIsLucid(false);
          }
        } catch (err) {
          console.error('Error checking today\'s dream:', err);
        } finally {
          setIsLoading(false);
        }
      };
      checkTodayDream();
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user && todayDream) {
      setContent(todayDream.content);
      setIsLucid(todayDream.is_lucid);
    } else {
      setContent('');
      setIsLucid(false);
    }
  }, [todayDream, user]);

  const generateTitle = () => {
    return formatDateTime(currentDateTime);
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const clientDate = new Date().toISOString();
      const dreamData = {
        title: `Dream on ${generateTitle()}`,
        content: content.trim(),
        is_lucid: isLucid,
        clientDate,
        tags: []
      };

      let result;
      if (todayDream) {
        const dreamDate = new Date(todayDream.date);
        const today = new Date();
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
      }

      if (result.errors) {
        setError(
          typeof result.errors === 'string' 
            ? result.errors 
            : Object.values(result.errors)[0]
        );
      } else {
        showSuccessNotification(
          todayDream 
            ? 'Dream updated successfully!' 
            : 'Dream saved successfully!'
        );
        if (!todayDream) {
          setContent('');
          setIsLucid(false);
        }
      }
    } catch (err) {
      console.error('Error saving dream:', err);
      setError('Failed to save dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="quick-dream-entry">
      <h3 className="quick-dream-title">
        {todayDream 
          ? `Dream on ${formatDateTime(new Date(todayDream.date))}` 
          : `Dream on ${formatDateTime(currentDateTime)}`}
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