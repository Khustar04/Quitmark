/**
 * Centralized Reminder Configuration & Smart Rules
 *
 * Duolingo-style automatic reminder cycle:
 * 1. Initial reminder at scheduled reminder_time.
 * 2. Gentle follow-up 60 minutes later if incomplete.
 * 3. Streak protection alert before day ends if incomplete and active streak > 0.
 * 4. Completion stops the reminder cycle for the day.
 */

export const REMINDER_RULES = {
  FOLLOW_UP_DELAY_MINUTES: 60,
  MAX_REMINDERS_PER_HABIT_PER_DAY: 3,
  STREAK_WARNING_ENABLED: true,
  STREAK_PROTECTION_DEFAULT_HOUR: 21, // 9:00 PM local time
  STREAK_PROTECTION_DEFAULT_MINUTE: 0,
  REMINDER_TYPES: {
    INITIAL: 'INITIAL',
    FOLLOW_UP: 'FOLLOW_UP',
    STREAK_PROTECTION: 'STREAK_PROTECTION',
  },
};

/**
 * Parses a "HH:MM:SS" or "HH:MM" 24-hour time string into total minutes from midnight.
 *
 * @param {string} timeStr - e.g. "19:00" or "07:30:00"
 * @returns {{ hour: number, minute: number, totalMinutes: number, formatted: string }}
 */
export const parseTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hour: 7, minute: 0, totalMinutes: 420, formatted: '07:00' };
  }
  const parts = timeStr.split(':');
  const hour = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0));
  const minute = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
  const totalMinutes = hour * 60 + minute;
  const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { hour, minute, totalMinutes, formatted };
};

/**
 * Formats total minutes from midnight to "HH:MM".
 *
 * @param {number} totalMinutes
 * @returns {string}
 */
export const formatMinutesToTime = (totalMinutes) => {
  const bounded = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Computes the full smart reminder schedule for a given habit reminder time.
 * Returns up to MAX_REMINDERS_PER_HABIT_PER_DAY (3) occurrences within the same calendar day:
 * 1. Initial reminder (at reminderTime)
 * 2. Follow-up reminder (at reminderTime + FOLLOW_UP_DELAY_MINUTES, if < 24:00)
 * 3. Streak protection reminder (at max(21:00, followUp + 60m), capped before midnight)
 *
 * @param {string} reminderTimeStr - "HH:MM:SS" or "HH:MM"
 * @returns {{
 *   initial: { hour: number, minute: number, timeStr: string },
 *   followUp: { hour: number, minute: number, timeStr: string } | null,
 *   streakProtection: { hour: number, minute: number, timeStr: string } | null,
 *   schedule: Array<{ type: string, hour: number, minute: number, timeStr: string }>
 * }}
 */
export const getSmartReminderSchedule = (reminderTimeStr) => {
  const initial = parseTimeString(reminderTimeStr);
  const initialEntry = {
    type: REMINDER_RULES.REMINDER_TYPES.INITIAL,
    hour: initial.hour,
    minute: initial.minute,
    timeStr: initial.formatted,
  };

  const schedule = [initialEntry];

  // 1. Follow-up reminder: initial + FOLLOW_UP_DELAY_MINUTES
  const followUpMinutes = initial.totalMinutes + REMINDER_RULES.FOLLOW_UP_DELAY_MINUTES;
  let followUpEntry = null;

  // Must occur on the same day (< 24 hours)
  if (followUpMinutes < 24 * 60) {
    const fh = Math.floor(followUpMinutes / 60);
    const fm = followUpMinutes % 60;
    followUpEntry = {
      type: REMINDER_RULES.REMINDER_TYPES.FOLLOW_UP,
      hour: fh,
      minute: fm,
      timeStr: formatMinutesToTime(followUpMinutes),
    };
    schedule.push(followUpEntry);
  }

  // 2. Streak protection reminder:
  // Must be later in the day, after follow-up, and before midnight.
  let streakProtectionEntry = null;
  if (REMINDER_RULES.STREAK_WARNING_ENABLED) {
    const defaultProtectionMinutes =
      REMINDER_RULES.STREAK_PROTECTION_DEFAULT_HOUR * 60 +
      REMINDER_RULES.STREAK_PROTECTION_DEFAULT_MINUTE;

    // Minimum 45-60 mins after followUp if followUp is already late
    const minAfterFollowUp = followUpEntry
      ? followUpMinutes + REMINDER_RULES.FOLLOW_UP_DELAY_MINUTES
      : initial.totalMinutes + REMINDER_RULES.FOLLOW_UP_DELAY_MINUTES;

    const streakMinutes = Math.max(defaultProtectionMinutes, minAfterFollowUp);

    // Capped at 23:30 so it strictly falls within the current day
    if (streakMinutes <= 23 * 60 + 30 && streakMinutes > (followUpEntry ? followUpMinutes : initial.totalMinutes)) {
      const sh = Math.floor(streakMinutes / 60);
      const sm = streakMinutes % 60;
      streakProtectionEntry = {
        type: REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION,
        hour: sh,
        minute: sm,
        timeStr: formatMinutesToTime(streakMinutes),
      };
      if (schedule.length < REMINDER_RULES.MAX_REMINDERS_PER_HABIT_PER_DAY) {
        schedule.push(streakProtectionEntry);
      }
    }
  }

  return {
    initial: initialEntry,
    followUp: followUpEntry,
    streakProtection: streakProtectionEntry,
    schedule,
  };
};

/**
 * Concise, motivational notification message templates per reminder type.
 */
export const REMINDER_MESSAGES = {
  [REMINDER_RULES.REMINDER_TYPES.INITIAL]: [
    (name) => ({ title: 'Quitmark Reminder', body: `Time for your ${name} 🌱` }),
    (name) => ({ title: 'Quitmark Reminder', body: `Your ${name} time is here 💪` }),
    (name) => ({ title: 'Quitmark Reminder', body: `Ready to keep your streak going with ${name}? 🔥` }),
  ],
  [REMINDER_RULES.REMINDER_TYPES.FOLLOW_UP]: [
    (name) => ({ title: 'Gentle Reminder', body: `Your ${name} is still waiting for you.` }),
    (name) => ({ title: 'Gentle Reminder', body: `There's still time to complete ${name} today.` }),
    (name) => ({ title: 'Gentle Reminder', body: `Don't forget your ${name} today.` }),
  ],
  [REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION]: [
    (name) => ({ title: '🔥 Streak at Risk!', body: `Your streak is at risk 🔥 Complete ${name} before the day ends.` }),
    (name) => ({ title: '🔥 Protect Your Streak', body: `Complete ${name} before midnight to keep your streak alive!` }),
    (name) => ({ title: '🔥 Streak at Risk!', body: `One more step to protect your ${name} streak.` }),
  ],
};

/**
 * Selects a motivational message variation deterministically or by seed.
 *
 * @param {string} reminderType - 'INITIAL', 'FOLLOW_UP', or 'STREAK_PROTECTION'
 * @param {string} habitName - Name of the habit
 * @param {number} [seed=0] - Optional seed/index to vary the message
 * @returns {{ title: string, body: string }}
 */
export const getReminderMessage = (reminderType, habitName = 'habit', seed = 0) => {
  const templates = REMINDER_MESSAGES[reminderType] || REMINDER_MESSAGES[REMINDER_RULES.REMINDER_TYPES.INITIAL];
  const idx = Math.abs(seed) % templates.length;
  const name = habitName || 'habit';
  return templates[idx](name);
};
