import { getActiveUserId } from '../auth/sessionGuard';

const PREFS_KEY_BASE = 'quitmark_notification_prefs';

const getPrefsKey = (userId) => {
  const uid = userId || getActiveUserId();
  return uid ? `${PREFS_KEY_BASE}_${uid}` : PREFS_KEY_BASE;
};

const defaultPreferences = {
  enabled: false,
  streakReminders: true,
  morning: true,
  afternoon: true,
  evening: true,
};

export const getNotificationPreferences = (userId = null) => {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const key = getPrefsKey(userId);
    let stored = localStorage.getItem(key);
    // If not found in user-scoped key, check legacy shared key as fallback
    if (!stored && key !== PREFS_KEY_BASE) {
      stored = localStorage.getItem(PREFS_KEY_BASE);
    }

    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }

    // If browser/device permission is already granted on this device, default enabled to true
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      return { ...defaultPreferences, enabled: true };
    }
  } catch (error) {
    console.error('Failed to parse notification preferences', error);
  }

  return defaultPreferences;
};

export const isNotificationsGloballyEnabled = (userId = null) => {
  const prefs = getNotificationPreferences(userId);
  return Boolean(prefs?.enabled);
};

export const saveNotificationPreferences = (newPrefs, userId = null) => {
  if (typeof window === 'undefined') return;

  try {
    const key = getPrefsKey(userId);
    const current = getNotificationPreferences(userId);
    const updated = { ...current, ...newPrefs };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save notification preferences', error);
  }
};
