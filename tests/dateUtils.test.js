import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalDateString,
  getPreviousDayString,
  formatDisplayDate,
  formatFullDisplayDate,
  getMonthDetails,
  getLastNWeeksDays,
} from '../src/utils/streaks/dateUtils.js';

// ──────────────────────────────────────
// getLocalDateString
// ──────────────────────────────────────

test('getLocalDateString returns YYYY-MM-DD format', () => {
  const result = getLocalDateString(new Date(2026, 0, 5)); // Jan 5, 2026
  assert.equal(result, '2026-01-05');
});

test('getLocalDateString pads single-digit month and day', () => {
  const result = getLocalDateString(new Date(2026, 2, 3)); // Mar 3, 2026
  assert.equal(result, '2026-03-03');
});

test('getLocalDateString handles Dec 31 correctly', () => {
  const result = getLocalDateString(new Date(2026, 11, 31));
  assert.equal(result, '2026-12-31');
});

test('getLocalDateString defaults to today when no argument is given', () => {
  const result = getLocalDateString();
  const now = new Date();
  const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  assert.equal(result, expected);
});

test('getLocalDateString accepts a string date', () => {
  const result = getLocalDateString('2026-06-15');
  // Note: new Date('2026-06-15') interprets as UTC, so this may differ by timezone
  // but the function uses local getFullYear/getMonth/getDate so result depends on locale
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
});

// ──────────────────────────────────────
// getPreviousDayString
// ──────────────────────────────────────

test('getPreviousDayString returns the previous calendar day', () => {
  assert.equal(getPreviousDayString('2026-09-15'), '2026-09-14');
});

test('getPreviousDayString handles month boundary (first of month)', () => {
  assert.equal(getPreviousDayString('2026-03-01'), '2026-02-28');
});

test('getPreviousDayString handles year boundary (Jan 1)', () => {
  assert.equal(getPreviousDayString('2026-01-01'), '2025-12-31');
});

test('getPreviousDayString handles leap year Feb 29', () => {
  assert.equal(getPreviousDayString('2024-03-01'), '2024-02-29');
});

test('getPreviousDayString handles non-leap year Feb 28', () => {
  assert.equal(getPreviousDayString('2026-03-01'), '2026-02-28');
});

// ──────────────────────────────────────
// formatDisplayDate
// ──────────────────────────────────────

test('formatDisplayDate returns "Today" for today\'s date', () => {
  const today = getLocalDateString();
  assert.equal(formatDisplayDate(today), 'Today');
});

test('formatDisplayDate returns "Yesterday" for yesterday\'s date', () => {
  const today = getLocalDateString();
  const yesterday = getPreviousDayString(today);
  assert.equal(formatDisplayDate(yesterday), 'Yesterday');
});

test('formatDisplayDate returns a short date for older dates', () => {
  // Use a fixed old date — result varies by locale, so just check it's not Today/Yesterday
  const result = formatDisplayDate('2025-01-15');
  assert.notEqual(result, 'Today');
  assert.notEqual(result, 'Yesterday');
  assert.ok(typeof result === 'string' && result.length > 0);
});

// ──────────────────────────────────────
// formatFullDisplayDate
// ──────────────────────────────────────

test('formatFullDisplayDate returns empty string for falsy input', () => {
  assert.equal(formatFullDisplayDate(null), '');
  assert.equal(formatFullDisplayDate(undefined), '');
  assert.equal(formatFullDisplayDate(''), '');
});

test('formatFullDisplayDate returns a full readable date', () => {
  const result = formatFullDisplayDate('2026-09-15');
  // Expected: "Tue, Sep 15, 2026" (en-US with weekday short)
  assert.ok(result.includes('2026'));
  assert.ok(result.includes('Sep') || result.includes('15'));
});

// ──────────────────────────────────────
// getMonthDetails
// ──────────────────────────────────────

test('getMonthDetails returns correct days in January', () => {
  const details = getMonthDetails(2026, 1);
  assert.equal(details.year, 2026);
  assert.equal(details.month, 1);
  assert.equal(details.daysInMonth, 31);
  assert.equal(details.monthName, 'January');
  assert.equal(details.days.length, 31);
});

test('getMonthDetails returns correct days in February (non-leap)', () => {
  const details = getMonthDetails(2026, 2);
  assert.equal(details.daysInMonth, 28);
  assert.equal(details.days.length, 28);
});

test('getMonthDetails returns correct days in February (leap year)', () => {
  const details = getMonthDetails(2024, 2);
  assert.equal(details.daysInMonth, 29);
  assert.equal(details.days.length, 29);
});

test('getMonthDetails days array has correct dateStr format', () => {
  const details = getMonthDetails(2026, 9);
  assert.equal(details.days[0].dateStr, '2026-09-01');
  assert.equal(details.days[0].dayNumber, 1);
  assert.equal(details.days[29].dateStr, '2026-09-30');
  assert.equal(details.days[29].dayNumber, 30);
});

test('getMonthDetails firstDayIndex is a valid weekday (0-6)', () => {
  const details = getMonthDetails(2026, 9);
  assert.ok(details.firstDayIndex >= 0 && details.firstDayIndex <= 6);
});

// ──────────────────────────────────────
// getLastNWeeksDays
// ──────────────────────────────────────

test('getLastNWeeksDays returns correct number of days', () => {
  const days = getLastNWeeksDays(12);
  assert.equal(days.length, 84); // 12 * 7
});

test('getLastNWeeksDays returns correct number for 1 week', () => {
  const days = getLastNWeeksDays(1);
  assert.equal(days.length, 7);
});

test('getLastNWeeksDays last element is today', () => {
  const days = getLastNWeeksDays(4);
  const today = getLocalDateString();
  assert.equal(days[days.length - 1], today);
});

test('getLastNWeeksDays returns all valid YYYY-MM-DD strings', () => {
  const days = getLastNWeeksDays(2);
  for (const day of days) {
    assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('getLastNWeeksDays dates are in ascending order', () => {
  const days = getLastNWeeksDays(4);
  for (let i = 1; i < days.length; i++) {
    assert.ok(days[i] > days[i - 1], `${days[i]} should be after ${days[i - 1]}`);
  }
});

test('getLastNWeeksDays defaults to 12 weeks when no argument given', () => {
  const days = getLastNWeeksDays();
  assert.equal(days.length, 84);
});
