const CACHE_NAME = "offline-cache-v8";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(["/", "index.html"]);
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
    let requestUrl = new URL(event.request.url);

    // Verifica se a solicitação é para um arquivo TXT específico
    if (requestUrl.pathname.includes("cartao_")) {
        let matriculaMatch = requestUrl.pathname.match(/cartao_(\d+)\.txt/);
        if (matriculaMatch) {
            let matricula = matriculaMatch[1];
            let txtUrl = `https://raw.githubusercontent.com/LeticiaC16/uva/main/cartao_${matricula}.txt`;

            event.respondWith(
                fetch(txtUrl)
                    .then((response) => {
                        // Se o arquivo for encontrado online, faz o cache dele
                        let responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(txtUrl, responseClone); // Armazena o arquivo no cache
                        });
                        return response; // Retorna a resposta normalmente
                    })
                    .catch(() => {
                        // Se estiver offline, tenta obter o arquivo do cache
                        return caches.match(txtUrl).then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse; // Retorna o arquivo cacheado
                            } else {
                                // Se o arquivo não estiver no cache, retorna o fallback (index.html)
                                return caches.match("index.html");
                            }
                        });
                    })
            );
            return; // Retorna para evitar o código abaixo
        }
    }

    // Se não for um arquivo TXT, usa a abordagem padrão do cache
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                return response || caches.match("index.html"); // Fallback para index.html se não encontrar
            });
        })
    );
});
