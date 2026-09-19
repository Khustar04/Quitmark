import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCurrentStreak } from '../src/utils/streaks/calculateCurrentStreak.js';
import { calculateLongestStreak } from '../src/utils/streaks/calculateLongestStreak.js';

const checkin = (check_in_date, status = 'completed') => ({ check_in_date, status });

test('a new habit has no current or best streak', () => {
  assert.equal(calculateCurrentStreak([], '2026-09-19'), 0);
  assert.equal(calculateLongestStreak([]), 0);
});

test('completed daily check-ins build a streak and preserve the best streak', () => {
  const checkins = [
    checkin('2026-09-15'),
    checkin('2026-09-16'),
    checkin('2026-09-17'),
    checkin('2026-09-19'),
  ];

  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 1);
  assert.equal(calculateLongestStreak(checkins), 3);
});

test('a pending today does not extend yesterday’s streak and a missed day breaks it', () => {
  const checkins = [checkin('2026-09-17'), checkin('2026-09-18')];

  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
  assert.equal(calculateCurrentStreak(checkins, '2026-09-20'), 0);
});

test('an explicit missed check-in breaks the current streak', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
    checkin('2026-09-19', 'missed'),
  ];

  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 0);
  assert.equal(calculateLongestStreak(checkins), 2);
});

test('duplicate same-day records cannot inflate a streak', () => {
  const checkins = [
    checkin('2026-09-18'),
    checkin('2026-09-19'),
    checkin('2026-09-19'),
  ];

  assert.equal(calculateCurrentStreak(checkins, '2026-09-19'), 2);
  assert.equal(calculateLongestStreak(checkins), 2);
});
