import test from 'node:test';
import assert from 'node:assert/strict';

// ──────────────────────────────────────
// habitsSlice reducer tests
// ──────────────────────────────────────
import habitsReducer, {
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
} from '../src/store/slices/habitsSlice.js';

const initialState = {
  items: [],
  checkinsByHabit: {},
  loading: false,
  initialized: false,
  checkinLoading: {},
  error: null,
};

const mockHabit = (id, name = 'Test Habit') => ({ id, name, user_id: 'user-1' });

// ──────────────────────────────────────
// Initial state
// ──────────────────────────────────────

test('habitsSlice: initial state is correct', () => {
  const state = habitsReducer(undefined, { type: 'unknown' });
  assert.deepStrictEqual(state, initialState);
});

// ──────────────────────────────────────
// setHabits
// ──────────────────────────────────────

test('habitsSlice: setHabits populates items and clears error', () => {
  const habits = [mockHabit('h1'), mockHabit('h2')];
  const state = habitsReducer(initialState, setHabits(habits));
  assert.equal(state.items.length, 2);
  assert.equal(state.loading, false);
  assert.equal(state.initialized, true);
  assert.equal(state.error, null);
});

test('habitsSlice: setHabits with null defaults to empty array', () => {
  const state = habitsReducer(initialState, setHabits(null));
  assert.deepStrictEqual(state.items, []);
});

// ──────────────────────────────────────
// addHabit
// ──────────────────────────────────────

test('habitsSlice: addHabit prepends to items and initializes checkins', () => {
  const habit = mockHabit('h1', 'Running');
  const state = habitsReducer(initialState, addHabit(habit));

  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].id, 'h1');
  assert.deepStrictEqual(state.checkinsByHabit['h1'], []);
});

test('habitsSlice: addHabit preserves existing items', () => {
  const stateWithOne = habitsReducer(initialState, addHabit(mockHabit('h1')));
  const state = habitsReducer(stateWithOne, addHabit(mockHabit('h2')));

  assert.equal(state.items.length, 2);
  assert.equal(state.items[0].id, 'h2'); // prepended
  assert.equal(state.items[1].id, 'h1');
});

// ──────────────────────────────────────
// updateHabitInState
// ──────────────────────────────────────

test('habitsSlice: updateHabitInState updates matching habit', () => {
  const initial = habitsReducer(initialState, addHabit(mockHabit('h1', 'Old Name')));
  const state = habitsReducer(initial, updateHabitInState({ id: 'h1', name: 'New Name' }));

  assert.equal(state.items[0].name, 'New Name');
  assert.equal(state.items[0].id, 'h1');
});

test('habitsSlice: updateHabitInState does nothing for non-existent id', () => {
  const initial = habitsReducer(initialState, addHabit(mockHabit('h1', 'Test')));
  const state = habitsReducer(initial, updateHabitInState({ id: 'h-nonexistent', name: 'Nope' }));

  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].name, 'Test');
});

// ──────────────────────────────────────
// removeHabitFromState
// ──────────────────────────────────────

test('habitsSlice: removeHabitFromState removes the habit and its checkins', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, addHabit(mockHabit('h2')));
  state = habitsReducer(state, removeHabitFromState('h1'));

  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].id, 'h2');
  assert.equal(state.checkinsByHabit['h1'], undefined);
});

// ──────────────────────────────────────
// setCheckins
// ──────────────────────────────────────

test('habitsSlice: setCheckins groups checkins by habit_id', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, addHabit(mockHabit('h2')));

  const checkins = [
    { habit_id: 'h1', check_in_date: '2026-09-18', status: 'completed' },
    { habit_id: 'h1', check_in_date: '2026-09-19', status: 'completed' },
    { habit_id: 'h2', check_in_date: '2026-09-19', status: 'missed' },
  ];
  state = habitsReducer(state, setCheckins(checkins));

  assert.equal(state.checkinsByHabit['h1'].length, 2);
  assert.equal(state.checkinsByHabit['h2'].length, 1);
});

test('habitsSlice: setCheckins with empty array clears all checkins', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, setCheckins([]));

  assert.deepStrictEqual(state.checkinsByHabit['h1'], []);
});

// ──────────────────────────────────────
// setHabitCheckinOptimistic
// ──────────────────────────────────────

test('habitsSlice: setHabitCheckinOptimistic adds a new checkin', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  const checkin = { check_in_date: '2026-09-19', status: 'completed' };
  state = habitsReducer(state, setHabitCheckinOptimistic({ habitId: 'h1', checkin }));

  assert.equal(state.checkinsByHabit['h1'].length, 1);
  assert.equal(state.checkinsByHabit['h1'][0].status, 'completed');
});

test('habitsSlice: setHabitCheckinOptimistic updates existing checkin for same date', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  const checkin1 = { check_in_date: '2026-09-19', status: 'completed' };
  state = habitsReducer(state, setHabitCheckinOptimistic({ habitId: 'h1', checkin: checkin1 }));

  const checkin2 = { check_in_date: '2026-09-19', status: 'missed' };
  state = habitsReducer(state, setHabitCheckinOptimistic({ habitId: 'h1', checkin: checkin2 }));

  assert.equal(state.checkinsByHabit['h1'].length, 1); // no duplicate
  assert.equal(state.checkinsByHabit['h1'][0].status, 'missed'); // updated
});

test('habitsSlice: setHabitCheckinOptimistic creates checkin array if habit has none', () => {
  const state = habitsReducer(initialState, setHabitCheckinOptimistic({
    habitId: 'h-new',
    checkin: { check_in_date: '2026-09-19', status: 'completed' },
  }));

  assert.equal(state.checkinsByHabit['h-new'].length, 1);
});

// ──────────────────────────────────────
// removeHabitCheckinOptimistic
// ──────────────────────────────────────

test('habitsSlice: removeHabitCheckinOptimistic removes a checkin by date', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, setHabitCheckinOptimistic({
    habitId: 'h1',
    checkin: { check_in_date: '2026-09-19', status: 'completed' },
  }));

  state = habitsReducer(state, removeHabitCheckinOptimistic({
    habitId: 'h1',
    checkInDate: '2026-09-19',
  }));

  assert.equal(state.checkinsByHabit['h1'].length, 0);
});

test('habitsSlice: removeHabitCheckinOptimistic does nothing if date not found', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, setHabitCheckinOptimistic({
    habitId: 'h1',
    checkin: { check_in_date: '2026-09-19', status: 'completed' },
  }));

  state = habitsReducer(state, removeHabitCheckinOptimistic({
    habitId: 'h1',
    checkInDate: '2026-09-20', // different date
  }));

  assert.equal(state.checkinsByHabit['h1'].length, 1); // unchanged
});

// ──────────────────────────────────────
// setSingleHabit
// ──────────────────────────────────────

test('habitsSlice: setSingleHabit updates existing habit', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1', 'Old')));
  state = habitsReducer(state, setSingleHabit({ id: 'h1', name: 'Updated' }));

  assert.equal(state.items[0].name, 'Updated');
});

test('habitsSlice: setSingleHabit adds new habit if not found', () => {
  const state = habitsReducer(initialState, setSingleHabit(mockHabit('h-new', 'Brand New')));

  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].name, 'Brand New');
  assert.deepStrictEqual(state.checkinsByHabit['h-new'], []);
});

// ──────────────────────────────────────
// setSingleHabitCheckins
// ──────────────────────────────────────

test('habitsSlice: setSingleHabitCheckins replaces checkins for a habit', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  const checkins = [
    { check_in_date: '2026-09-18', status: 'completed' },
    { check_in_date: '2026-09-19', status: 'missed' },
  ];
  state = habitsReducer(state, setSingleHabitCheckins({ habitId: 'h1', checkins }));

  assert.equal(state.checkinsByHabit['h1'].length, 2);
});

// ──────────────────────────────────────
// revertHabitCheckin
// ──────────────────────────────────────

test('habitsSlice: revertHabitCheckin restores previous checkins', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  const original = [{ check_in_date: '2026-09-17', status: 'completed' }];
  state = habitsReducer(state, setSingleHabitCheckins({ habitId: 'h1', checkins: original }));

  // Simulate optimistic update
  state = habitsReducer(state, setHabitCheckinOptimistic({
    habitId: 'h1',
    checkin: { check_in_date: '2026-09-19', status: 'completed' },
  }));
  assert.equal(state.checkinsByHabit['h1'].length, 2);

  // Revert
  state = habitsReducer(state, revertHabitCheckin({ habitId: 'h1', previousCheckins: original }));
  assert.equal(state.checkinsByHabit['h1'].length, 1);
  assert.equal(state.checkinsByHabit['h1'][0].check_in_date, '2026-09-17');
});

// ──────────────────────────────────────
// Loading / Error
// ──────────────────────────────────────

test('habitsSlice: setLoading sets loading flag', () => {
  const state = habitsReducer(initialState, setLoading(true));
  assert.equal(state.loading, true);
});

test('habitsSlice: setCheckinLoading sets per-habit loading', () => {
  const state = habitsReducer(initialState, setCheckinLoading({ habitId: 'h1', loading: true }));
  assert.equal(state.checkinLoading['h1'], true);
});

test('habitsSlice: setError sets error and disables loading', () => {
  const loadingState = { ...initialState, loading: true };
  const state = habitsReducer(loadingState, setError('Database error'));
  assert.equal(state.error, 'Database error');
  assert.equal(state.loading, false);
  assert.equal(state.initialized, true);
});

test('habitsSlice: clearError resets error', () => {
  const errorState = { ...initialState, error: 'Some error' };
  const state = habitsReducer(errorState, clearError());
  assert.equal(state.error, null);
});

// ──────────────────────────────────────
// resetHabitsState
// ──────────────────────────────────────

test('habitsSlice: resetHabitsState returns to initial state', () => {
  let state = habitsReducer(initialState, addHabit(mockHabit('h1')));
  state = habitsReducer(state, setLoading(true));
  state = habitsReducer(state, setError('test'));
  state = habitsReducer(state, resetHabitsState());

  assert.deepStrictEqual(state, initialState);
});

test('habitsSlice: initialized flag lifecycle distinguishes uninitialized from empty', () => {
  // Fresh state starts uninitialized
  let state = habitsReducer(undefined, { type: 'unknown' });
  assert.equal(state.initialized, false);
  assert.equal(state.loading, false);
  assert.deepStrictEqual(state.items, []);

  // When loading starts
  state = habitsReducer(state, setLoading(true));
  assert.equal(state.initialized, false);
  assert.equal(state.loading, true);

  // When empty data finishes loading, initialized flips to true
  state = habitsReducer(state, setHabits([]));
  assert.equal(state.initialized, true);
  assert.equal(state.loading, false);
  assert.deepStrictEqual(state.items, []);

  // On logout/reset, initialized flips back to false
  state = habitsReducer(state, resetHabitsState());
  assert.equal(state.initialized, false);
});
