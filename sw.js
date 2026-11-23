const CACHE = 'deadline-offline-v4-gradecalc';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './security.js', './grade-math.js', './grades.js', './manifest.webmanifest', './icons/favicon.svg', './icons/icon-192.png', './icons/icon-512.png'];
const assetURLs = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('deadline-offline-') && k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !assetURLs.has(new URL(request.url).href)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) { return (await caches.match(request)) || Response.error(); }
  })());
});