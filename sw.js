const CACHE_NAME = 'pwa-test-cache-v1';

// Configure test file URLs
const TEST_FILE_BASE_URL = 'https://raw.githubusercontent.com/srluccasonline/sw-150mb/refs/heads/main/test-files/test-file-';
const TEST_FILE_EXTENSION = '.txt';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const urlsToCache = Array.from({ length: 30 }, (_, i) => 
                `/test-files/test-file-${i + 1}.txt`
            );
            console.log('Iniciando cache dos arquivos...');
            return cache.addAll(urlsToCache);
        })
    )
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Check if request is for a test file
    if (url.pathname.includes('test-file-')) {
        // Extract file number from URL
        const fileNumber = url.pathname.match(/test-file-(\d+)/)[1];
        
        // Construct full test file URL
        const testFileUrl = `${TEST_FILE_BASE_URL}${fileNumber}${TEST_FILE_EXTENSION}`;
        
        // Handle the fetch
        event.respondWith(
            fetch(testFileUrl)
                .then(response => {
                    // Cache the response if needed
                    return response;
                })
                .catch(error => {
                    console.error('Error fetching test file:', error);
                    return new Response('Error loading test file', { status: 500 });
                })
        );
    } else {
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
    }
});
