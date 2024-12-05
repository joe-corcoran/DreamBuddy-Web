// frontend/src/components/Dreams/DreamDetailsModal/DreamForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { thunkUpdateDream, thunkQuickDream, thunkDeleteDream, thunkGetDreamsByMonth } from '../../../redux/dreams';

const DreamForm = ({ dream, defaultTitle, currentDate, onClose, onSave }) => {  // Add currentDate to props
    const dispatch = useDispatch();
    const [title, setTitle] = useState(dream?.title || defaultTitle || '');
    const [content, setContent] = useState(dream?.content || '');
    const [isLucid, setIsLucid] = useState(dream?.is_lucid || false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dream) {
      setTitle(dream.title);
      setContent(dream.content);
      setIsLucid(dream.is_lucid);
    } else if (defaultTitle) {
      setTitle(defaultTitle);
    }
  }, [dream, defaultTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Check if the selected date is in the future
      const today = new Date();
      if (currentDate > today) {
        setError('Cannot create dreams for future dates');
        setIsSubmitting(false);
        return;
      }

      const dreamData = {
        title: title.trim(),
        content: content.trim(),
        is_lucid: isLucid,
        clientDate: currentDate.toISOString(),
        allowMultiple: false
      };

      let result;
      if (dream) {
        result = await dispatch(thunkUpdateDream(dream.id, dreamData));
        if (result.dream) {
          setSuccessMessage('Dream updated successfully!');
          const dreamDate = new Date(dream.date);
          await dispatch(thunkGetDreamsByMonth(dreamDate.getFullYear(), dreamDate.getMonth() + 1));
          await onSave?.(result.dream);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else if (result.errors) {
          setError(typeof result.errors === 'string' ? result.errors : Object.values(result.errors)[0]);
        }
      } else {
        result = await dispatch(thunkQuickDream(dreamData));
        if (result.dream) {
          setSuccessMessage('Dream added successfully!');
          await dispatch(thunkGetDreamsByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1));
          await onSave?.(result.dream);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else if (result.errors) {
          setError(typeof result.errors === 'string' ? result.errors : Object.values(result.errors)[0]);
        }
      }
    } catch (err) {
      console.error('Error submitting dream:', err);
      setError('Failed to save dream');
    } finally {
      setIsSubmitting(false);
      if (!error && successMessage) {
        onClose();
      }
    }
  };

  const handleDelete = async () => {
    if (!dream || !window.confirm('Are you sure you want to delete this dream?')) return;
    
    setIsSubmitting(true);
    try {
        const result = await dispatch(thunkDeleteDream(dream.id));
        if (result.errors) {
          let errorMessage = result.errors;
          if (typeof result.errors === 'object') {
            errorMessage = Object.values(result.errors)[0]?.toString() || 'Failed to delete dream';
          }
          setError(errorMessage);
        } else {
          setSuccessMessage('Dream deleted successfully');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await onSave?.();
          onClose();
        }
    } catch (err) {
      setError('Failed to delete dream');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dream-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Dream Title"
        className="dream-title-input"
        disabled={isSubmitting}
        required
      />
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe your dream..."
        className="dream-content-input"
        disabled={isSubmitting}
        required
      />

       <div className="form-controls">
        <label className="lucid-toggle">
          <input
            type="checkbox"
            checked={isLucid}
            onChange={(e) => setIsLucid(e.target.checked)}
            disabled={isSubmitting}
          />
          <span>Lucid Dream</span>
        </label>

        <div className="button-group">
          {dream && (
            <button
              type="button"
              onClick={handleDelete}
              className="delete-button"
              disabled={isSubmitting}
            >
              Delete Dream
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={isSubmitting || !content.trim() || !title.trim()}
          >
            {isSubmitting ? 'Saving...' : (dream ? 'Update Dream' : 'Add Dream')}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default DreamForm;