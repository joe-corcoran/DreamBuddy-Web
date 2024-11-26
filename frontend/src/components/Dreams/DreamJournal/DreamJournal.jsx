// // frontend/src/components/Dreams/DreamJournal/DreamJournal.jsx
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { thunkLoadDreams, thunkUpdateDream, thunkDeleteDream } from '../../../redux/dreams';
// import { useModal } from '../../../context/Modal';
// import './DreamJournal.css';

// const DeleteConfirmModal = ({ onConfirm, onClose }) => (
//     <div className="delete-confirm-modal">
//         <h2>Delete Dream?</h2>
//         <p>Are you sure you want to delete this dream? This action cannot be undone.</p>
//         <div className="delete-modal-buttons">
//             <button onClick={onConfirm} className="confirm-delete-button">
//                 Delete
//             </button>
//             <button onClick={onClose} className="cancel-button">
//                 Cancel
//             </button>
//         </div>
//     </div>
// );

// const DreamJournal = () => {
//     const dispatch = useDispatch();
//     const { setModalContent, closeModal } = useModal();
//     const dreams = useSelector(state => Object.values(state.dreams.allDreams));
//     const [isLoading, setIsLoading] = useState(true);
//     const [selectedDream, setSelectedDream] = useState(null);
//     const [editMode, setEditMode] = useState(false);
//     const [formData, setFormData] = useState({
//         title: '',
//         content: '',
//         is_lucid: false,
//         tags: ''
//     });
//     const [errorMessage, setErrorMessage] = useState(null);
//     const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');

//     useEffect(() => {
//         loadDreams();
//     }, [dispatch]);

//     const loadDreams = async () => {
//         setIsLoading(true);
//         const response = await dispatch(thunkLoadDreams());
//         if (response.errors) {
//             setErrorMessage(response.errors);
//         }
//         setIsLoading(false);
//     };

//     const handleDreamSelect = (dream) => {
//         setSelectedDream(dream);
//         setFormData({
//             title: dream.title,
//             content: dream.content,
//             is_lucid: dream.is_lucid,
//             tags: dream.tags?.join(', ') || ''
//         });
//         setEditMode(true);
//     };

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
        
//         const dreamData = {
//             ...formData,
//             tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
//         };

//         const response = await dispatch(thunkUpdateDream(selectedDream.id, dreamData));
        
//         if (response.errors) {
//             setErrorMessage(response.errors);
//         } else {
//             showSuccessMessage('Dream saved successfully!');
//             setEditMode(false);
//         }
//         setIsLoading(false);
//     };

//     const handleDelete = async (dreamId) => {
//         setModalContent(
//             <DeleteConfirmModal
//                 onConfirm={async () => {
//                     setIsLoading(true);
//                     const response = await dispatch(thunkDeleteDream(dreamId));
//                     if (response.errors) {
//                         setErrorMessage(response.errors);
//                     } else {
//                         if (selectedDream?.id === dreamId) {
//                             setSelectedDream(null);
//                             setEditMode(false);
//                         }
//                         showSuccessMessage('Dream deleted successfully!');
//                     }
//                     closeModal();
//                     setIsLoading(false);
//                 }}
//                 onClose={closeModal}
//             />
//         );
//     };

//     const showSuccessMessage = (message) => {
//         setSuccessMessage(message);
//         setShowSuccessPopup(true);
//         setTimeout(() => setShowSuccessPopup(false), 3000);
//     };

//     return (
//         <div className="dream-journal-container">
//             <div className="stars-background">
//                 {[...Array(50)].map((_, i) => (
//                     <div key={i} className="star" style={{
//                         left: `${Math.random() * 100}%`,
//                         top: `${Math.random() * 100}%`,
//                         animationDelay: `${Math.random() * 2}s`
//                     }} />
//                 ))}
//             </div>

//             <div className="content-container">
//                 <h1 className="page-title">Dream Journal</h1>

//                 {isLoading ? (
//                     <div className="loading-spinner">Loading...</div>
//                 ) : (
//                     <div className="dream-journal-layout">
//                         {/* Dreams List */}
//                         <div className="dreams-list">
//                             {dreams.map(dream => (
//                                 <div 
//                                     key={dream.id} 
//                                     className={`dream-item ${selectedDream?.id === dream.id ? 'selected' : ''}`}
//                                 >
//                                     <div className="dream-item-content" onClick={() => handleDreamSelect(dream)}>
//                                         <h3>{dream.title}</h3>
//                                         <p>{new Date(dream.date).toLocaleDateString()}</p>
//                                         {dream.is_lucid && (
//                                             <span className="lucid-indicator">Lucid</span>
//                                         )}
//                                     </div>
//                                     <button 
//                                         className="delete-button"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleDelete(dream.id);
//                                         }}
//                                     >
//                                         <i className="fas fa-trash"></i>
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Dream Editor */}
//                         {editMode && selectedDream && (
//                             <form onSubmit={handleSubmit} className="dream-editor">
//                                 <input
//                                     type="text"
//                                     name="title"
//                                     value={formData.title}
//                                     onChange={handleInputChange}
//                                     placeholder="Dream Title"
//                                     className="dream-input"
//                                 />

//                                 <textarea
//                                     name="content"
//                                     value={formData.content}
//                                     onChange={handleInputChange}
//                                     placeholder="What did you dream about?"
//                                     className="dream-textarea"
//                                 />

//                                 <div className="dream-controls">
//                                     <label className="lucid-toggle">
//                                         <input
//                                             type="checkbox"
//                                             name="is_lucid"
//                                             checked={formData.is_lucid}
//                                             onChange={handleInputChange}
//                                         />
//                                         Lucid Dream
//                                     </label>

//                                     <input
//                                         type="text"
//                                         name="tags"
//                                         value={formData.tags}
//                                         onChange={handleInputChange}
//                                         placeholder="Tags (comma-separated)"
//                                         className="dream-input"
//                                     />
//                                 </div>

//                                 <button type="submit" className="save-button">
//                                     Save Dream
//                                 </button>
//                             </form>
//                         )}
//                     </div>
//                 )}

//                 {errorMessage && (
//                     <div className="error-message">
//                         {typeof errorMessage === 'string' ? errorMessage : 'An error occurred'}
//                     </div>
//                 )}

//                 {showSuccessPopup && (
//                     <div className="success-popup">
//                         {successMessage}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DreamJournal;
import "./DreamJournal.css"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { 
  Moon, Save, Edit2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  thunkLoadDreams, 
  thunkUpdateDream, 
  thunkQuickDream,
  thunkCheckTodayDream 
} from '../../../redux/dreams';

const DreamJournal = () => {
  const dispatch = useDispatch();
  const dreams = useSelector(state => Object.values(state.dreams.allDreams));
  const todayDream = useSelector(state => state.dreams.todayDream);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_lucid: false,
    tags: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadContent();
  }, [dispatch]);

  useEffect(() => {
    // Populate form with today's dream if it exists
    if (todayDream) {
      setFormData({
        title: todayDream.title,
        content: todayDream.content,
        is_lucid: todayDream.is_lucid,
        tags: todayDream.tags?.join(', ') || ''
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [todayDream]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      await dispatch(thunkLoadDreams());
      const clientDate = new Date().toISOString();
      await dispatch(thunkCheckTodayDream(clientDate));
    } catch (error) {
      setErrorMessage('Failed to load dreams');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_lucid: false,
      tags: ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const dreamData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      clientDate: new Date().toISOString()
    };

    try {
      if (isEditing && todayDream) {
        await dispatch(thunkUpdateDream(todayDream.id, dreamData));
        showSuccessMessage('Dream updated successfully!');
      } else {
        await dispatch(thunkQuickDream(dreamData));
        showSuccessMessage('Dream saved successfully!');
      }
      await loadContent();
    } catch (error) {
      setErrorMessage(isEditing ? 'Failed to update dream' : 'Failed to save dream');
    }
    
    setIsLoading(false);
  };

  const turnPage = (direction) => {
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage < Math.ceil(dreams.length / 2)) {
      const journalBook = document.querySelector('.journal-book');
      journalBook.classList.add('turning');
      setCurrentPage(newPage);
      setTimeout(() => {
        journalBook.classList.remove('turning');
      }, 500);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <div className="dream-journal-container">
      <div className="stars-background">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
      </div>

      <div className="journal-content">
        <div className="journal-book">
          <div className="book-spine"></div>
          <div className="book-binding"></div>
          
          <div className="book-pages">
            {/* Navigation */}
            <div className="page-navigation">
              <button 
                className="nav-button"
                onClick={() => turnPage(-1)}
                disabled={currentPage === 0 || isLoading}
              >
                <ChevronLeft />
              </button>
              
              <h1 className="page-title">Dream Journal</h1>
              <button 
                className="nav-button"
                onClick={() => turnPage(1)}
                disabled={currentPage >= Math.ceil(dreams.length / 2) - 1 || isLoading}
              >
                <ChevronRight />
              </button>
            </div>

            {/* Left Page - Current Day Dream Entry */}
            <div className="book-page left-page">
              <div className="page-lines"></div>
              <form onSubmit={handleSubmit} className="dream-entry-form">
                <div className="page-header">
                  <h2 className="current-date">
                    {moment().format('MMMM Do YYYY, h:mm a')}
                  </h2>
                </div>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="What did you dream about?"
                  className="dream-textarea"
                />

                <div className="dream-controls">
                  <label className="lucid-toggle">
                    <input
                      type="checkbox"
                      name="is_lucid"
                      checked={formData.is_lucid}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-icon">
                      <Moon />
                    </span>
                    <span>Lucid Dream</span>
                  </label>

                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Tags (comma-separated)"
                    className="dream-input"
                  />

                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={isLoading || !formData.content.trim()}
                  >
                    <Save size={16} />
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Dream' : 'Save Dream')}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Page - Dream Display & Dreamscape */}
            <div className="book-page right-page">
              {todayDream ? (
                <div className="dream-display">
                  <div className="dream-content">
                    <h3>{todayDream.title}</h3>
                    <p>{todayDream.content}</p>
                    
                    {todayDream.is_lucid && (
                      <div className="lucid-indicator">
                        <Moon size={16} />
                        <span>Lucid Dream</span>
                      </div>
                    )}

                    {todayDream.tags?.length > 0 && (
                      <div className="dream-tags">
                        {todayDream.tags.map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {todayDream.dreamscape && (
                    <div className="dreamscape-container">
                      <img 
  src={todayDream.dreamscape.imageUrl} 
  alt="Dreamscape"
  className="dreamscape-image"
  onError={(e) => console.error("Image failed to load:", e)}
/>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-page">
                  <p>No dream recorded yet for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DreamJournal;