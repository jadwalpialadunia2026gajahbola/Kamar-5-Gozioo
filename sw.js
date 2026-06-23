// sw.js — minimal, tidak cache apapun yang bisa 404
const CACHE_NAME = 'kamar5-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
  // Tidak cache apapun saat install — hindari error addAll
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase — selalu network, jangan pernah cache
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Semua request lain — network first, fallback cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Hanya cache response yang sukses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
