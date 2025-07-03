// public/sw.js
const CACHE_NAME = 'image-cache-v1'
const IMAGE_CACHE_NAME = 'images-v1'

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
}

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...')
    self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...')
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Fetch event - Handle image requests
self.addEventListener('fetch', (event) => {
    const request = event.request
    const url = new URL(request.url)

    // Handle image requests
    if (request.destination === 'image' ||
        url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
        url.hostname === 'suggesto.xyz') {

        event.respondWith(handleImageRequest(request))
        return
    }

    // Handle other requests normally
    event.respondWith(fetch(request))
})

async function handleImageRequest(request) {
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME)
        const cachedResponse = await cache.match(request)

        // If cached and not expired, return cached version
        if (cachedResponse) {
            const cachedDate = cachedResponse.headers.get('cached-date')
            const isExpired = cachedDate &&
                (Date.now() - new Date(cachedDate).getTime()) > (7 * 24 * 60 * 60 * 1000) // 7 days

            if (!isExpired) {
                return cachedResponse
            }
        }

        // Fetch from network
        const networkResponse = await fetch(request)

        if (networkResponse.ok) {
            // Clone the response before caching
            const responseClone = networkResponse.clone()

            // Add cache timestamp
            const headers = new Headers(responseClone.headers)
            headers.set('cached-date', new Date().toISOString())

            const responseWithTimestamp = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            })

            // Cache the response
            cache.put(request, responseWithTimestamp.clone())

            return networkResponse
        }

        // If network fails, return cached version even if expired
        return cachedResponse || networkResponse

    } catch (error) {
        console.error('Service Worker fetch error:', error)

        // Try to return cached version on network error
        const cache = await caches.open(IMAGE_CACHE_NAME)
        const cachedResponse = await cache.match(request)

        if (cachedResponse) {
            return cachedResponse
        }

        // Return a fallback response
        return new Response('', {
            status: 408,
            statusText: 'Request Timeout'
        })
    }
}

// Background sync for cache cleanup
self.addEventListener('sync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupCache())
    }
})

async function cleanupCache() {
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME)
        const requests = await cache.keys()

        const expiredRequests = []

        for (const request of requests) {
            const response = await cache.match(request)
            const cachedDate = response.headers.get('cached-date')

            if (cachedDate) {
                const isExpired = (Date.now() - new Date(cachedDate).getTime()) > (7 * 24 * 60 * 60 * 1000)
                if (isExpired) {
                    expiredRequests.push(request)
                }
            }
        }

        // Delete expired entries
        await Promise.all(expiredRequests.map(request => cache.delete(request)))

        console.log(`Cleaned up ${expiredRequests.length} expired cache entries`)
    } catch (error) {
        console.error('Cache cleanup error:', error)
    }
}