import test from 'node:test';
import assert from 'node:assert/strict';

// ──────────────────────────────────────
// sessionGuard
// ──────────────────────────────────────
import {
  setActiveUserId,
  getActiveUserId,
  isActiveUser,
} from '../src/utils/auth/sessionGuard.js';

test('getActiveUserId returns null initially', () => {
  setActiveUserId(null); // reset
  assert.equal(getActiveUserId(), null);
});

test('setActiveUserId stores and retrieves user id', () => {
  setActiveUserId('user-abc-123');
  assert.equal(getActiveUserId(), 'user-abc-123');
});

test('setActiveUserId with falsy value resets to null', () => {
  setActiveUserId('user-abc-123');
  setActiveUserId('');
  assert.equal(getActiveUserId(), null);

  setActiveUserId('user-abc-123');
  setActiveUserId(undefined);
  assert.equal(getActiveUserId(), null);
});

test('isActiveUser returns true for the currently set user', () => {
  setActiveUserId('user-abc-123');
  assert.equal(isActiveUser('user-abc-123'), true);
});

test('isActiveUser returns false for a different user', () => {
  setActiveUserId('user-abc-123');
  assert.equal(isActiveUser('user-xyz-456'), false);
});

test('isActiveUser returns false when no user is set', () => {
  setActiveUserId(null);
  assert.equal(isActiveUser('user-abc-123'), false);
});

test('isActiveUser returns true for null when no user is set (null === null)', () => {
  setActiveUserId(null);
  assert.equal(isActiveUser(null), true);
});
