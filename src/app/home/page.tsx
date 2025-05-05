"use client"

import Image from "next/image"
import { Search, Bell, Heart, Play, SlidersHorizontal } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"

import 'swiper/css';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import FilterComponent from "@/components/filter-component";
import { motion, AnimatePresence } from "framer-motion"

const banners = [
    { id: 1, src: home1, alt: 'Elemental movie' },
    { id: 2, src: home2, alt: 'Another movie' },
    { id: 3, src: home3, alt: 'Third movie' },
];

const movies = [
    { id: 1, title: 'The Incredibles', imageSrc: home1, rank: 'TOP #1' },
    { id: 2, title: 'Inside Out', imageSrc: home2, rank: 'TOP #2' },
    { id: 3, title: 'Movie 3', imageSrc: home3, rank: 'TOP #3' },
];

export default function Home() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="bg-[#181826] text-white min-h-screen mb-20">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Suggesto</h1>
                    <p className="text-xs text-gray-400">#1 Streaming Platform</p>
                </div>
                <div className="flex gap-4">
                    <button className="text-gray-300" onClick={() => router.push('/search')}>
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="text-gray-300 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
                    </button>
                </div>
            </header>

            {/* Tabs and Search */}
            <div className="top-0 bg-[#181826] z-10 px-4 pt-4">
                <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar">
                    <button className="bg-[#6c5ce7] text-white px-4 py-3 rounded-full text-sm font-medium">ALL</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">TV</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">MOVIES</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">NEWS</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">HUBS</button>
                </div>

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
            </div>

            {/* Featured Banner */}
            <div className="relative h-56 mb-8">
                <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 4000 }}
                    loop
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="h-full w-full"
                >
                    {banners.map((banner, index) => (
                        <SwiperSlide key={banner.id}>
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: activeIndex === index ? 1.05 : 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="relative h-48 w-[80%] mx-auto rounded-lg overflow-hidden"
                                onClick={() => router.push("/movie-detail-page")}
                            >
                                <Image
                                    src={banner.src}
                                    alt={banner.alt}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 flex gap-1 items-center">
                    {banners.map((_, index) => (
                        <div
                            key={index}
                            className={`rounded-full transition-all duration-300 h-2 ${activeIndex === index ? 'w-6 bg-[#9370ff]' : 'w-2 bg-gray-600'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Movies Today */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Movies Today's</h2>
                    <a href="#" className="text-sm text-[#9370ff]">See All</a>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {movies.map((movie, index) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[160px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push("/movie-detail-page")}
                        >
                            <Image
                                src={movie.imageSrc}
                                alt={movie.title}
                                width={160}
                                height={180}
                                className="w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded-sm">
                                {movie.rank}
                            </span>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                <button className="bg-black/50 backdrop-blur-md w-full text-white text-xs flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg">
                                    <Play className="w-3 h-3" fill="white" />
                                    WATCH MOVIE
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Promo Section */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Special Promo this Week</h2>
                    <div className="flex gap-1">
                        <div className="w-6 h-2 bg-[#9370ff] rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#6c5ce7] rounded-xl p-4 flex flex-wrap sm:flex-nowrap"
                >
                    <div className="w-full sm:w-1/2 pr-4 mb-4 sm:mb-0">
                        <h3 className="text-white font-semibold mb-1">Suggesto</h3>
                        <p className="text-sm mb-3">Become our subscription member and get unlimited movie streaming.</p>
                        <button
                            className="bg-white text-[#6c5ce7] text-xs font-medium py-2 px-4 rounded-full"
                            onClick={() => router.push("/pricing")}
                        >
                            Check Now
                        </button>
                    </div>
                    <div className="w-1/2 relative">
                        <div className="absolute inset-0">
                            <Image
                                src={home1}
                                alt="Movie poster"
                                layout="fill"
                                className="rounded-md z-50 object-cover"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Top Movie Awards */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Top Movie Awards</h2>
                    <a href="#" className="text-sm text-[#6c5ce7]">See All</a>
                </div>

                <div className="space-y-10">
                    {[home1, home2].map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                        >
                            <div className="flex gap-3" onClick={() => router.push("/movie-detail-page")}>
                                <div className="relative w-28 h-36 flex-shrink-0">
                                    <Image
                                        src={img}
                                        alt="Movie"
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center mt-12">
                                            <Play className="w-5 h-5 text-white" fill="white" />
                                        </div>
                                    </div>
                                    <span className="absolute top-2 right-2 bg-[#6c5ce7] text-xs px-2 py-0.5 rounded-sm">NEW</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{i === 0 ? "Onward" : "Luca"}</h3>
                                        <Heart className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Animation, Adventure, Family</p>
                                    <p className="text-xs text-gray-300 mt-2 line-clamp-3">
                                        {i === 0 ? "“Onward” is an enchanting animated adventure..." : "“Luca” is a heartwarming animated film..."}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">2 hrs 15 mins • English • 1400HD</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNavigation currentPath={"/home"} />

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 backdrop-blur-xs bg-white/30 transition-all duration-300"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute bottom-0 w-full shadow-xl"
                        >
                            <FilterComponent onClick={() => setShowFilter(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
