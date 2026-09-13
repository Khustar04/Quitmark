import { getLocalDateString } from '../streaks/dateUtils.js';
import calculateCurrentStreak from '../streaks/calculateCurrentStreak.js';

/**
 * Pure function to determine if a habit's streak is at risk of breaking TODAY.
 * 
 * Rules:
 * - If today is 'completed' -> false (already protected)
 * - If today is 'missed' -> false (already broken)
 * - If today is pending and yesterday was part of a streak -> true (at risk)
 * - If today is pending and yesterday was not completed -> false (no streak to protect)
 * 
 * @param {Array<{ check_in_date: string, status: string }>} checkins - Habit check-in history
 * @param {string} [todayDateStr] - Calendar date string for today (defaults to local today)
 * @returns {boolean} True if the streak requires a check-in today to stay active
 */
export const isStreakAtRisk = (checkins = [], todayDateStr = getLocalDateString()) => {
  if (!Array.isArray(checkins) || checkins.length === 0) {
    return false;
  }

  // Fast lookup: dateStr -> status
  const statusMap = new Map();
  for (const c of checkins) {
    if (c && c.check_in_date) {
      statusMap.set(c.check_in_date, c.status);
    }
  }

  const todayStatus = statusMap.get(todayDateStr);

  // If today is explicitly completed or missed, no further action is required today.
  if (todayStatus === 'completed' || todayStatus === 'missed') {
    return false;
  }

  // Today is pending (undefined). 
  // Determine if there is an active consecutive streak from yesterday.
  // The calculateCurrentStreak logic already handles counting from yesterday when today is pending.
  const activeStreak = calculateCurrentStreak(checkins, todayDateStr);

  // If activeStreak > 0, yesterday was completed and we have an active streak to protect.
  return activeStreak > 0;
};

export default isStreakAtRisk;
