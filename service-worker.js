const CACHE_NAME = "offline-cache-v10";

const urlsToCache = [
    "/",
    "/index.html",
    "/redirect.html"
];

// INSTALAÇÃO
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cache inicial criado");
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// ATIVAÇÃO
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
    self.clients.claim();
});

// FETCH (Intercepta imagens PNG automaticamente)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    // Só cacheia se for sucesso
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    return new Response("Arquivo não disponível offline", {
                        status: 404,
                        headers: { "Content-Type": "text/plain" }
                    });
                });
        })
    );
});
