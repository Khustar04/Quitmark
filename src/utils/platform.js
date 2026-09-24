import { Capacitor } from '@capacitor/core';

/**
 * Returns true if running inside native Capacitor environment (Android/iOS APK).
 */
export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns true if running in native app OR mobile preview mode (?mobile=1 or ?app=1).
 */
export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mobile') === '1' || params.get('app') === '1') return true;
  } catch {
    // Ignore in SSR/unsupported envs
  }
  return false;
};

const ONBOARDING_STORAGE_KEY = 'quitmark_onboarding_completed';

/**
 * Returns true if user has already completed or skipped the mobile onboarding flow.
 */
export const isOnboardingCompleted = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Persists that onboarding was completed/skipped so it is never shown again on this device.
 */
export const setOnboardingCompleted = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage quota/security errors
  }
};

/**
 * Resets the onboarding flag (for debugging/testing).
 */
export const resetOnboarding = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Ignore
  }
};
