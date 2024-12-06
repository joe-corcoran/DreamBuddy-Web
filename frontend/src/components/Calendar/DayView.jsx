//frontedn/src/components/calendar/dayview.jsx
import React from 'react';
import './DayView.css';

const DayView = ({ 
  date, 
  dreams, 
  tagColors, 
  popularTags, 
  onClick, 
  isToday,
  dreamscapeUrl 
}) => {
  if (!date) {
    return <div className="calendar-cell empty" />;
  }

  const getTagsFromDream = (dream) => {
    return popularTags.filter(tag => 
      dream.content.toLowerCase().includes(tag.toLowerCase())
    );
  };

  const allTags = dreams.flatMap(getTagsFromDream);
  const uniqueTags = [...new Set(allTags)];
  const hasLucidDream = dreams.some(dream => dream.is_lucid);

  const getTagPositions = (numTags) => {
    const positions = [];
    const radius = 15;
    const startAngle = -90;
    const angleStep = 360 / Math.min(numTags, 6);

    for (let i = 0; i < Math.min(numTags, 6); i++) {
      const angle = (startAngle + i * angleStep) * (Math.PI / 180);
      positions.push({
        left: `${50 + radius * Math.cos(angle)}%`,
        top: `${50 + radius * Math.sin(angle)}%`
      });
    }
    return positions;
  };

  const positions = getTagPositions(uniqueTags.length);

  return (
    <div 
      className={`calendar-cell ${dreams.length > 0 ? 'has-dreams' : ''} 
                 ${isToday ? 'today' : ''} 
                 ${hasLucidDream ? 'lucid' : ''}`}
      onClick={onClick}
    >
      {dreamscapeUrl && (
        <div 
          className="dreamscape-background"
          style={{
            backgroundImage: `url(${dreamscapeUrl})`
          }}
        />
      )}
      <div className="cell-content">
        <div className="date-number">{date.getDate()}</div>
        {dreams.length > 0 && (
          <div className="dream-indicators">
            {uniqueTags.slice(0, 6).map((tag, index) => (
              <div
                key={index}
                className="tag-dot"
                style={{
                  backgroundColor: tagColors[tag],
                  left: positions[index].left,
                  top: positions[index].top
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;