//frontend/src/redux/dreams.js
import { csrfFetch } from './csrf';

// Action Types
const SET_DREAMS = "dreams/SET_DREAMS";
const ADD_DREAM = "dreams/ADD_DREAM";
const UPDATE_DREAM = "dreams/UPDATE_DREAM";
const REMOVE_DREAM = "dreams/REMOVE_DREAM";
const SET_TODAY_DREAM = "dreams/SET_TODAY_DREAM";
const SET_MONTH_DREAMS = "dreams/SET_MONTH_DREAMS";
const SET_POPULAR_TAGS = "dreams/SET_POPULAR_TAGS";
const SET_SELECTED_DATE = "dreams/SET_SELECTED_DATE";
const CLEAR_DREAMS = "dreams/CLEAR_DREAMS";

// Action Creators
const setDreams = (dreams) => ({
  type: SET_DREAMS,
  payload: dreams,
});

const addDream = (dream) => ({
  type: ADD_DREAM,
  payload: dream,
});

const updateDream = (dream) => ({
  type: UPDATE_DREAM,
  payload: dream,
});

const removeDream = (dreamId) => ({
  type: REMOVE_DREAM,
  payload: dreamId,
});

const setTodayDream = (dream) => ({
  type: SET_TODAY_DREAM,
  payload: dream,
});

const setMonthDreams = (dreams) => ({
  type: SET_MONTH_DREAMS,
  payload: dreams,
});

const setPopularTags = (tags) => ({
  type: SET_POPULAR_TAGS,
  payload: tags,
});

const setSelectedDate = (date) => ({
  type: SET_SELECTED_DATE,
  payload: date,
});

export const clearDreams = () => ({
  type: CLEAR_DREAMS,
});

// Thunks
export const thunkLoadDreams = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/dreams');
    const dreams = await response.json();
    dispatch(setDreams(dreams));
    return dreams;
  } catch (error) {
    return { errors: await error.json() };
  }
};

export const thunkCheckTodayDream = (clientDate) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/dreams/today?clientDate=${encodeURIComponent(clientDate)}`);
    const dream = await response.json();
    
    // Only set as today's dream if we actually got a dream back
    if (dream && dream.id) {
      const today = new Date(clientDate);
      const dreamDate = new Date(dream.date);
      
      // Verify the dates match
      if (today.getFullYear() === dreamDate.getFullYear() &&
          today.getMonth() === dreamDate.getMonth() &&
          today.getDate() === dreamDate.getDate()) {
        dispatch(setTodayDream(dream));
        // Also ensure it's in allDreams
        dispatch(addDream(dream));
      } else {
        dispatch(setTodayDream(null));
      }
    } else {
      dispatch(setTodayDream(null));
    }
    
    return dream;
  } catch (error) {
    console.error('Error checking today\'s dream:', error);
    dispatch(setTodayDream(null));
    return { errors: { server: "Failed to check today's dream" } };
  }
};

export const thunkQuickDream = (dreamData) => async (dispatch) => {
  try {
    // Validate the date - no future dreams
    const clientDate = new Date(dreamData.clientDate);
    const currentDate = new Date();
    if (clientDate > currentDate) {
      return { errors: { date: 'Cannot create dreams for future dates' } };
    }

    const response = await csrfFetch('/api/dreams/quick', {
      method: "POST",
      body: JSON.stringify(dreamData)
    });

    const newDream = await response.json();
    if (!response.ok) {
      throw newDream;
    }
    
    dispatch(addDream(newDream));
    
    // Only set as today's dream if it's actually for today
    const isToday = new Date(newDream.date).toDateString() === currentDate.toDateString();
    if (isToday) {
      dispatch(setTodayDream(newDream));
    }
    
    return { dream: newDream };
  } catch (error) {
    return { errors: error.errors || { server: "Failed to save dream" } };
  }
};

export const thunkUpdateDream = (dreamId, dreamData) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/dreams/${dreamId}`, {
      method: "PUT",
      body: JSON.stringify(dreamData)
    });

    const updatedDream = await response.json();
    dispatch(updateDream(updatedDream));
    const today = new Date().toDateString();
    const dreamDate = new Date(updatedDream.date).toDateString();
    if (today === dreamDate) {
      dispatch(setTodayDream(updatedDream));
    }
    return { dream: updatedDream };
  } catch (error) {
    return { errors: await error.json() };
  }
};

export const thunkDeleteDream = (dreamId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/dreams/${dreamId}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    dispatch(removeDream(dreamId));
    
    const today = new Date().toDateString();
    const state = store.getState();
    const deletedDream = state.dreams.allDreams[dreamId];
    
    if (deletedDream && new Date(deletedDream.date).toDateString() === today) {
      dispatch(setTodayDream(null));
    }
    
    const dreamDate = new Date(deletedDream?.date || Date.now());
    await dispatch(thunkGetDreamsByMonth(
      dreamDate.getFullYear(),
      dreamDate.getMonth() + 1
    ));
    
    return { success: true };
  } catch (error) {
    return { errors: error.errors || { server: "Failed to delete dream" } };
  }
};

export const thunkGetDreamsByMonth = (year, month) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/dreams/month/${year}/${month}`);
    const dreams = await response.json();
    dispatch(setMonthDreams(dreams));
    return dreams;
  } catch (error) {
    return { errors: { server: "Failed to fetch dreams" } };
  }
};

export const thunkGetPopularTags = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/dreams/popular_tags');
    const tags = await response.json();
    dispatch(setPopularTags(tags));
    return tags;
  } catch (error) {
    return { errors: { server: "Failed to fetch popular tags" } };
  }
};
export const thunkLogout = () => async (dispatch) => {
  try {
    await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/logout`);
    dispatch(clearAllState());
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Initial State
const initialState = {
  allDreams: {},
  monthDreams: {},
  currentDream: null,
  todayDream: null,
  popularTags: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,
};

// Reducer
export default function dreamsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_DREAMS: {
      const allDreams = {};
      action.payload.forEach((dream) => {
        allDreams[dream.id] = dream;
      });
      return { ...state, allDreams };
    }
    case ADD_DREAM:
      return {
        ...state,
        allDreams: { ...state.allDreams, [action.payload.id]: action.payload },
      };
    case UPDATE_DREAM:
      return {
        ...state,
        allDreams: { ...state.allDreams, [action.payload.id]: action.payload },
        currentDream:
          state.currentDream?.id === action.payload.id
            ? action.payload
            : state.currentDream,
      };
    case REMOVE_DREAM: {
      const newState = { ...state };
      delete newState.allDreams[action.payload];
      if (newState.currentDream?.id === action.payload) {
        newState.currentDream = null;
      }
      if (newState.todayDream?.id === action.payload) {
        newState.todayDream = null;
      }
      return newState;
    }
    case SET_TODAY_DREAM:
      return {
        ...state,
        todayDream: action.payload,
      };
    case SET_MONTH_DREAMS: {
      const monthDreams = {};
      action.payload.forEach((dream) => {
        monthDreams[dream.id] = dream;
      });
      return {
        ...state,
        monthDreams,
      };
    }
    case CLEAR_DREAMS:
      return {
        ...initialState
      };
    case SET_POPULAR_TAGS:
      return {
        ...state,
        popularTags: action.payload,
      };
    case SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload,
      };
    default:
      return state;
  }
}