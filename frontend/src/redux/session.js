//frontend/src/redux/session.js
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

  if (method !== 'GET' && !getCookie('csrf_token')) {
    console.log('No CSRF token found, fetching new one...');
    await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/csrf/refresh`, {
      credentials: 'include'
    });
  }
  
  const csrfToken = getCookie('csrf_token');
  console.log('Using CSRF Token:', csrfToken);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken  
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : null
  };

  console.log('Making request to:', url, 'with options:', options);

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const text = await response.text();
    console.error('Request failed:', text);
    throw new Error(text);
  }
  
  return response.json();
};

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    const signupUrl = `${import.meta.env.VITE_APP_API_URL}/api/auth/signup`;
    console.log('Signup URL:', signupUrl);
    
    await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/csrf/refresh`, {
      credentials: 'include'
    });
    
    const data = await makeRequest(signupUrl, 'POST', userData);
    dispatch(setUser(data));
    return null;
  } catch (err) {
    console.error('Signup error:', err);
    return err;
  }
};

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const data = await makeRequest(`${import.meta.env.VITE_APP_API_URL}/api/auth/`);
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
    console.log('Fetching CSRF token before login...');
    const csrfResponse = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/csrf/refresh`,
      { credentials: 'include' }
    );
    console.log('CSRF Response:', csrfResponse);
    console.log('CSRF Response Headers:', [...csrfResponse.headers.entries()]);
    console.log('Cookies after CSRF:', document.cookie);

    console.log('Attempting login with credentials:', credentials);
    const csrfToken = getCookie('csrf_token');
    console.log('CSRF Token before login:', csrfToken);

    const data = await makeRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
      'POST',
      credentials
    );
    dispatch(setUser(data));
    return null;
  } catch (err) {
    console.error('Login error:', err);
    return err;
  }
};

export const thunkLogout = () => async (dispatch) => {
  try {
    await makeRequest(`${import.meta.env.VITE_APP_API_URL}/api/auth/logout`);
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