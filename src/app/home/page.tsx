"use client"

import Image from "next/image"
import { Search, Bell, Play, Users, Sparkles } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import { useState } from "react"
import { useRouter } from "next/navigation"
import FilterComponent from "@/components/filter-component"
import { motion, AnimatePresence } from "framer-motion"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"
import AvatarImg from "@/assets/avatar.jpg"

import "swiper/css"

// Placeholder data - replace with your actual data
const banners = [
    {
        id: 1,
        title: "Captain America: The Winter Soldier",
        imageSrc: home1,
        alt: "Captain America movie",
    },
    {
        id: 2,
        title: "Avengers infinity War",
        imageSrc: home4,
        alt: "Avengers movie",
    },
    {
        id: 3,
        title: "Joker",
        imageSrc: home5,
        alt: "joker movie",
    },
]

const recentlyWatched = [
    {
        id: 1,
        title: "Joker",
        imageSrc: home1,
        progress: 75,
    },
    {
        id: 2,
        title: "Stay the Night",
        imageSrc: home2,
        progress: 30,
        episode: "EP 2",
    },
]

const friendActivities = [
    {
        id: 1,
        title: "The Incredibles",
        imageSrc: home1,
        friend: "Alex",
        friendAvatar: AvatarImg,
        action: "watched",
    },
    {
        id: 2,
        title: "Inside Out",
        imageSrc: home2,
        friend: "Sarah",
        friendAvatar: AvatarImg,
        action: "added to watchlist",
    },
]

const featuredPicks = [
    {
        id: 1,
        title: "Split",
        imageSrc: home1,
        rating: 7.3,
    },
    {
        id: 2,
        title: "A River Runs Through It",
        imageSrc: home2,
        rating: 7.8,
    },
    {
        id: 3,
        title: "The Shallows",
        imageSrc: home3,
        rating: 6.3,
    },
    {
        id: 4,
        title: "Inception",
        imageSrc: home1,
        rating: 8.8,
    },
]

export default function Home() {
    const router = useRouter()
    const [activeIndex, setActiveIndex] = useState(0)
    const [showFilter, setShowFilter] = useState(false)
    const [notificationCount, setNotificationCount] = useState(3)

    return (
        <div className="bg-[#181826] text-white min-h-screen mb-18">
            {/* Featured Movie */}
            <div className="relative mb-8 border-0">
                {/* Fixed Suggesto label (outside Swiper) */}
                <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center px-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Suggesto</h1>
                        <p className="text-xs text-gray-400">#1 Streaming Platform</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            aria-label="Search"
                            className="text-gray-300"
                            onClick={() => router.push("/search")}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            aria-label="Notifications"
                            className="text-gray-300 relative"
                            onClick={() => router.push("/notifications")}
                        >
                            <Bell className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>


                <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 5000 }}
                    loop
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="h-full w-full border-0"
                >
                    {banners.map((banner, index) => (
                        <SwiperSlide key={banner.id}>
                            <motion.div
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: activeIndex === index ? 1 : 0.8 }}
                                transition={{ duration: 0.5 }}
                                className="relative w-full aspect-[2/3] rounded-lg  shadow-xl mx-auto"
                                onClick={() => router.push(`/movie-deatil-page/${banner.id}`)}
                            >
                                <Image
                                    src={banner.imageSrc || "/placeholder.svg"}
                                    alt={banner.alt}
                                    fill
                                    className="object-cover w-full h-full"
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#181826]/60 to-[#181826]" />

                                {/* Bottom content */}
                                <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col z-20">
                                    <div className="flex justify-between items-end w-full">
                                        {/* Left section */}
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">{banner.title}</h2>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-primary text-white text-xs px-1 rounded">HD</span>
                                                <span className="text-gray-300 text-xs">120:00</span>
                                                <span className="text-gray-300 text-xs">13+</span>
                                            </div>
                                        </div>

                                        {/* Right section */}
                                        <div className="flex gap-1">
                                            {banners.map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-full transition-all duration-300 h-2 ${activeIndex === index ? "w-6 bg-primary" : "w-2 bg-gray-600"}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>


            {/* Popular Movies */}
            {/* <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Popular Movies</h2>
                    <a href="#" className="text-sm text-primary">
                        See All
                    </a>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {featuredPicks.map((movie) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: movie.id * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/movie/${movie.id}`)}
                        >
                            <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-2 left-2">
                                <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div> */}

            {/* Continue Watching */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Continue Watching</h2>
                    <a href="#" className="text-sm text-primary">
                        See All
                    </a>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {recentlyWatched.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.id * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[160px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/watch/${item.id}`)}
                        >
                            <Image src={item.imageSrc || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                            {item.episode && (
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs">
                                    {item.episode}
                                </div>
                            )}

                            <div className="absolute bottom-8 left-2">
                                <h3 className="text-sm font-medium text-white">{item.title}</h3>
                            </div>

                            <div className="absolute bottom-2 left-2 right-2">
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                    <div className="bg-primary h-1 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Friend Activities */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Friend Activities</h2>
                    </div>
                    <a href="#" className="text-sm text-primary">
                        See All
                    </a>
                </div>

                <div className="space-y-3">
                    {friendActivities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: activity.id * 0.1 }}
                            className="flex items-center gap-3 bg-[#292938] p-3 rounded-lg"
                        >
                            <div className="relative w-10 h-10">
                                <Image
                                    src={activity.friendAvatar || "/placeholder.svg"}
                                    alt={activity.friend}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium">{activity.friend}</span>{" "}
                                    <span className="text-gray-400">{activity.action}</span>
                                </p>
                                <p className="text-xs text-gray-400">{activity.title}</p>
                            </div>
                            <div className="relative w-12 h-16 rounded overflow-hidden">
                                <Image
                                    src={activity.imageSrc || "/placeholder.svg"}
                                    alt={activity.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Featured Suggesto Picks */}
            <div className="px-4 mb-20">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Featured Suggesto Picks</h2>
                    </div>
                    <a href="#" className="text-sm text-primary">
                        See All
                    </a>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {featuredPicks.map((movie) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: movie.id * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/movie/${movie.id}`)}
                        >
                            <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                                {movie.rating}
                            </div>
                            <div className="absolute bottom-2 left-2">
                                <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNavigation currentPath={"home"} />

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
