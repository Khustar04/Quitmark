/**
 * Notification Permission Utility for Quitmark.
 * Handles checking and requesting browser notification permissions.
 */

export const isNotificationSupported = () => {
  return 'Notification' in window;
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

export const sendNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
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
