const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return cookieValue;
  }
  return null;
};

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/`, {
    credentials: 'include'  
  });
  if (response.ok) {
    const data = await response.json();
    if (data.errors) {
      return;
    }
    dispatch(setUser(data));
  }
};

export const thunkLogin = (credentials) => async dispatch => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-CSRF-Token": getCookie("csrf_token")  
    },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  if(response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages
  } else {
    return { server: "Something went wrong. Please try again" }
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-CSRF-Token": getCookie("csrf_token")  
    },
    credentials: 'include',
    body: JSON.stringify(user)
  });

  if(response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages
  } else {
    return { server: "Something went wrong. Please try again" }
  }
};
export const thunkLogout = () => async (dispatch) => {
  try {
    await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/logout`, {
      credentials: 'include'  
    });
    dispatch(clearAllState());
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

export default sessionReducer;