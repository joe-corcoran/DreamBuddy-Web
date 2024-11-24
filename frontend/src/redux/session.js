const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const debugLog = (message, data) => {
  if (import.meta.env.MODE !== 'production') {
    console.log(`[Debug] ${message}`, data);
  }
};

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

const refreshCSRFToken = async () => {
  try {
    console.log('Attempting to refresh CSRF token...');
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/csrf/refresh`, {
      credentials: 'include'
    });
    console.log('CSRF refresh response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh CSRF token:', errorText);
      throw new Error('Failed to refresh CSRF token');
    }
    
    const data = await response.json();
    console.log('CSRF token refreshed successfully');
    return data.csrf_token;
  } catch (error) {
    console.error('Error refreshing CSRF token:', error);
    return null;
  }
};

const makeAuthenticatedRequest = async (url, method, body = null) => {
  try {
    let csrfToken = getCookie('csrf_token');
    if (!csrfToken) {
      debugLog('No CSRF token found, attempting to refresh');
      csrfToken = await refreshCSRFToken();
      if (!csrfToken) throw new Error('Could not obtain CSRF token');
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    };

    debugLog('Making request', { url, options });
    const response = await fetch(url, options);
    debugLog('Response received', { status: response.status });

    if (!response.ok) {
      const errorData = await response.json();
      debugLog('Error response', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const thunkLogin = (credentials) => async dispatch => {
  try {
    debugLog('Attempting login', { email: credentials.email });
    const data = await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
      'POST',
      credentials
    );
    dispatch(setUser(data));
    return null;
  } catch (error) {
    debugLog('Login failed', error);
    try {
      return JSON.parse(error.message);
    } catch {
      return { server: 'Something went wrong. Please try again' };
    }
  }
};

export const thunkSignup = (userData) => async dispatch => {
  try {
    debugLog('Attempting signup', { username: userData.username, email: userData.email });
    const data = await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/signup`,
      'POST',
      userData
    );
    dispatch(setUser(data));
    return null;
  } catch (error) {
    debugLog('Signup failed', error);
    try {
      return JSON.parse(error.message);
    } catch {
      return { server: 'Something went wrong. Please try again' };
    }
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