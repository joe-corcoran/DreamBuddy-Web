import { getApiUrl } from '../config';

// Action Types
const SET_DREAMSCAPE = "dreamscapes/SET_DREAMSCAPE";
const SET_LOADING = "dreamscapes/SET_LOADING";
const SET_ERROR = "dreamscapes/SET_ERROR";

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
    const response = await fetch(getApiUrl(`/api/dreamscapes/dream/${dreamId}`), {
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to fetch dreamscape');
    }

    const result = await response.json();
    dispatch(setDreamscape(dreamId, result.image_url, result.optimized_prompt));
    return { success: true, imageUrl: result.image_url, prompt: result.optimized_prompt };
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch dreamscape';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Initial State
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