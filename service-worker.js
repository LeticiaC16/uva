const CACHE_NAME = "offline-cache-v6";
const urlsToCache = [
    "/",
    "index.html",
    "https://uva-beryl.vercel.app/cartao_300.txt", // Garanta que o arquivo .txt esteja no cache
];

// Função para abrir ou criar o IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("offlineDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("txts")) {
                db.createObjectStore("txts", { keyPath: "matricula" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao abrir IndexedDB.");
    });
}

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
            // Quando o usuário estiver offline, tenta retornar o arquivo do cache
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response; // Se encontrar no cache, retorna o arquivo
                }

                // Se não encontrar no cache, tenta retornar do IndexedDB
                return new Promise((resolve, reject) => {
                    openIndexedDB().then((db) => {
                        const transaction = db.transaction("txts", "readonly");
                        const store = transaction.objectStore("txts");
                        const getRequest = store.get(event.request.url);

                        getRequest.onsuccess = () => {
                            if (getRequest.result) {
                                resolve(new Response(getRequest.result.texto));
                            } else {
                                resolve(caches.match("index.html")); // Fallback para index.html
                            }
                        };
                        getRequest.onerror = reject;
                    }).catch(reject);
                });
            });
        })
    );
});

// Função para armazenar um arquivo no IndexedDB
function armazenarNoIndexedDB(matricula, texto) {
    openIndexedDB().then((db) => {
        const transaction = db.transaction("txts", "readwrite");
        const store = transaction.objectStore("txts");
        store.put({ matricula, texto });
        transaction.oncomplete = () => console.log(`Texto armazenado para a matrícula ${matricula}`);
    }).catch((error) => {
        console.error("Erro ao armazenar no IndexedDB", error);
    });
}
