const CACHE_NAME = 'french-learning-v1.3';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/data/metadata/difficulty.json',
    '/data/metadata/grammar-points.json',
    '/data/metadata/topics.json',
    '/data/sentences/A1/basic.json',
    '/data/sentences/A1/colors.json',
    '/data/sentences/A1/family.json',
    '/data/sentences/A1/greetings.json',
    '/data/sentences/A1/numbers.json',
    '/data/sentences/A2/daily-routine.json',
    '/data/sentences/A2/food.json',
    '/data/sentences/A2/hobbies.json',
    '/data/sentences/A2/transportation.json',
    '/data/sentences/A2/work.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, {
                        credentials: 'same-origin'
                    });
                }));
            })
            .catch(error => {
                console.log('Cache install failed:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    if (event.request.url.includes('/data/')) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return response;
                }).catch(() => {
                    if (event.request.url.includes('/data/')) {
                        return new Response(JSON.stringify({
                            error: 'Offline',
                            sentences: []
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    return caches.match('/index.html');
                });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});