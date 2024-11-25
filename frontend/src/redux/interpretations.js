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
  payload: error
});

// Thunks
export const generateInterpretation = (dreamIds, type) => async (dispatch) => {
  if (!Object.values(interpretationTypes).includes(type)) {
    dispatch(setError({ validation: 'Invalid interpretation type' }));
    return { errors: { validation: 'Invalid interpretation type' } };
  }

  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch('/api/interpretations/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0]
      },
      credentials: 'include',
      body: JSON.stringify({ dreamIds, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.server || 'Failed to generate interpretation');
    }

    const interpretation = await response.json();
    dispatch(setTypeInterpretation(type, interpretation));
    return { interpretation };
  } catch (error) {
    const errors = { server: error.message || 'Failed to generate interpretation' };
    dispatch(setError(errors));
    return { errors };
  } finally {
    dispatch(setLoading(false));
  }
};

// Get all interpretation types for a dream
export const getDreamInterpretations = (dreamId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(`/api/interpretations/dream/${dreamId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.server || 'Failed to fetch interpretations');
    }

    const interpretations = await response.json();
    // Clear existing interpretations for this dream
    Object.values(interpretationTypes).forEach(type => {
      dispatch(setTypeInterpretation(type, null));
    });
    // Set received interpretations
    interpretations.forEach(interpretation => {
      dispatch(setTypeInterpretation(interpretation.interpretation_type, interpretation));
    });
    return { interpretations };
  } catch (error) {
    const errors = { server: error.message || 'Failed to fetch interpretations' };
    dispatch(setError(errors));
    return { errors };
  } finally {
    dispatch(setLoading(false));
  }
};

// Generate all interpretation types for a dream
export const generateAllInterpretations = (dreamIds) => async (dispatch) => {
  const results = {};
  let hasError = false;

  for (const type of Object.values(interpretationTypes)) {
    const result = await dispatch(generateInterpretation(dreamIds, type));
    if (result.errors) {
      hasError = true;
      results[type] = { error: result.errors };
    } else {
      results[type] = result.interpretation;
    }
  }

  return {
    success: !hasError,
    results
  };
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