import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,
};

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
