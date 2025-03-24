const CACHE_NAME = "offline-cache-v9";
const urlsToCache = [
    "/",
    "index.html",
    "https://uva-beryl.vercel.app/cartao_300.txt", // Garanta que o arquivo .txt esteja no cache
];

// Quando o Service Worker é instalado
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cache aberto para instalação.");
            return cache.addAll(urlsToCache).then(() => {
                console.log("Arquivos adicionados ao cache.");
            });
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
                        console.log(`Deletando cache antigo: ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Quando o Service Worker intercepta uma requisição
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Quando o usuário estiver offline, tenta retornar o arquivo do cache
            console.log(`Tentando carregar do cache: ${event.request.url}`);
            return caches.match(event.request).then((response) => {
                if (response) {
                    console.log(`Arquivo encontrado no cache: ${event.request.url}`);
                    return response; // Se encontrar no cache, retorna o arquivo
                }

                // Se não encontrar no cache, retorna o index.html como fallback
                console.log("Arquivo não encontrado no cache, retornando index.html.");
                return caches.match("index.html");
            });
        })
    );
});
