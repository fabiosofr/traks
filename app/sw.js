// Cambia il numero di versione a ogni aggiornamento dell'app
const CACHE = 'traks-v18';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './css/app.css',
  './js/exercise-data.js', './js/utils.js', './js/store.js', './js/domain.js', './js/nav.js',
  './js/view-home.js', './js/view-session.js', './js/view-history.js', './js/charts.js',
  './js/view-exercises.js', './js/view-routines.js', './js/view-progress.js', './js/view-more.js',
  './js/ui.js', './js/main.js',
  './unbounded.woff2', './instrument-sans.woff2', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const save = res => { if (res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  // pagina, codice e stili: prima la rete (gli aggiornamenti arrivano subito), senza rete la copia salvata
  if (e.request.mode === 'navigate' || /\.(js|css)$/.test(url.pathname)){
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request, {ignoreSearch:true}).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  // font e icone: prima la copia salvata
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request).then(save)));
});
