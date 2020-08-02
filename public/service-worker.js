const { response } = require("express");

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/style.css"
    // Do I need to add the dist/bundle.js files to these?
    // "/dist/app.bundle.js",
    // "/dist/favorites.bundle.js",
    // "/dist/topic.bundle.js"
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            })
        );
    }
});