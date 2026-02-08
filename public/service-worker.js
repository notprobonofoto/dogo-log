// DogoLog Push Notification Service Worker
// This service worker handles Web Push notifications

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    data = { title: 'DogoLog', body: event.data?.text() || 'Nowe powiadomienie' };
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'dogolog-notification',
    renotify: true,
    data: {
      url: data.url || '/',
      type: data.type || 'notification'
    },
    actions: []
  };

  // Add action buttons based on notification type
  if (data.type === 'walk') {
    options.actions = [
      { action: 'open', title: '🐾 Otwórz' }
    ];
  } else if (data.type === 'feed') {
    options.actions = [
      { action: 'open', title: '🍖 Otwórz' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'DogoLog', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(clients.claim());
});

// Handle installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});
