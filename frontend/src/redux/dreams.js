import { removeUser } from './session';

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
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/`);

  if (response.ok) {
    const dreams = await response.json();
    dispatch(setDreams(dreams));
    return dreams;
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const thunkCheckTodayDream = (clientDate) => async (dispatch) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/today?clientDate=${encodeURIComponent(clientDate)}`);

    if (response.ok) {
      const dream = await response.json();
      if (dream) {
        dispatch(setTodayDream(dream));
      }
      return dream;
    } else {
      const errors = await response.json();
      return { errors };
    }
  } catch (error) {
    return { errors: { server: "Failed to check today's dream" } };
  }
};

export const thunkQuickDream = (dreamData) => async (dispatch) => {
  const todayDream = await dispatch(thunkCheckTodayDream());
  if (todayDream && !todayDream.errors) {
    return { errors: { date: "You have already logged a dream today" } };
  }

  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/quick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dreamData),
  });

  if (response.ok) {
    const newDream = await response.json();
    dispatch(addDream(newDream));
    dispatch(setTodayDream(newDream));
    return { dream: newDream };
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const thunkUpdateDream = (dreamId, dreamData) => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/${dreamId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dreamData),
  });

  if (response.ok) {
    const updatedDream = await response.json();
    dispatch(updateDream(updatedDream));
    const today = new Date().toDateString();
    const dreamDate = new Date(updatedDream.date).toDateString();
    if (today === dreamDate) {
      dispatch(setTodayDream(updatedDream));
    }
    return { dream: updatedDream };
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const thunkDeleteDream = (dreamId) => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/${dreamId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeDream(dreamId));
    dispatch(setTodayDream(null));
    return { success: true };
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const thunkGetDreamsByMonth = (year, month) => async (dispatch) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/month/${year}/${month}`);

    if (response.ok) {
      const dreams = await response.json();
      dispatch(setMonthDreams(dreams));
      return dreams;
    } else {
      const errors = await response.json();
      return { errors };
    }
  } catch (error) {
    return { errors: { server: "Failed to fetch dreams" } };
  }
};

export const thunkGetPopularTags = () => async (dispatch) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/dreams/popular_tags`);

    if (response.ok) {
      const tags = await response.json();
      dispatch(setPopularTags(tags));
      return tags;
    } else {
      const errors = await response.json();
      return { errors };
    }
  } catch (error) {
    return { errors: { server: "Failed to fetch popular tags" } };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/logout`);
  dispatch(removeUser());
  dispatch(clearDreams());
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