import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Notification Preferences tests
 *
 * Provides a localStorage shim for Node.js environment.
 */

// Shared backing store for localStorage
const _store = {};
const localStorageShim = {
  getItem: (key) => _store[key] ?? null,
  setItem: (key, val) => { _store[key] = String(val); },
  removeItem: (key) => { delete _store[key]; },
};

// Install shim globally
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = localStorageShim;
}

// Also make sure window exists and refers to the same localStorage
if (typeof globalThis.window === 'undefined') {
  globalThis.window = { localStorage: globalThis.localStorage };
} else if (!globalThis.window.localStorage) {
  globalThis.window.localStorage = globalThis.localStorage;
}

// Set a test user for scoped prefs
import { setActiveUserId } from '../src/utils/auth/sessionGuard.js';
setActiveUserId('prefs-test-user');

const {
  getNotificationPreferences,
  saveNotificationPreferences,
} = await import('../src/utils/notifications/notificationPreferences.js');

const clearPrefStorage = () => {
  for (const key of Object.keys(_store)) {
    delete _store[key];
  }
};

// ──────────────────────────────────────
// Default preferences
// ──────────────────────────────────────

test('getNotificationPreferences: returns defaults when nothing is stored', () => {
  clearPrefStorage();
  const prefs = getNotificationPreferences('fresh-user');
  assert.equal(prefs.enabled, false);
  assert.equal(prefs.streakReminders, true);
  assert.equal(prefs.morning, true);
  assert.equal(prefs.afternoon, true);
  assert.equal(prefs.evening, true);
});

// ──────────────────────────────────────
// Save and retrieve
// ──────────────────────────────────────

test('saveNotificationPreferences: persists and retrieves values', () => {
  clearPrefStorage();
  setActiveUserId('save-user');

  saveNotificationPreferences({ enabled: true, morning: false }, 'save-user');
  const prefs = getNotificationPreferences('save-user');

  assert.equal(prefs.enabled, true);
  assert.equal(prefs.morning, false);
  // Unchanged defaults preserved
  assert.equal(prefs.streakReminders, true);
  assert.equal(prefs.afternoon, true);
  assert.equal(prefs.evening, true);
});

test('saveNotificationPreferences: merges with existing preferences', () => {
  clearPrefStorage();
  setActiveUserId('merge-user');

  saveNotificationPreferences({ enabled: true }, 'merge-user');
  saveNotificationPreferences({ streakReminders: false }, 'merge-user');

  const prefs = getNotificationPreferences('merge-user');
  assert.equal(prefs.enabled, true); // from first save
  assert.equal(prefs.streakReminders, false); // from second save
});

// ──────────────────────────────────────
// User isolation
// ──────────────────────────────────────

test('preferences are isolated per user', () => {
  clearPrefStorage();

  saveNotificationPreferences({ enabled: true }, 'user-A');
  saveNotificationPreferences({ enabled: false }, 'user-B');

  const prefsA = getNotificationPreferences('user-A');
  const prefsB = getNotificationPreferences('user-B');

  assert.equal(prefsA.enabled, true);
  assert.equal(prefsB.enabled, false);
});

// ──────────────────────────────────────
// Legacy fallback
// ──────────────────────────────────────

test('getNotificationPreferences: falls back to legacy shared key', () => {
  clearPrefStorage();
  // Store in the legacy (non-scoped) key
  _store['quitmark_notification_prefs'] = JSON.stringify({ enabled: true, streakReminders: false });

  setActiveUserId('legacy-fallback-user');
  const prefs = getNotificationPreferences('legacy-fallback-user');
  assert.equal(prefs.enabled, true);
  assert.equal(prefs.streakReminders, false);
});

// ──────────────────────────────────────
// Invalid stored data
// ──────────────────────────────────────

test('getNotificationPreferences: handles corrupt JSON gracefully', () => {
  clearPrefStorage();
  setActiveUserId('corrupt-user');
  _store['quitmark_notification_prefs_corrupt-user'] = '{broken json!!!}';

  const prefs = getNotificationPreferences('corrupt-user');
  // Should return defaults without throwing
  assert.equal(prefs.enabled, false);
  assert.equal(prefs.streakReminders, true);
});
