import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DriverProfileState } from '../slices/driverProfile/driverProfile.types';

const KEY = '@zubba_driver_profile';

export async function saveDriverProfile(state: DriverProfileState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function loadDriverProfile(): Promise<DriverProfileState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
