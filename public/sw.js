// sw.js
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker installé !");
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activé !");
});

self.addEventListener("fetch", (event) => {
  // Ici tu peux gérer le caching si tu veux, pour l'instant on laisse passer
});
