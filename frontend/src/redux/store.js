//frontend/src/redux/store.js
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
import profileReducer from './profile';
import dreamEntitiesReducer from './dreamEntities';

export const CLEAR_STATE = 'app/CLEAR_STATE';

// Error handling middleware
const errorHandlingMiddleware = store => next => action => {
  if (action.payload && typeof action.payload.error === 'object') {
    action.payload.error = action.payload.error.message || 'An error occurred';
  }
  return next(action);
};

const combinedReducer = combineReducers({
  session: sessionReducer,
  dreams: dreamsReducer,
  character: characterReducer,
  dreamscapes: dreamscapesReducer,
  interpretations: interpretationsReducer,
  profile: profileReducer,
  dreamEntities: dreamEntitiesReducer
});

const rootReducer = (state, action) => {
  if (action.type === CLEAR_STATE) {
    state = undefined;
  }
  return combinedReducer(state, action);
};

let enhancer;

const configureStore = (preloadedState) => {
  if (import.meta.env.MODE === "production") {
    enhancer = applyMiddleware(thunk, errorHandlingMiddleware);
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, errorHandlingMiddleware, logger));
  }
  
  const store = createStore(rootReducer, preloadedState, enhancer);

  if (import.meta.env.MODE !== "production" && import.meta.hot) {
    import.meta.hot.accept(() => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
};

export const clearAllState = () => ({
  type: CLEAR_STATE
});

export default configureStore;