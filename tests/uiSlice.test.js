import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * uiSlice tests
 *
 * Note: uiSlice accesses `document` and `localStorage` at module load time
 * for initial theme synchronization. In a Node.js test environment, we provide
 * minimal shims to prevent crashes.
 */

// Minimal DOM shims for uiSlice module-level side effects
const store = {};
const localStorageShim = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = localStorageShim;
}

const docShim = {
  documentElement: {
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
    },
  },
};

if (typeof globalThis.document === 'undefined') {
  globalThis.document = docShim;
}

// Ensure window is defined and has localStorage
if (typeof globalThis.window === 'undefined') {
  globalThis.window = { localStorage: globalThis.localStorage };
} else if (!globalThis.window.localStorage) {
  globalThis.window.localStorage = globalThis.localStorage;
}

// Now we can safely import
const { default: uiReducer, toggleTheme, setTheme, toggleMobileNav, closeMobileNav } = await import('../src/store/slices/uiSlice.js');

// ──────────────────────────────────────
// Initial state
// ──────────────────────────────────────

test('uiSlice: initial state has theme and mobileNavOpen', () => {
  const state = uiReducer(undefined, { type: 'unknown' });
  assert.ok(state.theme === 'dark' || state.theme === 'light');
  assert.equal(state.mobileNavOpen, false);
});

// ──────────────────────────────────────
// toggleTheme
// ──────────────────────────────────────

test('uiSlice: toggleTheme switches dark to light', () => {
  const state = uiReducer({ theme: 'dark', mobileNavOpen: false }, toggleTheme());
  assert.equal(state.theme, 'light');
});

test('uiSlice: toggleTheme switches light to dark', () => {
  const state = uiReducer({ theme: 'light', mobileNavOpen: false }, toggleTheme());
  assert.equal(state.theme, 'dark');
});

test('uiSlice: toggleTheme persists to localStorage', () => {
  uiReducer({ theme: 'dark', mobileNavOpen: false }, toggleTheme());
  // The reducer calls localStorage.setItem('quitmark_theme', nextTheme)
  assert.equal(globalThis.localStorage.getItem('quitmark_theme'), 'light');
});

// ──────────────────────────────────────
// setTheme
// ──────────────────────────────────────

test('uiSlice: setTheme sets to light', () => {
  const state = uiReducer({ theme: 'dark', mobileNavOpen: false }, setTheme('light'));
  assert.equal(state.theme, 'light');
});

test('uiSlice: setTheme sets to dark', () => {
  const state = uiReducer({ theme: 'light', mobileNavOpen: false }, setTheme('dark'));
  assert.equal(state.theme, 'dark');
});

test('uiSlice: setTheme with invalid value defaults to dark', () => {
  const state = uiReducer({ theme: 'light', mobileNavOpen: false }, setTheme('invalid'));
  assert.equal(state.theme, 'dark');
});

// ──────────────────────────────────────
// Mobile nav
// ──────────────────────────────────────

test('uiSlice: toggleMobileNav flips the flag', () => {
  const s1 = uiReducer({ theme: 'dark', mobileNavOpen: false }, toggleMobileNav());
  assert.equal(s1.mobileNavOpen, true);

  const s2 = uiReducer(s1, toggleMobileNav());
  assert.equal(s2.mobileNavOpen, false);
});

test('uiSlice: closeMobileNav sets flag to false', () => {
  const state = uiReducer({ theme: 'dark', mobileNavOpen: true }, closeMobileNav());
  assert.equal(state.mobileNavOpen, false);
});

test('uiSlice: closeMobileNav is idempotent when already closed', () => {
  const state = uiReducer({ theme: 'dark', mobileNavOpen: false }, closeMobileNav());
  assert.equal(state.mobileNavOpen, false);
});
