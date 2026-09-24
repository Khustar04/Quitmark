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
