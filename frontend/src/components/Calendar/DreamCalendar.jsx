// frontend/src/components/Calendar/DreamCalendar.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  thunkLoadDreams,
  thunkGetDreamsByMonth,
  thunkGetPopularTags,
} from '../../redux/dreams';
import { useModal } from '../../context/Modal'; 
import DreamDetailsModal from '../Dreams/DreamDetailsModal/DreamDetailsModal';
import CalendarHeader from './CalendarHeader';
import DayView from './DayView';
import TagLegend from './TagLegend';
import './DreamCalendar.css';

const DreamCalendar = () => {
  const { setModalContent } = useModal();
  const dispatch = useDispatch();
  const dreams = useSelector((state) =>
    Object.values(state.dreams.allDreams)
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  // const [showDreamPopover, setShowDreamPopover] = useState(false);
  const [selectedDreams, setSelectedDreams] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [tagColors, setTagColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCalendarData = async () => {
      setIsLoading(true);
      try {
        // Load all dreams
        await dispatch(thunkLoadDreams());

        // Load month-specific dreams
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        await dispatch(thunkGetDreamsByMonth(year, month));

        // Load popular tags
        const tagsData = await dispatch(thunkGetPopularTags());
        const tags = tagsData.map(tagObj => tagObj.tag); // Extract tag names
        setPopularTags(tags);
        assignColorsToTags(tags);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarData();
  }, [dispatch, selectedDate]);

  const assignColorsToTags = (tags) => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEEAD',
      '#D4A5A5',
      '#9B59B6',
      '#3498DB',
      '#F1C40F',
      '#E67E22',
    ];

    const newTagColors = tags.reduce((acc, tag, index) => {
      acc[tag] = colors[index % colors.length];
      return acc;
    }, {});

    setTagColors(newTagColors);
  };

  const daysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];

    // Add empty slots for days before the first of the month
    const firstDay = date.getDay();
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days in the month
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const getDreamsForDate = (date) => {
    if (!date) return [];
    return dreams.filter((dream) => {
      const dreamDate = new Date(dream.date);
      return (
        dreamDate.getDate() === date.getDate() &&
        dreamDate.getMonth() === date.getMonth() &&
        dreamDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dreamsForDate = getDreamsForDate(date);
    setSelectedDate(date);
    setSelectedDreams(dreamsForDate);
    
    setModalContent(
      <DreamDetailsModal 
        key={`dream-modal-${date.toISOString()}`} 
        date={date}
        dreams={dreamsForDate}
        allDreams={dreams} // Pass all dreams for navigation
      />
    );
  };
  

  return (
    <div className="dream-calendar-container">
      <div className="stars-background">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="calendar-content">
        <div className="calendar-container">
          <CalendarHeader
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />

          {isLoading ? (
            <div className="loading-spinner">Loading dreams...</div>
          ) : (
            <>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="calendar-header-cell">
                    {day}
                  </div>
                ))}
                {daysInMonth().map((date, index) => (
                  <DayView
                    key={index}
                    date={date}
                    dreams={getDreamsForDate(date)}
                    tagColors={tagColors}
                    popularTags={popularTags}
                    onClick={() => handleDateClick(date)}
                    isToday={
                      date &&
                      new Date().toDateString() === date.toDateString()
                    }
                  />
                ))}
              </div>

              <TagLegend tags={popularTags} tagColors={tagColors} />
            </>
          )}

          {/* {showDreamPopover && (
            <DreamPopover
              date={selectedDate}
              dreams={selectedDreams}
              onClose={() => setShowDreamPopover(false)}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default DreamCalendar;
