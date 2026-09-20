import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isPushSupported, subscribeToPush } from '../utils/notifications/pushSubscription';
import { isNativeApp, ensureNotificationChannel } from '../utils/notifications/nativeReminderService';

/**
 * Notification Coordinator Hook.
 *
 * In adherence with system rules:
 * - Server-side Edge Function handles Web Push scheduling.
 * - Android AlarmManager handles native Capacitor scheduling.
 * - This hook ensures channels and push subscriptions are registered
 *   without running duplicate foreground JavaScript interval timers.
 */
export function useNotificationScheduler() {
  const userId = useSelector((state) => state.auth?.user?.id || null);

  useEffect(() => {
    if (!userId) return;

    if (isNativeApp()) {
      ensureNotificationChannel();
    } else if (isPushSupported() && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      // Ensure Web Push subscription exists in Supabase only if active service worker exists
      navigator.serviceWorker?.getRegistration().then((reg) => {
        if (reg?.active) {
          subscribeToPush().catch((err) => {
            console.warn('[Quitmark] Background push subscription verification skipped:', err);
          });
        }
      }).catch(() => {});
    }
  }, [userId]);
}
