import test from 'node:test';
import assert from 'node:assert/strict';
import { isStreakAtRisk } from '../src/utils/notifications/isStreakAtRisk.js';

const checkin = (check_in_date, status = 'completed') => ({ check_in_date, status });

// ──────────────────────────────────────
// Empty / invalid input
// ──────────────────────────────────────

test('empty checkins → not at risk', () => {
  assert.equal(isStreakAtRisk([], '2026-09-19'), false);
});

test('null checkins → not at risk', () => {
  assert.equal(isStreakAtRisk(null, '2026-09-19'), false);
});

test('undefined checkins → not at risk', () => {
  assert.equal(isStreakAtRisk(undefined, '2026-09-19'), false);
});

// ──────────────────────────────────────
// Today already completed
// ──────────────────────────────────────

test('today completed → not at risk (already protected)', () => {
  const checkins = [
    checkin('2026-09-18'),
    checkin('2026-09-19'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), false);
});

// ──────────────────────────────────────
// Today already missed
// ──────────────────────────────────────

test('today missed → not at risk (already broken)', () => {
  const checkins = [
    checkin('2026-09-18'),
    checkin('2026-09-19', 'missed'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), false);
});

// ──────────────────────────────────────
// Today pending — with active streak (at risk)
// ──────────────────────────────────────

test('today pending, yesterday completed → at risk', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), true);
});

test('today pending, single yesterday completed → at risk', () => {
  const checkins = [checkin('2026-09-18')];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), true);
});

// ──────────────────────────────────────
// Today pending — no active streak (not at risk)
// ──────────────────────────────────────

test('today pending, yesterday not completed → not at risk', () => {
  const checkins = [checkin('2026-09-16')];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), false);
});

test('today pending, yesterday missed → not at risk', () => {
  const checkins = [
    checkin('2026-09-17'),
    checkin('2026-09-18', 'missed'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), false);
});

test('today pending, no records near today → not at risk', () => {
  const checkins = [checkin('2026-09-01')];
  assert.equal(isStreakAtRisk(checkins, '2026-09-19'), false);
});

// ──────────────────────────────────────
// Edge: month/year boundary
// ──────────────────────────────────────

test('streak at risk across month boundary', () => {
  const checkins = [
    checkin('2026-08-30'),
    checkin('2026-08-31'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-09-01'), true);
});

test('streak at risk across year boundary', () => {
  const checkins = [
    checkin('2025-12-30'),
    checkin('2025-12-31'),
  ];
  assert.equal(isStreakAtRisk(checkins, '2026-01-01'), true);
});
