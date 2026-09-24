import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  checkinsByHabit: {}, // { [habitId]: Array<Checkin> }
  loading: false,
  initialized: false, // Distinguishes initial uninitialized loading from a genuine empty list
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
      state.initialized = true;
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
    removeHabitCheckinOptimistic: (state, action) => {
      const { habitId, checkInDate } = action.payload;
      if (state.checkinsByHabit[habitId]) {
        state.checkinsByHabit[habitId] = state.checkinsByHabit[habitId].filter(
          (checkin) => checkin.check_in_date !== checkInDate
        );
      }
    },
    setSingleHabit: (state, action) => {
      const habit = action.payload;
      const index = state.items.findIndex((h) => h.id === habit.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...habit };
      } else {
        state.items.push(habit);
      }
      if (!state.checkinsByHabit[habit.id]) {
        state.checkinsByHabit[habit.id] = [];
      }
    },
    setSingleHabitCheckins: (state, action) => {
      const { habitId, checkins } = action.payload;
      state.checkinsByHabit[habitId] = checkins || [];
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
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetHabitsState: () => initialState,
  },
});

export const {
  setHabits,
  addHabit,
  updateHabitInState,
  removeHabitFromState,
  setCheckins,
  setHabitCheckinOptimistic,
  removeHabitCheckinOptimistic,
  setSingleHabit,
  setSingleHabitCheckins,
  revertHabitCheckin,
  setLoading,
  setCheckinLoading,
  setError,
  clearError,
  resetHabitsState,
} = habitsSlice.actions;

export default habitsSlice.reducer;
