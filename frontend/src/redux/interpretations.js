//frontend/src/reduc/interpretations.js
import { getApiUrl } from '../config';
import { csrfFetch } from './csrf';

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
const SET_ALL_INTERPRETATIONS = 'interpretations/SET_ALL_INTERPRETATIONS';
const UPDATE_INTERPRETATION_NOTES = 'interpretations/UPDATE_INTERPRETATION_NOTES';
const DELETE_INTERPRETATION = 'interpretations/DELETE_INTERPRETATION';
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
  allInterpretations: [],
  isLoading: false,
  error: null
};

// Action Creators
export const setTypeInterpretation = (type, interpretation) => ({
  type: SET_TYPE_INTERPRETATION,
  payload: { type, interpretation }
});

export const updateInterpretationNotes = (interpretationId, notes) => ({
  type: UPDATE_INTERPRETATION_NOTES,
  payload: { id: interpretationId, notes }
});

export const deleteInterpretation = (interpretationId) => ({
  type: DELETE_INTERPRETATION,
  payload: interpretationId
});

export const setAllInterpretations = (interpretations) => ({
  type: SET_ALL_INTERPRETATIONS,
  payload: interpretations
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

export const saveInterpretationNotes = (interpretationId, notes) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await csrfFetch(getApiUrl(`/api/interpretations/${interpretationId}/notes`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to save notes');
    }

    const interpretation = await response.json();
    console.log('Server response:', interpretation);
    
    dispatch(updateInterpretationNotes(interpretationId, notes));
    // Don't reload all interpretations here since we already updated the state
    return { success: true, interpretation };
  } catch (error) {
    console.error('Error saving notes:', error);
    const errorMessage = error.message || 'Failed to save notes';
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};
export const removeInterpretation = (interpretationId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log('Attempting to remove interpretation:', interpretationId);
    
    const response = await csrfFetch(getApiUrl(`/api/interpretations/${interpretationId}`), {
      method: 'DELETE'
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.server || 'Failed to delete interpretation');
    }

    // Dispatch the delete action to update the store
    dispatch(deleteInterpretation(interpretationId));
    
    console.log('Successfully deleted interpretation');
    return { success: true };
  } catch (error) {
    console.error('Error in removeInterpretation:', error);
    dispatch(setError(error.message || 'Failed to delete interpretation'));
    return { error: error.message || 'Failed to delete interpretation' };
  } finally {
    dispatch(setLoading(false));
  }
};
export const getAllInterpretations = () => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // Use csrfFetch with getApiUrl
    const response = await csrfFetch(getApiUrl('/api/interpretations/all'));

    if (!response.ok) {
      throw new Error('Failed to fetch interpretations');
    }

    const interpretations = await response.json();
    console.log('Fetched interpretations:', interpretations); // Debug log
    dispatch(setAllInterpretations(interpretations));
    return { success: true, interpretations };
  } catch (error) {
    console.error('Error fetching interpretations:', error); // Debug log
    const errorMessage = error.message || 'Failed to fetch interpretations';
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
    case SET_ALL_INTERPRETATIONS:
      return {
        ...state,
        allInterpretations: action.payload,
        byId: action.payload.reduce((acc, interp) => {
          acc[interp.id] = interp;
          return acc;
        }, {}),
        error: null  // Clear any previous errors
      };
      case UPDATE_INTERPRETATION_NOTES:
        const updatedInterpretations = state.allInterpretations.map(interp => 
          interp.id === action.payload.id 
            ? { ...interp, user_notes: action.payload.notes }
            : interp
        );
      
        console.log('Updating notes for interpretation:', action.payload.id);
        console.log('Updated interpretations:', updatedInterpretations);
      
        return {
          ...state,
          allInterpretations: updatedInterpretations,
          byId: {
            ...state.byId,
            [action.payload.id]: {
              ...state.byId[action.payload.id],
              user_notes: action.payload.notes
            }
          },
          error: null // Clear any existing errors
        };
      
    case DELETE_INTERPRETATION:
      return {
        ...state,
        allInterpretations: state.allInterpretations.filter(
          interp => interp.id !== action.payload
        ),
        byId: Object.fromEntries(
          Object.entries(state.byId).filter(([id]) => id !== action.payload.toString())
        )
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