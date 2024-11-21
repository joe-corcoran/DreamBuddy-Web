// frontend/src/redux/dreams.js

// Action Types
const SET_DREAMS = 'dreams/SET_DREAMS';
const ADD_DREAM = 'dreams/ADD_DREAM';
const UPDATE_DREAM = 'dreams/UPDATE_DREAM';
const REMOVE_DREAM = 'dreams/REMOVE_DREAM';

// Action Creators
const setDreams = (dreams) => ({
    type: SET_DREAMS,
    payload: dreams
});

const addDream = (dream) => ({
    type: ADD_DREAM,
    payload: dream
});

const updateDream = (dream) => ({
    type: UPDATE_DREAM,
    payload: dream
});

const removeDream = (dreamId) => ({
    type: REMOVE_DREAM,
    payload: dreamId
});

// Thunks
export const thunkLoadDreams = () => async (dispatch) => {
    const response = await fetch('/api/dreams/');
    
    if (response.ok) {
        const dreams = await response.json();
        dispatch(setDreams(dreams));
        return dreams;
    } else {
        const errors = await response.json();
        return errors;
    }
};

export const thunkQuickDream = (dreamData) => async (dispatch) => {
    const response = await fetch('/api/dreams/quick', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dreamData)
    });

    if (response.ok) {
        const newDream = await response.json();
        dispatch(addDream(newDream));
        return newDream;
    } else {
        const errors = await response.json();
        return { errors };
    }
};

export const thunkUpdateDream = (dreamId, dreamData) => async (dispatch) => {
    const response = await fetch(`/api/dreams/${dreamId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dreamData)
    });

    if (response.ok) {
        const updatedDream = await response.json();
        dispatch(updateDream(updatedDream));
        return updatedDream;
    } else {
        const errors = await response.json();
        return { errors };
    }
};

export const thunkDeleteDream = (dreamId) => async (dispatch) => {
    const response = await fetch(`/api/dreams/${dreamId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        dispatch(removeDream(dreamId));
        return null;
    } else {
        const errors = await response.json();
        return { errors };
    }
};

// Initial State
const initialState = {
    allDreams: {},
    currentDream: null
};

// Reducer
export default function dreamsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_DREAMS: {
            const allDreams = {};
            action.payload.forEach(dream => {
                allDreams[dream.id] = dream;
            });
            return { ...state, allDreams };
        }
        case ADD_DREAM:
            return {
                ...state,
                allDreams: { ...state.allDreams, [action.payload.id]: action.payload }
            };
        case UPDATE_DREAM:
            return {
                ...state,
                allDreams: { ...state.allDreams, [action.payload.id]: action.payload }
            };
        case REMOVE_DREAM: {
            const newState = { ...state };
            delete newState.allDreams[action.payload];
            return newState;
        }
        default:
            return state;
    }
}