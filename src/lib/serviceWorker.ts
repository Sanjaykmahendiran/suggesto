// utils/serviceWorker.js
export const registerServiceWorker = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')

            console.log('Service Worker registered successfully:', registration.scope)

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing

                newWorker?.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New service worker available')
                        // You can show a "Refresh to update" message here
                    }
                })
            })

            return registration
        } catch (error) {
            console.error('Service Worker registration failed:', error)
        }
    }
}
