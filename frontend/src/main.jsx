//frontend/src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router";
import { thunkAuthenticate } from "./redux/session";
import "./index.css";

const store = configureStore();

// Initialize authentication state
store.dispatch(thunkAuthenticate()).catch(console.error);

// Debug logging for API URL in production
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
}

// Development helpers
if (import.meta.env.MODE !== "production") {
  window.store = store;
}

// Root component with error boundary
const Root = () => {
  return (
    <React.StrictMode>
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </React.StrictMode>
  );
};

// Mount application
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Root />);
} catch (error) {
  console.error("Application failed to mount:", error);
}