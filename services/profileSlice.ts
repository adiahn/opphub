import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ProfileData, UserProfile } from '../types';
import apiClient from './apiClient';
import { clearUserData } from './authSlice';
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

    let attempt = 0;
    const maxAttempts = 2; // Lower attempts for profile fetch

    while (attempt < maxAttempts) {
      try {
        const response = await apiClient.get('/profile');
        return response.data;
      } catch (error: any) {
        attempt++;
        
        // Check if it's a rate limit error
        if (error.response?.data?.message?.includes('Too many requests') || 
            error.response?.status === 429) {
          
          if (attempt < maxAttempts) {
            const delay = Math.min(Math.pow(2, attempt) * 1000, 10000); // Max 10s for profile
            console.log(`Profile fetch rate limited. Waiting ${delay}ms before retry ${attempt}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          } else {
            return rejectWithValue('Too many requests. Please wait a moment and try again.');
          }
        }

        // For non-rate-limit errors, don't retry
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
      }
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
        }
      })
      // Listen for clearUserData action from auth slice
      .addCase(clearUserData, (state) => {
        state.data = null;
        state.loading = false;
        state.error = null;
        state.lastFetched = null;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer; 