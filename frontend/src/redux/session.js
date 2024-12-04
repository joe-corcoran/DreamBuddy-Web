// frontend/src/redux/session.js
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

const makeRequest = async (url, method = 'GET', body = null) => {
  if (method !== 'GET') {
    await fetch('/api/auth/csrf/refresh', {
      credentials: 'include'
    });
  }

  const csrfToken = getCookie('csrf_token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken })
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : null
  };

  const response = await fetch(url, options);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw data;
  }
  
  return data;
};

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    const data = await makeRequest('/api/auth/signup', 'POST', userData);
    dispatch(setUser(data));
    return null;
  } catch (err) {
    console.error('Signup error:', err);
    return err.errors || err;
  }
};
export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const data = await makeRequest('/api/auth');
    if (data) {
      dispatch(setUser(data));
    } else {
      dispatch(removeUser());
    }
  } catch (err) {
    console.error('Authentication failed:', err);
    dispatch(removeUser());
  }
};
export const thunkLogin = (credentials) => async (dispatch) => {
  try {
    const data = await makeRequest('/api/auth/login', 'POST', {
      credential: credentials.credential,
      password: credentials.password
    });
    
    dispatch(setUser(data));
    return null;
  } catch (err) {
    console.error('Login error:', err);
    return err;
  }
};
export const thunkLogout = () => async (dispatch) => {
  try {
    await makeRequest('/api/auth/logout');
    dispatch(removeUser());
  } catch (err) {
    console.error('Logout failed:', err);
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