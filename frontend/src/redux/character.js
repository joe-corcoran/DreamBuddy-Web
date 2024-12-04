import { csrfFetch } from './csrf';

// Action Types
const SET_CHARACTER = 'character/SET_CHARACTER';
const UPDATE_CHARACTER = 'character/UPDATE_CHARACTER';
const RESET_CHARACTER = 'character/RESET_CHARACTER';

// Action Creators
const setCharacter = (character) => ({
    type: SET_CHARACTER,
    payload: character
});

const updateCharacter = (character) => ({
    type: UPDATE_CHARACTER,
    payload: character
});

export const resetCharacter = () => ({
    type: RESET_CHARACTER
});

// Thunks
export const getCharacter = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/character/');
        if (response.ok) {
            const data = await response.json();
            dispatch(setCharacter(data));
            return data;
        }
    } catch (error) {
        console.error('Error fetching character:', error);
        return null;
    }
};

export const updateCharacterStats = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/character/update', {
            method: 'PUT'
        });
        if (response.ok) {
            const data = await response.json();
            dispatch(updateCharacter(data));
            return data;
        }
    } catch (error) {
        console.error('Error updating character:', error);
        return null;
    }
};

// Character stage definitions
export const CHARACTER_STAGES = {
    drifty: {
        name: "Drifty",
        traits: [
            "Begins to catch glimpses of dreams, recalling fragments.",
            "Curious and starting to sense the connection between dreams and reality.",
            "Occasionally aware in dreams but still floats through them aimlessly."
        ],
        minHappiness: 0
    },
    wisp: {
        name: "Wisp",
        traits: [
            "Begins to catch glimpses of dreams, recalling fragments.",
            "Curious and starting to sense the connection between dreams and reality.",
            "Occasionally aware in dreams but still floats through them aimlessly."
        ],
        minHappiness: 15
    },
    shimmer: {
        name: "Shimmer",
        traits: [
            "Dreams become more vivid and memorable, though hazy at times.",
            "Actively questions reality and performs reality checks.",
            "Brief moments of awareness in dreams, with growing curiosity and wonder."
        ],
        minHappiness: 30
    },
    phantom: {
        name: "Phantom",
        traits: [
            "Dreams regularly and with increasing clarity, can control small aspects.",
            "Wakes up with a clearer sense of what happened in dreams.",
            "Lucidity starts to take hold, though still slips in and out of control."
        ],
        minHappiness: 45
    },
    lumos: {
        name: "Lumos",
        traits: [
            "Dream recall is sharp, and dreams feel like second nature.",
            "Can navigate dreams with purpose, shifting between dreamscapes.",
            "Reality checks are routine, and lucid dreaming happens frequently."
        ],
        minHappiness: 60
    },
    aether: {
        name: "Aether",
        traits: [
            "Absolute mastery over lucid dreaming, fully conscious and in control.",
            "Dreams become a playground for creativity, personal growth, and exploration.",
            "Seamlessly integrates dreams and waking life, using dreams as a tool for real-world change."
        ],
        minHappiness: 75
    }
};

// Initial state
const initialState = {
    stage_name: 'drifty',
    happiness: 50,
    health: 50,
    streak_days: 0,
    last_dream_date: null,
    isLoading: false,
    error: null
};

// Reducer
export default function characterReducer(state = initialState, action) {
    switch (action.type) {
        case SET_CHARACTER:
        case UPDATE_CHARACTER:
            return {
                ...state,
                ...action.payload,
                isLoading: false,
                error: null
            };
        case RESET_CHARACTER:
            return initialState;
        default:
            return state;
    }
}