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
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || ''
    },
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
};

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const data = await makeRequest(`${import.meta.env.VITE_APP_API_URL}/api/auth/`);
    dispatch(setUser(data));
  } catch (err) {
    console.error('Authentication failed:', err);
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