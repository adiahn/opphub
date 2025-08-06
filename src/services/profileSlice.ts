import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../services/apiClient';

interface ProfileData {
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  skills: any[];
  projects: any[];
  achievements: any[];
  education: any[];
  workExperience: any[];
}

interface UserProfile {
  profile: ProfileData;
  streak: {
    current: number;
    longest: number;
    lastCheckIn: string | null;
  };
  _id: string;
  email: string;
  name: string;
  xp: number;
  level: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProfileState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState }) => {
    const state = getState() as { profile: ProfileState };
    const now = Date.now();

    // Return cached data if it's still valid
    if (state.profile.data && state.profile.lastFetched && 
        now - state.profile.lastFetched < CACHE_DURATION) {
      return state.profile.data;
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) throw new Error('No token found');

    try {
      const response = await apiClient.get('/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (updateData: Partial<ProfileData>, { getState }) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) throw new Error('No token found');

    try {
      const response = await apiClient.put('/profile/basic', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data) {
          state.data.profile = { ...state.data.profile, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  },
});

export default profileSlice.reducer; 