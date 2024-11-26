//frontend/src/reduc/interpretations.js
import { getApiUrl } from '../config';

// Interpretation Types Definition
export const interpretationTypes = {
  SPIRITUAL: 'spiritual',
  PRACTICAL: 'practical',
  EMOTIONAL: 'emotional',
  ACTIONABLE: 'actionable',
  LUCID: 'lucid'
};

// Action Types
const SET_INTERPRETATIONS = 'interpretations/SET_INTERPRETATIONS';
const SET_TYPE_INTERPRETATION = 'interpretations/SET_TYPE_INTERPRETATION';
const SET_LOADING = 'interpretations/SET_LOADING';
const SET_ERROR = 'interpretations/SET_ERROR';

// Initial state with all interpretation types
const initialState = {
  byId: {},
  byType: {
    [interpretationTypes.SPIRITUAL]: null,
    [interpretationTypes.PRACTICAL]: null,
    [interpretationTypes.EMOTIONAL]: null,
    [interpretationTypes.ACTIONABLE]: null,
    [interpretationTypes.LUCID]: null
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
  payload: typeof error === 'string' ? error : 'An error occurred'
});

// Thunks
export const generateInterpretation = (dreamIds, type) => async (dispatch) => {
  if (!Object.values(interpretationTypes).includes(type)) {
    const errorMessage = 'Invalid interpretation type';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  }

  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(getApiUrl('/api/interpretations/generate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0]
      },
      credentials: 'include',
      body: JSON.stringify({ dreamIds, type })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to generate interpretation');
    }

    const interpretation = await response.json();
    dispatch(setTypeInterpretation(type, interpretation));
    return { success: true, interpretation };
  } catch (error) {
    const errorMessage = error.message || 'Failed to generate interpretation';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getDreamInterpretations = (dreamId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(getApiUrl(`/api/interpretations/dream/${dreamId}`), {
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to fetch interpretations');
    }

    const interpretations = await response.json();
    Object.values(interpretationTypes).forEach(type => {
      dispatch(setTypeInterpretation(type, null));
    });
    interpretations.forEach(interpretation => {
      dispatch(setTypeInterpretation(interpretation.interpretation_type, interpretation));
    });
    return { success: true, interpretations };
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch interpretations';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
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