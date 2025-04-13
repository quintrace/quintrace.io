const CACHE_NAME = 'quintrace-v1';
const urlsToCache = [
  'https://quintrace.github.io/quintrace.io/',
  'https://quintrace.github.io/quintrace.io/index.html',
  'https://quintrace.github.io/quintrace.io/contact.html',
  'https://quintrace.github.io/quintrace.io/offline.html',
  'https://quintrace.github.io/quintrace.io/manifest.json',
  'https://quintrace.github.io/quintrace.io/assets/image/quintrace-logo-full.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-72x72.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-96x96.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-128x128.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-144x144.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-152x152.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-192x192.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-384x384.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/icon-512x512.png',
  'https://quintrace.github.io/quintrace.io/assets/icons/maskable_icon.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Return the response as-is if not valid or is a chrome-extension request
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.url.startsWith('chrome-extension://')) {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, return offline fallback for HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('https://quintrace.github.io/quintrace.io/offline.html');
        }
      })
  );
});