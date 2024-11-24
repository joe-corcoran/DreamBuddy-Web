export const interpretationTypes = {
  SPIRITUAL: 'spiritual',
  PRACTICAL: 'practical',
  EMOTIONAL: 'emotional',
  ACTIONABLE: 'actionable',
  LUCID: 'lucid'
};

// Action Types
const SET_INTERPRETATIONS = 'interpretations/SET_INTERPRETATIONS';
const ADD_INTERPRETATION = 'interpretations/ADD_INTERPRETATION';
const SET_TYPE_INTERPRETATION = 'interpretations/SET_TYPE_INTERPRETATION';
const SET_LOADING = 'interpretations/SET_LOADING';
const SET_ERROR = 'interpretations/SET_ERROR';

const initialState = {
  byId: {},
  byType: {
    spiritual: null,
    practical: null,
    emotional: null,
    actionable: null,
    lucid: null
  },
  isLoading: false,
  error: null
};

// Action Creators
export const setTypeInterpretation = (type, interpretation) => ({
  type: SET_TYPE_INTERPRETATION,
  payload: { type, interpretation }
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
});

// Thunks
export const generateInterpretation = (dreamIds, type) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/interpretations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dreamIds, type })
    });

    if (response.ok) {
      const interpretation = await response.json();
      dispatch(setTypeInterpretation(type, interpretation));
      return { interpretation };
    } else {
      const error = await response.json();
      dispatch(setError(error.message));
      return null;
    }
  } catch (error) {
    dispatch(setError(error.message));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Reducer
export default function interpretationsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TYPE_INTERPRETATION:
      return {
        ...state,
        byType: {
          ...state.byType,
          [action.payload.type]: action.payload.interpretation
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