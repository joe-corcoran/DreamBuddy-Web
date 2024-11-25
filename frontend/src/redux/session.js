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
  // For non-GET requests, refresh CSRF token first
  if (method !== 'GET') {
    console.log('Making CSRF refresh request...');
    const csrfResponse = await fetch('/api/auth/csrf/refresh', {
      credentials: 'include'
    });
    console.log('CSRF Headers:', [...csrfResponse.headers.entries()]);
    console.log('CSRF Cookies after refresh:', document.cookie);
  }

  const csrfToken = getCookie('csrf_token');
  console.log('CSRF Token for request:', csrfToken);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken })
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : null
  };

  console.log('Request Options:', {
    url,
    method,
    headers: options.headers,
    credentials: options.credentials
  });

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const text = await response.text();
    console.error('Request failed:', {
      status: response.status,
      text,
      responseHeaders: [...response.headers.entries()]
    });
    throw new Error(text);
  }
  
  return response.json();
};

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    console.log('Attempting signup...');
    const data = await makeRequest('/api/auth/signup', 'POST', userData);
    dispatch(setUser(data));
    return null;
  } catch (err) {
    console.error('Signup error:', err);
    return err;
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
    console.log('Attempting login with credentials:', credentials);
    const data = await makeRequest('/api/auth/login', 'POST', credentials);
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