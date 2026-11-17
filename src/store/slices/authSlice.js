import { createSlice } from '@reduxjs/toolkit';
import { setActiveUserId } from '../../utils/auth/sessionGuard';
import { setNotificationUser } from '../../utils/notifications/inAppNotificationStore';

const getInitialAuthState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      user: null,
      session: null,
      loading: false,
      initialized: false,
      error: null,
    };
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const user = parsed.user || null;
          if (user && user.id) {
            // Check if access_token has an iat from the future (e.g. issued prior to a system clock sync)
            if (parsed.access_token && typeof parsed.access_token === 'string') {
              try {
                const parts = parsed.access_token.split('.');
                if (parts.length === 3) {
                  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                  const payload = JSON.parse(
                    typeof atob === 'function'
                      ? atob(base64)
                      : (globalThis.Buffer?.from(base64, 'base64').toString('utf-8') || '{}')
                  );
                  const currentSec = Math.floor(Date.now() / 1000);
                  if (payload?.iat && payload.iat > currentSec + 2) {
                    console.warn(
                      `[Quitmark] Cached session token iat (${payload.iat}) is in the future relative to system clock (${currentSec}). Evicting stale future token.`
                    );
                    localStorage.removeItem(key);
                    return {
                      user: null,
                      session: null,
                      loading: false,
                      initialized: false,
                      error: null,
                    };
                  }
                }
              } catch {
                // If parsing fails, fall through safely
              }
            }
            setActiveUserId(user.id);
            setNotificationUser(user.id);
            return {
              user,
              session: parsed,
              loading: false,
              initialized: true,
              error: null,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Quitmark] Synchronous auth hydration skipped:', err);
  }

  return {
    user: null,
    session: null,
    loading: false,
    initialized: false,
    error: null,
  };
};

const initialState = getInitialAuthState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { user, session } = action.payload;
      state.user = user || null;
      state.session = session || null;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setAuth, clearAuth, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;
