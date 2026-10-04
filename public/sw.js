const CACHE_NAME = "code-cache-v4";
const ICONS_CACHE_NAME = "code-icons-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
];

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
  "/apple-touch-icon.png",
];

/* =========================================================
   INSTALLATION
========================================================= */

self.addEventListener("install", (event) => {
  console.log("🟢 Nouveau Service Worker installé");

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      }),

      caches.open(ICONS_CACHE_NAME).then((cache) => {
        return cache.addAll(iconsToCache);
      }),
    ])
  );

  /*
   * IMPORTANT :
   *
   * Aucun skipWaiting() ici.
   *
   * Le nouveau Service Worker reste en attente jusqu'à ce
   * que l'utilisateur demande explicitement la mise à jour.
   */
});

/* =========================================================
   ACTIVATION
========================================================= */

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activé");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== ICONS_CACHE_NAME
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/* =========================================================
   REQUÊTES
========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  /*
   * Nous ne gérons que les requêtes GET.
   */
  if (request.method !== "GET") {
    return;
  }

  const requestURL = new URL(request.url);

  /*
   * Nous ne devons pas intercepter les requêtes vers
   * d'autres domaines.
   */
  if (requestURL.origin !== self.location.origin) {
    return;
  }

  /* =======================================================
     MANIFEST + ICÔNES
  ======================================================= */

  if (iconsToCache.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (!response || !response.ok) {
            return response;
          }

          const clone = response.clone();

          caches
            .open(ICONS_CACHE_NAME)
            .then((cache) => {
              return cache.put(request, clone);
            })
            .catch((error) => {
              console.warn(
                "⚠️ Impossible de mettre l'icône en cache :",
                error
              );
            });

          return response;
        });
      })
    );

    return;
  }

  /* =======================================================
     API
  ======================================================= */

  /*
   * Les données de l'application doivent rester dynamiques.
   *
   * On laisse donc les appels API aller directement au réseau.
   *
   * Exemple :
   * /api/...
   */

  if (
    requestURL.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        /*
         * En cas de problème réseau, nous ne fabriquons pas
         * une réponse API à partir de index.html.
         */
        return new Response(
          JSON.stringify({
            detail:
              "Connexion au serveur impossible.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );
      })
    );

    return;
  }

  /* =======================================================
     AUTRES RESSOURCES
     
     NETWORK FIRST
  ======================================================= */

  event.respondWith(
    fetch(request)
      .then((response) => {
        /*
         * On ne met en cache que les réponses valides.
         */
        if (response && response.ok) {
          const clone = response.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              return cache.put(
                request,
                clone
              );
            })
            .catch((error) => {
              console.warn(
                "⚠️ Impossible de mettre la ressource en cache :",
                error
              );
            });
        }

        return response;
      })
      .catch(() => {
        return caches
          .match(request)
          .then((cached) => {
            if (cached) {
              return cached;
            }

            /*
             * Pour une navigation, on revient sur index.html
             * afin que React Router puisse gérer la route.
             */
            if (request.mode === "navigate") {
              return caches.match(
                "/index.html"
              );
            }

            /*
             * Pour une ressource qui n'est pas disponible
             * hors connexion, on laisse le navigateur gérer
             * l'erreur normalement.
             */
            return new Response(
              "Ressource indisponible hors connexion.",
              {
                status: 503,
                statusText:
                  "Service Unavailable",
              }
            );
          });
      })
  );
});

/* =========================================================
   MESSAGES VENANT DE CODE
========================================================= */

self.addEventListener("message", (event) => {
  const data = event.data;

  /* -------------------------------------------------------
     NOUVEAU FORMAT
  ------------------------------------------------------- */

  if (
    data &&
    data.type === "SKIP_WAITING"
  ) {
    console.log(
      "🚀 Mise à jour de CODE demandée par l'utilisateur"
    );

    self.skipWaiting();

    return;
  }

  /* -------------------------------------------------------
     ANCIEN FORMAT
     
     Conservé pour compatibilité.
  ------------------------------------------------------- */

  if (data === "SKIP_WAITING") {
    console.log(
      "🚀 Ancienne commande SKIP_WAITING reçue"
    );

    self.skipWaiting();
  }
});