/* EagleEyE — Service Worker v13.6
   PASSIVE mode — does NOT cache anything on install.
   Only handles push notifications.
   This prevents the service worker from serving stale
   cached files that break the site.
*/

const CACHE_NAME = 'eagleeye-v13.6';

// On install — do nothing, skip waiting immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// On activate — delete ALL old caches, claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        console.log('[SW] Deleting cache:', k);
        return caches.delete(k);
      }))
    ).then(() => clients.claim())
  );
});

// Fetch — ALWAYS go to network, never serve from cache
// This ensures users always get the latest version of the site
self.addEventListener('fetch', event => {
  // Just let all requests go through to the network normally
  // Do not intercept or cache anything
  return;
});

// Push notifications — this is the only active feature
self.addEventListener('push', event => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); }
  catch (e) { data = { title: 'EagleEyE', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'EagleEyE', {
      body:    data.body || '',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      data:    { url: data.url || '/dashboard.html' },
      actions: [
        { action: 'view',    title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/dashboard.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(url) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
