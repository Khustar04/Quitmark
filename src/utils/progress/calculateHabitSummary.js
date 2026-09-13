import { calculateCurrentStreak } from '../streaks/calculateCurrentStreak.js';
import { calculateLongestStreak } from '../streaks/calculateLongestStreak.js';
import { getLocalDateString } from '../streaks/dateUtils.js';

/**
 * Pure and deterministic utility to compute progress statistics for a habit.
 *
 * @param {Array<{ check_in_date: string, status: string }>} checkins
 * @param {string} [todayDateStr] - Local calendar date string (YYYY-MM-DD)
 * @returns {{
 *   currentStreak: number,
 *   longestStreak: number,
 *   totalCompleted: number,
 *   totalMissed: number,
 *   consistency: string,
 *   consistencyRate: number
 * }}
 */
export const calculateHabitSummary = (checkins = [], todayDateStr = getLocalDateString()) => {
  if (!Array.isArray(checkins)) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalMissed: 0,
      consistency: '—',
      consistencyRate: 0,
    };
  }

  const currentStreak = calculateCurrentStreak(checkins, todayDateStr);
  const longestStreak = calculateLongestStreak(checkins);

  const totalCompleted = checkins.filter((c) => c && c.status === 'completed').length;
  const totalMissed = checkins.filter((c) => c && c.status === 'missed').length;
  const totalTracked = totalCompleted + totalMissed;

  const consistencyRate = totalTracked > 0 ? totalCompleted / totalTracked : 0;
  const consistency = totalTracked === 0 ? '—' : `${Math.round(consistencyRate * 100)}%`;

  return {
    currentStreak,
    longestStreak,
    totalCompleted,
    totalMissed,
    consistency,
    consistencyRate,
  };
};

export default calculateHabitSummary;
