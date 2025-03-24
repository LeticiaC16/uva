const CACHE_NAME = "offline-cache-v8"; // Atualize a versão do cache
const urlsToCache = [
    "/",
    "index.html",
    "redirect.html", // Inclua o redirect.html no cache
    "cartao.txt",    // Adicione o arquivo TXT ao cache, se necessário
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cache está sendo aberto e os arquivos estão sendo armazenados.");
            return cache.addAll(urlsToCache);
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
                        return caches.delete(cache); // Limpa caches antigos
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Se o arquivo está em cache, retorna-o
            if (cachedResponse) {
                console.log("Arquivo encontrado no cache: ", event.request.url);
                return cachedResponse;
            }

            // Caso não tenha o arquivo no cache, tenta fazer o fetch da rede
            return fetch(event.request).catch((error) => {
                console.error("Falha ao buscar o arquivo na rede: ", error);
                // Se falhar, tenta retornar o fallback (como um arquivo de erro)
                return caches.match("index.html");
            });
        })
    );
});
