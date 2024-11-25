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
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];
    
  // Debug logging
  console.log('API URL:', import.meta.env.VITE_APP_API_URL);
  console.log('Complete URL:', url);
  console.log('CSRF Token:', csrfToken);
  console.log('Cookies:', document.cookie);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  // Only add CSRF token if we have one
  if (csrfToken) {
    options.headers['X-CSRF-Token'] = csrfToken;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    // Debug response
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorData = await response.text(); // Use text() instead of json() to see raw response
      console.error('Error response:', errorData);
      throw new Error(errorData);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    // Debug log the complete URL
    const signupUrl = `${import.meta.env.VITE_APP_API_URL}/api/auth/signup`;
    console.log('Signup URL:', signupUrl);
    
    // First ensure we have a CSRF token
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
    const data = await makeRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
      'POST',
      credentials
    );
    dispatch(setUser(data));
    return null;
  } catch (err) {
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