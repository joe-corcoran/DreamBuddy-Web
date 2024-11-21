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
import insightsReducer from "./insights";

const rootReducer = combineReducers({
  session: sessionReducer,
  dreams: dreamsReducer,
  character: characterReducer,
  dreamscapes: dreamscapesReducer,
  insights: insightsReducer
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