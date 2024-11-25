import { OpenAIService } from '../services/openai';

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
  payload: error
});

// Thunk
export const generateDreamscape = (dreamId, dreamContent) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const optimizedPrompt = await OpenAIService.generateDreamscapePrompt(dreamContent);
    const imageUrl = await OpenAIService.generateDreamscapeImage(optimizedPrompt);
    
    const response = await fetch(`/api/dreamscapes/${dreamId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.cookie.split('csrf_token=')[1]
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          optimizedPrompt
        })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.server || 'Failed to save dreamscape');
    }

    const result = await response.json();
    dispatch(setDreamscape(dreamId, result.image_url, result.optimized_prompt));
    return { success: true, imageUrl: result.image_url, prompt: result.optimized_prompt };
  } catch (error) {
    const errors = { server: error.message || 'Failed to generate dreamscape' };
    dispatch(setError(errors));
    return { errors };
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