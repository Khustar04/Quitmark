import { getNotificationPermission } from './notificationService';
import { isStreakAtRisk } from './isStreakAtRisk';
import { getNotificationPreferences } from './notificationPreferences';

// Maintain a session-level set of habit IDs that have already triggered a notification
// to strictly prevent repeated spamming during re-renders or page activity.
const notifiedHabitIds = new Set();

/**
 * Checks all habits and triggers a browser notification for any habit
 * whose streak is actively at risk today.
 *
 * Requirements enforced:
 * - Only runs if notification permission is granted.
 * - Only runs if streakReminders preference is enabled.
 * - Only notifies if the streak is at risk (via isStreakAtRisk).
 * - Prevents duplicate notifications per session.
 *
 * @param {Array} habits - List of user habit objects
 * @param {Object} checkinsByHabit - Map of habitId -> array of check-in records
 */
export const checkAndNotifyStreakRisks = (habits = [], checkinsByHabit = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (getNotificationPermission() !== 'granted') return;
  
  const prefs = getNotificationPreferences();
  if (!prefs.streakReminders) return;

  habits.forEach((habit) => {
    if (!habit || !habit.id) return;

    // Prevent duplicate notifications in the same session
    if (notifiedHabitIds.has(habit.id)) {
      return;
    }

    const checkins = checkinsByHabit[habit.id] || [];

    // Trigger notification if the streak is at risk
    if (isStreakAtRisk(checkins)) {
      try {
        new Notification(`Habit: ${habit.name}`, {
          body: '🔥 Your streak is at risk. Check in today to keep it alive.',
        });
        
        // Mark as notified so we don't spam them again
        notifiedHabitIds.add(habit.id);
      } catch (err) {
        console.error('Failed to trigger streak notification:', err);
      }
    }
  });
};
