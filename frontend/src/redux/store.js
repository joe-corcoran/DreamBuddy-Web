// frontend/src/redux/store.js
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import sessionReducer from "./session";
import dreamsReducer from "./dreams";
import characterReducer from "./character";
import dreamscapesReducer from "./dreamscapes";
import interpretationsReducer from "./interpretations";

// Action type for clearing entire app state
export const CLEAR_STATE = 'app/CLEAR_STATE';

// Create the base reducer combining all slice reducers
const combinedReducer = combineReducers({
  session: sessionReducer,
  dreams: dreamsReducer,
  character: characterReducer,
  dreamscapes: dreamscapesReducer,
  interpretations: interpretationsReducer,
});

// Root reducer that can clear all state
const rootReducer = (state, action) => {
  if (action.type === CLEAR_STATE) {
    // Clear all state on logout
    state = undefined;
  }
  return combinedReducer(state, action);
};

let enhancer;

const configureStore = (preloadedState) => {
  // Configure middleware based on environment
  if (import.meta.env.MODE === "production") {
    enhancer = applyMiddleware(thunk);
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
  }
  
  // Create store with root reducer that can handle state clearing
  const store = createStore(rootReducer, preloadedState, enhancer);

  // Development hot reloading
  if (import.meta.env.MODE !== "production" && import.meta.hot) {
    import.meta.hot.accept(() => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
};

// Action creator for clearing state
export const clearAllState = () => ({
  type: CLEAR_STATE
});

export default configureStore;