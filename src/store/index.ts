import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../slices/auth/authSlice';
import { driverProfileReducer } from '../slices/driverProfile/driverProfileSlice';
import { driverStatusReducer } from '../slices/driverStatus/driverStatusSlice';
import { uiReducer } from '../slices/ui/uiSlice';
import { saveDriverProfile } from '../utils/driverProfileStorage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driverProfile: driverProfileReducer,
    driverStatus: driverStatusReducer,
    ui: uiReducer,
  },
});

// Auto-persisted on every change (unlike auth, which is saved explicitly at the
// point of login — see VerifyOtpScreen — mirroring the customer app's manual
// AsyncStorage convention). driverProfile has more write sites (KYC, terms,
// status changes), so a single subscribe here avoids scattering save calls.
let previousDriverProfile = store.getState().driverProfile;
store.subscribe(() => {
  const next = store.getState().driverProfile;
  if (next !== previousDriverProfile) {
    previousDriverProfile = next;
    saveDriverProfile(next);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
