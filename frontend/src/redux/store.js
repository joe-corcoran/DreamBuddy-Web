// frontend/src/redux/store.js
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger"; // Regular import
import sessionReducer from "./session";

const rootReducer = combineReducers({
  session: sessionReducer,
});

let enhancer;

const configureStore = (preloadedState) => {
  if (import.meta.env.MODE === "production") {
    enhancer = applyMiddleware(thunk);
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
  }
  
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;