const CACHE = 'ma-diete-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // Pages / navigation : réseau d'abord -> toujours la dernière version en ligne ; cache en secours hors-ligne
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
                .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // Autres ressources : cache d'abord, réseau sinon
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
