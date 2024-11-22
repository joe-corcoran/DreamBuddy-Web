// frontend/src/components/Calendar/CalendarHeader.jsx
import React from 'react';
import './CalendarHeader.css';

const CalendarHeader = ({ selectedDate, onChange }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const previousMonth = () => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
        onChange(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        onChange(newDate);
    };

    return (
        <div className="calendar-header">
            <button 
                className="month-nav-button"
                onClick={previousMonth}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            <h2 className="month-year">
                {`${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
            </h2>

            <button 
                className="month-nav-button"
                onClick={nextMonth}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default CalendarHeader;