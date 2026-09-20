import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHabitSummary } from '../src/utils/progress/calculateHabitSummary.js';

const checkin = (check_in_date, status = 'completed') => ({ check_in_date, status });

// ──────────────────────────────────────
// Empty / invalid input
// ──────────────────────────────────────

test('empty checkins returns default summary', () => {
  const result = calculateHabitSummary([], '2026-09-19');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 0);
  assert.equal(result.totalCompleted, 0);
  assert.equal(result.totalMissed, 0);
  assert.equal(result.consistency, '—');
  assert.equal(result.consistencyRate, 0);
});

test('non-array input returns default summary', () => {
  const result = calculateHabitSummary('invalid', '2026-09-19');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.totalCompleted, 0);
});

test('null input returns default summary', () => {
  const result = calculateHabitSummary(null, '2026-09-19');
  assert.equal(result.currentStreak, 0);
});

// ──────────────────────────────────────
// Counting completed / missed
// ──────────────────────────────────────

test('counts completed and missed correctly', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16'),
    checkin('2026-09-17', 'missed'),
    checkin('2026-09-18'),
    checkin('2026-09-19', 'missed'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  assert.equal(result.totalCompleted, 3);
  assert.equal(result.totalMissed, 2);
});

// ──────────────────────────────────────
// Consistency rate
// ──────────────────────────────────────

test('consistency rate is correctly calculated', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16'),
    checkin('2026-09-17', 'missed'),
    checkin('2026-09-18'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  // 3 completed / 4 tracked = 75%
  assert.equal(result.consistency, '75%');
  assert.equal(result.consistencyRate, 0.75);
});

test('all completed gives 100% consistency', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
    checkin('2026-09-19'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  assert.equal(result.consistency, '100%');
  assert.equal(result.consistencyRate, 1);
});

test('all missed gives 0% consistency', () => {
  const checkins = [
    checkin('2026-09-17', 'missed'),
    checkin('2026-09-18', 'missed'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  assert.equal(result.consistency, '0%');
  assert.equal(result.consistencyRate, 0);
});

test('no tracked (0 completed + 0 missed with empty array) gives dash consistency', () => {
  const result = calculateHabitSummary([], '2026-09-19');
  assert.equal(result.consistency, '—');
});

// ──────────────────────────────────────
// Streak integration
// ──────────────────────────────────────

test('currentStreak and longestStreak are computed correctly', () => {
  const checkins = [
    checkin('2026-09-10'),
    checkin('2026-09-11'),
    checkin('2026-09-12'),
    checkin('2026-09-13'),
    // gap
    checkin('2026-09-18'),
    checkin('2026-09-19'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 4);
});

test('today pending with yesterday completed shows pending streak', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
  ];
  const result = calculateHabitSummary(checkins, '2026-09-19');
  assert.equal(result.currentStreak, 2);
});
