/**
 * In-App Notification Store
 * Manages user-isolated notification history in localStorage with event dispatching
 * for reactive multi-tab and multi-component updates.
 */

import { getActiveUserId } from '../auth/sessionGuard';

const STORAGE_PREFIX = 'quitmark_in_app_notifications_';
const LEGACY_KEY = 'quitmark_in_app_notifications';
const EVENT_NAME = 'quitmark_notifications_updated';

// Format time ago helper
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Returns the storage key for a specific user ID or the current active user.
 */
export const getNotificationStorageKey = (userId) => {
  const uid = userId || getActiveUserId();
  return uid ? `${STORAGE_PREFIX}${uid}` : null;
};

// Track current active user in memory
let currentStoreUserId = null;

/**
 * Sets the active user for the notification store.
 * Dispatches an event so all subscribers re-sync to the new user's notifications.
 */
export const setNotificationUser = (userId) => {
  currentStoreUserId = userId || null;
  if (typeof window !== 'undefined') {
    // Clean up legacy unscoped key if present to eliminate old shared data
    try {
      if (localStorage.getItem(LEGACY_KEY)) {
        localStorage.removeItem(LEGACY_KEY);
      }
    } catch {
      // ignore
    }

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: {
          userId: currentStoreUserId,
          notifications: getInAppNotifications(currentStoreUserId),
        },
      })
    );
  }
};

/**
 * Retrieves all stored in-app notifications for the user, sorted latest first.
 */
export const getInAppNotifications = (userId) => {
  if (typeof window === 'undefined') return [];
  const storageKey = getNotificationStorageKey(userId || currentStoreUserId);
  if (!storageKey) return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      // Seed an initial friendly welcome notification for this specific user
      const initial = [
        {
          id: `welcome-${Date.now()}`,
          title: 'Welcome to Quitmark! 🔥',
          body: 'Track your daily habits, maintain your streaks, and unlock a better you.',
          timestamp: Date.now(),
          read: false,
          type: 'achievement',
        },
      ];
      localStorage.setItem(storageKey, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Quitmark] Failed to load in-app notifications:', err);
    return [];
  }
};

/**
 * Adds a new in-app notification and dispatches update event.
 * @param {Object} param0
 * @param {string} param0.title
 * @param {string} param0.body
 * @param {'streak' | 'reminder' | 'system' | 'achievement'} [param0.type='reminder']
 * @param {string} [param0.url]
 * @param {string} [param0.userId]
 */
export const addInAppNotification = ({
  title,
  body,
  type = 'reminder',
  url = null,
  userId = null,
}) => {
  if (typeof window === 'undefined') return null;

  const targetUserId = userId || currentStoreUserId || getActiveUserId();
  const storageKey = getNotificationStorageKey(targetUserId);
  if (!storageKey) return null;

  try {
    const current = getInAppNotifications(targetUserId);

    // Prevent identical notification spam within last 5 minutes
    const now = Date.now();
    const isDuplicate = current.some(
      (n) => n.title === title && n.body === body && now - n.timestamp < 5 * 60 * 1000
    );
    if (isDuplicate) return null;

    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title || 'Notification',
      body: body || '',
      type,
      url,
      timestamp: now,
      read: false,
    };

    // Keep last 50 notifications to prevent unbounded growth
    const updated = [newNotification, ...current].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { userId: targetUserId, notifications: updated },
      })
    );
    return newNotification;
  } catch (err) {
    console.error('[Quitmark] Failed to save in-app notification:', err);
    return null;
  }
};

/**
 * Removes a single notification by id.
 */
export const removeInAppNotification = (id, userId = null) => {
  if (typeof window === 'undefined') return;
  const targetUserId = userId || currentStoreUserId || getActiveUserId();
  const storageKey = getNotificationStorageKey(targetUserId);
  if (!storageKey) return;

  try {
    const current = getInAppNotifications(targetUserId);
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { userId: targetUserId, notifications: updated },
      })
    );
  } catch (err) {
    console.error('[Quitmark] Failed to delete in-app notification:', err);
  }
};

/**
 * Clears all in-app notifications for the target user.
 */
export const clearAllInAppNotifications = (userId = null) => {
  if (typeof window === 'undefined') return;
  const targetUserId = userId || currentStoreUserId || getActiveUserId();
  const storageKey = getNotificationStorageKey(targetUserId);
  if (!storageKey) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify([]));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { userId: targetUserId, notifications: [] },
      })
    );
  } catch (err) {
    console.error('[Quitmark] Failed to clear all in-app notifications:', err);
  }
};

/**
 * Marks all notifications as read for the target user.
 */
export const markAllInAppNotificationsAsRead = (userId = null) => {
  if (typeof window === 'undefined') return;
  const targetUserId = userId || currentStoreUserId || getActiveUserId();
  const storageKey = getNotificationStorageKey(targetUserId);
  if (!storageKey) return;

  try {
    const current = getInAppNotifications(targetUserId);
    if (!current.some((n) => !n.read)) return; // No unread items

    const updated = current.map((item) => ({ ...item, read: true }));
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { userId: targetUserId, notifications: updated },
      })
    );
  } catch (err) {
    console.error('[Quitmark] Failed to mark notifications as read:', err);
  }
};

/**
 * Returns the count of unread notifications for the target user.
 */
export const getUnreadNotificationsCount = (userId = null) => {
  const list = getInAppNotifications(userId || currentStoreUserId);
  return list.filter((n) => !n.read).length;
};

/**
 * Subscribes to notification store changes.
 * @param {Function} callback
 * @param {string} [subscribedUserId]
 * @returns {Function} unsubscribe
 */
export const subscribeToInAppNotifications = (callback, subscribedUserId = null) => {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = (e) => {
    const eventUserId = e.detail?.userId;
    const activeUid = subscribedUserId || currentStoreUserId || getActiveUserId();

    // Only update if the event belongs to this user (or if unconstrained)
    if (!eventUserId || !activeUid || eventUserId === activeUid) {
      callback(e.detail?.notifications || getInAppNotifications(activeUid));
    }
  };

  const handleStorage = (e) => {
    const activeUid = subscribedUserId || currentStoreUserId || getActiveUserId();
    const storageKey = getNotificationStorageKey(activeUid);

    if (e.key === storageKey || (activeUid && e.key === null)) {
      callback(getInAppNotifications(activeUid));
    }
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
};
