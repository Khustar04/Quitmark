import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const HABIT_CHANNEL_ID = 'habit-reminders';

/**
 * Checks if running inside native Android/iOS app via Capacitor.
 */
export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Generates a stable 32-bit positive integer from a habit UUID/string ID.
 */
const stringToId = (str, extraOffset = 0) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 2000000000) + extraOffset;
};

/**
 * Creates the required Android Notification Channel (Android 8.0+ / API 26+).
 * High importance ensures sound, vibration, and heads-up banner display.
 */
export const ensureNotificationChannel = async () => {
  if (!isNativeApp()) return;
  try {
    await LocalNotifications.createChannel({
      id: HABIT_CHANNEL_ID,
      name: 'Habit Reminders',
      description: 'Reminders for daily habits and streaks',
      importance: 5, // High / Max importance (shows banner + plays sound)
      visibility: 1, // Public on lock screen
      vibration: true,
      lights: true,
      lightColor: '#10B981',
    });
  } catch (err) {
    console.warn('[Quitmark] Failed to create notification channel:', err);
  }
};

/**
 * Requests notification permission from native Android/iOS system.
 */
export const requestNativeNotificationPermission = async () => {
  if (!isNativeApp()) return false;
  try {
    let check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') {
      const request = await LocalNotifications.requestPermissions();
      check = request;
    }
    return check.display === 'granted';
  } catch (error) {
    console.error('[Quitmark] Native permission request failed:', error);
    return false;
  }
};

/**
 * Computes next occurrence Date for a given hour and minute.
 * If target time today is still in the future (by at least 5 seconds), returns today at hour:minute.
 * Otherwise returns tomorrow at hour:minute.
 */
const getNextOccurrenceDate = (hour, minute, dayOfWeek = null) => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (dayOfWeek !== null) {
    // dayOfWeek is 0 (Sunday) to 6 (Saturday)
    const currentDay = now.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    if (daysUntil === 0 && target.getTime() <= now.getTime() + 5000) {
      daysUntil = 7;
    }
    target.setDate(now.getDate() + daysUntil);
  } else {
    // Daily
    if (target.getTime() <= now.getTime() + 5000) {
      target.setDate(target.getDate() + 1);
    }
  }

  return target;
};

/**
 * Schedules a local notification for a habit on the native device.
 * Uses exact trigger time + Android AlarmManager so it rings even when app is closed.
 */
export const scheduleNativeHabitReminder = async (habitId, habitName, config) => {
  if (!isNativeApp()) return;

  // Always ensure channel exists before scheduling
  await ensureNotificationChannel();

  // Cancel any existing schedule for this habit first
  await cancelNativeHabitReminder(habitId);

  if (!config || config.enabled === false || !config.reminderTime) {
    return;
  }

  const [rawHour = '07', rawMinute = '00'] = config.reminderTime.split(':');
  const hour = parseInt(rawHour, 10);
  const minute = parseInt(rawMinute, 10);

  const granted = await requestNativeNotificationPermission();
  if (!granted) {
    console.warn('[Quitmark] Native notification permission not granted.');
    return;
  }

  const baseId = stringToId(habitId);
  const title = 'Quitmark Reminder';
  const body = `Time to check in: ${habitName || 'your habit'}! Keep your streak alive 🔥`;

  try {
    if (config.repeatType === 'SELECTED_DAYS' && Array.isArray(config.repeatDays) && config.repeatDays.length > 0) {
      const notifications = config.repeatDays.map((dayIdx, index) => {
        const nextDate = getNextOccurrenceDate(hour, minute, dayIdx);
        return {
          id: baseId + index,
          title,
          body,
          channelId: HABIT_CHANNEL_ID,
          schedule: {
            at: nextDate,
            repeats: true,
            every: 'week',
            allowWhileIdle: true,
          },
          extra: { habitId },
        };
      });

      await LocalNotifications.schedule({ notifications });
    } else {
      // Daily repeat
      const nextDate = getNextOccurrenceDate(hour, minute);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: baseId,
            title,
            body,
            channelId: HABIT_CHANNEL_ID,
            schedule: {
              at: nextDate,
              repeats: true,
              every: 'day',
              allowWhileIdle: true,
            },
            extra: { habitId },
          },
        ],
      });
    }
  } catch (error) {
    console.error('[Quitmark] Failed to schedule native notification:', error);
  }
};

/**
 * Cancels all scheduled local notifications for a specific habit.
 */
export const cancelNativeHabitReminder = async (habitId) => {
  if (!isNativeApp()) return;
  try {
    const baseId = stringToId(habitId);
    const idsToCancel = Array.from({ length: 8 }, (_, i) => ({ id: baseId + i }));
    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (error) {
    console.warn('[Quitmark] Failed to cancel native notification:', error);
  }
};

/**
 * Synchronizes all habit reminders with native Android alarms.
 */
export const syncAllNativeHabitReminders = async (habits, remindersMap) => {
  if (!isNativeApp() || !Array.isArray(habits)) return;
  try {
    await ensureNotificationChannel();
    for (const habit of habits) {
      const reminder = remindersMap[habit.id];
      if (reminder && reminder.enabled) {
        await scheduleNativeHabitReminder(habit.id, habit.name, {
          enabled: true,
          reminderTime: reminder.reminder_time,
          repeatType: reminder.repeat_type,
          repeatDays: reminder.repeat_days,
        });
      } else {
        await cancelNativeHabitReminder(habit.id);
      }
    }
  } catch (error) {
    console.error('[Quitmark] Failed to sync native reminders:', error);
  }
};

/**
 * Fires a test notification in X seconds to verify system sounds and banners.
 */
export const sendImmediateTestNotification = async (delaySeconds = 5) => {
  if (!isNativeApp()) return false;
  try {
    await ensureNotificationChannel();
    const granted = await requestNativeNotificationPermission();
    if (!granted) return false;

    const testDate = new Date(Date.now() + delaySeconds * 1000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999999,
          title: 'Quitmark Test Notification 🚀',
          body: 'Habit reminder notifications are working perfectly on your device!',
          channelId: HABIT_CHANNEL_ID,
          schedule: {
            at: testDate,
            allowWhileIdle: true,
          },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error('[Quitmark] Failed to send test notification:', err);
    return false;
  }
};
