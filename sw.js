// Mes stats : fonctionne hors ligne. Aucune donnée du joueur ne passe par ici.
const VERSION = 'mes-stats-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './fonts/archivo.woff2', './fonts/source-sans-3-400.woff2', './fonts/source-sans-3-600.woff2', './fonts/source-sans-3-700.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // La page : réseau d'abord, pour recevoir les mises à jour ; cache si hors ligne
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Le reste : cache d'abord
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })));
});
