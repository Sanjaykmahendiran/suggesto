"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Heart, Play, SlidersHorizontal } from "lucide-react"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"
import FilterComponent from "@/components/filter-component"
import { useState } from "react"

export default function Playlist() {
    const router = useRouter();
    const [showFilter, setShowFilter] = useState(false);


    return (
        <div className="min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <Link href="/" className="p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-semibold">Downloads</h1>
                <div className="p-2">
                    <SlidersHorizontal
                        size={20}
                        onClick={() => setShowFilter(true)} />
                </div>
            </div>

            {/* Search */}
            <div className="px-4 mb-4">
                <div className="flex items-center bg-[#292938] rounded-full px-4 py-4">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent w-full focus:outline-none text-gray-300"
                        onClick={() => router.push("/search")}
                    />
                    <SlidersHorizontal
                        size={18}
                        className="text-gray-400 cursor-pointer"
                        onClick={() => setShowFilter(true)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar">
                <button className="flex items-center justify-center px-6 py-2 rounded-full bg-[#6c5ce7] text-white text-sm whitespace-nowrap">
                    All
                </button>
                <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent text-gray-300 text-sm border border-gray-600 whitespace-nowrap">
                    Want to Watch
                </button>
                <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent text-gray-300 text-sm border border-gray-600 whitespace-nowrap">
                    Watched
                </button>
                <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent text-gray-300 text-sm border border-gray-600 whitespace-nowrap">
                    Skipped
                </button>
            </div>

            {/* Finished Watching */}
            <div className="px-4 pb-20 mt-6">

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

                <div className="relative">
                    <div className="flex">
                        <Image
                            src={home3}
                            alt="Luca"
                            width={150}
                            height={100}
                            className="w-[100px] h-[100px] object-cover rounded-lg"
                        />
                        <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                                <h3 className="font-bold">Luca</h3>
                                <div className="bg-[#6c5ce7] text-xs px-2 py-0.5 rounded">NEW</div>
                            </div>
                            <p className="text-xs text-gray-300 mt-1">Animation, Adventure, Family</p>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNavigation currentPath={"/download"} />

            {/* Bottom Slide Filter Component */}
            {showFilter && (
                <div className="fixed inset-0 z-50 backdrop-blur-xs bg-white/30 transition-all duration-300">
                    {/* Full-screen blur layer */}
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <FilterComponent onClick={() => setShowFilter(false)} />
                    </div>
                </div>
            )}

        </div>
    )
}
