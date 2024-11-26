//frontend/src/redux/dreamscapes.js
import { getApiUrl } from '../config';

// Action Types
const SET_DREAMSCAPE = "dreamscapes/SET_DREAMSCAPE";
const SET_LOADING = "dreamscapes/SET_LOADING";
const SET_ERROR = "dreamscapes/SET_ERROR";
const SET_STATUS = "dreamscapes/SET_STATUS";

// Action Creators
const setDreamscape = (dreamId, imageUrl, prompt) => ({
  type: SET_DREAMSCAPE,
  payload: { dreamId, imageUrl, prompt }
});

const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

const setError = (error) => ({
  type: SET_ERROR,
  payload: typeof error === 'string' ? error : 'An error occurred'
});

const setStatus = (dreamId, status) => ({
  type: SET_STATUS,
  payload: { dreamId, status }
});

// Poll function
const pollGenerationStatus = async (dreamId, dispatch) => {
  try {
    const response = await fetch(getApiUrl(`/api/dreamscapes/status/${dreamId}`), {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to check status');
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      dispatch(setDreamscape(dreamId, data.image_url, data.optimized_prompt));
      return true;
    } else if (data.status === 'failed') {
      dispatch(setError(data.error_message || 'Generation failed'));
      return true;
    }
    
    return false;
    
  } catch (error) {
    dispatch(setError(error.message));
    return true;
  }
};


// Thunks
export const generateDreamscape = (dreamId, dreamContent) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(getApiUrl(`/api/dreamscapes/generate/${dreamId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0]
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to generate dreamscape');
    }

    const result = await response.json();
    
    // If generation is in progress, start polling
    if (result.status === 'generating' || result.status === 'uploading') {
      // Poll every 3 seconds
      const pollInterval = setInterval(async () => {
        const isDone = await pollGenerationStatus(dreamId, dispatch);
        if (isDone) {
          clearInterval(pollInterval);
          dispatch(setLoading(false));
        }
      }, 3000);
      
      // Set timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        dispatch(setLoading(false));
        dispatch(setError('Generation timed out. Please try again.'));
      }, 300000);
      
      return { status: result.status };
    }

    dispatch(setDreamscape(dreamId, result.image_url, result.optimized_prompt));
    return { success: true, imageUrl: result.image_url, prompt: result.optimized_prompt };
    
  } catch (error) {
    const errorMessage = error.message || 'Failed to generate dreamscape';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const regenerateDreamscape = (dreamId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(getApiUrl(`/api/dreamscapes/regenerate/${dreamId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0]
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to regenerate dreamscape');
    }

    const result = await response.json();
    dispatch(setDreamscape(dreamId, result.image_url, result.optimized_prompt));
    return { success: true, imageUrl: result.image_url, prompt: result.optimized_prompt };
  } catch (error) {
    const errorMessage = error.message || 'Failed to regenerate dreamscape';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getDreamscape = (dreamId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log('Fetching dreamscape for dream:', dreamId);
    const response = await fetch(getApiUrl(`/api/dreamscapes/dream/${dreamId}`), {
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Dreamscape response:', data);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No dreamscape found');
        return { notFound: true };
      }
      throw new Error(data.errors?.server || 'Failed to fetch dreamscape');
    }

    dispatch(setDreamscape(dreamId, data.image_url, data.optimized_prompt));
    return { success: true };
  } catch (error) {
    console.error('Error in getDreamscape:', error);
    if (!error.notFound) {
      dispatch(setError(error.message || 'Failed to fetch dreamscape'));
    }
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

// Reducer
export default function dreamscapesReducer(state = initialState, action) {
  switch (action.type) {
    case SET_DREAMSCAPE:
      return {
        ...state,
        byDreamId: {
          ...state.byDreamId,
          [action.payload.dreamId]: {
            imageUrl: action.payload.imageUrl,
            prompt: action.payload.prompt
          }
        }
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