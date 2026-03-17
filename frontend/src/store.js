import { configureStore } from "@reduxjs/toolkit";
import { serviceListReducer } from "./reducers/servicesReducers";
import { combineReducers } from "redux";
import { userLoginReducer, userRegisterReducer } from './reducers/authReducers'

const reducer = combineReducers({
    serviceList: serviceListReducer,
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
});

const initialState = {};

const store = configureStore({
  reducer,
  preloadedState: initialState,
});

export default store;