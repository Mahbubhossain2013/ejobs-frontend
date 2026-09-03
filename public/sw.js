// Self-destructing Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((c) => {
          if (c.url && 'navigate' in c) {
            c.navigate(c.url);
          }
        });
      })
  );
});

// Pass all network requests directly without any caching
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
