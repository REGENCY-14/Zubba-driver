import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DriverStatusState } from './driverStatus.types';

// Drivers are always online while authenticated. useDriverPresence flips this
// to true as soon as an access token is present.
const initialState: DriverStatusState = {
  isOnline: false,
};

const driverStatusSlice = createSlice({
  name: 'driverStatus',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setOnline } = driverStatusSlice.actions;
export const driverStatusReducer = driverStatusSlice.reducer;
