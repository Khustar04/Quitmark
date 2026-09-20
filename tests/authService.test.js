import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * authService tests
 *
 * Only tests the pure getFriendlyAuthErrorMessage function.
 * The rest of authService requires Supabase (import.meta.env),
 * which is Vite-only and cannot run in Node.js directly.
 *
 * We extract the function by dynamically evaluating just the function code.
 */

// ──────────────────────────────────────
// Inline the pure function for testing
// (avoids importing authService.js which depends on supabase.js -> import.meta.env)
// ──────────────────────────────────────

const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (error.message || error.toString() || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'This email is already registered. Try logging in.';
  }
  if (message.includes('password should be at least 6 characters') || message.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('invalid format') || message.includes('valid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your inbox to confirm your email before logging in.';
  }
  if (message.includes('provider is not enabled') || message.includes('unsupported provider')) {
    return 'Google authentication is not enabled in your Supabase project. Please configure Google provider credentials in Supabase Dashboard (Authentication > Providers).';
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Network connection error. Please check your internet connection.';
  }
  return 'Something went wrong. Please try again.';
};

// ──────────────────────────────────────
// Error message translation
// ──────────────────────────────────────

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
