import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router";
import { thunkAuthenticate } from "./redux/session";
import "./index.css";

const store = configureStore();

// CSRF token initialization
async function initializeCSRF() {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/csrf/refresh`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`CSRF initialization failed: ${response.status}`);
    }
    // After getting CSRF token, initialize authentication
    await store.dispatch(thunkAuthenticate());
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
  }
}

// Root component with initialization
const Root = () => {
  useEffect(() => {
    initializeCSRF();
  }, []);

  return (
    <ReduxProvider store={store}>
      <RouterProvider router={router} />
    </ReduxProvider>
  );
};

// Debug logging for production
if (import.meta.env.MODE === "production") {
  console.log("API URL:", import.meta.env.VITE_APP_API_URL);
  
  // Global error handler
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('Global error:', {
      message: msg,
      url,
      line: lineNo,
      column: columnNo,
      error: error && error.stack
    });
    return false;
  };

  // Unhandled promise rejection handler
  window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise
    });
  };
}

// Development helpers
if (import.meta.env.MODE !== "production") {
  window.store = store;
}

// Mount application with error handling
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application failed to mount:", error);
  // Optionally display a user-friendly error message
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Application Error</h2>
      <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
}