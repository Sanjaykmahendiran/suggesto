"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Play, HelpCircle, Share2 } from "lucide-react"
import Image from "next/image"
import logoIcon from "@/assets/suggesto-logo.png"
import PlayStore from "@/assets/play-store.png"
import AppStore from "@/assets/app-store.png"
import BgShareImg from "@/assets/top-10-share-background.jpg"
import * as htmlToImage from "html-to-image"
import { Share } from "@capacitor/share"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Capacitor } from "@capacitor/core"
import toast from "react-hot-toast"

interface Movie {
    movie_id: number
    title: string
    poster_path?: string
    release_date?: string
    language?: string
    rating?: number
}

interface Top10MovieEntry {
    order_no: number
    movie: Movie | null
    isMockData?: boolean
}

interface TopTenItem {
    rank: number
    title?: string
    genre?: string
    rating?: number
    thumbnail?: string
    isPlaceholder?: boolean
    userName?: string
}

interface ShareTopTenListProps {
    top10Movies: Top10MovieEntry[]
    userName: string
}

export function ShareTopTenList({ top10Movies, userName }: ShareTopTenListProps) {
    const [isSharing, setIsSharing] = useState(false)
    const shareContentRef = useRef<HTMLDivElement>(null)

    const topTenData: TopTenItem[] = Array.from({ length: 10 }, (_, index) => {
        const rank = index + 1
        if (rank <= 4) {
            return { rank, isPlaceholder: true }
        }

        const movieEntry = top10Movies.find((entry) => entry.order_no === rank)
        const movie = movieEntry?.movie

        if (movie && !movieEntry?.isMockData) {
            return {
                rank,
                title: movie.title,
                genre: movie.language?.toUpperCase() || "Unknown",
                rating: movie.rating || 0,
                thumbnail: movie.poster_path
                    ? `https://suggesto.xyz/App/${movie.poster_path}`
                    : "/placeholder.svg",
                isPlaceholder: false,
            }
        } else {
            return { rank, isPlaceholder: true }
        }
    })

    const handleShare = async () => {
        if (!shareContentRef.current || isSharing) return
        setIsSharing(true)

        // Hide elements that shouldn’t appear
        const toHideSelectors = [".skip-block", "noscript"]
        const hidden: { el: HTMLElement; display: string }[] = []
        toHideSelectors.forEach((sel) => {
            document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
                hidden.push({ el, display: el.style.display })
                el.style.display = "none"
            })
        })

        // Save original styles
        const originalLeft = shareContentRef.current.style.left
        const originalOpacity = shareContentRef.current.style.opacity

        try {
            // Temporarily show content
            shareContentRef.current.style.left = "0px"
            shareContentRef.current.style.opacity = "1"

            await new Promise((resolve) => setTimeout(resolve, 200))

            const dataUrl = await htmlToImage.toJpeg(shareContentRef.current, {
                quality: 0.95,
                cacheBust: true,
                backgroundColor: "#000",
            })

            if (Capacitor.isNativePlatform()) {
                const base64Data = dataUrl.split(",")[1]
                const fileName = `top10-list-${Date.now()}.jpg`

                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                })

                await Share.share({
                    title: "My Top 10 Movies",
                    text: "🎬 Check out my top 10 movie list! Created with Suggesto 🍿",
                    files: [savedFile.uri],
                    url: "https://suggesto.app",
                })
            } else if (navigator.share) {
                await navigator.share({
                    title: userName ? `${userName}'s Top 10 Movies` : "My Top 10 Movies",
                    text: `🎬 Check out ${userName ? userName + "'s" : "my"
                        } top 10 movie list! Created with Suggesto 🍿`,
                    url: "https://suggesto.app",
                })
            } else {
                await navigator.clipboard.writeText(
                    `🎬 Check out ${userName ? userName + "'s" : "my"
                    } top 10 movie list! Created with Suggesto 🍿 https://suggesto.app`
                )

                const link = document.createElement("a")
                link.download = `top10-list-${Date.now()}.jpg`
                link.href = dataUrl
                link.click()

                toast.success("Image downloaded and link copied to clipboard!")
            }

            toast.success("Shared successfully!")
        } catch (err) {
            console.error("Sharing failed:", err)
            toast.error("Failed to share. Please try again.")
        } finally {
            // Restore hidden state
            shareContentRef.current.style.left = originalLeft
            shareContentRef.current.style.opacity = originalOpacity
            hidden.forEach(({ el, display }) => (el.style.display = display))
            setIsSharing(false)
        }
    }

    return (
        <>
            {/* Hidden Share Content */}
            <div
                ref={shareContentRef}
                className="absolute -left-[9999px] top-0 w-[600px] p-6 rounded-3xl shadow-2xl overflow-hidden text-white"
                style={{ opacity: 0 }}
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={BgShareImg}
                        alt="Background"
                        fill
                        priority
                        crossOrigin="anonymous"
                        className="object-cover"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#c47bc7]/70 to-[#6b63b5]/70" />

                <div className="relative z-10 mx-auto">
                    {/* Header Circle */}
                    <div className="flex justify-center relative z-20 -mb-16">
                        <div className="relative w-48 h-48 bg-gradient-to-br from-[#c47bc7] to-[#6b63b5] rounded-full flex flex-col items-center justify-center shadow-2xl">
                            <div className="text-center">
                                <Image
                                    src={logoIcon}
                                    alt="Logo"
                                    width={60}
                                    height={60}
                                    crossOrigin="anonymous"
                                    className="mb-2 object-cover mx-auto"
                                />
                                <div className="text-white font-bold text-2xl tracking-wider">
                                    TOP
                                </div>
                                <div className="text-white font-bold text-6xl leading-none">
                                    10
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="relative bg-gradient-to-br from-[#6b63b5] to-[#c47bc7] backdrop-blur-sm rounded-3xl p-6 shadow-2xl z-10">
                        <div className="grid grid-cols-2 gap-4 mt-18">
                            {topTenData.map((item) => (
                                <div key={item.rank} className="flex items-center gap-3">
                                    <div className="text-white font-bold text-xl min-w-[2rem]">
                                        #{item.rank}
                                    </div>

                                    {item.isPlaceholder ? (
                                        <div className="w-16 h-20 bg-white rounded-lg flex items-center justify-center">
                                            <HelpCircle className="w-8 h-8 text-[#b56bbc]" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-16 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.thumbnail || "/placeholder.svg"}
                                                    alt={item.title || "Movie"}
                                                    width={64}
                                                    height={80}
                                                    crossOrigin="anonymous"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-semibold text-lg leading-tight truncate">
                                                    {item.title}
                                                </div>
                                                <div className="text-[#d4c5d7] text-sm">
                                                    {item.genre}
                                                </div>
                                                <div className="text-white text-sm font-medium">
                                                    ⭐ {item.rating}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Available On */}
                    <div className="flex items-center justify-end gap-3 mt-1 text-white">
                        <span className="text-sm font-medium">Available on</span>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                                <Image
                                    src={AppStore}
                                    alt="App Store"
                                    crossOrigin="anonymous"
                                    className="object-contain"
                                />
                            </div>
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                                <Image
                                    src={PlayStore}
                                    alt="Play Store"
                                    crossOrigin="anonymous"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Share Button */}
            <motion.button
                onClick={handleShare}
                disabled={isSharing}
                className={`fixed bottom-10 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 ${isSharing
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105"
                    }`}
                whileHover={!isSharing ? { scale: 1.05 } : {}}
                whileTap={!isSharing ? { scale: 0.95 } : {}}
            >
                {isSharing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Share2 className="h-6 w-6 text-white" />
                )}
            </motion.button>
        </>
    )
}
