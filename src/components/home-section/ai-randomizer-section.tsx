"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Bot, Shuffle, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Movie = {
    backdrop_path: any
    movie_id: string
    title: string
    poster_path: string
    rating: number
    release_date: string
    language: string
}

type AiRandomizerSectionProps = {
    sectionKey: string
    movies: Movie[]
    title?: string
}

export const AiRandomizerSection = ({   sectionKey, movies, title = "AI Recommendations" }: AiRandomizerSectionProps) => {
    const router = useRouter()

    if (!movies || movies.length === 0) {
        return null
    }

    return (
        <div className="px-4 mb-14">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
            </div>

            <div className="bg-[#2b2b2b] rounded-lg p-4 mb-3 border border-[#b56bbc]/20">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]/20 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">AI Curated for You</p>
                        <p className="text-xs text-gray-400">Based on your preferences and viewing history</p>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {movies.slice(0, 6).map((movie, index) => (
                        <motion.div
                            key={movie.movie_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative w-[300px] h-[200px] rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                            onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
                        >
                            <img
                                src={`https://suggesto.xyz/App/${movie.backdrop_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                            {/* Rating Badge */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{parseFloat(movie.rating.toString()).toFixed(1)}</span>
                            </div>

                            {/* Movie Title & Meta */}
                            <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="text-xs font-medium text-white truncate">{movie.title}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs bg-black/30 px-1 py-0.5 rounded text-gray-300">
                                        {new Date(movie.release_date).getFullYear()}
                                    </span>
                                    <span className="text-xs bg-black/30 px-1 py-0.5 rounded text-gray-300 uppercase">
                                        {movie.language}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>


                {movies.length > 6 && (
                    <div className="mt-3 text-center">
                        <Button
                            variant="default"
                            className="rounded-full px-4 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white"
                            onClick={() => router.push(`/add-movie?keyword=${sectionKey}`)}
                        >
                            View All {movies.length} Recommendations
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
