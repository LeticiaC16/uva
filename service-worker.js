const CACHE_NAME = "offline-cache-v7"; // Atualize para forçar uma nova versão do cache

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "index.html",
                "redirect.html", // Inclua o redirect.html no cache
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response; // Serve from cache if available
            }

            // Else fetch and cache the file
            return fetch(event.request).then((networkResponse) => {
                // Cache only the relevant files (e.g., txt, png)
                if (
                    event.request.url.endsWith(".txt") ||
                    event.request.url.endsWith(".png")
                ) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
        })
    );
});
