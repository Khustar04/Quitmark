import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REMINDER_RULES,
  getSmartReminderSchedule,
  getReminderMessage,
} from '../src/constants/reminderRules.js';
import { isStreakAtRisk } from '../src/utils/notifications/isStreakAtRisk.js';

/**
 * Simulates the decision engine of the smart reminder system.
 * Evaluates whether a notification should actually be sent based on:
 * 1. Scheduled time match
 * 2. Scheduled day match
 * 3. Latest checkin state (completed/missed/pending)
 * 4. Active streak protection criteria
 * 5. Idempotency execution store
 */
function evaluateReminderDecision({
  reminderTime,
  repeatType = 'DAILY',
  repeatDays = null,
  currentHour,
  currentMinute,
  currentDayOfWeek,
  todayCheckinStatus = null, // null (pending), 'completed', or 'missed'
  yesterdayCheckinStatus = null, // 'completed' or null/'missed'
  executionStore = new Set(),
  reminderId = 'rem-1',
  dateStr = '2026-09-20',
}) {
  // 1. Day of week check
  if (repeatType === 'SELECTED_DAYS') {
    if (!repeatDays || !repeatDays.includes(currentDayOfWeek)) {
      return { send: false, reason: 'NOT_SCHEDULED_TODAY' };
    }
  }

  // 2. Schedule match
  const { schedule } = getSmartReminderSchedule(reminderTime);
  const dueStage = schedule.find((s) => s.hour === currentHour && s.minute === currentMinute);
  if (!dueStage) {
    return { send: false, reason: 'TIME_NOT_DUE' };
  }

  // 3. Idempotency key
  const occurrenceKey = `${reminderId}:${dateStr}:${dueStage.type}`;
  if (executionStore.has(occurrenceKey)) {
    return { send: false, reason: 'DUPLICATE_ALREADY_PROCESSED', occurrenceKey };
  }

  // 4. Habit completion check
  if (todayCheckinStatus === 'completed') {
    executionStore.add(occurrenceKey);
    return { send: false, reason: 'HABIT_ALREADY_COMPLETED', occurrenceKey };
  }
  if (todayCheckinStatus === 'missed') {
    executionStore.add(occurrenceKey);
    return { send: false, reason: 'HABIT_ALREADY_MISSED', occurrenceKey };
  }

  // 5. Streak protection check
  if (dueStage.type === REMINDER_RULES.REMINDER_TYPES.STREAK_PROTECTION) {
    if (yesterdayCheckinStatus !== 'completed') {
      executionStore.add(occurrenceKey);
      return { send: false, reason: 'NO_ACTIVE_STREAK_TO_PROTECT', occurrenceKey };
    }
  }

  // All checks pass -> Record execution and send
  executionStore.add(occurrenceKey);
  const message = getReminderMessage(dueStage.type, 'Workout', 0);
  return {
    send: true,
    stage: dueStage.type,
    occurrenceKey,
    message,
  };
}

// ─── 1. Basic Flow Tests ───────────────────────────────────────────────────

test('Basic Flow: sends initial reminder at scheduled time if incomplete', () => {
  const store = new Set();
  const decision = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0, // Sunday
    todayCheckinStatus: null, // pending
    executionStore: store,
  });

  assert.equal(decision.send, true);
  assert.equal(decision.stage, 'INITIAL');
  assert.ok(decision.message.body.includes('Workout'));
});

test('Basic Flow: sends follow-up reminder 60 minutes later if still incomplete', () => {
  const store = new Set();
  // 19:00 initial reminder
  evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null,
    executionStore: store,
  });

  // 20:00 follow-up reminder (+60m)
  const followUpDecision = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 20,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null, // still incomplete
    executionStore: store,
  });

  assert.equal(followUpDecision.send, true);
  assert.equal(followUpDecision.stage, 'FOLLOW_UP');
  assert.equal(followUpDecision.message.title, 'Gentle Reminder');
});

test('Basic Flow: sends streak protection reminder later if streak exists', () => {
  const store = new Set();
  // Habit set at 08:00 AM, streak protection due at 21:00
  const decision = evaluateReminderDecision({
    reminderTime: '08:00',
    currentHour: 21,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null, // still incomplete
    yesterdayCheckinStatus: 'completed', // has active streak!
    executionStore: store,
  });

  assert.equal(decision.send, true);
  assert.equal(decision.stage, 'STREAK_PROTECTION');
  assert.ok(decision.message.title.includes('Streak'));
});

// ─── 2. Completion Flow Tests (Stop Reminder Cycle) ─────────────────────────

test('Completion Flow: does NOT send initial reminder if completed before reminder time', () => {
  const store = new Set();
  const decision = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: 'completed', // completed earlier in the day
    executionStore: store,
  });

  assert.equal(decision.send, false);
  assert.equal(decision.reason, 'HABIT_ALREADY_COMPLETED');
});

test('Completion Flow: stops follow-up if completed after initial reminder', () => {
  const store = new Set();

  // Initial at 19:00 sent
  const initial = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null,
    executionStore: store,
  });
  assert.equal(initial.send, true);

  // User completes habit at 19:30.
  // At 20:00 follow-up check:
  const followUp = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 20,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: 'completed', // completed!
    executionStore: store,
  });

  assert.equal(followUp.send, false);
  assert.equal(followUp.reason, 'HABIT_ALREADY_COMPLETED');
});

test('Completion Flow: stops streak protection if completed after follow-up', () => {
  const store = new Set();

  // Follow-up was evaluated earlier.
  // User completes habit before 21:00.
  const streakDecision = evaluateReminderDecision({
    reminderTime: '08:00',
    currentHour: 21,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: 'completed', // completed!
    yesterdayCheckinStatus: 'completed',
    executionStore: store,
  });

  assert.equal(streakDecision.send, false);
  assert.equal(streakDecision.reason, 'HABIT_ALREADY_COMPLETED');
});

// ─── 3. Streak Protection Eligibility Checks ────────────────────────────────

test('Streak Protection: does NOT send if no active streak can be affected', () => {
  const store = new Set();

  const decision = evaluateReminderDecision({
    reminderTime: '08:00',
    currentHour: 21,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null,
    yesterdayCheckinStatus: null, // no streak yesterday!
    executionStore: store,
  });

  assert.equal(decision.send, false);
  assert.equal(decision.reason, 'NO_ACTIVE_STREAK_TO_PROTECT');
});

test('Streak Protection: integration with isStreakAtRisk utility', () => {
  // Case A: yesterday completed, today pending -> at risk
  const checkinsA = [{ check_in_date: '2026-09-19', status: 'completed' }];
  assert.equal(isStreakAtRisk(checkinsA, '2026-09-20'), true);

  // Case B: yesterday missed -> not at risk
  const checkinsB = [{ check_in_date: '2026-09-19', status: 'missed' }];
  assert.equal(isStreakAtRisk(checkinsB, '2026-09-20'), false);

  // Case C: today already completed -> not at risk
  const checkinsC = [
    { check_in_date: '2026-09-19', status: 'completed' },
    { check_in_date: '2026-09-20', status: 'completed' },
  ];
  assert.equal(isStreakAtRisk(checkinsC, '2026-09-20'), false);
});

// ─── 4. Idempotency & Duplicate Prevention ──────────────────────────────────

test('Idempotency: duplicate trigger within the same minute is rejected', () => {
  const store = new Set();

  // First trigger
  const run1 = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null,
    executionStore: store,
  });
  assert.equal(run1.send, true);

  // Second trigger (e.g. cron retry, double scheduler tick, multiple tabs)
  const run2 = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0,
    todayCheckinStatus: null,
    executionStore: store,
  });
  assert.equal(run2.send, false);
  assert.equal(run2.reason, 'DUPLICATE_ALREADY_PROCESSED');
});

// ─── 5. Daily Reset & Isolation ─────────────────────────────────────────────

test('Daily Reset: reminder state resets per habit per calendar day', () => {
  const store = new Set();

  // Monday: 19:00 initial reminder sent
  const monday = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 1,
    dateStr: '2026-09-21',
    todayCheckinStatus: null,
    executionStore: store,
  });
  assert.equal(monday.send, true);
  assert.equal(monday.occurrenceKey, 'rem-1:2026-09-21:INITIAL');

  // Tuesday: 19:00 initial reminder starts a fresh new cycle!
  const tuesday = evaluateReminderDecision({
    reminderTime: '19:00',
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 2,
    dateStr: '2026-09-22',
    todayCheckinStatus: null,
    executionStore: store,
  });
  assert.equal(tuesday.send, true);
  assert.equal(tuesday.occurrenceKey, 'rem-1:2026-09-22:INITIAL');
  assert.notEqual(monday.occurrenceKey, tuesday.occurrenceKey);
});

// ─── 6. Selected Days Filtering ─────────────────────────────────────────────

test('Selected Days: habit only notifies on configured days of week', () => {
  const store = new Set();

  // Habit set for Monday (1) and Wednesday (3) only
  // Testing Sunday (0):
  const sunday = evaluateReminderDecision({
    reminderTime: '19:00',
    repeatType: 'SELECTED_DAYS',
    repeatDays: [1, 3],
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 0, // Sunday
    executionStore: store,
  });
  assert.equal(sunday.send, false);
  assert.equal(sunday.reason, 'NOT_SCHEDULED_TODAY');

  // Testing Monday (1):
  const monday = evaluateReminderDecision({
    reminderTime: '19:00',
    repeatType: 'SELECTED_DAYS',
    repeatDays: [1, 3],
    currentHour: 19,
    currentMinute: 0,
    currentDayOfWeek: 1, // Monday
    executionStore: store,
  });
  assert.equal(monday.send, true);
});
