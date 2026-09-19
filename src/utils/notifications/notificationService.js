/**
 * Notification Permission Utility for Quitmark.
 * Handles checking and requesting browser notification permissions.
 */

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

const isMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';

  // If already granted or denied, don't request again
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const sendNotification = async (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });
        return true;
      }
    }

    if (isMobileBrowser()) {
      console.warn('[Quitmark] An active service worker is required for mobile notifications.');
      return false;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });

    notification.onclick = function() {
      window.focus();
      this.close();
    };

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};
