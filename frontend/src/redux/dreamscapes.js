// frontend/src/redux/dreamscapes.js

// Action Types
const SET_DREAMSCAPES = 'dreamscapes/SET_DREAMSCAPES';
const ADD_DREAMSCAPE = 'dreamscapes/ADD_DREAMSCAPE';
const REMOVE_DREAMSCAPE = 'dreamscapes/REMOVE_DREAMSCAPE';

// Action Creators
const setDreamscapes = (dreamscapes) => ({
    type: SET_DREAMSCAPES,
    payload: dreamscapes
});

const addDreamscape = (dreamscape) => ({
    type: ADD_DREAMSCAPE,
    payload: dreamscape
});

const removeDreamscape = (id) => ({
    type: REMOVE_DREAMSCAPE,
    payload: id
});

// Thunks
export const thunkGenerateDreamscape = (dreamId, prompt) => async (dispatch) => {
    const response = await fetch('/api/dreamscapes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_id: dreamId, prompt })
    });
    
    if (response.ok) {
        const newDreamscape = await response.json();
        dispatch(addDreamscape(newDreamscape));
        return newDreamscape;
    }
};

export const thunkLoadDreamscapes = () => async (dispatch) => {
    const response = await fetch('/api/dreamscapes/');
    if (response.ok) {
        const dreamscapes = await response.json();
        dispatch(setDreamscapes(dreamscapes));
    }
};

// Initial State
const initialState = {
    allDreamscapes: {},
    currentDreamscape: null
};

// Reducer
export default function dreamscapesReducer(state = initialState, action) {
    switch (action.type) {
        case SET_DREAMSCAPES: {
            const allDreamscapes = {};
            action.payload.forEach(dreamscape => {
                allDreamscapes[dreamscape.id] = dreamscape;
            });
            return { ...state, allDreamscapes };
        }
        case ADD_DREAMSCAPE:
            return {
                ...state,
                allDreamscapes: {
                    ...state.allDreamscapes,
                    [action.payload.id]: action.payload
                }
            };
        case REMOVE_DREAMSCAPE: {
            const newState = { ...state };
            delete newState.allDreamscapes[action.payload];
            return newState;
        }
        default:
            return state;
    }
}