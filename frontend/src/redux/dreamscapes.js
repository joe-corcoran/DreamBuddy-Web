// frontend/src/redux/dreamscapes.js
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        optimizedPrompt
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save dreamscape');
    }

    dispatch(setDreamscape(dreamId, imageUrl, optimizedPrompt));
    return { success: true, imageUrl, prompt: optimizedPrompt };
  } catch (error) {
    dispatch(setError(error.message));
    return { errors: { server: error.message } };
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