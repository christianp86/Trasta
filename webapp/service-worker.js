const CACHE_NAME = 'pwa-my-waste-stats-v0.0.1';
const RESOURCES_TO_PRELOAD = [
	'index.html',
    'register-worker.js',
    'manifest.webmanifest',
    'manifest.json'
    //'/controller/',
    //'/view/',
];

/* 
   // Note: if you want to preload the UI5 core and mobile libraries by install,
   // uncomment this block of code
	const cdnBase = 'https://openui5.hana.ondemand.com/resources/';
	resourcesToCache = resourcesToCache.concat([
		`${cdnBase}sap-ui-core.js`,
		`${cdnBase}sap/ui/core/library-preload.js`,
		`${cdnBase}sap/ui/core/themes/sap_belize_plus/library.css`,
		`${cdnBase}sap/ui/core/themes/base/fonts/SAP-icons.woff2`,
		`${cdnBase}sap/m/library-preload.js`,
		`${cdnBase}sap/m/themes/sap_belize_plus/library.css`
	]);
*/

// Preload some resources during install
self.addEventListener('install', function (event) {
    "use strict";
	event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
			return cache.addAll(RESOURCES_TO_PRELOAD);
		}).catch(function(error) {
			console.error(error);
		})
	);
});


self.addEventListener('fetch', function(event) {
    "use strict";
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
  
          return fetch(event.request).then(
            function(response) {
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
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
  
              return response;
            }
          );
        })
      );
  });
  
  