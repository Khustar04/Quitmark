import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * notificationService tests
 *
 * Tests the pure utility functions (isNotificationSupported, getNotificationPermission)
 * with appropriate browser environment shims.
 */

// ── Minimal browser shims ──
const _store = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key) => _store[key] ?? null,
    setItem: (key, val) => { _store[key] = String(val); },
    removeItem: (key) => { delete _store[key]; },
  };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    localStorage: globalThis.localStorage,
  };
}

if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(name, opts = {}) {
      this.type = name;
      this.detail = opts.detail || null;
    }
  };
}

// Set up session guard
import { setActiveUserId } from '../src/utils/auth/sessionGuard.js';
setActiveUserId('notif-svc-user');

const {
  isNotificationSupported,
  getNotificationPermission,
} = await import('../src/utils/notifications/notificationService.js');

// ──────────────────────────────────────
// isNotificationSupported
// ──────────────────────────────────────

test('isNotificationSupported: returns false when Notification is not in window', () => {
  // In Node.js, there's no Notification API in window
  const hasNotification = 'Notification' in globalThis.window;
  if (!hasNotification) {
    assert.equal(isNotificationSupported(), false);
  } else {
    assert.equal(isNotificationSupported(), true);
  }
});

// ──────────────────────────────────────
// getNotificationPermission
// ──────────────────────────────────────

test('getNotificationPermission: returns "unsupported" when Notification API is absent', () => {
  const hasNotification = 'Notification' in globalThis.window;
  if (!hasNotification) {
    assert.equal(getNotificationPermission(), 'unsupported');
  } else {
    const perm = getNotificationPermission();
    assert.ok(['default', 'granted', 'denied'].includes(perm));
  }
});

// ──────────────────────────────────────
// getNotificationPermission with mock
// ──────────────────────────────────────

test('getNotificationPermission: returns permission when Notification is mocked on window', () => {
  const originalWindowNotification = globalThis.window.Notification;
  const originalNotification = globalThis.Notification;

  // Mock Notification API on both window and globalThis
  const mockNotification = { permission: 'granted' };
  globalThis.window.Notification = mockNotification;
  globalThis.Notification = mockNotification;

  const perm = getNotificationPermission();
  assert.equal(perm, 'granted');

  // Change to denied
  mockNotification.permission = 'denied';
  assert.equal(getNotificationPermission(), 'denied');

  // Change to default
  mockNotification.permission = 'default';
  assert.equal(getNotificationPermission(), 'default');

  // Restore
  if (originalWindowNotification !== undefined) {
    globalThis.window.Notification = originalWindowNotification;
  } else {
    delete globalThis.window.Notification;
  }
  if (originalNotification !== undefined) {
    globalThis.Notification = originalNotification;
  } else {
    delete globalThis.Notification;
  }
});
