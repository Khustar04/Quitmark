import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  checkinsByHabit: {}, // { [habitId]: Array<Checkin> }
  loading: false,
  checkinLoading: {}, // { [habitId]: boolean }
  error: null,
};

export const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits: (state, action) => {
      state.items = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    addHabit: (state, action) => {
      state.items.unshift(action.payload);
      if (!state.checkinsByHabit[action.payload.id]) {
        state.checkinsByHabit[action.payload.id] = [];
      }
    },
    updateHabitInState: (state, action) => {
      const index = state.items.findIndex((h) => h.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removeHabitFromState: (state, action) => {
      const habitId = action.payload;
      state.items = state.items.filter((h) => h.id !== habitId);
      delete state.checkinsByHabit[habitId];
    },
    setCheckins: (state, action) => {
      const allCheckins = action.payload || [];
      const map = {};
      // Initialize empty arrays for all current habits
      for (const h of state.items) {
        map[h.id] = [];
      }
      // Group checkins by habit_id
      for (const c of allCheckins) {
        if (!map[c.habit_id]) {
          map[c.habit_id] = [];
        }
        map[c.habit_id].push(c);
      }
      state.checkinsByHabit = map;
    },
    setHabitCheckinOptimistic: (state, action) => {
      const { habitId, checkin } = action.payload;
      if (!state.checkinsByHabit[habitId]) {
        state.checkinsByHabit[habitId] = [];
      }
      const existingIndex = state.checkinsByHabit[habitId].findIndex(
        (c) => c.check_in_date === checkin.check_in_date
      );
      if (existingIndex !== -1) {
        state.checkinsByHabit[habitId][existingIndex] = checkin;
      } else {
        state.checkinsByHabit[habitId].unshift(checkin);
      }
    },
    revertHabitCheckin: (state, action) => {
      const { habitId, previousCheckins } = action.payload;
      if (previousCheckins) {
        state.checkinsByHabit[habitId] = previousCheckins;
      }
    },
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setCheckinLoading: (state, action) => {
      const { habitId, loading } = action.payload;
      state.checkinLoading[habitId] = Boolean(loading);
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

export const {
  setHabits,
  addHabit,
  updateHabitInState,
  removeHabitFromState,
  setCheckins,
  setHabitCheckinOptimistic,
  revertHabitCheckin,
  setLoading,
  setCheckinLoading,
  setError,
  clearError,
} = habitsSlice.actions;

export default habitsSlice.reducer;
