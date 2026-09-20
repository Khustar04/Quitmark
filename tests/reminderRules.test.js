import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REMINDER_RULES,
  parseTimeString,
  formatMinutesToTime,
  getSmartReminderSchedule,
  getReminderMessage,
} from '../src/constants/reminderRules.js';

// ─── Centralized Constants Verification ─────────────────────────────────────

test('REMINDER_RULES: contains required constants with exact values', () => {
  assert.equal(REMINDER_RULES.FOLLOW_UP_DELAY_MINUTES, 60);
  assert.equal(REMINDER_RULES.MAX_REMINDERS_PER_HABIT_PER_DAY, 3);
  assert.equal(REMINDER_RULES.STREAK_WARNING_ENABLED, true);
  assert.equal(REMINDER_RULES.STREAK_PROTECTION_DEFAULT_HOUR, 21);
  assert.equal(REMINDER_RULES.STREAK_PROTECTION_DEFAULT_MINUTE, 0);
  assert.equal(REMINDER_RULES.REMINDER_TYPES.INITIAL, 'INITIAL');
  assert.equal(REMINDER_RULES.REMINDER_TYPES.FOLLOW_UP, 'FOLLOW_UP');
  assert.equal(REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION, 'STREAK_PROTECTION');
});

// ─── Time String Parsing & Formatting ───────────────────────────────────────

test('parseTimeString: parses HH:MM and HH:MM:SS formats accurately', () => {
  const t1 = parseTimeString('19:30');
  assert.equal(t1.hour, 19);
  assert.equal(t1.minute, 30);
  assert.equal(t1.totalMinutes, 19 * 60 + 30);
  assert.equal(t1.formatted, '19:30');

  const t2 = parseTimeString('07:05:00');
  assert.equal(t2.hour, 7);
  assert.equal(t2.minute, 5);
  assert.equal(t2.totalMinutes, 7 * 60 + 5);
  assert.equal(t2.formatted, '07:05');
});

test('parseTimeString: gracefully handles invalid or missing inputs', () => {
  const fallback = parseTimeString(null);
  assert.equal(fallback.hour, 7);
  assert.equal(fallback.minute, 0);

  const fallbackEmpty = parseTimeString('');
  assert.equal(fallbackEmpty.hour, 7);
});

test('formatMinutesToTime: converts total minutes to 24h string', () => {
  assert.equal(formatMinutesToTime(0), '00:00');
  assert.equal(formatMinutesToTime(425), '07:05');
  assert.equal(formatMinutesToTime(1260), '21:00');
  assert.equal(formatMinutesToTime(1439), '23:59');
});

// ─── Smart Reminder Schedule Calculation ───────────────────────────────────

test('getSmartReminderSchedule: generates standard 3-stage schedule for morning habit', () => {
  // 8:00 AM workout
  const schedule = getSmartReminderSchedule('08:00');

  assert.equal(schedule.initial.type, 'INITIAL');
  assert.equal(schedule.initial.timeStr, '08:00');

  // Follow-up exactly 60 minutes later
  assert.ok(schedule.followUp);
  assert.equal(schedule.followUp.type, 'FOLLOW_UP');
  assert.equal(schedule.followUp.timeStr, '09:00');

  // Streak protection later in the day (default 21:00)
  assert.ok(schedule.streakProtection);
  assert.equal(schedule.streakProtection.type, 'STREAK_PROTECTION');
  assert.equal(schedule.streakProtection.timeStr, '21:00');

  assert.equal(schedule.schedule.length, 3);
});

test('getSmartReminderSchedule: shifts streak protection if habit reminder is late evening', () => {
  // 8:30 PM (20:30) habit
  const schedule = getSmartReminderSchedule('20:30');

  assert.equal(schedule.initial.timeStr, '20:30');
  // Follow-up at 21:30
  assert.equal(schedule.followUp.timeStr, '21:30');
  // Streak protection should be pushed after follow-up (22:30)
  assert.equal(schedule.streakProtection.timeStr, '22:30');
  assert.equal(schedule.schedule.length, 3);
});

test('getSmartReminderSchedule: enforces max reminders and bounds at midnight', () => {
  // 23:15 habit
  const schedule = getSmartReminderSchedule('23:15');
  assert.equal(schedule.initial.timeStr, '23:15');
  // Follow-up would be 00:15 (next day), so must not be scheduled today
  assert.equal(schedule.followUp, null);
  assert.equal(schedule.streakProtection, null);
  assert.equal(schedule.schedule.length, 1);
});

test('getSmartReminderSchedule: never exceeds MAX_REMINDERS_PER_HABIT_PER_DAY', () => {
  const times = ['06:00', '12:00', '18:00', '20:00', '22:00'];
  for (const time of times) {
    const s = getSmartReminderSchedule(time);
    assert.ok(s.schedule.length <= REMINDER_RULES.MAX_REMINDERS_PER_HABIT_PER_DAY);
  }
});

// ─── Motivational Messages ──────────────────────────────────────────────────

test('getReminderMessage: returns motivational initial reminder with habit name', () => {
  const msg = getReminderMessage('INITIAL', 'Morning Run', 0);
  assert.ok(msg.title.includes('Quitmark'));
  assert.ok(msg.body.includes('Morning Run'));
  assert.ok(msg.body.includes('🌱') || msg.body.includes('💪') || msg.body.includes('🔥'));
});

test('getReminderMessage: returns gentle follow-up reminder', () => {
  const msg = getReminderMessage('FOLLOW_UP', 'Read Book', 0);
  assert.equal(msg.title, 'Gentle Reminder');
  assert.ok(msg.body.includes('Read Book'));
  assert.ok(msg.body.includes('waiting') || msg.body.includes('still time') || msg.body.includes('forget'));
});

test('getReminderMessage: returns urgent streak protection reminder', () => {
  const msg = getReminderMessage('STREAK_PROTECTION', 'Meditation', 0);
  assert.ok(msg.title.includes('Streak'));
  assert.ok(msg.body.includes('Meditation'));
  assert.ok(msg.body.includes('risk') || msg.body.includes('protect') || msg.body.includes('midnight'));
});

test('getReminderMessage: produces message variations with seed', () => {
  const msg1 = getReminderMessage('INITIAL', 'Exercise', 0);
  const msg2 = getReminderMessage('INITIAL', 'Exercise', 1);
  const msg3 = getReminderMessage('INITIAL', 'Exercise', 2);

  // Different bodies for message variety
  assert.notEqual(msg1.body, msg2.body);
  assert.notEqual(msg2.body, msg3.body);
});
