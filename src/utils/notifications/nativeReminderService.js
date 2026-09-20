import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getSmartReminderSchedule, getReminderMessage, REMINDER_RULES } from '../../constants/reminderRules';

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
 * Schedules smart reminders for a habit on the native device:
 * 1. Initial reminder at scheduled time
 * 2. Follow-up reminder 60m later
 * 3. Streak protection reminder before day ends (if active streak exists)
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

  const granted = await requestNativeNotificationPermission();
  if (!granted) {
    console.warn('[Quitmark] Native notification permission not granted.');
    return;
  }

  const smartSchedule = getSmartReminderSchedule(config.reminderTime);
  const baseId = stringToId(habitId);
  const isSelectedDays = config.repeatType === 'SELECTED_DAYS' && Array.isArray(config.repeatDays) && config.repeatDays.length > 0;
  const daysList = isSelectedDays ? config.repeatDays : [null];

  const notifications = [];

  daysList.forEach((dayIdx, dayOffset) => {
    smartSchedule.schedule.forEach((stage, stageIdx) => {
      // If streak protection, verify active streak exists (default true unless explicitly false)
      if (stage.type === REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION && options.hasActiveStreak === false) {
        return;
      }

      const nextDate = getNextOccurrenceDate(stage.hour, stage.minute, dayIdx);
      const msg = getReminderMessage(stage.type, habitName, stageIdx + (dayIdx || 0));
      const notifId = baseId + (dayOffset * 10) + stageIdx;

      notifications.push({
        id: notifId,
        title: msg.title,
        body: msg.body,
        channelId: HABIT_CHANNEL_ID,
        schedule: {
          at: nextDate,
          repeats: true,
          every: isSelectedDays ? 'week' : 'day',
          allowWhileIdle: true,
        },
        extra: { habitId, stageType: stage.type },
      });
    });
  });

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('[Quitmark] Failed to schedule native smart reminders:', error);
    }
  }
};

/**
 * Cancels all scheduled local notifications for a specific habit.
 */
export const cancelNativeHabitReminder = async (habitId) => {
  if (!isNativeApp()) return;
  try {
    const baseId = stringToId(habitId);
    // Cover all day offsets (0-7) and stage offsets (0-9)
    const idsToCancel = Array.from({ length: 80 }, (_, i) => ({ id: baseId + i }));
    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (error) {
    console.warn('[Quitmark] Failed to cancel native notification:', error);
  }
};

/**
 * Synchronizes all habit reminders with native Android alarms.
 * Skips scheduling for habits already completed today.
 */
export const syncAllNativeHabitReminders = async (habits, remindersMap, checkinsByHabit = {}) => {
  if (!isNativeApp() || !Array.isArray(habits)) return;
  try {
    await ensureNotificationChannel();
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const habit of habits) {
      const reminder = remindersMap[habit.id];
      const checkins = checkinsByHabit[habit.id] || [];
      const todayCheckin = checkins.find((c) => c.check_in_date && c.check_in_date.startsWith(todayStr));
      const isCompletedToday = todayCheckin?.status === 'completed';

      if (reminder && reminder.enabled && !isCompletedToday) {
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
