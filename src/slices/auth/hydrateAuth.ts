import { store } from '../../store';
import { setCredentials } from './authSlice';
import { loadStoredAuth } from '../../utils/authStorage';

export async function hydrateAuth() {
  const stored = await loadStoredAuth();
  if (stored) {
    store.dispatch(
      setCredentials({
        user: stored.user,
        accessToken: stored.tokens.accessToken,
        refreshToken: stored.tokens.refreshToken,
      })
    );
  }
}
