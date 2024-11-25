export const csrfFetch = async (url, options = {}) => {
    options.method = options.method || "GET";
    options.headers = options.headers || {};
    options.credentials = 'include';
      if (options.method.toUpperCase() !== "GET") {
      options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
      options.headers["X-CSRF-Token"] = document.cookie.split("csrf_token=")[1];
    }
  
    const res = await fetch(url, options);
    
    if (res.status >= 400) {
      throw res;
    }
    
    return res;
  };