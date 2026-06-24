// Minimal service worker — satisfies installability, no aggressive caching.
// Cache only the app shell (icons + manifest); always go to network for HTML/assets
// so updates appear without a stale-cache wait.
const SHELL = 'scs-shell-v1';
const SHELL_FILES = ['./manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (SHELL_FILES.some(f => url.pathname.endsWith(f.replace('./', '/')))) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
  // Everything else: default network behavior (no interception).
});
