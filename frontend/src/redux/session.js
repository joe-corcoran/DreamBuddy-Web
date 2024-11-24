const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return cookieValue;
  }
  return null;
};

export const thunkLogin = (credentials) => async dispatch => {
  const csrfToken = getCookie('csrf_token');
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(credentials),
    credentials: 'include'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return null;
  } else {
    const data = await response.json();
    return data;
  }
};

export const thunkSignup = (userData) => async dispatch => {
  const csrfToken = getCookie('csrf_token');
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(userData),
    credentials: 'include'
  });
  
  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return null;
  } else {
    const data = await response.json();
    return data;
  }
};

export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/`, {
    headers: {
      'Content-Type': 'application/json'
    },
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

export const thunkLogout = () => async (dispatch) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/logout`, {
    credentials: 'include'
  });

  if (response.ok) {
    dispatch(removeUser());
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