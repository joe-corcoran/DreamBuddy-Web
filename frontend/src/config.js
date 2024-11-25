let API_URL = '';

if (import.meta.env.MODE === 'development') {
  API_URL = 'http://localhost:5000';
} else {
  API_URL = '';
}

export const getApiUrl = (path) => {
  return `${API_URL}${path}`;
};