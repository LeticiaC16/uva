const CACHE_NAME = "offline-cache-v4";
const urlsToCache = [
    "/",
    "index.html",
    // Atualizando o arquivo para cartao_282.txt
    "https://raw.githubusercontent.com/LeticiaC16/treinamento/refs/heads/main/cartao_282.txt" // Atualização do nome do arquivo
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache); // Cacheando os arquivos necessários
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
                        return caches.delete(cache); // Removendo caches antigos
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                // Caso o arquivo solicitado esteja no cache, retorna ele
                if (response) {
                    return response;
                }

                // Se não encontrar no cache, retorna o conteúdo do arquivo index.html
                return caches.match("index.html");
            });
        })
    );
});
