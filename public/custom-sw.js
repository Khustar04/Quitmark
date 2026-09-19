/**
 * Quitmark Custom Service Worker — Push Notification Handler
 * This file is imported into the Workbox-generated service worker
 * via the importScripts config in vite.config.js.
 */

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Quitmark',
      body: event.data.text() || 'You have a habit reminder!',
    };
  }

  const title = payload.title || '🔔 Habit Reminder';
  const options = {
    body: payload.body || 'Time to update your habit.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: payload.tag || 'quitmark-reminder',
    data: {
      url: payload.url || '/dashboard',
    },
    // Vibrate pattern for mobile
    vibrate: [100, 50, 100],
    // Keep notification visible until user interacts
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click — open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || '/dashboard';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      // If the app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          try {
            await client.navigate(targetUrl);
          } catch (error) {
            console.warn('Unable to navigate notification client:', error);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
