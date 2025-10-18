const CACHE_NAME = "code-cache-v2";
const ICONS_CACHE_NAME = "code-icons-cache-v1";

const urlsToCache = ["/", "/index.html"];

const iconsToCache = [
  "/manifest.json",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-48x48.png",
  "/icon-72x72.png",
  "/icon-96x96.png",
  "/icon-128x128.png",
  "/icon-144x144.png",
  "/icon-152x152.png",
  "/icon-192x192.png",
  "/icon-256x256.png",
  "/icon-384x384.png",
  "/icon-512x512.png",
  "/icon-1024x1024.png",
  "/apple-touch-icon.png"
];

// 🟢 Installation : cache des fichiers de base et des icônes
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker installé");
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(ICONS_CACHE_NAME).then((cache) => cache.addAll(iconsToCache))
    ])
  );
  self.skipWaiting();
});

// ✅ Activation : suppression des anciens caches
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activé");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== ICONS_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 🔄 Gestion des requêtes
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestURL = new URL(event.request.url);

  // Cache First pour les icônes et manifest
  if (iconsToCache.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(ICONS_CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
        );
      })
    );
    return;
  }

  // Network First pour le reste
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/index.html"))
      )
  );
});

// 🔔 Gestion des messages depuis la page
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
