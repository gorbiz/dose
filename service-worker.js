// Files to cache
const cacheName = 'dose-v24'
const appShellFiles = [
  '',
  'index.html',
  'app.js',
  'script.js',
  'style.css',
  'icons/icon.svg',
  'icons/icon-32.png',
  'icons/icon-64.png',
  'icons/icon-96.png',
  'icons/icon-128.png',
  'icons/icon-168.png',
  'icons/icon-192.png',
  'icons/icon-256.png',
  'icons/icon-512.png'
  // TODO generate this list ...or somehow make sure it is up to date
]
const contentToCache = appShellFiles

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install')
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    console.log('[Service Worker] Caching all: app shell and content')
    await cache.addAll(contentToCache)
  })())
})

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request)
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`)
    if (r) return r
    const response = await fetch(e.request)
    const cache = await caches.open(cacheName)
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`)
    cache.put(e.request, response.clone())
    return response
  })())
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) return
      return caches.delete(key)
    }))
  }))
})
