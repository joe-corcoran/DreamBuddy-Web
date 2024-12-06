// frontend/src/components/Calendar/CalendarHeader.jsx
import React from 'react';
import './CalendarHeader.css';

const CalendarHeader = ({ selectedDate, onChange, view, onViewChange }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getWeekDates = () => {
        const curr = new Date(selectedDate);
        const first = curr.getDate() - curr.getDay();
        const start = new Date(curr.setDate(first));
        const end = new Date(curr.setDate(first + 6));
        return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    };

    const navigate = (direction) => {
        if (view === 'month') {
            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
            onChange(newDate);
        } else {
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() + (direction * 7));
            onChange(newDate);
        }
    };

    return (
        <div className="calendar-header">
            <button 
                className="month-nav-button"
                onClick={() => navigate(-1)}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            <div className="header-center">
                <h2 className="month-year">
                    {view === 'month' 
                        ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                        : `Week of ${getWeekDates()}, ${selectedDate.getFullYear()}`
                    }
                </h2>
                <div className="view-toggle">
                    <button 
                        className={`toggle-btn ${view === 'month' ? 'active' : ''}`}
                        onClick={() => onViewChange('month')}
                    >
                        Month
                    </button>
                    <button 
                        className={`toggle-btn ${view === 'week' ? 'active' : ''}`}
                        onClick={() => onViewChange('week')}
                    >
                        Week
                    </button>
                </div>
            </div>

            <button 
                className="month-nav-button"
                onClick={() => navigate(1)}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default CalendarHeader;