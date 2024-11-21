// frontend/src/redux/character.js

// Action Types
const SET_CHARACTER = 'character/SET_CHARACTER';
const UPDATE_STREAK = 'character/UPDATE_STREAK';
const UPDATE_HAPPINESS = 'character/UPDATE_HAPPINESS';
const EVOLVE_CHARACTER = 'character/EVOLVE_CHARACTER';

// Action Creators
const setCharacter = (character) => ({
    type: SET_CHARACTER,
    payload: character
});

const updateStreak = (streakCount) => ({
    type: UPDATE_STREAK,
    payload: streakCount
});

const updateHappiness = (level) => ({
    type: UPDATE_HAPPINESS,
    payload: level
});

const evolveCharacter = (newStage) => ({
    type: EVOLVE_CHARACTER,
    payload: newStage
});

// Thunks
export const thunkGetCharacter = () => async (dispatch) => {
    const response = await fetch('/api/character/');
    if (response.ok) {
        const data = await response.json();
        dispatch(setCharacter(data));
    }
};

export const thunkUpdateStreak = (streakCount) => async (dispatch) => {
    const response = await fetch('/api/character/streak', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak_count: streakCount })
    });
    if (response.ok) {
        const data = await response.json();
        dispatch(updateStreak(data.streak_count));
    }
};

// Initial State
const initialState = {
    currentStage: null,
    streakCount: 0,
    happinessLevel: 50,
    nextEvolutionAt: null
};

// Reducer
export default function characterReducer(state = initialState, action) {
    switch (action.type) {
        case SET_CHARACTER:
            return { ...state, ...action.payload };
        case UPDATE_STREAK:
            return { ...state, streakCount: action.payload };
        case UPDATE_HAPPINESS:
            return { ...state, happinessLevel: action.payload };
        case EVOLVE_CHARACTER:
            return {
                ...state,
                currentStage: action.payload,
                nextEvolutionAt: action.payload.required_streak
            };
        default:
            return state;
    }
}