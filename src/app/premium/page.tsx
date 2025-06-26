"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import namelogo from "@/assets/suggesto-name-logo.png"
import logo from "@/assets/suggesto-logo.png"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"

// Feature Images
import topWallImg from "@/assets/Top wall.png"
import suggestoAIImg from "@/assets/Suggesto AI.png"
import autoListsImg from "@/assets/Auto-list.png"
import cineCardImg from "@/assets/Cine-card.png"
import streakRoomImg from "@/assets/Streak Room.png"
import influencerWallImg from "@/assets/Influencer wall.png"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"
import Link from "next/link"

const features = [
    {
        img: topWallImg,
        title: "Top Wall",
        description: "Post your Top 10 lists for all. Let everyone see your top movie tastes.",
    },
    {
        img: suggestoAIImg,
        title: "Suggesto AI",
        description: "Smart daily picks based on your taste. Get AI-powered movie suggestions just for you.",
    },
    {
        img: autoListsImg,
        title: "Auto Lists",
        description: "Curated watchlists for your mood, vibe. Suggesto builds lists based on what you love.",
    },
    {
        img: cineCardImg,
        title: "Cine Card",
        description: "Your movie taste as a shareable card. Show off your cinema persona to friends.",
    },
    {
        img: streakRoomImg,
        title: "Streak Room",
        description: "Challenge friends, unlock rewards, and earn badges with movie streaks.",
    },
    {
        img: influencerWallImg,
        title: "Influencer Wall",
        description: "See top users, their lists and impact. Pro-only access to influencers and their picks.",
    }
]

export default function Premium() {
    const [index, setIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [showCheckError, setShowCheckError] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [notified, setNotified] = useState(false)

    const router = useRouter()
    const carouselRef = useRef(null)
    const touchStartX = useRef(0)
    const touchStartTime = useRef(0)
    const lastTouchX = useRef(0)
    const velocity = useRef(0)
    const animationRef = useRef(null)
    const minSwipeDistance = 30
    const minSwipeVelocity = 0.3

    useEffect(() => {
        checkNotificationStatus()
    }, [])

    const checkNotificationStatus = async () => {
        const userId = Cookies.get("userID")
        if (!userId) return

        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`
            )

            if (response.ok) {
                const data = await response.json()
                if (data.pronotify === "yes") {
                    setNotified(true)
                }
            }
        } catch (error) {
            console.error("Error checking notification status:", error)
        }
    }

    const handleNotify = async () => {
        const userId = Cookies.get("userID")
        if (!userId) {
            toast.error("User ID not found.")
            return
        }

        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=pronotify&user_id=${userId}`
            )

            if (response.ok) {
                const data = await response.json()
                console.log("Notification registered:", data)
                toast.success("You’ve been notified!")
                setNotified(true)
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("An error occurred. Please check your connection.")
        }
    }

    // Preload all feature images
    useEffect(() => {
        const imagePromises = features.map((feature) => {
            return new Promise((resolve, reject) => {
                const img = new window.Image()
                img.onload = resolve
                img.onerror = reject
                img.src = typeof feature.img === "string" ? feature.img : feature.img.src
            })
        })

        Promise.all(imagePromises)
            .then(() => setImagesLoaded(true))
            .catch(() => setImagesLoaded(true))
    }, [])

    // Divide features into chunks of 2
    const chunkedFeatures = []
    for (let i = 0; i < features.length; i += 2) {
        chunkedFeatures.push(features.slice(i, i + 2))
    }

    const goToSlide = useCallback((slideIndex: number) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setIndex(slideIndex)
        setDragOffset(0)
        setTimeout(() => setIsTransitioning(false), 400)
    }, [isTransitioning])

    const nextSlide = useCallback(() => {
        if (isTransitioning) return
        const nextIndex = (index + 1) % chunkedFeatures.length
        goToSlide(nextIndex)
    }, [index, chunkedFeatures.length, goToSlide, isTransitioning])

    const prevSlide = useCallback(() => {
        if (isTransitioning) return
        const prevIndex = (index - 1 + chunkedFeatures.length) % chunkedFeatures.length
        goToSlide(prevIndex)
    }, [index, chunkedFeatures.length, goToSlide, isTransitioning])

    // Auto-slide functionality
    useEffect(() => {
        if (isDragging || isTransitioning) return

        const interval = setInterval(() => {
            nextSlide()
        }, 4000) // Auto-advance every 4 seconds

        return () => clearInterval(interval)
    }, [nextSlide, isDragging, isTransitioning])

    // Enhanced touch handlers with momentum
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0]
        touchStartX.current = touch.clientX
        lastTouchX.current = touch.clientX
        touchStartTime.current = Date.now()
        velocity.current = 0
        setIsDragging(true)

        // Cancel any ongoing animations
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return

        const touch = e.touches[0]
        const currentX = touch.clientX
        const deltaX = currentX - touchStartX.current
        const deltaTime = Date.now() - touchStartTime.current

        // Calculate velocity for momentum
        velocity.current = (currentX - lastTouchX.current) / Math.max(deltaTime, 1)
        lastTouchX.current = currentX

        // Limit drag offset to prevent over-scrolling
        const maxOffset = window.innerWidth * 0.3
        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX))

        setDragOffset(clampedOffset)

        // Prevent default to avoid scrolling
        e.preventDefault()
    }

    const handleTouchEnd = () => {
        if (!isDragging) return

        setIsDragging(false)

        const deltaX = lastTouchX.current - touchStartX.current
        const deltaTime = Date.now() - touchStartTime.current
        const swipeVelocity = Math.abs(deltaX) / deltaTime

        // Determine if it's a valid swipe based on distance and velocity
        const isValidSwipe = Math.abs(deltaX) > minSwipeDistance || swipeVelocity > minSwipeVelocity

        if (isValidSwipe) {
            if (deltaX > 0) {
                prevSlide()
            } else {
                nextSlide()
            }
        } else {
            // Snap back to current position
            setDragOffset(0)
        }

        // Reset values
        touchStartX.current = 0
        lastTouchX.current = 0
        velocity.current = 0
    }

    // Mouse events for desktop
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        const touch = { clientX: e.clientX }
        touchStartX.current = touch.clientX
        lastTouchX.current = touch.clientX
        touchStartTime.current = Date.now()
        velocity.current = 0
        setIsDragging(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return

        const currentX = e.clientX
        const deltaX = currentX - touchStartX.current
        const deltaTime = Date.now() - touchStartTime.current

        velocity.current = (currentX - lastTouchX.current) / Math.max(deltaTime, 1)
        lastTouchX.current = currentX

        const maxOffset = window.innerWidth * 0.3
        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX))

        setDragOffset(clampedOffset)
    }

    const handleMouseUp = () => {
        if (!isDragging) return
        handleTouchEnd()
    }

    // Add global mouse event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging])

    // Calculate transform with drag offset
    const getTransform = () => {
        const baseTransform = -index * 100
        const dragPercentage = (dragOffset / window.innerWidth) * 100
        return `translateX(${baseTransform + dragPercentage}%)`
    }

    return (
        // <PageTransitionWrapper>
        <div className="fixed inset-0 max-w-sm mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center px-4 py-2 pt-8">
                <button onClick={() => router.back()} className="p-2.5" aria-label="Go back">
                    <ArrowLeft size={20} className="text-white" />
                </button>
            </div>

            {/* Logo */}
            <div className="relative px-6 py-2">
                <div className="w-full max-w-xs mx-auto relative h-24">
                    <Image
                        src={namelogo}
                        alt="Suggesto Logo"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="text-center px-6 mb-8">
                <h1 className="text-xl font-bold text-white mb-1">Upgrade to Suggesto premium</h1>
                <p className="text-gray-300 text-sm">Premium perks. A sweet upgrade!</p>
            </div>

            {/* Feature Cards Carousel */}
            <div className="px-6 mb-6 relative">
                {!imagesLoaded && (
                    <>
                        {/* Skeleton Loader */}
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="bg-gradient-to-br from-[#2b2b2b]/10 to-[#2b2b2b]/5 backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-3 text-center shadow flex flex-col items-center justify-start max-h-[180px] h-[180px] animate-pulse"
                                >
                                    <div className="w-16 h-16 rounded-lg bg-gray-300/20 mb-3 shimmer"></div>
                                    <div className="w-full space-y-2">
                                        <div className="h-2 bg-gray-300/20 rounded shimmer"></div>
                                        <div className="h-2 bg-gray-300/20 rounded w-4/5 mx-auto shimmer"></div>
                                        <div className="h-2 bg-gray-300/20 rounded w-3/5 mx-auto shimmer"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3].map((dot) => (
                                <div
                                    key={dot}
                                    className="w-3 h-3 rounded-full bg-gray-300/30 animate-pulse"
                                />
                            ))}
                        </div>
                    </>
                )}

                {imagesLoaded && (
                    <>
                        {/* Carousel Container */}
                        <div className="relative overflow-hidden rounded-xl select-none">
                            <div
                                ref={carouselRef}
                                className={`flex ${isDragging ? 'transition-none' : 'transition-transform duration-500 ease-out'}`}
                                style={{
                                    transform: getTransform(),
                                    cursor: isDragging ? 'grabbing' : 'grab'
                                }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onMouseDown={handleMouseDown}
                            >
                                {chunkedFeatures.map((chunk, slideIndex) => (
                                    <div
                                        key={slideIndex}
                                        className="w-full flex-shrink-0"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            {chunk.map((feature, i) => (
                                                <div
                                                    key={i}
                                                    className={`bg-gradient-to-br from-[#2b2b2b] to-[#2b2b2b]/50  border border-[#2b2b2b]/20 rounded-xl p-3 text-center  flex flex-col items-center justify-start max-h-[180px] h-[180px] transform transition-all duration-300 ${!isDragging ? 'hover:scale-105' : ''}`}
                                                >
                                                    <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-3 relative">
                                                        <Image
                                                            src={feature.img}
                                                            alt={feature.title}
                                                            width={64}
                                                            height={64}
                                                            className="rounded-lg object-cover"
                                                            priority={slideIndex === 0}
                                                            loading={slideIndex === 0 ? "eager" : "lazy"}
                                                            placeholder="blur"
                                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-200 leading-tight">{feature.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Enhanced Dots Indicator */}
                        <div className="flex justify-center gap-2 mt-4">
                            {chunkedFeatures.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToSlide(i)}
                                    disabled={isTransitioning}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === index
                                        ? "bg-primary w-6 scale-110"
                                        : "bg-gray-300 w-2 hover:bg-gray-200 hover:scale-105"
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pricing Card */}
            <div className="px-6 mb-6">
                <div className="bg-gradient-to-br from-[#2b2b2b]/50 to-[#2b2b2b] backdrop-blur-sm border border-[#2b2b2b]/20 rounded-full p-4 text-white flex items-center justify-between shadow-lg w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full">
                            <Image
                                src={logo}
                                alt="Heart"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <div className="text-xs font-medium leading-tight opacity-90">1 Month</div>
                            <div className="text-sm font-semibold leading-tight">NXT Membership</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold leading-tight">125.00 INR</div>
                        <div className="text-xs opacity-75">
                            <span className="line-through">500 INR</span> | Save 75%
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms Checkbox */}
            <div className="px-6 mb-6">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="terms"
                        className="mt-1"
                        checked={isChecked}
                        onCheckedChange={(value) => setIsChecked(!!value)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                        I Accept all <span className="text-primary underline">T & C</span> and{" "}
                        <span className="text-primary underline">Privacy Policies</span>
                    </label>
                </div>
            </div>

            {/* Continue Button */}
            <div className="px-6 mb-4">
                {!isChecked && showCheckError && (
                    <p className="text-red-500 text-sm mb-2 text-center">
                        Please check the box to continue.
                    </p>
                )}
                <Button
                    disabled={notified}
                    className={`w-full text-white rounded-full mx-auto flex items-center justify-center ${notified ? "" : ""
                        }`}
                    onClick={() => {
                        if (isChecked) {
                            handleNotify()
                            setShowCheckError(false)
                        } else {
                            setShowCheckError(true)
                        }
                    }}
                >
                    {notified ? "Notified" : "Notify Me"}{" "}
                    {!notified && <ArrowRight className="w-6 h-6 ml-2" />}
                </Button>
            </div>

            {/* Contact Us */}
            <div className="text-center px-6 mb-6">
                <p className="text-sm text-gray-500">
                    Need Help?
                    <Link href="/contactus">
                        <span className="text-primary underline pl-1">Contact Us</span></Link>
                </p>
            </div>

        </div>
        // </PageTransitionWrapper>
    )
}