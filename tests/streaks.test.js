import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCurrentStreak } from '../src/utils/streaks/calculateCurrentStreak.js';
import { calculateLongestStreak } from '../src/utils/streaks/calculateLongestStreak.js';

const checkin = (check_in_date, status = 'completed') => ({ check_in_date, status });

// ──────────────────────────────────────────────────
// calculateCurrentStreak — basic scenarios
// ──────────────────────────────────────────────────

test('empty checkins array returns 0', () => {
  assert.equal(calculateCurrentStreak([], '2026-09-19'), 0);
});

test('null input returns 0', () => {
  assert.equal(calculateCurrentStreak(null, '2026-09-19'), 0);
});

test('undefined input returns 0', () => {
  assert.equal(calculateCurrentStreak(undefined, '2026-09-19'), 0);
});

test('non-array input returns 0', () => {
  assert.equal(calculateCurrentStreak('not an array', '2026-09-19'), 0);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — today completed
// ──────────────────────────────────────────────────

test('single completed today returns streak of 1', () => {
  const checkins = [checkin('2026-09-19')];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 1);
});

test('consecutive completed days ending today returns correct streak', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
    checkin('2026-09-19'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 3);
});

test('gap in completed days resets the streak count from today', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16'),
    // gap on 17
    checkin('2026-09-18'),
    checkin('2026-09-19'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — today missed
// ──────────────────────────────────────────────────

test('today marked missed returns streak 0 even with prior completed days', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
    checkin('2026-09-19', 'missed'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 0);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — today pending (no record)
// ──────────────────────────────────────────────────

test('today pending counts consecutive completed days ending yesterday', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
});

test('today pending with no completed yesterday returns 0', () => {
  const checkins = [checkin('2026-09-16')];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 0);
});

test('today pending after a missed day breaks streak', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18', 'missed'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 0);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — edge: duplicate records
// ──────────────────────────────────────────────────

test('duplicate same-day records do not inflate streak', () => {
  const checkins = [
    checkin('2026-09-18'),
    checkin('2026-09-19'),
    checkin('2026-09-19'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — edge: invalid entries
// ──────────────────────────────────────────────────

test('ignores entries with null check_in_date', () => {
  const checkins = [
    checkin('2026-09-18'),
    { check_in_date: null, status: 'completed' },
    checkin('2026-09-19'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
});

test('ignores null entries in the array', () => {
  const checkins = [
    checkin('2026-09-18'),
    null,
    checkin('2026-09-19'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
});

// ──────────────────────────────────────────────────
// calculateCurrentStreak — edge: month/year boundary
// ──────────────────────────────────────────────────

test('streak spans month boundary', () => {
  const checkins = [
    checkin('2026-08-30'),
    checkin('2026-08-31'),
    checkin('2026-09-01'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-09-01'), 3);
});

test('streak spans year boundary', () => {
  const checkins = [
    checkin('2025-12-30'),
    checkin('2025-12-31'),
    checkin('2026-01-01'),
  ];
  assert.equal(calculateCurrentStreak(checkins, '2026-01-01'), 3);
});

// ──────────────────────────────────────────────────
// calculateLongestStreak — basic scenarios
// ──────────────────────────────────────────────────

test('empty array returns longest streak 0', () => {
  assert.equal(calculateLongestStreak([]), 0);
});

test('null input returns longest streak 0', () => {
  assert.equal(calculateLongestStreak(null), 0);
});

test('single completed checkin returns longest streak 1', () => {
  assert.equal(calculateLongestStreak([checkin('2026-09-19')]), 1);
});

test('consecutive completed days returns correct longest streak', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16'),
    checkin('2026-09-17'),
  ];
  assert.equal(calculateLongestStreak(checkins), 3);
});

test('longest streak is found even when not at the end', () => {
  const checkins = [
    checkin('2026-09-10'),
    checkin('2026-09-11'),
    checkin('2026-09-12'),
    checkin('2026-09-13'),
    // gap
    checkin('2026-09-15'),
    checkin('2026-09-16'),
  ];
  assert.equal(calculateLongestStreak(checkins), 4);
});

test('missed status checkins are excluded from longest streak', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16', 'missed'),
    checkin('2026-09-17'),
    checkin('2026-09-18'),
  ];
  assert.equal(calculateLongestStreak(checkins), 2);
});

test('duplicate dates do not inflate longest streak', () => {
  const checkins = [
    checkin('2026-09-18'),
    checkin('2026-09-19'),
    checkin('2026-09-19'),
    checkin('2026-09-19'),
  ];
  assert.equal(calculateLongestStreak(checkins), 2);
});

test('all missed returns longest streak 0', () => {
  const checkins = [
    checkin('2026-09-18', 'missed'),
    checkin('2026-09-19', 'missed'),
  ];
  assert.equal(calculateLongestStreak(checkins), 0);
});

test('longest streak with only one completed among missed', () => {
  const checkins = [
    checkin('2026-09-17', 'missed'),
    checkin('2026-09-18'),
    checkin('2026-09-19', 'missed'),
  ];
  assert.equal(calculateLongestStreak(checkins), 1);
});

// ──────────────────────────────────────────────────
// calculateLongestStreak — unsorted input
// ──────────────────────────────────────────────────

test('longest streak works correctly even with unsorted input', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-15'),
    checkin('2026-09-16'),
  ];
  assert.equal(calculateLongestStreak(checkins), 3);
});

// ──────────────────────────────────────────────────
// calculateLongestStreak — month/year boundary
// ──────────────────────────────────────────────────

test('longest streak spans month boundary', () => {
  const checkins = [
    checkin('2026-08-30'),
    checkin('2026-08-31'),
    checkin('2026-09-01'),
    checkin('2026-09-02'),
  ];
  assert.equal(calculateLongestStreak(checkins), 4);
});

test('longest streak spans year boundary', () => {
  const checkins = [
    checkin('2025-12-30'),
    checkin('2025-12-31'),
    checkin('2026-01-01'),
    checkin('2026-01-02'),
  ];
  assert.equal(calculateLongestStreak(checkins), 4);
});
