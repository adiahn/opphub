import { configureStore } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import apiClient from './apiClient';
import authReducer, { logout, refreshToken, setTokens } from './authSlice';
import checkInReducer from './checkInSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    checkIn: checkInReducer,
  },
});

// Request interceptor to add the access token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = store.getState().auth.accessToken || await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers['x-auth-token'] = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshTokenPromise: Promise<any> | null = null;

// Response interceptor to handle token refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // If the error is not 401, or if it's a request to the refresh token endpoint itself, just reject.
    if (error.response?.status !== 401 || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }
    
    // If we've already retried this request, give up.
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (!refreshTokenPromise) {
      console.log('[AXIOS INTERCEPTOR] No active refresh promise. Creating new one.');
      refreshTokenPromise = store.dispatch(refreshToken()).unwrap()
        .then(data => {
          console.log('[AXIOS INTERCEPTOR] Token refresh successful.');
          refreshTokenPromise = null; // Clear promise for the next time.
          store.dispatch(setTokens(data));
          apiClient.defaults.headers.common['x-auth-token'] = data.accessToken;
          return data.accessToken;
        })
        .catch(err => {
          console.error('[AXIOS INTERCEPTOR] Token refresh failed. Logging out.');
          refreshTokenPromise = null;
          store.dispatch(logout());
          return Promise.reject(err);
        });
    } else {
      console.log('[AXIOS INTERCEPTOR] Active refresh promise detected. Waiting for it to resolve.');
    }

    try {
      const newAccessToken = await refreshTokenPromise;
      console.log('[AXIOS INTERCEPTOR] Retrying original request to', originalRequest.url);
      originalRequest.headers['x-auth-token'] = newAccessToken;
      return apiClient(originalRequest);
    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 