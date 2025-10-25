// hooks/useCachedImage.ts
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { imageCacheManager } from '@/lib/imageCache'

export const useCachedImage = (src: string | { src: string } | null, fallbackSrc = '/placeholder.svg') => {
    const [imageSrc, setImageSrc] = useState<string>(fallbackSrc)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const abortControllerRef = useRef<AbortController | undefined>(undefined)

    // Helper function to extract URL from Next.js static imports
    const extractImageUrl = useCallback((imageSource: string | { src: string } | null): string | null => {
        if (!imageSource) return null

        if (typeof imageSource === "string") {
            return imageSource
        }

        if (typeof imageSource === "object" && imageSource.src) {
            return imageSource.src
        }

        return null
    }, [])

    const loadImage = useCallback(async (imageUrl: string | null): Promise<string> => {
        if (!imageUrl) {
            setImageSrc(fallbackSrc)
            setIsLoading(false)
            return fallbackSrc
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            setIsLoading(true)
            setError(null)

            // For Next.js static assets, use directly
            if (imageUrl.startsWith('/_next/static/')) {
                setImageSrc(imageUrl)
                setIsLoading(false)
                return imageUrl
            }

            // For external URLs, use caching
            if (imageUrl.startsWith('http')) {
                // Check cache first
                const cachedBlob = await imageCacheManager.getCachedImage(imageUrl)

                if (cachedBlob && !abortControllerRef.current?.signal.aborted) {
                    const blobUrl = URL.createObjectURL(cachedBlob)
                    setImageSrc(blobUrl)
                    setIsLoading(false)
                    return blobUrl
                }

                // Fetch from network
                const response = await fetch(imageUrl, {
                    signal: abortControllerRef.current.signal
                })

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

                if (abortControllerRef.current?.signal.aborted) return fallbackSrc

                const blob = await response.blob()

                if (abortControllerRef.current?.signal.aborted) return fallbackSrc

                // Cache in background
                imageCacheManager.cacheImage(imageUrl, blob).catch(console.warn)

                const blobUrl = URL.createObjectURL(blob)
                setImageSrc(blobUrl)
                setIsLoading(false)

                return blobUrl
            } else {
                // For relative paths
                setImageSrc(imageUrl)
                setIsLoading(false)
                return imageUrl
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return fallbackSrc

            console.error('Error loading image:', err)
            setError(err instanceof Error ? err : new Error(String(err)))
            setImageSrc(fallbackSrc)
            setIsLoading(false)
            return fallbackSrc
        }
    }, [fallbackSrc])

    useEffect(() => {
        const imageUrl = extractImageUrl(src)
        if (imageUrl) {
            loadImage(imageUrl)
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [src, loadImage, extractImageUrl])

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc)
            }
        }
    }, [imageSrc])

    return {
        imageSrc,
        isLoading,
        error,
        reload: () => {
            const imageUrl = extractImageUrl(src)
            return loadImage(imageUrl)
        }
    }
}

// Hook for batch image preloading
export const useImagePreloader = () => {
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
    const activeRequests = useRef<Map<string, AbortController>>(new Map())

    const preloadImages = useCallback(async (imageUrls: Array<string | { src: string } | null>) => {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) return

        const validUrls = imageUrls
            .map(url => {
                // Handle Next.js static imports
                if (typeof url === 'object' && url !== null && 'src' in url) return url.src
                if (typeof url === 'string') return url
                return null
            })
            .filter(url =>
                url &&
                url.startsWith('http') &&
                !preloadedImages.has(url) &&
                !activeRequests.current.has(url)
            )

        if (validUrls.length === 0) return

        // Limit concurrent requests
        const concurrencyLimit = 3
        const chunks = []
        for (let i = 0; i < validUrls.length; i += concurrencyLimit) {
            chunks.push(validUrls.slice(i, i + concurrencyLimit))
        }

        for (const chunk of chunks) {
            const promises = chunk.map(async (url) => {
                // Mark as active
                const abortController = new AbortController()
                if (url) activeRequests.current.set(url, abortController)

                try {
                    const cachedBlob = await imageCacheManager.getCachedImage(url)
                    if (cachedBlob) {
                        setPreloadedImages(prev => new Set(prev).add(url))
                        return
                    }

                    const response = await fetch(url, {
                        signal: abortController.signal
                    })

                    if (response.ok) {
                        const blob = await response.blob()
                        await imageCacheManager.cacheImage(url, blob)
                        setPreloadedImages(prev => new Set(prev).add(url))
                    }
                } catch (error) {
                    if (!(error instanceof Error) || error.name !== 'AbortError') {
                        console.warn('Failed to preload image:', url, error)
                    }
                } finally {
                    activeRequests.current.delete(url)
                }
            })

            await Promise.allSettled(promises)
        }
    }, [preloadedImages])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            activeRequests.current.forEach(controller => controller.abort())
            activeRequests.current.clear()
        }
    }, [])

    return { preloadImages, preloadedImages }
}