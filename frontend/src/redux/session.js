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
  const csrfToken = getCookie('csrf_token');
  
  if (!csrfToken) {
    console.error('No CSRF token found in cookies');
    // Try to refresh the page to get a new CSRF token
    window.location.reload();
    return;
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

  try {
    console.log('Making request:', { 
      url, 
      method, 
      headers: options.headers,
      credentials: options.credentials 
    });
    
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Request failed:', errorData);
        throw errorData;
      } else {
        const text = await response.text();
        console.error('Request failed:', text);
        throw new Error(text);
      }
    }
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const data = await makeRequest(`${import.meta.env.VITE_APP_API_URL}/api/auth/`);
    if (data && !data.errors) {
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

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    const data = await makeRequest(
      `${import.meta.env.VITE_APP_API_URL}/api/auth/signup`,
      'POST',
      userData
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