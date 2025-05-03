"use client"

import Image from "next/image"
import { Search, Bell, Heart, Play } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"

import 'swiper/css';
import { useState } from "react";

const banners = [
    { id: 1, src: home1, alt: 'Elemental movie' },
    { id: 2, src: home2, alt: 'Another movie' },
    { id: 3, src: home3, alt: 'Third movie' },
];

const movies = [
    { id: 1, title: 'The Incredibles', imageSrc: home1, rank: 'TOP #1' },
    { id: 2, title: 'Inside Out', imageSrc: home2, rank: 'TOP #2' },
    { id: 3, title: 'Movie 3', imageSrc: home3, rank: 'TOP #3' },
    // Add more movies as needed
];

export default function Home() {
    const [activeIndex, setActiveIndex] = useState(0);


    return (
        <div className="bg-[#0f0f1a] text-white min-h-screen mb-20">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Suggesto</h1>
                    <p className="text-xs text-gray-400">#1 Streaming Platform</p>
                </div>
                <div className="flex gap-4">
                    <button className="text-gray-300">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="text-gray-300 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className=" top-0 bg-[#0f0f1a] z-10 px-4 pt-4 ">
                <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar">
                    <button className="bg-[#6c5ce7] text-white px-4 py-3 rounded-full text-sm font-medium">ALL</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">TV</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">MOVIES</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">NEWS</button>
                    <button className="text-gray-400 px-4 py-1 text-sm font-medium">HUBS</button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-[#1f1f2e] w-full py-4 pl-10 pr-8 rounded-lg text-gray-300 text-sm"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Featured Banner */}
            <div className="relative h-56 mb-8">
                {/* Banner Carousel */}
                <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 4000 }}
                    loop
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="h-full w-full"
                >
                    {banners.map((banner, index) => (
                        <SwiperSlide key={banner.id}>
                            <div
                                className={`relative h-48 w-[80%] mx-auto rounded-lg overflow-hidden transition-transform duration-500 ${activeIndex === index ? 'scale-105 z-10' : 'scale-95'
                                    }`}
                            >
                                <Image
                                    src={banner.src}
                                    alt={banner.alt}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Dynamic Slide Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex gap-1 items-center">
                        {banners.map((_, index) => (
                            <div
                                key={index}
                                className={`rounded-full transition-all duration-300 h-2 ${activeIndex === index ? 'w-6 bg-[#9370ff]' : 'w-2 bg-gray-600'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Movies Today */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Movies Today's</h2>
                    <a href="#" className="text-sm text-[#9370ff]">
                        See All
                    </a>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {movies.map((movie) => (
                        <div key={movie.id} className="relative min-w-[160px] rounded-lg overflow-hidden">
                            <Image
                                src={movie.imageSrc}
                                alt={movie.title}
                                width={160}
                                height={180}
                                className="w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <span className="absolute top-2 left-2 bg-[#6c5ce7] text-white text-xs px-2 py-0.5 rounded-sm">{movie.rank}</span>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                <button className="bg-black/50 backdrop-blur-md w-full text-white text-xs flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg">
                                    <Play className="w-3 h-3" fill="white" />
                                    WATCH MOVIE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Promo */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Special Promo this Week</h2>
                    <div className="flex gap-1">
                        <div className="w-6 h-2 bg-[#9370ff] rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                </div>

                <div className="bg-[#6c5ce7] rounded-xl p-4 flex flex-wrap sm:flex-nowrap">
                    <div className="w-full sm:w-1/2 pr-4 mb-4 sm:mb-0">
                        <h3 className="text-white font-semibold mb-1">Suggesto</h3>
                        <p className="text-sm mb-3">Become our subscription member and get unlimited movie streaming.</p>
                        <button className="bg-white text-[#6c5ce7] text-xs font-medium py-2 px-4 rounded-full">Check Now</button>
                    </div>
                    <div className="w-full sm:w-1/2 relative">
                        <div className="absolute inset-0">
                            <Image
                                src={home1}
                                alt="Movie poster"
                                layout="fill"
                                className="rounded-md z-50 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Movie Awards */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Top Movie Awards</h2>
                    <a href="#" className="text-sm text-[#9370ff]">
                        See All
                    </a>
                </div>

                <div className="space-y-10">
                    {/* Onward Movie */}
                    <div>
                        <div className="flex gap-3">
                            <div className="relative w-28 h-36 flex-shrink-0">
                                <Image
                                    src={home1}
                                    alt="Onward"
                                    fill
                                    className="rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center mt-12">
                                        <Play className="w-5 h-5 text-white" fill="white" />
                                    </div>
                                </div>
                                <span className="absolute top-2 right-2 bg-[#1f1f2e] text-xs px-2 py-0.5 rounded-sm">NEW</span>
                            </div>
                            <div className="flex-1 ">
                                <div className="flex justify-between">
                                    <h3 className="font-semibold">Onward</h3>
                                    <button>
                                        <Heart className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Animation, Adventure, Family</div>
                            </div>
                        </div>
                        <div className="flex flex-col mt-2 ">
                            <p className="text-xs text-gray-300 line-clamp-3">
                                "Onward" is an enchanting animated adventure set in a modern suburban fantasy world. The story follows
                                two elven brothers...
                            </p>
                            <div className="text-xs text-gray-400 mt-2">2 hrs 15 mins • English • 1400HD</div>
                        </div>
                    </div>


                    {/* Luca Movie */}
                    <div>
                    <div className="flex gap-3">
                        <div className="relative w-28 h-36 flex-shrink-0">
                            <Image
                                src={home2}
                                alt="Luca"
                                fill
                                className="rounded-lg object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                                <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center mt-12">
                                    <Play className="w-5 h-5 text-white" fill="white" />
                                </div>
                            </div>
                            <span className="absolute top-2 right-2 bg-[#1f1f2e] text-xs px-2 py-0.5 rounded-sm">NEW</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h3 className="font-semibold">Luca</h3>
                                <button>
                                    <Heart className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Animation, Adventure, Family</div>

                        </div>
                    </div>
                    <div className="flex flex-col mt-2">
                        <p className="text-xs mt-2 text-gray-300 line-clamp-3">
                            "Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story
                            revolves around a young boy...
                        </p>

                        <div className="text-xs text-gray-400 mt-2">2 hrs 15 mins • English • 1400HD</div>
                    </div>
                    </div>
                </div>
            </div>
            <BottomNavigation currentPath={"/home"} />
        </div>
    )
}
