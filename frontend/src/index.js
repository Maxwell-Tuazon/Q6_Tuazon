import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './bootstrap.min.css'

import {Provider} from 'react-redux'
import store from './store'
import axios from 'axios'

// Suppress noisy cross-origin "Script error." messages from PayPal SDK
const _suppressPaypalScriptError = (e) => {
  try {
    if (e && e.message === 'Script error.' && e.filename && e.filename.includes('paypal')) {
      console.warn('Suppressed cross-origin Script error. from PayPal SDK')
      e.preventDefault && e.preventDefault()
      e.stopImmediatePropagation && e.stopImmediatePropagation()
      return true
    }
  } catch (err) {
    // ignore
  }
}
window.addEventListener('error', _suppressPaypalScriptError, true)

// Initialize axios Authorization header from localStorage if user is already logged in
const rawUserInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
const token = rawUserInfo && (rawUserInfo.access || (rawUserInfo.user && rawUserInfo.user.access))
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Response interceptor: if access token expired, try to refresh using refresh token and retry request
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    const status = error.response ? error.response.status : null
    const data = error.response ? error.response.data : null

    // If token is expired and we haven't retried yet, attempt refresh
    if (status === 401 && data && data.code === 'token_not_valid' && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const stored = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
        const refresh = stored && (stored.refresh || (stored.user && stored.user.refresh))
        if (!refresh) {
          // no refresh token -> force logout
          localStorage.removeItem('userInfo')
          window.location.href = '/signin'
          return Promise.reject(error)
        }

        const resp = await axios.post('/api/v1/users/token/refresh/', { refresh })
        const newAccess = resp.data.access
        // update stored token and axios default header
        if (stored) {
          stored.access = newAccess
          if (stored.user) stored.user.access = newAccess
          localStorage.setItem('userInfo', JSON.stringify(stored))
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        return axios(originalRequest)
      } catch (refreshErr) {
        localStorage.removeItem('userInfo')
        window.location.href = '/signin'
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
