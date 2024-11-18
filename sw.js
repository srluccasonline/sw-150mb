const CACHE_NAME = 'pwa-test-cache-v1';
const TEST_FILE_BASE_URL = 'https://raw.githubusercontent.com/srluccasonline/sw-150mb/refs/heads/main/test-files/test-file-';

// Adicionar evento de mensagem para receber comandos
self.addEventListener('message', (event) => {
    if (event.data === 'CLEAR_CACHE') {
        console.log('📢 Recebido comando para limpar cache');
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('🗑️ Cache limpo com sucesso');
                })
        );
    }
});

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalando...');
    // Não vamos pré-cachear todos os arquivos na instalação
    self.skipWaiting();
});

// Interceptar requisições fetch
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // Verifica se a requisição é para um arquivo de teste
    if (url.includes('test-files/test-file-')) {
        event.respondWith(
            caches.open(CACHE_NAME)
                .then(cache => {
                    return cache.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('✅ Servindo do cache:', url);
                                const headers = new Headers(cachedResponse.headers);
                                headers.append('sw-from-cache', 'true');
                                
                                return new Response(cachedResponse.body, {
                                    status: cachedResponse.status,
                                    statusText: cachedResponse.statusText,
                                    headers: headers
                                });
                            }

                            console.log('⬇️ Baixando novo arquivo:', url);
                            return fetch(event.request)
                                .then(networkResponse => {
                                    if (!networkResponse.ok) {
                                        throw new Error('Resposta da rede não ok');
                                    }
                                    
                                    const responseToCache = networkResponse.clone();
                                    
                                    // Log quando salvar no cache
                                    cache.put(event.request, responseToCache)
                                        .then(() => {
                                            console.log('💾 Salvou no cache:', url);
                                        });
                                    
                                    return networkResponse;
                                });
                        });
                })
                .catch(error => {
                    console.error('❌ Erro:', error, url);
                    return new Response('Erro ao carregar arquivo', { 
                        status: 500,
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                })
        );
    }
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
