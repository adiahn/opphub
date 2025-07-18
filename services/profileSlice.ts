import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ProfileData, UserProfile } from '../types';
import apiClient from './apiClient';
import { performCheckIn } from './checkInSlice';

interface ProfileState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { profile: ProfileState };
    const now = Date.now();

    if (state.profile.data && state.profile.lastFetched && now - state.profile.lastFetched < CACHE_DURATION) {
      return state.profile.data;
    }

    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (updateData: Partial<ProfileData>, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/profile/basic', updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        console.log('[PROFILE SLICE] fetchProfile fulfilled. Payload:', JSON.stringify(action.payload, null, 2));
        state.loading = false;
        state.data = action.payload as UserProfile;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        console.error('[PROFILE SLICE] fetchProfile rejected. Payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as UserProfile;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(performCheckIn.fulfilled, (state, action) => {
        if (state.data) {
          state.data.streak = {
            ...action.payload.streak,
            lastCheckIn: new Date().toISOString(),
          };
          state.data.level = action.payload.level;
          state.data.xp = action.payload.xp;
        }
      })
      // Handle logout by listening to the auth/logout action type
      .addCase('auth/logout/fulfilled', (state) => {
        // Clear profile data when user logs out
        state.data = null;
        state.loading = false;
        state.error = null;
        state.lastFetched = null;
      })
      .addCase('auth/logout/rejected', (state) => {
        // Also clear profile data if logout fails
        state.data = null;
        state.loading = false;
        state.error = null;
        state.lastFetched = null;
      })
      // Handle user data clearing when switching users
      .addCase('auth/clearUserData', (state) => {
        // Clear profile data when switching users
        state.data = null;
        state.loading = false;
        state.error = null;
        state.lastFetched = null;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer; 