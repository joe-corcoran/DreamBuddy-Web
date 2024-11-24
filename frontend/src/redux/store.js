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

export const CLEAR_STATE = 'app/CLEAR_STATE';

const combinedReducer = combineReducers({
  session: sessionReducer,
  dreams: dreamsReducer,
  character: characterReducer,
  dreamscapes: dreamscapesReducer,
  interpretations: interpretationsReducer,
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
    enhancer = applyMiddleware(thunk);
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
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