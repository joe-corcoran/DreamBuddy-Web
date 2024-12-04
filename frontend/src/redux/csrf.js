//frontend/src/redux/csrf.js


export const refreshCSRFToken = async () => {
  const response = await fetch('/api/auth/csrf/refresh', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.token;
};

export const csrfFetch = async (url, options = {}) => {
  options.method = options.method || "GET";
  options.headers = options.headers || {};
  options.credentials = 'include';

  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
    
    const token = await refreshCSRFToken();
    options.headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(url, options);
  if (res.status >= 400) throw res;
  return res;
};