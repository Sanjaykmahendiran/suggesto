"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Bot, Shuffle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Movie = {
    movie_id: string
    title: string
    poster_path: string
    rating: number
    release_date: string
    language: string
}

type AiRandomizerSectionProps = {
    movies: Movie[]
    title?: string
}

export const AiRandomizerSection = ({ movies, title = "AI Recommendations" }: AiRandomizerSectionProps) => {
    const router = useRouter()
    const [shuffling, setShuffling] = useState(false)

    if (!movies || movies.length === 0) {
        return null
    }

    const shuffleRecommendations = () => {
        setShuffling(true)
        setTimeout(() => {
            setShuffling(false)
            window.location.reload()
        }, 1000)
    }

    return (
        <div className="px-4 mb-14">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#6c5ce7]" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="text-xs rounded-full h-8 border-[#6c5ce7] text-[#6c5ce7] hover:bg-[#6c5ce7]/20"
                    onClick={shuffleRecommendations}
                    disabled={shuffling}
                >
                    <Shuffle className={`w-3 h-3 mr-1 ${shuffling ? 'animate-spin' : ''}`} />
                    {shuffling ? 'Shuffling...' : 'Shuffle'}
                </Button>
            </div>

            <div className="bg-gradient-to-r from-[#6c5ce7]/10 to-[#6c5ce7]/10 rounded-lg p-4 mb-3 border border-[#6c5ce7]/20">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#6c5ce7]/20 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[#6c5ce7]" />
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
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[100px] h-[150px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/movie-deatil-paage?movie_id=${movie.movie_id}`)}
                        >
                            <img
                                src={
                                    movie.poster_path.startsWith("http")
                                        ? movie.poster_path
                                        : `https://suggesto.xyz/App/${movie.poster_path}`
                                }
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute top-2 right-2 bg-[#6c5ce7] text-black text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>{parseFloat(movie.rating.toString()).toFixed(1)}</span>
                            </div>
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
                            size="sm"
                            className="rounded-full text-xs h-8 px-4 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80 text-white"
                            onClick={() => router.push('/ai-recommendations')}
                        >
                            View All {movies.length} Recommendations
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
