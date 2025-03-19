const CACHE_NAME = "offline-cache-v5";
const urlsToCache = [
    "/",
    "index.html",
    "https://uva-beryl.vercel.app/cartao_300.txt"  // Arquivo .txt que você quer armazenar offline
];

// Durante o "install", cacheamos os arquivos necessários
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Durante o "activate", fazemos limpeza dos caches antigos
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

// Durante o "fetch", verificamos se o recurso está no cache ou tentamos obtê-lo da rede
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                // Retorna o arquivo cacheado se disponível
                return caches.match("index.html");
            });
        })
    );
});
