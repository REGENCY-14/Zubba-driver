import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DriverStatusState, MatchingMode } from './driverStatus.types';

// Resets to offline on every app start (no persistence) — matches the real-world
// expectation that a driver has to actively go online each session.
const initialState: DriverStatusState = {
  isOnline: false,
  matchingMode: 'broadcast',
};

const driverStatusSlice = createSlice({
  name: 'driverStatus',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setMatchingMode: (state, action: PayloadAction<MatchingMode>) => {
      state.matchingMode = action.payload;
    },
  },
});

export const { setOnline, setMatchingMode } = driverStatusSlice.actions;
export const driverStatusReducer = driverStatusSlice.reducer;
