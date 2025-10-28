"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCircle, Calendar, Users, Clock, Heart, Star, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import namelogo from "@/assets/Premium-crown.png"
import logo from "@/assets/suggesto-logo.png"
import { useRouter } from "next/navigation"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"
import { Capacitor } from '@capacitor/core'
import { UserData, Package, features, statsMessages } from "./type"
import PremiumSkeleton from "./_components/PremiumSkeleton"
import { AnimatePresence, motion } from "framer-motion"


interface StatMessage {
    icon: React.ComponentType<any>;
    text: string;
    color: string;
}

// Razorpay interfaces from DeliveryAndPayment
interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

interface RazorpayOptions {
    key: string
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill: {
        name: string
        email: string
        contact: string
    }
    theme: {
        color: string
    }
    modal: {
        ondismiss: () => void
    }
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            on(arg0: string, arg1: (response: any) => void): unknown;
            open: () => void;
        };
    }
}

const FIXED_MRP = 500;
const MAX_COIN_USAGE = 375;

export default function Premium() {
    const router = useRouter()
    const [index, setIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [showCheckError, setShowCheckError] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [packages, setPackages] = useState<Package[]>([])
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [currentStat, setCurrentStat] = useState(0)
    const [statsMessages, setStatsMessages] = useState<StatMessage[]>([])
    const [isStatsLoading, setIsStatsLoading] = useState(true)

    const carouselRef = useRef(null)
    const touchStartX = useRef(0)
    const touchStartTime = useRef(0)
    const lastTouchX = useRef(0)
    const velocity = useRef(0)
    const animationRef = useRef(null)
    const minSwipeDistance = 30
    const minSwipeVelocity = 0.3

    // Razorpay Keys - Using test key from DeliveryAndPayment
    const RAZORPAY_KEY_ID = 'rzp_test_28UhRPu2GtFse3'

    useEffect(() => {
        getUserData()
        getPackages()
        getStatsMessages()
    }, [])

    // Load Razorpay script (from DeliveryAndPayment)
    useEffect(() => {
        // Load Razorpay script if it's not already loaded
        if (!document.getElementById('razorpay-checkout-js')) {
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-js';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                console.log("Razorpay script loaded successfully");
            };
            script.onerror = () => {
                console.error("Failed to load Razorpay script");
            };
            document.head.appendChild(script);
        }
    }, []);

    const getPackages = async () => {
        try {
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=packageslist')

            if (response.ok) {
                const data = await response.json()
                console.log('Packages data:', data)
                setPackages(data)
                // Automatically select the first package if available
                if (data.length > 0) {
                    setSelectedPackage(data[0])
                }
            }
        } catch (error) {
            console.error("Error fetching packages:", error)
        }
    }

    const getUserData = async () => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
        if (!userId) {
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`
            )

            if (response.ok) {
                const data = await response.json()
                setUserData(data)
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const userCoins = userData?.coins || 0;
    const coinsUsed = Math.min(userCoins, MAX_COIN_USAGE);
    const payable = FIXED_MRP - coinsUsed;

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const isPremiumActive = () => {
        if (!userData?.payment_status || !userData?.paid_upto) return false

        const paidUptoDate = new Date(userData.paid_upto)
        const currentDate = new Date()

        // Only check payment_status = 1, don't check if date is expired
        return Number(userData.payment_status) === 1 && paidUptoDate > currentDate
    }

    // Add new function to check if user has ever paid (for showing renew button)
    const hasPaidBefore = () => {
        return Number(userData?.payment_status) === 1
    }

    // Razorpay payment initiation (adapted from DeliveryAndPayment)
    const initiateRazorpayPayment = async (order_id: string, finalAmount: number, coinsUsed: number) => {
        try {
            if (!window.Razorpay) {
                console.error("Razorpay SDK not loaded");
                toast.error("Payment system is not available. Please try again later.");
                setIsProcessing(false);
                return;
            }

            const response = await fetch("https://suggesto.xyz/App/razorpay.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: localStorage.getItem("userID"),
                    package_id: selectedPackage?.id || selectedPackage?.package_id || selectedPackage?.pid || selectedPackage?.packageId,
                    final_amount: finalAmount, // Send the calculated amount
                    coins_used: coinsUsed, // Send coins used for backend processing
                }),
            });

            const razorPayData = await response.json();
            console.log("Razorpay API response:", razorPayData);

            if (!razorPayData.order_id) {
                throw new Error("Invalid order_id received from server");
            }

            const options: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                currency: "INR",
                name: "Suggesto",
                description: `${selectedPackage?.name || 'Premium'} - ₹${finalAmount} (${coinsUsed} coins used)`,
                order_id: razorPayData.order_id,
                handler: function (response: RazorpayResponse) {
                    console.log("Payment successful:", response);
                    verifyPayment(response, razorPayData.order_id);
                },
                theme: {
                    color: "#b56bbc",
                },
                modal: {
                    ondismiss: function () {
                        console.log("Payment modal dismissed");
                        setIsProcessing(false);
                        toast.error("Payment canceled");
                    },
                },
                prefill: {
                    name: userData?.name || "",
                    email: userData?.email || "",
                    contact: userData?.phone || ""
                }
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on("payment.failed", function (response: any) {
                console.error("Payment failed:", response.error);
                setIsProcessing(false);
                toast.error(response.error.description || "Payment failed");
            });

            razorpayInstance.open();

        } catch (error) {
            console.error("Error initiating Razorpay payment:", error);
            setIsProcessing(false);
            toast.error("Failed to initiate payment. Please try again.");
        }
    }


    // Payment verification (adapted from DeliveryAndPayment)
    const verifyPayment = async (razorpayResponse: RazorpayResponse, order_id: string) => {
        try {
            const response = await fetch("https://suggesto.xyz/App/verify.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                }),
            })

            const data = await response.json()

            if (data.response === "Payment Successful & User Upgraded" || data.success) {
                toast.success('Payment successful! Welcome to Premium!')
                // Refresh user data to get updated premium status
                await getUserData()
                // Redirect to thanks page
                router.push('/thanks')
            } else {
                setIsProcessing(false)
                toast.error("Payment Verification Failed")
            }
        } catch (error) {
            setIsProcessing(false)
            console.error("Error during payment verification:", error)
            toast.error("An error occurred during payment verification. Please contact support.")
        }
    }

    // Main payment handler
    const handlePayment = async () => {
        if (!isChecked) {
            setShowCheckError(true)
            return
        }

        if (!selectedPackage) {
            toast.error("Please select a package first.")
            return
        }

        const packageId = selectedPackage.id || selectedPackage.package_id || selectedPackage.pid || selectedPackage.packageId

        if (!packageId) {
            toast.error("Package ID is missing. Please try again.")
            return
        }

        setIsProcessing(true)

        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
        if (!userId) {
            toast.error("User ID not found.")
            setIsProcessing(false)
            return
        }

        try {
            // Pass the calculated payable amount and coins used to the payment API
            await initiateRazorpayPayment(packageId.toString(), payable, coinsUsed)
        } catch (error) {
            console.error('Payment error:', error)
            toast.error(`Payment initialization failed: ${error instanceof Error ? error.message : String(error)}`)
            setIsProcessing(false)
        }
    }

    // Preload all feature images
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const imagePromises = features.map((feature) => {
            return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = typeof feature.img === "string" ? feature.img : feature.img.src;
            });
        });

        Promise.all(imagePromises)
            .then(() => setImagesLoaded(true))
            .catch(() => setImagesLoaded(true));
    }, []);

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
        }, 4000)

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

        velocity.current = (currentX - lastTouchX.current) / Math.max(deltaTime, 1)
        lastTouchX.current = currentX

        const maxOffset = window.innerWidth * 0.3
        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX))

        setDragOffset(clampedOffset)
        e.preventDefault()
    }

    const handleTouchEnd = () => {
        if (!isDragging) return

        setIsDragging(false)

        const deltaX = lastTouchX.current - touchStartX.current
        const deltaTime = Date.now() - touchStartTime.current
        const swipeVelocity = Math.abs(deltaX) / deltaTime

        const isValidSwipe = Math.abs(deltaX) > minSwipeDistance || swipeVelocity > minSwipeVelocity

        if (isValidSwipe) {
            if (deltaX > 0) {
                prevSlide()
            } else {
                nextSlide()
            }
        } else {
            setDragOffset(0)
        }

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

    const getStatsMessages = async () => {
        try {
            setIsStatsLoading(true)
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=protweetlist')

            if (response.ok) {
                const data = await response.json()
                console.log('Stats data:', data)

                // Transform API data to match your existing structure
                const transformedStats = data
                    .filter((item: { status: number }) => item.status === 1) // Only active stats
                    .map((item: { notes: any }, index: any) => ({
                        text: item.notes,
                        icon: getRandomIcon(), // Function to assign random icons
                        color: getRandomColor(index) // Function to assign colors
                    }))

                setStatsMessages(transformedStats)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        } finally {
            setIsStatsLoading(false)
        }
    }

    // 3. Helper functions for icons and colors
    const getRandomIcon = () => {
        const icons = [Users, Zap, Clock, Heart, TrendingUp, Star]
        return icons[Math.floor(Math.random() * icons.length)]
    }

    const getRandomColor = (index: number) => {
        const colors = [
            "text-green-400",
            "text-blue-400",
            "text-purple-400",
            "text-pink-400",
            "text-yellow-400",
            "text-orange-400"
        ]
        return colors[index % colors.length]
    }

    // Stats rotation effect - only for non-premium users
    useEffect(() => {
        if (isPremiumActive() || isStatsLoading || statsMessages.length === 0) return

        // Set random initial stat
        setCurrentStat(Math.floor(Math.random() * statsMessages.length))

        const interval = setInterval(() => {
            setCurrentStat((prev) => (prev + 1) % statsMessages.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [isPremiumActive(), isStatsLoading, statsMessages.length])

    // Calculate transform with drag offset
    const getTransform = () => {
        const baseTransform = -index * 100
        const dragPercentage = (dragOffset / window.innerWidth) * 100
        return `translateX(${baseTransform + dragPercentage}%)`
    }

    if (isLoading) {
        return <PremiumSkeleton />
    }

    return (
        <div className="fixed inset-0  mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center px-4 py-2 pt-8">
                <button onClick={() => router.back()} className="p-2.5" aria-label="Go back">
                    <ArrowLeft size={20} className="text-white" />
                </button>

                {/* Logo Centered */}
                {!isPremiumActive() && (
                    <div className="relative h-24 flex-1 flex justify-center">
                        <div className="relative w-full max-w-xs h-24">
                            <Image
                                src={namelogo}
                                alt="Suggesto Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}
                <div className="w-10" />

            </div>
            {isPremiumActive() && (
                <div className="relative h-24 flex-1 flex justify-center mt-4 mb-4">
                    <div className="relative w-full max-w-xs h-24">
                        <Image
                            src={namelogo}
                            alt="Suggesto Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Title */}
            <div className="text-center px-6 mb-8">
                <h1 className="text-xl font-bold text-white mb-1">
                    {isPremiumActive() ? "Premium Membership" : "Upgrade to Suggesto premium"}
                </h1>
                <p className="text-gray-300 text-sm">
                    {isPremiumActive() ? "You're enjoying premium features!" : "Premium perks. A sweet upgrade!"}
                </p>
            </div>

            {/* Feature Cards Carousel */}
            <div className="px-6 mb-3 relative">
                {!imagesLoaded && (
                    <>
                        {/* Skeleton Loader */}
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="bg-gradient-to-br from-[#2b2b2b]/10 to-[#2b2b2b]/5 backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-2 text-center shadow flex flex-col items-center justify-start max-h-[180px] h-[180px] animate-pulse"
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
                                                    className={`bg-gradient-to-br from-[#2b2b2b] to-[#2b2b2b]/50 border border-[#2b2b2b]/20 rounded-xl p-2 text-center flex flex-col items-center justify-start max-h-[180px] h-[180px] transform transition-all duration-300 ${!isDragging ? 'hover:scale-105' : ''}`}
                                                >
                                                    <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-2 relative">
                                                        <Image
                                                            src={feature.img}
                                                            alt={feature.title}
                                                            width={64}
                                                            height={64}
                                                            className="rounded-lg object-cover"
                                                            priority={slideIndex === 0}
                                                            loading={slideIndex === 0 ? "eager" : "lazy"}
                                                            placeholder="blur"
                                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                                                        />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
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
                {isPremiumActive() ? (
                    // Premium Active Card
                    <div className="bg-white rounded-xl p-4 text-white shadow-lg w-full max-w-md mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 rounded-full p-2">
                                    <CheckCircle size={24} className="text-green-700" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-green-700">Premium Active</div>
                                    <div className="text-xs text-gray-700">
                                        {selectedPackage?.name || 'Premium'} Membership
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <Calendar size={16} className="text-green-500" />
                                    <span className="text-green-700">Till {formatDate(userData?.paid_upto || '')}</span>
                                </div>
                                <div className="text-xs text-gray-700">Valid until</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Regular Pricing Card
                    <div className="relative w-full mx-auto">
                        <div className="bg-gradient-to-br from-[#2b2b2b]/50 to-[#2b2b2b] backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-2 text-white flex flex-col gap-1 shadow-lg w-full">
                            {/* Top - Package Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={logo}
                                        alt="Coin Logo"
                                        width={36}
                                        height={36}
                                        className="object-contain rounded-full"
                                    />
                                    <div>
                                        <div className="text-sm font-medium opacity-90 leading-tight">
                                            {selectedPackage?.duration_days || 90} Days
                                        </div>
                                        <div className="text-sm font-semibold leading-snug">
                                            {selectedPackage?.name || 'Premium'} Membership
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-primary leading-tight">₹{payable}</div>
                                    <div className="text-xs text-gray-300 leading-none">
                                        <span className="line-through">₹{FIXED_MRP}</span> | Save ₹{coinsUsed}
                                    </div>
                                </div>
                            </div>

                            {/* Middle - Coin Message */}
                            {coinsUsed > 0 && (
                                <>
                                    <div className="text-xs text-green-300 font-semibold text-center leading-tight mt-1">
                                        🎉 You used <span className="text-white">{coinsUsed} coins</span> to reduce the price!
                                    </div>
                                    <div className="text-xs text-gray-400 text-center leading-tight">
                                        (Coins reduce MRP up to max {MAX_COIN_USAGE})
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                )}
            </div>


            {/* Terms Checkbox - Only show if not premium */}
            {!hasPaidBefore() && (
                <div className="px-6 mb-2">
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
            )}

            {/* Action Button */}
            <div className="px-6 mb-4">
                {!isPremiumActive() && !isChecked && showCheckError && (
                    <p className="text-red-500 text-sm mb-1 text-center">
                        Please check the box to continue.
                    </p>
                )}
                <Button
                    disabled={isProcessing}
                    className="w-full text-white rounded-full mx-auto flex items-center justify-center"
                    onClick={handlePayment}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : (
                        <>
                            {hasPaidBefore() ? "Renew Now" : "Pay Now"}
                            <ArrowRight className="w-6 h-6 ml-2" />
                        </>
                    )}
                </Button>
            </div>

            {/* Dynamic Stats Section - Only for free users */}
            {!isPremiumActive() && !isStatsLoading && statsMessages.length > 0 && (
                <div className="px-6 mb-6">
                    <div className="relative overflow-hidden bg-white backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-[0_0_30px_#00000050] transition-transform duration-300 hover:scale-[1.02] group">
                        {/* Glowing gradient background */}
                        <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-[#ffffff0d] to-[#ffffff05] pointer-events-none group-hover:scale-105 transition duration-700 ease-out" />

                        {/* Icon + Message Row */}
                        <div className="relative z-10 flex items-start gap-3 h-[40px] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStat}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex items-start gap-3"
                                >
                                    {/* Icon Circle */}
                                    <div className="relative w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full animate-pulse-slow" />
                                        {(() => {
                                            const IconComponent = statsMessages[currentStat].icon || getRandomIcon()
                                            return (
                                                <IconComponent

                                                    className={`${statsMessages[currentStat].color || getRandomColor(currentStat)} relative z-10`}
                                                />
                                            )
                                        })()}
                                    </div>

                                    {/* Text */}
                                    <div className="text-black text-sm font-medium leading-snug opacity-90">
                                        <span className="block drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">
                                            {statsMessages[currentStat].text}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}