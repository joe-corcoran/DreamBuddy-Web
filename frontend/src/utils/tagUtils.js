// frontend/src/utils/tagUtils.js

// Predefined colors for tags
export const TAG_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Light Blue
    '#F1C40F', // Gold
    '#E67E22'  // Orange
];

export const assignColorsToTags = (tags) => {
    return tags.reduce((acc, tag, index) => {
        acc[tag] = TAG_COLORS[index % TAG_COLORS.length];
        return acc;
    }, {});
};

export const extractTagsFromContent = (content) => {
    const words = content.toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3);
    
    return [...new Set(words)];
};

export const getPopularTags = (dreams, maxTags = 10) => {
    const wordFrequency = {};
    
    dreams.forEach(dream => {
        const words = extractTagsFromContent(dream.content);
        words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });

    return Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxTags)
        .map(([word]) => word);
};