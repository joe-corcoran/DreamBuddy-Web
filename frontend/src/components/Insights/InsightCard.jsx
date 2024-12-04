// frontend/src/components/Insights/InsightCard.jsx
import React from 'react';

const InsightCard = ({ interpretation, color }) => {
  const getTypeIcon = (type) => {
    const icons = {
      spiritual: 'fa-pray',
      practical: 'fa-tools',
      emotional: 'fa-heart',
      actionable: 'fa-tasks',
      lucid: 'fa-moon'
    };
    return icons[type] || 'fa-star';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to format interpretation text with Markdown-style formatting
  const formatInterpretationText = (text) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a list item
      if (paragraph.includes('**') && paragraph.includes(':')) {
        // Format as a list item with title
        const [title, ...content] = paragraph.split(':');
        return (
          <div key={index} className="interpretation-section">
            <h5>{title.replace(/\*\*/g, '')}</h5>
            <p>{content.join(':').trim()}</p>
          </div>
        );
      }
      // Regular paragraph
      return <p key={index} className="interpretation-paragraph">{paragraph}</p>;
    });
  };

  return (
    <div className="insight-card" style={{ 
      '--card-color': color,
      borderColor: color 
    }}>
      <div className="insight-header" style={{ backgroundColor: color }}>
        <div className="insight-type">
          <i className={`fas ${getTypeIcon(interpretation.interpretation_type)}`}></i>
          <span>{interpretation.interpretation_type.charAt(0).toUpperCase() + 
                interpretation.interpretation_type.slice(1)}</span>
        </div>
        <div className="insight-date">
          {formatDate(interpretation.date)}
        </div>
      </div>
      
      <div className="insight-content">
        <div className="dream-contents">
          {interpretation.dreams?.map(dream => (
            <div key={dream.id} className="dream-content">
              <h4>Dream Description</h4>
              <p className="dream-text">{dream.content}</p>
              {dream.tags && dream.tags.length > 0 && (
                <div className="dream-tags">
                  {dream.tags.map(tag => (
                    <span key={tag} className="dream-tag" style={{ backgroundColor: color }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="interpretation-text">
          <h4>Interpretation:</h4>
          {formatInterpretationText(interpretation.interpretation_text)}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;