import axios from 'axios'
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
} from '../constants/authConstants'

const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST })
    const { data } = await axios.post('/api/v1/users/login/', { email, password })
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data })
    // set default Authorization header for subsequent requests
    if (data && data.access) axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAIL, payload: error.response && error.response.data.detail ? error.response.data.detail : error.message })
  }
}

const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo')
  delete axios.defaults.headers.common['Authorization']
  dispatch({ type: USER_LOGOUT })
}

const register = (form) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST })
    const { data } = await axios.post('/api/v1/users/register/', form)
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data })
    // also log in user
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data })
    if (data && data.access) axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAIL, payload: error.response && error.response.data.detail ? error.response.data.detail : error.message })
  }
}

export { login, logout, register }
