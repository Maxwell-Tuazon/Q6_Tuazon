import { configureStore } from "@reduxjs/toolkit";
import { serviceListReducer } from "./reducers/servicesReducers";
import { combineReducers } from "redux";

const reducer = combineReducers({
  serviceList: serviceListReducer,
});

const initialState = {};

const store = configureStore({
  reducer,
  preloadedState: initialState,
});

export default store;