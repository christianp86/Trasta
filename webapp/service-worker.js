const CACHE_NAME = 'pwa-my-waste-stats-v0.0.1';
const RESOURCES_TO_PRELOAD = [
  'index.html',
  'register-worker.js',
  'manifest.webmanifest',
  'manifest.json',
  '/libs/Chart.bundle.min.js',
  '/libs/localforage.min'
];


// Note: if you want to preload the UI5 core and mobile libraries by install,
// uncomment this block of code
const cdnBase = 'https://openui5.hana.ondemand.com/resources/';
const resourcesToCache = [
  `${cdnBase}sap-ui-core.js`,
  `${cdnBase}sap/ui/core/library-preload.js`,
  `${cdnBase}sap/ui/core/themes/sap_fiori_3_dark/library.css`,
  `${cdnBase}sap/ui/core/themes/base/fonts/SAP-icons.woff2`,
  `${cdnBase}sap/m/library-preload.js`,
  `${cdnBase}sap/m/themes/sap_fiori_3_dark/library.css`
];


// Preload some resources during install
self.addEventListener('install', function (event) {
  "use strict";
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(RESOURCES_TO_PRELOAD);
        return cache.addAll(resourcesToCache);
      }).then(() => {
        return self.skipWaiting();
      }).catch(function (error) {
        console.error(error);
      })
  );
});


self.addEventListener('activate', event => {
  "use strict";
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.keys()
          .then(cacheNames => {
            return Promise.all(
              cacheNames.filter(cacheName => {
                return RESOURCES_TO_PRELOAD.indexOf(cacheName) === -1;
              }).map(cacheName => {
                return caches.delete(cacheName);
              })
            );
          })
          .then(() => {
            return self.clients.claim();
          });
      })
  );
});


self.addEventListener('fetch', event => {
  "use strict";
  if (event.request.method === 'GET') {
    let url = event.request.url.indexOf(self.location.origin) !== -1 ?
      event.request.url.split(`${self.location.origin}/`)[1] :
      event.request.url;
    let isFileCached = RESOURCES_TO_PRELOAD.indexOf(url) !== -1;

    if (isFileCached) {
      event.respondWith(
        caches.open(CACHE_NAME)
          .then(cache => {
            return cache.match(url)
              .then(response => {
                if (response) {
                  return response;
                }
                throw Error('There is not response for such request', url);
              });
          })
          .catch(error => {
            return fetch(event.request);
          })
      );
    }
  }
});


/* self.addEventListener('fetch', function (event) {
  "use strict";
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function (response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
}); */

