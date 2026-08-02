import { store } from '../../store';
import { hydrate } from './driverProfileSlice';
import { loadDriverProfile } from '../../utils/driverProfileStorage';

export async function hydrateDriverProfile() {
  const stored = await loadDriverProfile();
  if (stored) store.dispatch(hydrate(stored));
}
