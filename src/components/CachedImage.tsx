"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { imageCacheManager } from "@/lib/imageCache"

const CachedImage = ({
    src,
    alt,
    width,
    height,
    fill,
    className = "",
    fallbackSrc = "/placeholder.svg",
    priority = false,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(fallbackSrc)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const loadedRef = useRef(false)
    const abortControllerRef = useRef()

    // Helper function to extract URL from Next.js static imports
    const extractImageUrl = (imageSource) => {
        if (!imageSource) return null

        // If it's already a string URL, return it
        if (typeof imageSource === "string") {
            return imageSource
        }

        // If it's a Next.js static import object, extract the src
        if (typeof imageSource === "object" && imageSource.src) {
            return imageSource.src
        }

        return null
    }

    useEffect(() => {
        const imageUrl = extractImageUrl(src)

        if (!imageUrl || loadedRef.current) return

        loadImage(imageUrl)

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [src])

    const loadImage = async (imageUrl) => {
        if (!imageUrl) {
            setImageSrc(fallbackSrc)
            setIsLoading(false)
            return
        }

        // Reset abort controller
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            setIsLoading(true)
            setError(false)

            // For Next.js static assets, use them directly
            if (imageUrl.startsWith('/_next/static/')) {
                setImageSrc(imageUrl)
                setIsLoading(false)
                loadedRef.current = true
                return
            }

            // For external URLs, use caching
            if (imageUrl.startsWith('http')) {
                // Check cache first
                const cachedBlob = await imageCacheManager.getCachedImage(imageUrl)

                if (cachedBlob && !abortControllerRef.current?.signal.aborted) {
                    const blobUrl = URL.createObjectURL(cachedBlob)
                    setImageSrc(blobUrl)
                    setIsLoading(false)
                    loadedRef.current = true
                    return
                }

                // Fetch from network with abort signal
                const response = await fetch(imageUrl, {
                    signal: abortControllerRef.current.signal
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                if (abortControllerRef.current?.signal.aborted) return

                const blob = await response.blob()

                if (abortControllerRef.current?.signal.aborted) return

                // Cache the image (fire and forget - don't wait for it)
                imageCacheManager.cacheImage(imageUrl, blob).catch(err => {
                    console.warn('Failed to cache image:', err)
                })

                const blobUrl = URL.createObjectURL(blob)
                setImageSrc(blobUrl)
                setIsLoading(false)
                loadedRef.current = true
            } else {
                // For relative paths, use them directly
                setImageSrc(imageUrl)
                setIsLoading(false)
                loadedRef.current = true
            }
        } catch (err) {
            if (err.name === 'AbortError') return

            console.error('Error loading image:', err)
            setError(true)
            setImageSrc(fallbackSrc)
            setIsLoading(false)
        }
    }

    const handleError = () => {
        if (!error) {
            setError(true)
            setImageSrc(fallbackSrc)
            setIsLoading(false)
        }
    }

    const handleLoad = () => {
        setIsLoading(false)
    }

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc)
            }
        }
    }, [imageSrc])

    const imageProps = {
        src: imageSrc,
        alt,
        onError: handleError,
        onLoad: handleLoad,
        className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
        priority,
        ...props
    }

    if (fill) {
        return <Image {...imageProps} fill />
    }

    return <Image {...imageProps} width={width} height={height} />
}

export default CachedImage