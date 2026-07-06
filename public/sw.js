// ============================================================
// marqaicourses Online Courses Platform — Service Worker
// Progressive Web App: offline-capable caching for static assets
// and an app-shell fallback for navigation requests.
// ============================================================

const CACHE_VERSION = 'marq-ai-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (fonts, analytics, etc.) — let the browser handle them
  if (url.origin !== self.location.origin) return;

  // Skip Next.js dev/HMR and API routes
  if (url.pathname.startsWith('/_next/webpack-hmr') ||
      url.pathname.startsWith('/_next/data') ||
      url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests (HTML pages) — network-first, fall back to cached app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // cache a copy of successful navigations
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('/', clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('/').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static assets (_next/static, images, css, js, fonts) — cache-first
  if (
    url.pathname.startsWith('/_next/static') ||
    /\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|otf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else — try network, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || Response.error()))
  );
});

// Listen for messages from the page (e.g., manual cache clear)
self.addEventListener('message', (event) => {
  if (event.data === 'marq:clear-cache') {
    caches.delete(CACHE_VERSION).then(() => {
      event.source && event.source.postMessage({ type: 'marq:cache-cleared' });
    });
  }
});
