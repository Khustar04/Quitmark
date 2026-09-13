import { getPreviousDayString } from './dateUtils.js';

/**
 * Pure function to calculate the all-time longest streak of consecutive completed days.
 *
 * @param {Array<{ check_in_date: string, status: string }>} checkins
 * @returns {number} Maximum consecutive completed days
 */
export const calculateLongestStreak = (checkins = []) => {
  if (!Array.isArray(checkins) || checkins.length === 0) {
    return 0;
  }

  // Filter completed checkins and sort dates ascending
  const completedDates = Array.from(
    new Set(
      checkins
        .filter((c) => c && c.status === 'completed' && c.check_in_date)
        .map((c) => c.check_in_date)
    )
  ).sort();

  if (completedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = completedDates[i - 1];
    const currDate = completedDates[i];

    // If currDate's previous day equals prevDate, it is consecutive
    if (getPreviousDayString(currDate) === prevDate) {
      currentStreak += 1;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};

export default calculateLongestStreak;
