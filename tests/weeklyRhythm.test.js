import test from 'node:test';
import assert from 'node:assert/strict';
import { getISOWeekNumber, getWeekDates, getDayTheme } from '../src/utils/streaks/dateUtils.js';

test('getISOWeekNumber calculates correct ISO week numbers', () => {
  // Sept 22, 2026 is Tuesday in Week 39
  const date1 = new Date(2026, 8, 22);
  assert.equal(getISOWeekNumber(date1), 39);

  // Jan 1, 2026 is Thursday in Week 1
  const date2 = new Date(2026, 0, 1);
  assert.equal(getISOWeekNumber(date2), 1);
});

test('getWeekDates returns 7 days starting from Monday to Sunday for the given date', () => {
  // 2026-09-22 is Tuesday
  const days = getWeekDates('2026-09-22');

  assert.equal(days.length, 7);
  assert.equal(days[0].label, 'M');
  assert.equal(days[0].dateStr, '2026-09-21'); // Monday
  assert.equal(days[0].isToday, false);
  assert.equal(days[0].isPast, true);

  assert.equal(days[1].label, 'T');
  assert.equal(days[1].dateStr, '2026-09-22'); // Tuesday (Today)
  assert.equal(days[1].isToday, true);
  assert.equal(days[1].isPast, false);
  assert.equal(days[1].isFuture, false);

  assert.equal(days[2].label, 'W');
  assert.equal(days[2].dateStr, '2026-09-23'); // Wednesday (Future)
  assert.equal(days[2].isFuture, true);

  assert.equal(days[6].label, 'S');
  assert.equal(days[6].dateStr, '2026-09-27'); // Sunday
  assert.equal(days[6].isFuture, true);
});

test('getWeekDates handles Sunday properly as last day of week', () => {
  // 2026-09-27 is Sunday
  const days = getWeekDates('2026-09-27');

  assert.equal(days[0].dateStr, '2026-09-21'); // Monday
  assert.equal(days[6].dateStr, '2026-09-27'); // Sunday
  assert.equal(days[6].isToday, true);
});

test('getDayTheme returns future for any future day', () => {
  assert.equal(getDayTheme({ isFuture: true, totalHabits: 5, completed: 0 }), 'future');
  assert.equal(getDayTheme({ isFuture: true, totalHabits: 0, completed: 0 }), 'future');
});

test('getDayTheme returns empty when totalHabits is 0', () => {
  // Zero habits should not display red error state
  assert.equal(getDayTheme({ isFuture: false, isToday: false, totalHabits: 0, completed: 0 }), 'empty');
  assert.equal(getDayTheme({ isFuture: false, isToday: true, totalHabits: 0, completed: 0 }), 'empty');
});

test('getDayTheme returns pending for today with 0 completed (morning state)', () => {
  // Today in progress should not be marked as missed/failed (red)
  assert.equal(getDayTheme({ isFuture: false, isToday: true, totalHabits: 5, completed: 0 }), 'pending');
});

test('getDayTheme returns red for past day with 0 completed (genuinely missed day)', () => {
  assert.equal(getDayTheme({ isFuture: false, isToday: false, totalHabits: 5, completed: 0 }), 'red');
});

test('getDayTheme returns yellow for partial completion', () => {
  assert.equal(getDayTheme({ isFuture: false, isToday: true, totalHabits: 5, completed: 2 }), 'yellow');
  assert.equal(getDayTheme({ isFuture: false, isToday: false, totalHabits: 5, completed: 3 }), 'yellow');
});

test('getDayTheme returns green when all habits are completed', () => {
  assert.equal(getDayTheme({ isFuture: false, isToday: true, totalHabits: 5, completed: 5 }), 'green');
  assert.equal(getDayTheme({ isFuture: false, isToday: false, totalHabits: 5, completed: 6 }), 'green');
});

