const CACHE_NAME = 'freelancer-os-cache-v1';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/favicon.ico',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install Event - Pre-cache offline page and essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline fallback and assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip Next.js dev server/hot-reloads or chrome-extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip NextAuth API, dashboard database APIs, or dev hot-reloads
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.includes('webpack')) {
    return;
  }

  // Network-First with Cache Fallback for HTML page requests (navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Open cache and save page copy for offline use
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, check cache for the page
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If page is not in cache, return pre-cached offline fallback page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache-First with Network Fallback for static assets (images, styles, scripts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache newly fetched static assets on the fly
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
