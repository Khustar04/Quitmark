import test from 'node:test';
import assert from 'node:assert/strict';

// ──────────────────────────────────────
// authSlice reducer tests
// ──────────────────────────────────────
import authReducer, {
  setAuth,
  clearAuth,
  setLoading,
  setError,
  clearError,
} from '../src/store/slices/authSlice.js';

const initialState = {
  user: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,
};

test('authSlice: initial state is correct', () => {
  const state = authReducer(undefined, { type: 'unknown' });
  assert.deepStrictEqual(state, initialState);
});

test('authSlice: setAuth sets user, session, initialized and clears error', () => {
  const mockUser = { id: 'user-1', email: 'test@test.com' };
  const mockSession = { access_token: 'token-123' };
  const state = authReducer(initialState, setAuth({ user: mockUser, session: mockSession }));

  assert.deepStrictEqual(state.user, mockUser);
  assert.deepStrictEqual(state.session, mockSession);
  assert.equal(state.initialized, true);
  assert.equal(state.loading, false);
  assert.equal(state.error, null);
});

test('authSlice: setAuth with null user sets user to null', () => {
  const state = authReducer(initialState, setAuth({ user: null, session: null }));
  assert.equal(state.user, null);
  assert.equal(state.session, null);
  assert.equal(state.initialized, true);
});

test('authSlice: clearAuth resets user and session', () => {
  const loggedInState = {
    user: { id: 'user-1' },
    session: { token: 'abc' },
    loading: false,
    initialized: true,
    error: null,
  };
  const state = authReducer(loggedInState, clearAuth());
  assert.equal(state.user, null);
  assert.equal(state.session, null);
  assert.equal(state.initialized, true);
  assert.equal(state.loading, false);
  assert.equal(state.error, null);
});

test('authSlice: setLoading sets loading flag', () => {
  const state = authReducer(initialState, setLoading(true));
  assert.equal(state.loading, true);

  const state2 = authReducer(state, setLoading(false));
  assert.equal(state2.loading, false);
});

test('authSlice: setLoading coerces to boolean', () => {
  const state = authReducer(initialState, setLoading(1));
  assert.equal(state.loading, true);

  const state2 = authReducer(state, setLoading(0));
  assert.equal(state2.loading, false);
});

test('authSlice: setError sets error and disables loading', () => {
  const loadingState = { ...initialState, loading: true };
  const state = authReducer(loadingState, setError('Something failed'));
  assert.equal(state.error, 'Something failed');
  assert.equal(state.loading, false);
});

test('authSlice: clearError resets error to null', () => {
  const errorState = { ...initialState, error: 'Something failed' };
  const state = authReducer(errorState, clearError());
  assert.equal(state.error, null);
});
