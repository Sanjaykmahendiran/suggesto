"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckCircle, Home, Gift, Sparkles, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import namelogo from "@/assets/suggesto-premium-logo.png"
// import namelogo from "@/assets/white-bg-logo.png"
import Crown from "@/assets/Premium-crown.png"
import { useRouter } from "next/navigation"
import confetti from 'canvas-confetti'
import Link from "next/link"

interface UserData {
    name?: string;
    email?: string;
    payment_status: string;
    paid_upto: string;
}

export default function Thanks() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [animationComplete, setAnimationComplete] = useState(false)

    const router = useRouter()

    useEffect(() => {
        getUserData()
        triggerConfetti()

        // Set animation complete after a delay
        const timer = setTimeout(() => {
            setAnimationComplete(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const triggerConfetti = () => {
        // Trigger confetti animation
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)

            // Since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }))
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }))
        }, 250)
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

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const handleGoHome = () => {
        router.push('/home')
    }

    const handleExplorePremium = () => {
        router.push('/premium-features') // Adjust this route as needed
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 max-w-sm mx-auto min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <div className="mx-auto min-h-screen ">

            {/* Main Content */}
            <div className="relative z-10 p-6 pt-12">
                {/* Logo */}
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto relative mb-4">
                        <Image
                            src={namelogo}
                            alt="Suggesto Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                {/* Success Animation */}
                {userData && (

                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-24 h-24
                             rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-4 
                             transform transition-all duration-1000 ${animationComplete ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                            <CheckCircle size={48} className="text-white" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Image src={Crown} alt="Crown" width={24} height={24} className="w-6 h-6" />
                            <h1 className="text-2xl font-bold text-white">
                                {userData.name ? `Welcome, ${userData.name}!` : 'Welcome!'}
                            </h1>
                            <Image src={Crown} alt="Crown" width={24} height={24} className="w-6 h-6" />
                        </div>

                        <p className="text-gray-300 text-sm">
                            Payment successful! Your premium membership is now active. Enjoy enhanced features and smarter movie recommendations!
                        </p>

                    </div>
                )}

                {/* User Info Card */}
                {userData && (
                    <Card className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 mb-6">
                        <CardContent>
                            <div className="flex items-center justify-between text-white">
                                {/* Left: Status Icon and Info */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/30 rounded-full p-2">
                                        <CheckCircle size={20} className="text-green-400" />
                                    </div>
                                    <div className="flex flex-col text-left ">
                                        <div className="text-sm font-semibold text-green-400">Active Suggesto premium</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5 leading-[1]">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span className="relative top-[1px]">Valid till {formatDate(userData.paid_upto)}</span>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Premium Features Highlight */}
                <Card className="bg-[#2b2b2b] backdrop-blur-sm  mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={20} className="text-white" />
                            <h3 className="text-white font-semibold">You now have access to:</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="bg-white rounded-lg p-3 text-center"
                                // onClick={() => router.push("/watch-list")}
                            >
                                <div className="text-2xl mb-1">🎬</div>
                                <div className="text-xs text-black">Smart AI Movie Genie</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">🚀</div>
                                <div className="text-xs text-black">Boost Suggestions</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">⭐</div>
                                <div className="text-xs text-black ">Watchroom Highlights</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">🪙</div>
                                <div className="text-xs text-black  ">2x Coin Earnings</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* <Card className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] backdrop-blur-sm border border-purple-500/30 mb-6"> */}

                {/* Special Offer */}
                <Card className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] backdrop-blur-sm border border-violet-300/30 mb-6">
                    <CardContent className="p-4">
                        {/* Heading */}
                        <div className="flex items-center gap-2 mb-2">
                            <Gift size={20} className="text-[#FFD700]" />
                            <h3 className="text-white font-semibold">Special Welcome Bonus!</h3>
                        </div>

                        {/* Message */}
                        <p className="text-gray-100 text-sm mb-3">
                            As a new premium member, you've received 100 bonus coins to get started!
                        </p>

                        {/* Bonus Coin Section */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center shadow-md">
                                <span className="text-lg font-bold text-center text-black">100</span>
                            </div>
                            <span className="text-[#FFD700] font-semibold">Bonus Coins Added!</span>
                        </div>
                    </CardContent>
                </Card>


                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleGoHome}
                        className="w-full "
                    >
                        <Home size={20} className="mr-2" />
                        Start Exploring
                        <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>


                {/* Footer */}
                <div className="text-center text-gray-400 text-xs mt-8">
                    <p>Questions? We're here to help!</p>
                    <p className="mt-1">
                        Contact support anytime for assistance.{" "}
                        <Link href="/contactus" className="underline text-primary">
                            Contact us
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}