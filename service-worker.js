const CACHE_NAME = "offline-cache-v7"; // Atualize para forçar uma nova versão do cache

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "index.html",
                "redirect.html",
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
            return (
                response ||
                fetch(event.request)
                    .then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            // Armazena dinamicamente arquivos TXT e PNG no cache
                            if (
                                event.request.url.includes(".txt") ||
                                event.request.url.includes(".png")
                            ) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        });
                    })
                    .catch(() => caches.match("index.html"))
            );
        })
    );
});
