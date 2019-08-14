const filesToCache = [
  '/',
  'style/main.css',
  'images/still_life_medium.jpg',
  'index.html',
  'pages/offline.html',
  'pages/404.html'
];

const staticCacheName = 'pages-cache-v2';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Activating new service worker...');

  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for', event.request.url);
  // create custom response to the request
  event.respondWith(
    caches
      .match(event.request) // match
      .then(response => {
        // return response if found in cache
        if (response) {
          console.log('Found', event.request.url, 'in cache');
          return response;
        }
        // fallback
        console.log('Network request for', event.request.url);
        return fetch(event.request);

        // // TODO 4 - Add fetched files to the cache
      })
      .then(response => {
        // TODO 5 - Respond with custom 404 page
        if (response.status === 404) {
          console.log('404');
          return caches.match('pages/404.html');
        }
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
      .catch(error => {
        // TODO 6 - Respond with custom offline page
        console.error(error);
        return caches.match('pages/offline.html');
      })
  );
});
