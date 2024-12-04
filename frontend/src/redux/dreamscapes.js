// frontend/src/redux/dreamscapes.js
import { getApiUrl } from '../config';

// Action Types
const SET_DREAMSCAPE = "dreamscapes/SET_DREAMSCAPE";
const SET_LOADING = "dreamscapes/SET_LOADING";
const SET_ERROR = "dreamscapes/SET_ERROR";
const SET_ALL_DREAMSCAPES = "dreamscapes/SET_ALL_DREAMSCAPES";

// Action Creators
const setDreamscape = (dreamId, imageUrl, prompt) => ({
  type: SET_DREAMSCAPE,
  payload: { 
    dreamId, 
    imageUrl, 
    optimized_prompt: prompt 
  }
});

const setAllDreamscapes = (dreamscapes) => ({
  type: SET_ALL_DREAMSCAPES,
  payload: dreamscapes
});

const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

const setError = (error) => ({
  type: SET_ERROR,
  payload: error
});


// Thunk Actions

export const getAllDreamscapes = () => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const response = await fetch(getApiUrl('/api/dreamscapes/all'), {
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.server || 'Failed to fetch dreamscapes');
    }

    const dreamscapesByDreamId = data.reduce((acc, dreamscape) => {
      acc[dreamscape.dream_id] = {
        image_url: dreamscape.image_url,
        optimized_prompt: dreamscape.optimized_prompt
      };
      return acc;
    }, {});

    dispatch(setAllDreamscapes(dreamscapesByDreamId));
    return { success: true };

  } catch (error) {
    console.error('Fetch all dreamscapes error:', error);
    dispatch(setError(error.message));
    return { error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateDreamscape = (dreamId, dreamContent) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log('Generating dreamscape for dream:', dreamId);
    
    const response = await fetch(getApiUrl(`/api/dreamscapes/generate/${dreamId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0]
      },
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Generate response:', data);
    
    if (!response.ok) {
      throw new Error(data.errors?.server || 'Failed to generate dreamscape');
    }

    // Use the exact property names from backend
    dispatch(setDreamscape(dreamId, data.image_url, data.optimized_prompt));
    return { success: true, data };

  } catch (error) {
    console.error('Generate error:', error);
    dispatch(setError(error.message));
    return { error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getDreamscape = (dreamId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    console.log('Fetching dreamscape for dream:', dreamId);
    
    const response = await fetch(getApiUrl(`/api/dreamscapes/dream/${dreamId}`), {
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Dreamscape response:', data);

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      throw new Error(data.errors?.server || 'Failed to fetch dreamscape');
    }

    dispatch(setDreamscape(dreamId, data.image_url, data.optimized_prompt));
    return { success: true, data };

  } catch (error) {
    console.error('Fetch error:', error);
    dispatch(setError(error.message));
    return { error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};



const initialState = {
  byDreamId: {},
  isLoading: false,
  error: null
};

const dreamscapesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DREAMSCAPE: {
      const { dreamId, imageUrl, optimized_prompt } = action.payload;
      return {
        ...state,
        byDreamId: {
          ...state.byDreamId,
          [dreamId]: {
            image_url: imageUrl,
            optimized_prompt, 
          }
        },
        error: null
      };
    };
    case SET_ALL_DREAMSCAPES:
      return {
        ...state,
        byDreamId: {
          ...state.byDreamId,
          ...action.payload
        },
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
};

export default dreamscapesReducer;