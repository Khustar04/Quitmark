import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * In-App Notification Store tests
 *
 * We provide minimal browser environment shims (localStorage, window event
 * dispatching) so the module can run in Node.js without JSDOM.
 */

// ── Minimal browser shims ──
const storage = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { for (const k of Object.keys(storage)) delete storage[k]; },
  };
}

// Track dispatched events
const dispatchedEvents = [];
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: (e) => { dispatchedEvents.push(e); },
  };
}

// Ensure existing window has dispatchEvent
if (!globalThis.window.dispatchEvent) {
  globalThis.window.dispatchEvent = (e) => { dispatchedEvents.push(e); };
}

// Provide CustomEvent if not available (Node.js)
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(name, opts = {}) {
      this.type = name;
      this.detail = opts.detail || null;
    }
  };
}

// Reset session guard before importing notification store
import { setActiveUserId } from '../src/utils/auth/sessionGuard.js';
setActiveUserId('test-user-001');

const {
  formatTimeAgo,
  getNotificationStorageKey,
  setNotificationUser,
  getInAppNotifications,
  addInAppNotification,
  removeInAppNotification,
  clearAllInAppNotifications,
  markAllInAppNotificationsAsRead,
  getUnreadNotificationsCount,
} = await import('../src/utils/notifications/inAppNotificationStore.js');

// Helper: clear storage between tests
const clearStorage = () => {
  for (const key of Object.keys(storage)) {
    delete storage[key];
  }
};

// ──────────────────────────────────────
// formatTimeAgo
// ──────────────────────────────────────

test('formatTimeAgo: returns "Just now" for null/undefined', () => {
  assert.equal(formatTimeAgo(null), 'Just now');
  assert.equal(formatTimeAgo(undefined), 'Just now');
});

test('formatTimeAgo: returns "Just now" for recent timestamp', () => {
  assert.equal(formatTimeAgo(Date.now()), 'Just now');
});

test('formatTimeAgo: returns minutes ago', () => {
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  assert.equal(formatTimeAgo(fiveMinAgo), '5m ago');
});

test('formatTimeAgo: returns hours ago', () => {
  const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
  assert.equal(formatTimeAgo(threeHoursAgo), '3h ago');
});

test('formatTimeAgo: returns "Yesterday"', () => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  assert.equal(formatTimeAgo(oneDayAgo), 'Yesterday');
});

test('formatTimeAgo: returns days ago for 2-6 days', () => {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  assert.equal(formatTimeAgo(threeDaysAgo), '3d ago');
});

test('formatTimeAgo: returns formatted date for 7+ days', () => {
  const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
  const result = formatTimeAgo(tenDaysAgo);
  // Should be a formatted date like "Sep 10"
  assert.ok(typeof result === 'string' && result.length > 0);
  assert.ok(!result.includes('ago'));
});

// ──────────────────────────────────────
// getNotificationStorageKey
// ──────────────────────────────────────

test('getNotificationStorageKey: returns key with user id', () => {
  const key = getNotificationStorageKey('user-xyz');
  assert.equal(key, 'quitmark_in_app_notifications_user-xyz');
});

test('getNotificationStorageKey: uses active user when no id provided', () => {
  setActiveUserId('fallback-user');
  const key = getNotificationStorageKey();
  assert.equal(key, 'quitmark_in_app_notifications_fallback-user');
});

test('getNotificationStorageKey: returns null when no user', () => {
  setActiveUserId(null);
  const key = getNotificationStorageKey(null);
  assert.equal(key, null);
  setActiveUserId('test-user-001'); // restore
});

// ──────────────────────────────────────
// getInAppNotifications
// ──────────────────────────────────────

test('getInAppNotifications: seeds welcome notification for new user', () => {
  clearStorage();
  setNotificationUser('new-test-user');
  const notifs = getInAppNotifications('new-test-user');
  assert.equal(notifs.length, 1);
  assert.ok(notifs[0].title.includes('Welcome'));
  assert.equal(notifs[0].type, 'achievement');
  assert.equal(notifs[0].read, false);
});

test('getInAppNotifications: returns stored notifications', () => {
  clearStorage();
  const testKey = 'quitmark_in_app_notifications_stored-user';
  const mockNotifs = [{ id: 'n1', title: 'Test', body: 'Body', timestamp: Date.now(), read: false }];
  storage[testKey] = JSON.stringify(mockNotifs);

  const notifs = getInAppNotifications('stored-user');
  assert.equal(notifs.length, 1);
  assert.equal(notifs[0].id, 'n1');
});

test('getInAppNotifications: returns empty array for invalid JSON', () => {
  clearStorage();
  const testKey = 'quitmark_in_app_notifications_bad-json-user';
  storage[testKey] = 'not valid json!!!';

  const notifs = getInAppNotifications('bad-json-user');
  assert.deepStrictEqual(notifs, []);
});

// ──────────────────────────────────────
// addInAppNotification
// ──────────────────────────────────────

test('addInAppNotification: adds a notification', () => {
  clearStorage();
  setNotificationUser('add-test-user');

  const result = addInAppNotification({
    title: 'New Streak!',
    body: 'You hit 5 days!',
    type: 'streak',
    userId: 'add-test-user',
  });

  assert.ok(result !== null);
  assert.equal(result.title, 'New Streak!');
  assert.equal(result.type, 'streak');
  assert.equal(result.read, false);

  const notifs = getInAppNotifications('add-test-user');
  // First one is the new notification (prepended), second is welcome
  assert.ok(notifs.length >= 2);
  assert.equal(notifs[0].title, 'New Streak!');
});

test('addInAppNotification: prevents duplicate within 5 minutes', () => {
  clearStorage();
  setNotificationUser('dup-test-user');

  addInAppNotification({
    title: 'Duplicate Test',
    body: 'Same content',
    userId: 'dup-test-user',
  });

  const result = addInAppNotification({
    title: 'Duplicate Test',
    body: 'Same content',
    userId: 'dup-test-user',
  });

  assert.equal(result, null); // rejected as duplicate
});

test('addInAppNotification: caps at 50 notifications', () => {
  clearStorage();
  setNotificationUser('cap-test-user');

  // Add 55 unique notifications
  for (let i = 0; i < 55; i++) {
    addInAppNotification({
      title: `Notification ${i}`,
      body: `Body ${i}`,
      userId: 'cap-test-user',
    });
  }

  const notifs = getInAppNotifications('cap-test-user');
  assert.ok(notifs.length <= 50, `Expected ≤50 notifications, got ${notifs.length}`);
});

// ──────────────────────────────────────
// removeInAppNotification
// ──────────────────────────────────────

test('removeInAppNotification: removes by id', () => {
  clearStorage();
  setNotificationUser('remove-test-user');
  const added = addInAppNotification({
    title: 'Will Remove',
    body: 'Bye',
    userId: 'remove-test-user',
  });

  removeInAppNotification(added.id, 'remove-test-user');

  const notifs = getInAppNotifications('remove-test-user');
  const found = notifs.find(n => n.id === added.id);
  assert.equal(found, undefined);
});

// ──────────────────────────────────────
// clearAllInAppNotifications
// ──────────────────────────────────────

test('clearAllInAppNotifications: empties the notification list', () => {
  clearStorage();
  setNotificationUser('clear-test-user');
  addInAppNotification({ title: 'A', body: 'B', userId: 'clear-test-user' });

  clearAllInAppNotifications('clear-test-user');

  const notifs = getInAppNotifications('clear-test-user');
  assert.equal(notifs.length, 0);
});

// ──────────────────────────────────────
// markAllInAppNotificationsAsRead
// ──────────────────────────────────────

test('markAllInAppNotificationsAsRead: marks all as read', () => {
  clearStorage();
  setNotificationUser('read-test-user');
  addInAppNotification({ title: 'Unread 1', body: 'A', userId: 'read-test-user' });
  addInAppNotification({ title: 'Unread 2', body: 'B', userId: 'read-test-user' });

  markAllInAppNotificationsAsRead('read-test-user');

  const notifs = getInAppNotifications('read-test-user');
  const unread = notifs.filter(n => !n.read);
  assert.equal(unread.length, 0);
});

// ──────────────────────────────────────
// getUnreadNotificationsCount
// ──────────────────────────────────────

test('getUnreadNotificationsCount: returns count of unread', () => {
  clearStorage();
  setNotificationUser('count-test-user');
  addInAppNotification({ title: 'One', body: 'A', userId: 'count-test-user' });
  addInAppNotification({ title: 'Two', body: 'B', userId: 'count-test-user' });

  const count = getUnreadNotificationsCount('count-test-user');
  // Welcome + 2 added = 3 unread
  assert.ok(count >= 2);
});

test('getUnreadNotificationsCount: returns 0 after marking all as read', () => {
  clearStorage();
  setNotificationUser('zero-count-user');
  addInAppNotification({ title: 'X', body: 'Y', userId: 'zero-count-user' });
  markAllInAppNotificationsAsRead('zero-count-user');

  const count = getUnreadNotificationsCount('zero-count-user');
  assert.equal(count, 0);
});
