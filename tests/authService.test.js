import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFriendlyAuthErrorMessage,
  isClockSkewError,
  isAuthenticationError,
} from '../src/services/authService.js';

// ──────────────────────────────────────
// Error message translation
// ──────────────────────────────────────

test('returns friendly message for clock skew error (JWT issued at future)', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'JWT issued at future' });
  assert.ok(result.includes('session could not be verified'));
  assert.ok(result.includes('Date & Time'));
});

test('returns friendly message for clock skew error (PGRST303)', () => {
  const result = getFriendlyAuthErrorMessage({ code: 'PGRST303', message: 'invalid token' });
  assert.ok(result.includes('session could not be verified'));
});

test('returns friendly message for invalid credentials', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Invalid login credentials' });
  assert.equal(result, 'Invalid email or password.');
});

test('returns friendly message for already registered user', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'User already registered' });
  assert.equal(result, 'This email is already registered. Try logging in.');
});

test('returns friendly message for weak password', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Password should be at least 6 characters' });
  assert.equal(result, 'Password must be at least 6 characters long.');
});

test('returns friendly message for invalid email format', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Unable to validate email address: invalid format' });
  assert.equal(result, 'Please enter a valid email address.');
});

test('returns friendly message for unconfirmed email', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Email not confirmed' });
  assert.equal(result, 'Please check your inbox to confirm your email before logging in.');
});

test('returns friendly message for disabled provider', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Provider is not enabled' });
  assert.ok(result.includes('Google authentication'));
});

test('returns friendly message for network error', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Failed to fetch' });
  assert.equal(result, 'Network connection error. Please check your internet connection.');
});

test('returns generic message for unknown error', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'Something weird happened' });
  assert.equal(result, 'Something went wrong. Please try again.');
});

test('returns generic message for null error', () => {
  const result = getFriendlyAuthErrorMessage(null);
  assert.equal(result, 'An unexpected error occurred. Please try again.');
});

test('returns generic message for undefined error', () => {
  const result = getFriendlyAuthErrorMessage(undefined);
  assert.equal(result, 'An unexpected error occurred. Please try again.');
});

test('handles error object with only toString()', () => {
  const result = getFriendlyAuthErrorMessage({ toString: () => 'Invalid credentials found' });
  assert.equal(result, 'Invalid email or password.');
});

test('case insensitive matching works', () => {
  const result = getFriendlyAuthErrorMessage({ message: 'INVALID LOGIN CREDENTIALS' });
  assert.equal(result, 'Invalid email or password.');
});

// ──────────────────────────────────────
// isClockSkewError tests
// ──────────────────────────────────────

test('isClockSkewError detects PGRST303 code', () => {
  assert.equal(isClockSkewError({ code: 'PGRST303' }), true);
});

test('isClockSkewError detects "JWT issued at future" message', () => {
  assert.equal(isClockSkewError({ message: 'JWT issued at future' }), true);
});

test('isClockSkewError detects "issued in the future" message', () => {
  assert.equal(isClockSkewError({ message: 'Token was issued in the future' }), true);
});

test('isClockSkewError detects error_description with future', () => {
  assert.equal(isClockSkewError({ error_description: 'JWT issued at future' }), true);
});

test('isClockSkewError returns false for null/undefined/unrelated error', () => {
  assert.equal(isClockSkewError(null), false);
  assert.equal(isClockSkewError(undefined), false);
  assert.equal(isClockSkewError({ message: 'JWT expired' }), false);
  assert.equal(isClockSkewError({ message: 'Invalid login credentials' }), false);
});

// ──────────────────────────────────────
// isAuthenticationError tests
// ──────────────────────────────────────

test('isAuthenticationError returns false for clock skew error even if status is 401', () => {
  const clockSkewError = {
    status: 401,
    code: 'PGRST303',
    message: 'JWT issued at future',
  };
  assert.equal(isClockSkewError(clockSkewError), true);
  assert.equal(isAuthenticationError(clockSkewError), false);
});

test('isAuthenticationError returns true for expired JWT', () => {
  const expiredError = {
    status: 401,
    message: 'JWT expired',
  };
  assert.equal(isClockSkewError(expiredError), false);
  assert.equal(isAuthenticationError(expiredError), true);
});

test('isAuthenticationError returns true for generic 401 unauthorized', () => {
  assert.equal(isAuthenticationError({ status: 401, message: 'Unauthorized' }), true);
  assert.equal(isAuthenticationError({ message: 'authentication is required' }), true);
});

test('isAuthenticationError returns false for null/undefined/non-auth errors', () => {
  assert.equal(isAuthenticationError(null), false);
  assert.equal(isAuthenticationError(undefined), false);
  assert.equal(isAuthenticationError({ status: 500, message: 'Internal Server Error' }), false);
});
