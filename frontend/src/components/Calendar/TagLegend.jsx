// frontend/src/components/Calendar/TagLegend.jsx
import React, { useState } from 'react';
import './TagLegend.css';

const TagLegend = ({ tags, tagColors }) => {
    const [showAllTags, setShowAllTags] = useState(false);

    const displayTags = showAllTags ? tags : tags.slice(0, 4);

    return (
        <div className="tag-legend">
            <div className="tag-list">
                {displayTags.map(tag => (
                    <div key={tag} className="tag-item">
                        <div 
                            className="tag-color-dot"
                            style={{ backgroundColor: tagColors[tag] }}
                        />
                        <span className="tag-name">{tag}</span>
                    </div>
                ))}
            </div>

            {tags.length > 4 && (
                <button 
                    className="show-more-tags"
                    onClick={() => setShowAllTags(!showAllTags)}
                >
                    {showAllTags ? 'Show Less' : 'Show All Tags'}
                </button>
            )}
        </div>
    );
};

export default TagLegend;