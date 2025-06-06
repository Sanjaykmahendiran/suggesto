"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton" // Make sure this path is correct

type Movie = {
    movie_id: string | number
    title: string
    poster_path: string
    rating: number | string
    release_date: string
    language: string
}

interface Props {
    movie_id: string | number
    user_id: string | number
}

export const YouMightAlsoLike: React.FC<Props> = ({ movie_id, user_id }) => {
    const router = useRouter()

    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRelatedMovies = async () => {
            setLoading(true)
            try {
                const response = await fetch("https://suggesto.xyz/App/api.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gofor: "relatedmovies",
                        movie_id,
                        user_id,
                    }),
                })
                const data = await response.json()
                setMovies(data)
            } catch (err) {
                setError("Failed to load related movies.")
            } finally {
                setLoading(false)
            }
        }

        if (movie_id && user_id) {
            fetchRelatedMovies()
        }
    }, [movie_id, user_id])

    const placeholders = Array(6).fill(null)

    if (!loading && (!movies || movies.length === 0)) return null

    return (
        <div className="w-full mb-16 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">You Might Also Like</h2>
                </div>
                <a href="/watch-list" className="text-sm text-primary">
                    See All
                </a>
            </div>

            <div className="flex gap-4 border-0 overflow-x-auto overflow-y-hidden no-scrollbar pb-2">
                {(loading ? placeholders : movies).map((movie, index) => (
                    <motion.div
                        key={movie?.movie_id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: loading ? 1 : 1.05 }}
                        className="relative min-w-[120px] h-[180px] border-0 rounded-lg overflow-hidden cursor-pointer bg-muted"
                        onClick={() =>
                            !loading && router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)
                        }
                    >
                        {loading ? (
                            <Skeleton className="w-full h-full bg-gray-50" />
                        ) : (
                            <>
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
                                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{parseFloat(movie.rating.toString()).toFixed(1)}</span>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-gray-300">
                                            {new Date(movie.release_date).getFullYear()}
                                        </span>
                                        <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-gray-300 uppercase">
                                            {movie.language}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
