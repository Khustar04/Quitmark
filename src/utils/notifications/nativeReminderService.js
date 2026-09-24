import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getSmartReminderSchedule, getReminderMessage, REMINDER_RULES } from '../../constants/reminderRules';
import { getNotificationPreferences, isNotificationsGloballyEnabled } from './notificationPreferences';

export const HABIT_CHANNEL_ID = 'habit-reminders';
const ROLLING_WINDOW_DAYS = 14;

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
 * Checks if notification permission is already granted on native Android/iOS system.
 */
export const checkNativeNotificationPermission = async () => {
  if (!isNativeApp()) return false;
  try {
    const check = await LocalNotifications.checkPermissions();
    return check.display === 'granted';
  } catch (error) {
    console.warn('[Quitmark] Native permission check failed:', error);
    return false;
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
 * Schedules smart reminders for a habit on the native device:
 * Uses a rolling window of exact alarms (with allowWhileIdle: true and without repeats: true).
 * This ensures Android AlarmManager uses setExactAndAllowWhileIdle(RTC_WAKEUP), waking the device
 * and triggering notifications even when the app is minimized or completely closed.
 */
export const scheduleNativeHabitReminder = async (habitId, habitName, config, options = {}) => {
  if (!isNativeApp()) return;

  // Always ensure channel exists before scheduling
  await ensureNotificationChannel();

  // Cancel any existing schedule for this habit first
  await cancelNativeHabitReminder(habitId);

  if (!config || config.enabled === false || !config.reminderTime) {
    return;
  }

  // Respect global notification toggle
  if (!isNotificationsGloballyEnabled(options.userId)) {
    return;
  }

  const granted = await requestNativeNotificationPermission();
  if (!granted) {
    console.warn('[Quitmark] Native notification permission not granted.');
    return;
  }

  const smartSchedule = getSmartReminderSchedule(config.reminderTime);
  const baseId = stringToId(habitId);
  const isSelectedDays = config.repeatType === 'SELECTED_DAYS' && Array.isArray(config.repeatDays) && config.repeatDays.length > 0;

  const notifications = [];
  const now = new Date();

  // Schedule exact alarms for the next ROLLING_WINDOW_DAYS (14 days)
  for (let dayOffset = 0; dayOffset < ROLLING_WINDOW_DAYS; dayOffset++) {
    const targetCalendarDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    const dayOfWeek = targetCalendarDate.getDay(); // 0 (Sun) to 6 (Sat)

    if (isSelectedDays && !config.repeatDays.includes(dayOfWeek)) {
      continue; // User opted out of this weekday
    }

    // If dayOffset === 0 (today) and habit is already completed today, skip today's alarms
    if (dayOffset === 0 && options.isCompletedToday) {
      continue;
    }

    smartSchedule.schedule.forEach((stage, stageIdx) => {
      // If streak protection, verify active streak exists (default true unless explicitly false)
      if (stage.type === REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION && options.hasActiveStreak === false) {
        return;
      }

      const stageDate = new Date(
        targetCalendarDate.getFullYear(),
        targetCalendarDate.getMonth(),
        targetCalendarDate.getDate(),
        stage.hour,
        stage.minute,
        0,
        0
      );

      // If scheduled time on day 0 is already in the past, skip
      if (dayOffset === 0 && stageDate.getTime() <= now.getTime() + 5000) {
        return;
      }

      const msg = getReminderMessage(stage.type, habitName, stageIdx + dayOffset);
      const notifId = baseId + (dayOffset * 10) + stageIdx;

      notifications.push({
        id: notifId,
        title: msg.title,
        body: msg.body,
        channelId: HABIT_CHANNEL_ID,
        schedule: {
          at: stageDate,
          allowWhileIdle: true,
        },
        extra: { habitId, stageType: stage.type, dayOffset },
      });
    });
  }

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('[Quitmark] Failed to schedule native smart reminders:', error);
    }
  }
};

/**
 * Cancels all scheduled local notifications for a specific habit across the rolling window.
 */
export const cancelNativeHabitReminder = async (habitId) => {
  if (!isNativeApp()) return;
  try {
    const baseId = stringToId(habitId);
    // Cover all day offsets (0-15) and stage offsets (0-9)
    const idsToCancel = Array.from({ length: 160 }, (_, i) => ({ id: baseId + i }));
    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (error) {
    console.warn('[Quitmark] Failed to cancel native notification:', error);
  }
};

/**
 * Cancels only today's remaining alarms for a habit (e.g. upon completion),
 * preserving future days' scheduled reminders so the user is reminded tomorrow.
 */
export const cancelTodayNativeHabitReminder = async (habitId) => {
  if (!isNativeApp()) return;
  try {
    const baseId = stringToId(habitId);
    // Day offset 0 uses indices baseId + 0, 1, 2
    const idsToCancel = Array.from({ length: 10 }, (_, i) => ({ id: baseId + i }));
    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (error) {
    console.warn('[Quitmark] Failed to cancel today native notification:', error);
  }
};

/**
 * Cancels ALL scheduled local notifications in the entire app.
 * Used when the user turns notifications OFF globally.
 */
export const cancelAllNativeReminders = async () => {
  if (!isNativeApp()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending && Array.isArray(pending.notifications) && pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (error) {
    console.warn('[Quitmark] Failed to cancel all native reminders:', error);
  }
};

/**
 * Synchronizes all habit reminders with native Android alarms.
 * Skips scheduling today's reminders for habits already completed today,
 * but keeps tomorrow and future rolling window days scheduled.
 */
export const syncAllNativeHabitReminders = async (habits, remindersMap, checkinsByHabit = {}, options = {}) => {
  if (!isNativeApp() || !Array.isArray(habits)) return;
  try {
    await ensureNotificationChannel();

    // If notifications are turned off globally by user, clear all alarms
    const prefs = getNotificationPreferences(options.userId);
    if (!prefs.enabled) {
      await cancelAllNativeReminders();
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const habit of habits) {
      const reminder = remindersMap[habit.id];
      const checkins = checkinsByHabit[habit.id] || [];
      const todayCheckin = checkins.find((c) => c.check_in_date && c.check_in_date.startsWith(todayStr));
      const isCompletedToday = todayCheckin?.status === 'completed';

      if (reminder && reminder.enabled) {
        await scheduleNativeHabitReminder(
          habit.id,
          habit.name,
          {
            enabled: true,
            reminderTime: reminder.reminder_time,
            repeatType: reminder.repeat_type,
            repeatDays: reminder.repeat_days,
          },
          {
            isCompletedToday,
            userId: options.userId,
          }
        );
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
