// frontend/src/redux/appearances.js
import { getApiUrl } from '../config';
import { csrfFetch } from './csrf';

// Action Types
const SET_USER_APPEARANCE = 'appearances/SET_USER_APPEARANCE';
const SET_RECURRING_CHARACTERS = 'appearances/SET_RECURRING_CHARACTERS';
const ADD_CHARACTER = 'appearances/ADD_CHARACTER';
const UPDATE_CHARACTER = 'appearances/UPDATE_CHARACTER';
const REMOVE_CHARACTER = 'appearances/REMOVE_CHARACTER';
const SET_LOADING = 'appearances/SET_LOADING';
const SET_ERROR = 'appearances/SET_ERROR';

// Action Creators
const setUserAppearance = (appearance) => ({
    type: SET_USER_APPEARANCE,
    payload: appearance
});

const setRecurringCharacters = (characters) => ({
    type: SET_RECURRING_CHARACTERS,
    payload: characters
});

const addCharacter = (character) => ({
    type: ADD_CHARACTER,
    payload: character
});

const updateCharacter = (character) => ({
    type: UPDATE_CHARACTER,
    payload: character
});

const removeCharacter = (characterId) => ({
    type: REMOVE_CHARACTER,
    payload: characterId
});

const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading
});

const setError = (error) => ({
    type: SET_ERROR,
    payload: error
});

// Thunks
export const fetchUserAppearance = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/appearances/user'));
        const appearance = await response.json();
        dispatch(setUserAppearance(appearance));
        return { success: true, appearance };
    } catch (error) {
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateUserAppearance = (appearanceData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/appearances/user'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appearanceData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.log('Error response:', error); // Add this log
            throw new Error(error.errors?.validation || error.errors?.server || 'Failed to update appearance');
        }

        const appearance = await response.json();
        dispatch(setUserAppearance(appearance));
        return { success: true, appearance };
    } catch (error) {
        console.error('Update appearance error:', error); // Add this log
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};
export const fetchRecurringCharacters = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/appearances/characters'));
        const characters = await response.json();
        dispatch(setRecurringCharacters(characters));
        return { success: true, characters };
    } catch (error) {
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const createCharacter = (characterData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/appearances/characters'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(characterData)
        });
        const character = await response.json();
        dispatch(addCharacter(character));
        return { success: true, character };
    } catch (error) {
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateCharacterThunk = (characterId, characterData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl(`/api/appearances/characters/${characterId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(characterData)
        });
        const character = await response.json();
        dispatch(updateCharacter(character));
        return { success: true, character };
    } catch (error) {
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const deleteCharacter = (characterId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await csrfFetch(getApiUrl(`/api/appearances/characters/${characterId}`), {
            method: 'DELETE'
        });
        dispatch(removeCharacter(characterId));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Initial State
const initialState = {
    userAppearance: null,
    characters: [],
    isLoading: false,
    error: null
};

// Reducer
export default function appearancesReducer(state = initialState, action) {
    switch (action.type) {
        case SET_USER_APPEARANCE:
            return {
                ...state,
                userAppearance: action.payload,
                error: null
            };
        case SET_RECURRING_CHARACTERS:
            return {
                ...state,
                characters: action.payload,
                error: null
            };
        case ADD_CHARACTER:
            return {
                ...state,
                characters: [...state.characters, action.payload],
                error: null
            };
        case UPDATE_CHARACTER:
            return {
                ...state,
                characters: state.characters.map(char =>
                    char.id === action.payload.id ? action.payload : char
                ),
                error: null
            };
        case REMOVE_CHARACTER:
            return {
                ...state,
                characters: state.characters.filter(char => char.id !== action.payload),
                error: null
            };
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
}