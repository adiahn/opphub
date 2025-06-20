import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from './apiClient';

interface CheckInResponse {
  message: string;
  xp: number;
  level: string;
  stars: number;
  streak: {
    current: number;
    longest: number;
  };
}

interface CheckInState {
  loading: boolean;
  error: string | null;
  lastCheckIn: string | null;
  todayCheckedIn: boolean;
  streak: {
    current: number;
    longest: number;
  };
}

const initialState: CheckInState = {
  loading: false,
  error: null,
  lastCheckIn: null,
  todayCheckedIn: false,
  streak: {
    current: 0,
    longest: 0
  }
};

export const performCheckIn = createAsyncThunk(
  'checkIn/perform',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/check-in');
      return response.data as CheckInResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    resetCheckInState: (state) => {
      state.loading = false;
      state.error = null;
    },
    setTodayCheckedIn: (state, action) => {
      state.todayCheckedIn = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performCheckIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performCheckIn.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCheckIn = new Date().toISOString();
        state.todayCheckedIn = true;
        state.streak = action.payload.streak;
      })
      .addCase(performCheckIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetCheckInState, setTodayCheckedIn } = checkInSlice.actions;
export default checkInSlice.reducer; 