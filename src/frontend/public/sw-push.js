/**
 * Push Notification Service Worker
 * Handles browser push notifications for QualiFlow
 */

 
self.addEventListener('install', (_event) => {
  console.log('[SW Push] Installing service worker...');

  self.skipWaiting();
});

 
self.addEventListener('activate', (event) => {
  console.log('[SW Push] Service worker activated');
   
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
 
self.addEventListener('push', (event) => {
  console.log('[SW Push] Push notification received');

  let notificationData = {
    title: 'QualiFlow',
    body: 'You have a new notification',
    icon: '/icons/qualiflow-icon-192.png',
    badge: '/icons/qualiflow-badge-72.png',
    tag: 'qualiflow-notification',
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [],
    vibrate: [100, 50, 100],
    renotify: true,
  };

  event.waitUntil(
     
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
 
self.addEventListener('notificationclick', (event) => {
  console.log('[SW Push] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const actionUrl = event.notification.data?.actionUrl || '/';

  event.waitUntil(
     
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (actionUrl !== '/') {
            client.navigate(actionUrl);
          }
          return;
        }
      }
      // Open a new window if none is open
       
      return clients.openWindow(actionUrl);
    })
  );
});

// Handle notification close
 
self.addEventListener('notificationclose', (event) => {
  console.log('[SW Push] Notification closed:', event.notification.tag);
});

