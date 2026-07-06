const CACHE_NAME = "roblox-studio-online-v1";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo512.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Pre-caching warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle local API requests gracefully if offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(async (error) => {
        console.log("Offline API request detected, returning local mock response.");
        
        if (url.pathname === "/api/ai/chat") {
          return new Response(
            JSON.stringify({
              text: "📴 [Офлайн Режим] Ви працюєте офлайн. Я не можу з'єднатися з сервером ШІ, але ви можете будувати, писати та запускати код, створювати блоки та зберігати сцени прямо на своєму пристрої!"
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
        
        if (url.pathname === "/api/ai/build") {
          return new Response(
            JSON.stringify({
              parts: [
                {
                  name: "OfflinePart",
                  shape: "block",
                  color: "#00FF88",
                  position: [0, 2, 0],
                  size: [4, 4, 4],
                  material: "Neon",
                  anchored: true,
                  canCollide: true,
                  transparency: 0
                }
              ]
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "Ви зараз офлайн" }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Stale-While-Revalidate strategy for static resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore fetch errors in background
          });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch((err) => {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
        throw err;
      });
    })
  );
});
