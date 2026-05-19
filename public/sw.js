const CACHE_NAME = "petelur-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Next.js static assets + icons: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetchAndCache(request))
    );
    return;
  }

  // Navigation: network-first, fallback to cache, then offline page
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached ?? caches.match("/offline"))
      )
  );
});

async function fetchAndCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}
