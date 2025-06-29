import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import apiClient from './apiClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper to store tokens
const storeTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
};

// Helper to clear tokens
const clearStoredData = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userInfo');
};

// --- Async Thunks ---
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('--- Starting login process... ---');
      
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;

      // --- Token Expiration Diagnosis ---
      try {
        const decodedToken: { exp: number } = jwtDecode(accessToken);
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        console.log(`[AUTH DEBUG] Token expires at: ${new Date(expirationTime).toISOString()}`);
        console.log(`[AUTH DEBUG] Current time is:  ${new Date(currentTime).toISOString()}`);
        if (currentTime >= expirationTime) {
          console.error('[AUTH DEBUG] FATAL: Token is already expired upon receipt.');
        } else {
          console.log(`[AUTH DEBUG] Token is valid. Expires in ${((expirationTime - currentTime) / 1000 / 60).toFixed(2)} minutes.`);
        }
      } catch (e) {
        console.error('[AUTH DEBUG] Failed to decode token.', e);
      }
      // --- End Diagnosis ---

      await storeTokens(accessToken, refreshToken);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error: any) {
      // Add detailed logging for better debugging
      console.error('--- LOGIN THUNK ERROR ---');
      if (error.response) {
        console.error('Login Error Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Login Error:', error.message);
      }

      // Handle validation errors from express-validator
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        return rejectWithValue(errorMessages);
      }

      // Handle general message errors from the backend
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      
      // Handle network errors or other unexpected issues
      if (error.message && error.message.toLowerCase().includes('network')) {
        return rejectWithValue('Unable to connect to the server. Please check your internet connection and try again.');
      }
      return rejectWithValue(error.message || 'Login failed due to an unknown error.');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;
      await storeTokens(accessToken, refreshToken);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!storedRefreshToken) {
      return rejectWithValue('No refresh token available');
    }
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken: storedRefreshToken });
      await SecureStore.setItemAsync('accessToken', response.data.accessToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh token');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    const { refreshToken } = (getState() as { auth: AuthState }).auth;

    try {
      if (refreshToken) {
        // Attempt to invalidate the token on the server.
        // The new interceptor will handle an expired token gracefully.
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error: any) {
      // Even if server logout fails (e.g., network error, expired token),
      // we still proceed to clear local data.
      console.warn('Server logout failed, proceeding with client-side cleanup.', error.response?.data);
    } finally {
      // ALWAYS clear local data to complete the logout on the device.
      await clearStoredData();
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userInfoString = await SecureStore.getItemAsync('userInfo');

      if (!accessToken || !refreshToken || !userInfoString) {
        return rejectWithValue('No stored credentials');
      }

      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userInfoString),
      };
    } catch (error) {
      return rejectWithValue('Failed to check auth status');
    }
  }
);

// --- Slice Definition ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUserData: (state) => {
      // This action will be used to clear all user data when switching users
      // The profile and checkIn slices will listen for this action
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Login ---
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Signup ---
    builder.addCase(signup.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Refresh Token ---
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
    });

    // --- Logout ---
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      // This case is less likely to be hit now, but is good for safety.
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Check Status ---
    builder.addCase(checkAuthStatus.pending, (state) => { state.loading = true; });
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    });
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const { setTokens, clearError, clearUserData } = authSlice.actions;
export default authSlice.reducer; 