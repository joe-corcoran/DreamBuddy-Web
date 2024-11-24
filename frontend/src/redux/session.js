const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';
const CLEAR_ALL_STATE = 'CLEAR_ALL_STATE';

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

export const clearAllState = () => ({
  type: CLEAR_ALL_STATE
});

const debugLog = (message, data) => {
  if (import.meta.env.MODE !== 'production') {
    console.log(`[Debug] ${message}`, data);
  }
};

const refreshCSRFToken = async () => {
  try {
    debugLog('Refreshing CSRF token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/csrf/refresh`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh CSRF token: ${response.status}`);
    }

    const data = await response.json();
    debugLog('CSRF token refreshed successfully');
    return data.csrf_token;
  } catch (error) {
    console.error('CSRF refresh failed:', error);
    throw error;
  }
};

const makeAuthenticatedRequest = async (url, method, body = null) => {
  try {
    // Always refresh CSRF token before making authenticated requests
    const csrfToken = await refreshCSRFToken();

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    };

    debugLog('Making authenticated request', { url, method });
    const response = await fetch(url, options);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      } else {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} - ${text}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const data = await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/`,
      'GET'
    );
    dispatch(setUser(data));
  } catch (error) {
    dispatch(removeUser());
  }
};

export const thunkLogin = (credentials) => async dispatch => {
  try {
    const data = await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
      'POST',
      credentials
    );
    dispatch(setUser(data));
    return null;
  } catch (error) {
    return { errors: error.message };
  }
};

export const thunkSignup = (userData) => async dispatch => {
  try {
    const data = await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/signup`,
      'POST',
      userData
    );
    dispatch(setUser(data));
    return null;
  } catch (error) {
    return { errors: error.message };
  }
};

export const thunkLogout = () => async (dispatch) => {
  try {
    await makeAuthenticatedRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/logout`,
      'GET'
    );
    dispatch(clearAllState());
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    case CLEAR_ALL_STATE:
      return initialState;
    default:
      return state;
  }
}

export default sessionReducer;