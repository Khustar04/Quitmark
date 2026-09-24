import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGoalStats, formatGoalDateRange } from '../src/services/goalService.js';
import { getGoalIcon, GOAL_CATEGORIES } from '../src/utils/goalIcons.js';

test('getGoalIcon returns correct icon metadata or fallback', () => {
  const targetIcon = getGoalIcon('Target');
  assert.equal(targetIcon.id, 'Target');
  assert.equal(targetIcon.label, 'Target');

  const fitnessIcon = getGoalIcon('Fitness');
  assert.equal(fitnessIcon.id, 'Fitness');

  const fallback = getGoalIcon('NonExistentIcon');
  assert.equal(fallback.id, 'Target');
});

test('GOAL_CATEGORIES contains standard categories', () => {
  assert.ok(GOAL_CATEGORIES.includes('Personal'));
  assert.ok(GOAL_CATEGORIES.includes('Health'));
  assert.ok(GOAL_CATEGORIES.includes('Learning'));
  assert.ok(GOAL_CATEGORIES.includes('Productivity'));
});

test('calculateGoalStats calculates 0% for new goal with no checkins', () => {
  const goal = {
    id: 'goal-1',
    name: 'Become a Better Developer',
    duration_days: 60,
    start_date: '2026-09-20',
    target_date: '2026-11-19',
    habit_ids: ['h1', 'h2'],
  };

  const habits = [
    { id: 'h1', name: 'Code React', category: 'Learning' },
    { id: 'h2', name: 'Read Book', category: 'Learning' },
  ];

  const stats = calculateGoalStats(goal, habits, {}, '2026-09-20');

  assert.equal(stats.totalDays, 60);
  assert.equal(stats.completedDaysCount, 0);
  assert.equal(stats.progressPercentage, 0);
  assert.equal(stats.linkedHabits.length, 2);
  assert.equal(stats.isCompleted, false);
});

test('calculateGoalStats calculates progress when habits are completed', () => {
  const goal = {
    id: 'goal-2',
    name: 'Fitness Transformation',
    duration_days: 30,
    start_date: '2026-09-01',
    target_date: '2026-10-01',
    habit_ids: ['h1'],
  };

  const habits = [{ id: 'h1', name: 'Morning Run', category: 'Health' }];

  const checkinsByHabit = {
    h1: [
      { check_in_date: '2026-09-01', status: 'completed' },
      { check_in_date: '2026-09-02', status: 'completed' },
      { check_in_date: '2026-09-03', status: 'completed' },
      { check_in_date: '2026-09-04', status: 'missed' },
    ],
  };

  const stats = calculateGoalStats(goal, habits, checkinsByHabit, '2026-09-05');

  assert.equal(stats.totalDays, 30);
  assert.equal(stats.completedDaysCount, 3);
  assert.equal(stats.totalHabitCompletions, 3);
  assert.equal(stats.totalMissedCount, 1);
  assert.equal(stats.progressPercentage, 10); // 3 / 30 * 100 = 10%
});

test('formatGoalDateRange treats YYYY-MM-DD values as local calendar dates', () => {
  assert.equal(
    formatGoalDateRange('2026-09-20', '2026-11-19'),
    'Sep 20, 2026 – Nov 19, 2026'
  );
});
