const CACHE_NAME = 'pwa-test-cache-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const urlsToCache = Array.from({ length: 30 }, (_, i) => 
                `./test-files/test-file-${i + 1}.txt`
            );
            console.log('Iniciando cache dos arquivos...');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('Arquivo encontrado no cache:', event.request.url);
                return response;
            }
            console.log('Arquivo não encontrado no cache:', event.request.url);
            return fetch(event.request);
        })
    );
});
