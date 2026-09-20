/**
 * Web Push Subscription utilities for Quitmark.
 * Handles registering/unregistering the browser push subscription
 * and persisting it to Supabase via reminderService.
 */

import { savePushSubscription, deletePushSubscription } from '../../services/reminderService';

const SERVICE_WORKER_READY_TIMEOUT_MS = 2000;

/**
 * Resolves the active service worker registration, but never waits forever.
 * In Vite development and during a first PWA install, `ready` may not resolve.
 */
const getReadyServiceWorker = async () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported.');
  }

  // Fast path: if registration is already active, return immediately without waiting
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing && existing.active) {
      return existing;
    }
    // If no service worker registration exists at all in the browser (e.g. dev mode or not yet installed),
    // exit immediately rather than waiting for a ready promise that will never resolve
    if (!existing) {
      throw new Error('Service worker is not registered.');
    }
  } catch (err) {
    if (err.message === 'Service worker is not registered.') {
      throw err;
    }
    // Proceed to ready promise for installing/waiting service workers
  }

  const readyPromise = navigator.serviceWorker.ready;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error('Service worker is not ready yet.')),
      SERVICE_WORKER_READY_TIMEOUT_MS
    );
  });

  return Promise.race([readyPromise, timeoutPromise]);
};

/**
 * Checks if the browser supports the Push API via Service Worker.
 */
export const isPushSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Converts a base64url-encoded VAPID public key to a Uint8Array
 * (required by PushManager.subscribe).
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Registers a push subscription with the browser and saves it to Supabase.
 * Returns the PushSubscription or null if failed.
 */
export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    console.warn('[Quitmark] Push notifications are not supported in this browser.');
    return null;
  }

  try {
    // 1. Request notification permission if not already granted
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        console.warn('[Quitmark] Notification permission denied.');
        return null;
      }
    } else if (Notification.permission === 'denied') {
      console.warn('[Quitmark] Notification permission is blocked.');
      return null;
    }

    // 2. Get the service worker registration
    const registration = await getReadyServiceWorker();

    // 3. Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 4. Subscribe with VAPID public key
      const vapidPublicKey = import.meta.env.SUPABASE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('[Quitmark] VAPID public key is not configured.');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // 5. Save to Supabase
    await savePushSubscription(subscription);

    return subscription;
  } catch (error) {
    const isServiceWorkerInactive =
      error.message?.includes('not registered') ||
      error.message?.includes('not ready') ||
      error.message?.includes('not supported') ||
      import.meta.env?.DEV;

    if (isServiceWorkerInactive) {
      console.info('[Quitmark] Push notifications skipped (service worker not active):', error.message);
    } else {
      console.error('[Quitmark] Failed to subscribe to push notifications:', error);
    }
    return null;
  }
};

/**
 * Unsubscribes from push notifications and removes the subscription from Supabase.
 */
export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) return;

  try {
    const registration = await getReadyServiceWorker();
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      try {
        await deletePushSubscription(endpoint);
      } catch {
        // Subscription may already be removed from DB (e.g. cascade on user delete)
      }
    }
  } catch (error) {
    if (
      import.meta.env?.DEV ||
      error.message?.includes('not registered') ||
      error.message?.includes('not ready')
    ) {
      console.info('[Quitmark] Push unsubscription skipped (service worker not active):', error.message);
    } else {
      console.error('[Quitmark] Failed to unsubscribe from push:', error);
    }
  }
};

/**
 * Returns the current push subscription status.
 */
export const getPushSubscriptionStatus = async () => {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  try {
    const registration = await getReadyServiceWorker();
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? 'subscribed' : 'unsubscribed';
  } catch {
    return 'unsupported';
  }
};
