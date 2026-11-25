/* Lumosity prototype service worker: precache shell, runtime cache for the rest. */
const CACHE = 'lumosity-proto-v1';
const SHELL = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  // Also cache the hashed bundle and the assets (fonts) referenced by CSS.
  const res = await fetch('./', { cache: 'reload' });
  const html = await res.clone().text();
  await cache.put('./', res);
  const scope = self.registration.scope;
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = new URL(m[1], scope);
    if (url.origin === self.location.origin && /\/assets\//.test(url.pathname)) urls.add(url.href);
  }
  for (const href of [...urls]) {
    const r = await fetch(href);
    await cache.put(href, r.clone());
    if (href.endsWith('.css')) {
      const css = await r.text();
      for (const m of css.matchAll(/url\(([^)]+)\)/g)) {
        const u = new URL(m[1].replace(/["']/g, ''), href);
        if (u.origin === self.location.origin) await cache.add(u.href);
      }
    }
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(precache().catch(() => undefined));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Network first for the HTML shell, cache fallback when offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
