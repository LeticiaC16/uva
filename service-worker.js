const CACHE_NAME = "offline-cache-v6";
const urlsToCache = [
    "/",
    "index.html",
    "https://uva-beryl.vercel.app/cartao_300.txt", // Garanta que o arquivo .txt esteja no cache
];

// Quando o Service Worker é instalado
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache); // Adiciona os arquivos ao cache
        })
    );
    self.skipWaiting();
});

// Quando o Service Worker é ativado
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Deleta caches antigos
                    }
                })
            );
        })
    );
});

// Quando o Service Worker intercepta uma requisição
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Se o arquivo não estiver online, tenta retornar do cache
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response; // Se encontrar no cache, retorna o arquivo
                }
                // Caso contrário, retorna index.html como fallback
                return caches.match("index.html");
            });
        })
    );
});


// Quando o Service Worker intercepta uma requisição
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Quando o usuário estiver offline, tenta retornar o arquivo do cache
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response; // Se encontrar no cache, retorna o arquivo
                }

                // Se não encontrar no cache, retorna o index.html como fallback
                return caches.match("index.html");
            });
        })
    );
});

// Quando o Service Worker intercepta uma requisição
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Quando o usuário estiver offline, tenta retornar o arquivo do cache
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response; // Se encontrar no cache, retorna o arquivo
                }

                // Se não encontrar no cache, retorna o index.html como fallback
                return caches.match("index.html");
            });
        })
    );
});
