import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import habitsReducer from './slices/habitsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    habits: habitsReducer,
  },
});

export default store;
