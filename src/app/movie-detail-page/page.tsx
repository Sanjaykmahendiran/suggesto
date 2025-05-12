"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, MoreVertical, Star, Play, Heart, Download, Share2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import MovieShareCard from "@/components/moviesharecard"

export default function MovieDetailPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"About" | "Episodes" | "Suggested">("About")
    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareCard, setShowShareCard] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-[#181826] text-white">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header with background image */}
                <div className="relative h-80">
                    <Image
                        src={home1}
                        alt="Ratatouille Paris background"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#181826]/60 to-[#181826]" />

                    {/* Header navigation */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 ">
                        <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold">Detail</h1>
                        <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Movie info card */}
                <div className="relative -mt-20 px-4">
                    <div className="flex gap-4">
                        {/* Movie poster */}
                        <div className="relative w-28 h-40 rounded-lg overflow-hidden flex-shrink-0">
                            <div className="absolute top-2 left-2 bg-blue-600 text-xs px-2 py-0.5 rounded-full">NEW</div>
                            <Image src={home1} alt="Ratatouille poster" fill className="object-cover" />
                        </div>

                        {/* Movie details */}
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h2 className="text-2xl font-bold">Ratatouille</h2>
                                <p className="text-sm text-gray-300">Animation, Adventure, Family</p>

                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="ml-1 text-sm">4.4 (532)</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                                    <span>2 hrs 15 mins</span>
                                    <span>•</span>
                                    <span>English</span>
                                    <span>•</span>
                                    <span>1400mp</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 bg-transparent border border-gray-600 rounded-full px-4 py-1.5 mt-2 text-sm">
                                <Play className="w-4 h-4 fill-white" />
                                <span>Watch Trailer</span>
                            </button>
                        </div>

                        {/* Favorite button */}
                        <button className="absolute top-2 right-4" onClick={() => setIsFavorite(!isFavorite)}>
                            <Heart className={cn("w-6 h-6", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b border-gray-800">
                    <div className="flex px-4">
                        {["About", "Episodes", "Suggested"].map((tab) => (
                            <button
                                key={tab}
                                className={cn(
                                    "pb-2 px-4 text-sm font-medium",
                                    activeTab === tab ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400",
                                )}
                                onClick={() => setActiveTab(tab as any)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="px-4 py-4">
                    {activeTab === "About" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    "Ratatouille" is a delightful and heartwarming animated film from Pixar. The story centers around Remy,
                                    a talented young rat with a refined palate and a dream of becoming a chef. Set in the bustling city of
                                    Paris, Remy forms an unlikely alliance with Linguini, a young garbage boy at a prestigious restaurant.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Cast and Crew</h3>
                                <div className="flex gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden mb-1"></div>
                                        <span className="text-xs text-center">Noah Schnapp</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden mb-1"></div>
                                        <span className="text-xs text-center">Finn Wolfhard</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Episodes" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Season 1</span>
                                    <ChevronLeft className="w-4 h-4 rotate-270" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Episode 1 */}
                                <div className="relative mb-6">
                                    <div className="flex">
                                        <Image
                                            src={home2}
                                            alt="Ratatouille"
                                            width={150}
                                            height={100}
                                            className="w-[100px] h-[100px] object-cover rounded-lg"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold">Ratatouille</h3>
                                                <Heart size={18} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-300 mt-1">Animation, Adventure, Family</p>
                                            <p className="text-xs text-gray-500 mt-3">2 hrs 15 mins • English • 1440mp</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                        "Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story
                                        revolves around a young boy...
                                    </p>
                                </div>

                                {/* Episode 2 */}
                                <div className="relative mb-6">
                                    <div className="flex">
                                        <Image
                                            src={home3}
                                            alt="Ratatouille"
                                            width={150}
                                            height={100}
                                            className="w-[100px] h-[100px] object-cover rounded-lg"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold">Ratatouille</h3>
                                                <Heart size={18} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-300 mt-1">Animation, Adventure, Family</p>
                                            <p className="text-xs text-gray-500 mt-3">2 hrs 15 mins • English • 1440mp</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                        "Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story
                                        revolves around a young boy...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Suggested" && (
                        <div className="flex items-center justify-center h-40 text-gray-400">
                            <p>Suggested content coming soon</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom action buttons */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 ">
                <div className="flex gap-6">
                    <button className="flex flex-col items-center">
                        <Share2 className="w-5 h-5 text-gray-400"
                            onClick={() => setShowShareCard(true)} />
                    </button>
                    <button className="flex flex-col items-center">
                        <Download className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <Button
                    className="bg-[#6c5ce7] text-white rounded-full px-6 py-2.5 font-medium"
                    onClick={() => router.push("/pricing")}
                >
                    Get Subscription
                </Button>
            </div>

            {/* Bottom Slide Filter Component */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-xs bg-white/5 transition-all duration-300">
                    {/* Full-screen blur layer */}
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard onClick={() => setShowShareCard(false)} />
                    </div>
                </div>
            )}

        </div>
    )
}
