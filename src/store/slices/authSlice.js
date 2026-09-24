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
