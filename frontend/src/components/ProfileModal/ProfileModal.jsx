// frontend/src/components/ProfileModal/ProfileModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { fetchProfile, updateProfile } from "../../redux/profile";
import "./ProfileModal.css";

function ProfileModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const profile = useSelector((state) => state.profile.data);
  
  const [formData, setFormData] = useState({
    birth_year: "",
    cultural_background: "",
    occupation: "",
    dream_goals: "",
    preferred_interpretation_type: "",
    significant_life_events: "",
    recurring_themes: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        birth_year: profile.birth_year || "",
        cultural_background: profile.cultural_background || "",
        occupation: profile.occupation || "",
        dream_goals: profile.dream_goals || "",
        preferred_interpretation_type: profile.preferred_interpretation_type || "",
        significant_life_events: profile.significant_life_events || "",
        recurring_themes: profile.recurring_themes || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await dispatch(updateProfile(formData));
    if (response.error) {
      setErrors({ server: response.error });
    } else {
      closeModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="profile-modal">
      <h2>Dream Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Birth Year:</label>
          <input
            type="number"
            name="birth_year"
            value={formData.birth_year}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Cultural Background:</label>
          <input
            type="text"
            name="cultural_background"
            value={formData.cultural_background}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Occupation:</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Dream Goals:</label>
          <select
            name="dream_goals"
            value={formData.dream_goals}
            onChange={handleInputChange}
          >
            <option value="">Select a goal</option>
            <option value="spiritual">Spiritual Growth</option>
            <option value="problem-solving">Problem Solving</option>
            <option value="lucid">Lucid Dreaming</option>
            <option value="emotional">Emotional Healing</option>
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Interpretation Type:</label>
          <select
            name="preferred_interpretation_type"
            value={formData.preferred_interpretation_type}
            onChange={handleInputChange}
          >
            <option value="">Select type</option>
            <option value="spiritual">Spiritual</option>
            <option value="practical">Practical</option>
            <option value="emotional">Emotional</option>
            <option value="actionable">Actionable</option>
            <option value="lucid">Lucid</option>
          </select>
        </div>

        <div className="form-group">
          <label>Significant Life Events:</label>
          <textarea
            name="significant_life_events"
            value={formData.significant_life_events}
            onChange={handleInputChange}
            placeholder="Enter any significant life events that might influence your dreams..."
          />
        </div>

        <div className="form-group">
          <label>Recurring Themes:</label>
          <textarea
            name="recurring_themes"
            value={formData.recurring_themes}
            onChange={handleInputChange}
            placeholder="Enter any themes that frequently appear in your dreams..."
          />
        </div>

        {errors.server && <p className="error">{errors.server}</p>}
        
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Save Profile
          </button>
          <button type="button" onClick={closeModal} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileModal;