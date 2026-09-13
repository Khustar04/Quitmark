import { createSelector } from '@reduxjs/toolkit';
import { calculateHabitSummary } from '../../utils/progress/calculateHabitSummary.js';
import { getLocalDateString } from '../../utils/streaks/dateUtils.js';

export const selectHabits = (state) => state.habits.items || [];
export const selectCheckinsByHabit = (state) => state.habits.checkinsByHabit || {};
export const selectHabitsLoading = (state) => state.habits.loading;
export const selectHabitsError = (state) => state.habits.error;

/**
 * Returns check-ins for a specific habit.
 */
export const selectHabitCheckins = (state, habitId) => {
  const checkinsMap = selectCheckinsByHabit(state);
  return checkinsMap[habitId] || [];
};

/**
 * Returns progress summary statistics for a specific habit.
 */
export const selectHabitSummary = (state, habitId) => {
  const checkins = selectHabitCheckins(state, habitId);
  return calculateHabitSummary(checkins);
};

/**
 * Returns all habits augmented with their live progress summary (memoized).
 */
export const selectHabitsWithProgress = createSelector(
  [selectHabits, selectCheckinsByHabit],
  (habits, checkinsMap) => {
    const today = getLocalDateString();

    return habits.map((habit) => {
      const checkins = checkinsMap[habit.id] || [];
      const summary = calculateHabitSummary(checkins, today);
      return {
        ...habit,
        summary,
      };
    });
  }
);

/**
 * Returns dashboard-level aggregate statistics across all habits (memoized).
 */
export const selectDashboardSummary = createSelector(
  [selectHabits, selectCheckinsByHabit],
  (habits, checkinsMap) => {
    const today = getLocalDateString();
    const totalHabits = habits.length;

    if (totalHabits === 0) {
      return {
        totalHabits: 0,
        totalCompleted: 0,
        bestCurrentStreak: 0,
        overallConsistency: '—',
      };
    }

    let totalCompleted = 0;
    let totalMissed = 0;
    let bestCurrentStreak = 0;

    for (const habit of habits) {
      const checkins = checkinsMap[habit.id] || [];
      const summary = calculateHabitSummary(checkins, today);

      totalCompleted += summary.totalCompleted;
      totalMissed += summary.totalMissed;

      if (summary.currentStreak > bestCurrentStreak) {
        bestCurrentStreak = summary.currentStreak;
      }
    }

    const totalTracked = totalCompleted + totalMissed;
    const overallConsistency =
      totalTracked === 0 ? '—' : `${Math.round((totalCompleted / totalTracked) * 100)}%`;

    return {
      totalHabits,
      totalCompleted,
      bestCurrentStreak,
      overallConsistency,
    };
  }
);
