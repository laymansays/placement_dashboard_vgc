/* ═══════════════════════════════════════════════════════
   VGI Placement — Service Worker
   Caches app shell for fast load; data always fetched live
   ═══════════════════════════════════════════════════════ */

const CACHE = 'vgi-placement-v1';

const SHELL = [
  '/placement_dashboard_vgc/',
  '/placement_dashboard_vgc/index.html',
  '/placement_dashboard_vgc/student.html',
  '/placement_dashboard_vgc/placement-dashboard.html',
  '/placement_dashboard_vgc/logo.jpg',
  '/placement_dashboard_vgc/manifest.json',
];

/* Install — cache the app shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

/* Activate — delete old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — app shell from cache, everything else from network */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* Always fetch live: Google APIs, Sheets, Drive, Apps Script */
  if (
    url.hostname.includes('google') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('script.google')
  ) {
    return; /* Let browser handle normally */
  }

  /* App shell: cache-first */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        /* Cache valid same-origin responses */
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        /* Offline fallback for HTML pages */
        if (e.request.destination === 'document') {
          return caches.match('/placement_dashboard_vgc/student.html');
        }
      });
    })
  );
});
