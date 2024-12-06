// frontend/src/redux/profile.js
import { getApiUrl } from '../config';
import { csrfFetch } from './csrf';

// Action Types
const SET_PROFILE = 'profile/SET_PROFILE';
const SET_LOADING = 'profile/SET_LOADING';
const SET_ERROR = 'profile/SET_ERROR';

// Action Creators
const setProfile = (profile) => ({
    type: SET_PROFILE,
    payload: profile
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
export const fetchProfile = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/profile'));
        if (response.ok) {
            const profile = await response.json();
            dispatch(setProfile(profile));
            return { success: true, profile };
        }
        throw new Error('Failed to fetch profile');
    } catch (error) {
        console.error('Error fetching profile:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateProfile = (profileData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/profile'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            const profile = await response.json();
            dispatch(setProfile(profile));
            return { success: true, profile };
        }
        throw new Error('Failed to update profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Initial State
const initialState = {
    data: null,
    isLoading: false,
    error: null
};

// Reducer
export default function profileReducer(state = initialState, action) {
    switch (action.type) {
        case SET_PROFILE:
            return {
                ...state,
                data: action.payload,
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