import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApplicationStatus, DriverProfileState, KycData } from './driverProfile.types';

const initialState: DriverProfileState = {
  applicationStatus: 'not_submitted',
  rejectionReason: null,
  kyc: null,
  termsAcceptedAt: null,
};

const driverProfileSlice = createSlice({
  name: 'driverProfile',
  initialState,
  reducers: {
    submitKyc: (state, action: PayloadAction<KycData>) => {
      state.kyc = action.payload;
    },
    acceptTerms: state => {
      state.termsAcceptedAt = new Date().toISOString();
    },
    setApplicationStatus: (
      state,
      action: PayloadAction<{ status: ApplicationStatus; reason?: string | null }>
    ) => {
      state.applicationStatus = action.payload.status;
      state.rejectionReason = action.payload.reason ?? null;
    },
    hydrate: (_state, action: PayloadAction<DriverProfileState>) => action.payload,
    resetApplication: () => initialState,
  },
});

export const { submitKyc, acceptTerms, setApplicationStatus, hydrate, resetApplication } =
  driverProfileSlice.actions;
export const driverProfileReducer = driverProfileSlice.reducer;
