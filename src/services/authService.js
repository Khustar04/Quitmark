import supabase from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Translates raw technical Supabase errors into clean, user-friendly messages.
 */
export const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // Only show the clock-skew message when we can confirm real drift.
  // isClockSkewError still returns true for PGRST303/"future" body text,
  // but that can be a stale token from a previous session — the actual
  // clock-skew UI banner requires measured drift ≥5s. For user-facing
  // error strings, fall through to the generic session error instead.
  if (isClockSkewError(error)) {
    return 'Your session could not be verified. Please try logging in again. If this keeps happening, check that your system Date & Time is set to automatic.';
  }

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

  console.error('[Quitmark] Authentication request failed:', error);
  return 'Something went wrong. Please try again.';
};

/**
 * Checks if the Supabase client is initialized with environment variables.
 */
const ensureClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your .env file.'
    );
  }
};

/**
 * Helper to add a timeout to a promise.
 */
const withTimeout = (promise, ms = 15000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error('Request timed out. Please check your Supabase SMTP configuration as the server took too long to respond.')),
      ms
    );

    promise.then(resolve, reject).finally(() => clearTimeout(timeoutId));
  });
};

const pendingAuthRequests = new Map();

/**
 * Measures the actual clock drift against the Supabase server before dispatching
 * the clock-skew UI event. Only fires when the measured drift confirms the local
 * clock is genuinely ≥5 seconds ahead, preventing false positives from stale JWTs.
 */
export const notifyClockSkewDetected = async () => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;

  try {
    // Make a lightweight HEAD request to measure real drift from the Date header
    const res = await fetch(
      `${supabase?.supabaseUrl || ''}/rest/v1/`,
      { method: 'HEAD', headers: { apikey: supabase?.supabaseKey || '' } }
    ).catch(() => null);

    const serverDateHeader = res?.headers?.get('date');
    const serverTimeMs = serverDateHeader ? new Date(serverDateHeader).getTime() : 0;
    const driftMs = serverTimeMs ? Date.now() - serverTimeMs : 0;

    if (driftMs > 5000) {
      window.dispatchEvent(
        new CustomEvent('quitmark:clock-skew', {
          detail: {
            driftMs,
            driftSeconds: Math.round(driftMs / 1000),
            serverDate: serverDateHeader,
          },
        })
      );
    }
  } catch {
    // If the measurement request fails, don't show a false banner
  }
};

/**
 * Detects if an error is caused by system clock skew / drift
 * ("JWT issued at future", PostgREST PGRST303).
 */
export const isClockSkewError = (error) => {
  if (!error) return false;
  const code = error?.code || '';
  if (code === 'PGRST303') return true;

  const message = (error?.message || error?.toString?.() || '').toLowerCase();
  const description = (error?.error_description || error?.description || '').toLowerCase();
  const details = (error?.details || '').toLowerCase();
  const hint = (error?.hint || '').toLowerCase();

  return (
    code === 'PGRST303' ||
    message.includes('jwt issued at future') ||
    message.includes('issued at future') ||
    message.includes('issued in the future') ||
    (message.includes('future') && message.includes('jwt')) ||
    description.includes('jwt issued at future') ||
    description.includes('issued at future') ||
    details.includes('future') ||
    hint.includes('future')
  );
};

/**
 * Returns true only for errors caused by a rejected or expired access token.
 * Clock skew errors ("JWT issued at future") return false because refreshing immediately
 * does not fix clock skew and can cause false logouts.
 */
export const isAuthenticationError = (error) => {
  if (!error || isClockSkewError(error)) return false;

  const status = Number(error?.status);
  const message = (error?.message || error?.toString?.() || '').toLowerCase();
  return status === 401 ||
    message.includes('jwt expired') ||
    message.includes('invalid jwt') ||
    message.includes('invalid token') ||
    message.includes('unauthorized') ||
    message.includes('authentication is required');
};

/**
 * Evicts stale or rejected auth tokens from localStorage, signs out Supabase client,
 * and notifies the application to cleanly navigate to /login.
 */
export const forceSignOut = async () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore
    }
  }
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('quitmark:session-expired'));
  }
};

/**
 * Refreshes the session after a Supabase request rejects its access token.
 * Callers retry exactly once, preventing request loops for revoked sessions.
 * If the refresh fails, forces sign out to avoid leaving the app in an invalid state.
 */
export const refreshSessionOrThrow = async () => {
  ensureClient();
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data?.session?.user) {
    await forceSignOut();
    throw new Error('Your session has expired. Please log in again.');
  }
  // Notify that the session recovered (auto-dismiss clock skew banner)
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('quitmark:session-recovered'));
  }
  return data.session;
};

const runSingleAuthRequest = (key, request) => {
  let pending = pendingAuthRequests.get(key);

  if (!pending) {
    pending = Promise.resolve()
      .then(request)
      .finally(() => pendingAuthRequests.delete(key));
    pendingAuthRequests.set(key, pending);
  }

  return withTimeout(pending);
};

/**
 * Signs up a user using email and password.
 */
export const signUpWithEmail = async (email, password) => {
  ensureClient();
  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/confirm-email`
      : '/confirm-email';

  const { data, error } = await runSingleAuthRequest(
    `signup:${email.trim().toLowerCase()}`,
    () => supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
  );

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};

/**
 * Signs in a user using email and password.
 */
export const signInWithEmail = async (email, password) => {
  ensureClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};

/**
 * Initiates Google OAuth sign-in with an environment-aware redirect URL.
 */
export const signInWithGoogle = async () => {
  ensureClient();
  const isNative = Capacitor.isNativePlatform();
  const redirectUrl = isNative
    ? 'com.quitmark.app://auth/callback'
    : typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : '/dashboard';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: isNative,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  if (isNative && data?.url) {
    await Browser.open({ url: data.url });
  }

  return data;
};

/**
 * Signs out the current user and clears session.
 */
export const signOut = async () => {
  ensureClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
};

/**
 * Retrieves the current session from Supabase.
 */
export const getSession = async () => {
  if (!supabase) return { session: null, user: null };
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[Quitmark] Error fetching initial session:', error);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('future') || msg.includes('jwt') || error.code === 'PGRST303') {
        await new Promise((res) => setTimeout(res, 500));
        const { data: refreshed, error: refErr } = await supabase.auth.refreshSession().catch(() => ({ data: {}, error: null }));
        if (!refErr && refreshed?.session) {
          return { session: refreshed.session, user: refreshed.session.user || null };
        }
      }
      return { session: null, user: null };
    }

    // Proactively check if the access_token has an iat from the future
    if (data?.session?.access_token && typeof data.session.access_token === 'string') {
      try {
        const parts = data.session.access_token.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(
            typeof atob === 'function'
              ? atob(base64)
              : (globalThis.Buffer?.from(base64, 'base64').toString('utf-8') || '{}')
          );
          const currentSec = Math.floor(Date.now() / 1000);
          if (payload?.iat && payload.iat > currentSec + 2) {
            console.warn('[Quitmark] Loaded session token iat is in the future. Forcing immediate refresh.');
            const { data: refreshed, error: refErr } = await supabase.auth.refreshSession().catch(() => ({ data: {}, error: null }));
            if (!refErr && refreshed?.session) {
              return { session: refreshed.session, user: refreshed.session.user || null };
            }
          }
        }
      } catch {
        // Fall through safely
      }
    }

    return { session: data.session, user: data.session?.user || null };
  } catch (err) {
    console.warn('[Quitmark] Unexpected error fetching session:', err);
    return { session: null, user: null };
  }
};

/**
 * Subscribes to Supabase authentication state changes.
 */
export const onAuthStateChange = (callback) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
};

let lastSyncedTimezone = null;
let syncTimezonePromise = null;

export const clearCachedTimezone = () => {
  lastSyncedTimezone = null;
  syncTimezonePromise = null;
};

/**
 * Stores the browser's IANA time zone for server-side date calculations.
 * Features in-memory caching and in-flight deduplication to avoid redundant network round-trips.
 */
export const syncUserTimezone = async () => {
  if (!supabase || typeof Intl === 'undefined') return;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timeZone || lastSyncedTimezone === timeZone) return;

  if (syncTimezonePromise) {
    return syncTimezonePromise;
  }

  syncTimezonePromise = (async () => {
    try {
      let retries = 2;
      let authRetries = 1;
      let result;

      while (retries >= 0) {
        result = await supabase.rpc('set_my_time_zone', {
          requested_time_zone: timeZone,
        });

        if (!result.error) {
          lastSyncedTimezone = timeZone;
          return;
        }

        if (isClockSkewError(result.error)) {
          notifyClockSkewDetected();
          if (retries > 0) {
            retries--;
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }
        }

        if (isAuthenticationError(result.error) && authRetries > 0) {
          authRetries--;
          try {
            await refreshSessionOrThrow();
            continue;
          } catch {
            break;
          }
        }

        break;
      }

      if (result?.error) {
        if (isClockSkewError(result.error)) {
          console.warn('[Quitmark] Clock skew detected during time zone sync: Device clock is ahead of server time.');
        } else {
          console.warn('[Quitmark] Unable to synchronize user time zone:', result.error);
        }
      }
    } finally {
      syncTimezonePromise = null;
    }
  })();

  return syncTimezonePromise;
};

/**
 * Sends a password reset email to the specified address.
 */
export const sendPasswordResetEmail = async (email) => {
  ensureClient();
  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : '/reset-password';

  const { error } = await runSingleAuthRequest(
    `password-reset:${email.trim().toLowerCase()}`,
    () => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  );

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
};

/**
 * Updates the user's password securely (requires an active session).
 */
export const updatePassword = async (newPassword) => {
  ensureClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};
