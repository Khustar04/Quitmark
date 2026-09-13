import { getLocalDateString, getPreviousDayString } from './dateUtils.js';

/**
 * Pure function to calculate current streak from check-in records.
 *
 * Rules:
 * - If today is marked 'missed': current streak = 0.
 * - If today is marked 'completed': count consecutive completed days ending today.
 * - If today is 'pending' (no record for today): count consecutive completed days ending yesterday.
 *
 * @param {Array<{ check_in_date: string, status: string }>} checkins - List of check-in records for a habit
 * @param {string} [todayDateStr] - Optional calendar day string (defaults to local today)
 * @returns {number} Current streak in days
 */
export const calculateCurrentStreak = (checkins = [], todayDateStr = getLocalDateString()) => {
  if (!Array.isArray(checkins) || checkins.length === 0) {
    return 0;
  }

  // Fast lookup: dateStr -> status
  const statusMap = new Map();
  for (const c of checkins) {
    if (c && c.check_in_date) {
      statusMap.set(c.check_in_date, c.status);
    }
  }

  const todayStatus = statusMap.get(todayDateStr);

  // 1. If today is marked 'missed', streak is broken today -> 0
  if (todayStatus === 'missed') {
    return 0;
  }

  // 2. If today is marked 'completed', count backwards from today
  if (todayStatus === 'completed') {
    let streak = 1;
    let cursorDate = getPreviousDayString(todayDateStr);

    while (statusMap.get(cursorDate) === 'completed') {
      streak += 1;
      cursorDate = getPreviousDayString(cursorDate);
    }

    return streak;
  }

  // 3. If today is pending, count consecutive completed days ending yesterday
  let streak = 0;
  let cursorDate = getPreviousDayString(todayDateStr);

  while (statusMap.get(cursorDate) === 'completed') {
    streak += 1;
    cursorDate = getPreviousDayString(cursorDate);
  }

  return streak;
};

export default calculateCurrentStreak;
