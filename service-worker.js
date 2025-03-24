const CACHE_NAME = "offline-cache-v7";

// Quando o Service Worker é instalado, só armazenamos o index.html
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(["/index.html"]);
        })
    );
    self.skipWaiting();
});

// Ativação: remove caches antigos
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

// Intercepta todas as requisições
self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);

    // Se for um arquivo .txt, tenta armazená-lo no cache para acesso offline
    if (requestUrl.pathname.endsWith(".txt")) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                try {
                    const response = await fetch(event.request);
                    if (response.ok) {
                        cache.put(event.request, response.clone()); // Salva no cache
                    }
                    return response;
                } catch (error) {
                    return cache.match(event.request) || new Response("Arquivo offline não encontrado.", {
                        status: 404,
                        statusText: "Not Found"
                    });
                }
            })
        );
        return;
    }

    // Para outros arquivos, primeiro tenta buscar online, depois recorre ao cache
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                return response || caches.match("/index.html");
            });
        })
    );
});
