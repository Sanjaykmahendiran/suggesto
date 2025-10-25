"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from 'js-cookie'
import Link from "next/link";
import Image from "next/image"
import { ArrowLeft, Search, Star, TrendingUp, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition";
import toast from "react-hot-toast";
import NotFound from "@/components/notfound";
import { useUser } from "@/contexts/UserContext";
import DefaultImage from "@/assets/default-user.webp"
import { BottomNavigation } from "@/components/bottom-navigation";

const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#2b2b2b]" />
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
        </div>
    </div>
)

interface SearchMovie {
    movie_id: number
    movie_code: string
    is_tmdb: number
    title: string
    overview: string
    poster_path: string
    backdrop_path: string
    video: string
    release_date: string
    rating: string
    sug_ratings: string | null
    language: string
    popularity: string
    tagline: string
    revenue: string
    is_adult: string
    actor1: number
    actor2: number
    actor3: number
    actor4: number
    director: number
    music_director: number
    cinematographer: number
    editor: number
    status: number
    created_date: string
    modified_date: string
}

interface FanSuggestionMovie {
    movie_id: number
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    total_suggestions: number
    total_votes: number
}

interface WatchlistedMovie {
    movie_id: number
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    watchlist_users: number
}

export default function SuggestCast() {
    const router = useRouter()
    const { user, setUser } = useUser()
    const [searchMovies, setSearchMovies] = useState<SearchMovie[]>([])
    const [fanSuggestionMovies, setFanSuggestionMovies] = useState<FanSuggestionMovie[]>([])
    const [watchlistedMovies, setWatchlistedMovies] = useState<WatchlistedMovie[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)

    // Fetch search movies
    const searchMoviesAPI = useCallback(async (searchText: string) => {
        if (!searchText.trim()) {
            setSearchMovies([])
            return
        }

        try {
            setSearchLoading(true)
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=searchmovies&searchtext=${encodeURIComponent(searchText)}`
            )

            if (!response.ok) {
                throw new Error('Failed to search movies')
            }

            const data = await response.json()
            setSearchMovies(Array.isArray(data) ? data : [])

        } catch (err) {
            toast.error('Failed to search movies')
            console.error('Error searching movies:', err)
            setSearchMovies([])
        } finally {
            setSearchLoading(false)
        }
    }, [])

    // Fetch top 10 fan suggestions
    const fetchFanSuggestions = useCallback(async () => {
        try {
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=top10fansugmovie')

            if (!response.ok) {
                throw new Error('Failed to fetch fan suggestions')
            }

            const data = await response.json()
            setFanSuggestionMovies(data?.data || [])

        } catch (err) {
            toast.error('Failed to load fan suggestions')
            console.error('Error fetching fan suggestions:', err)
        }
    }, [])


    // Load initial data when component mounts
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true)
            await Promise.all([
                fetchFanSuggestions(),
            ])
            setLoading(false)
        }

        loadInitialData()
    }, [fetchFanSuggestions])

    // Handle search with debounce
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm) {
                searchMoviesAPI(searchTerm)
            } else {
                setSearchMovies([])
            }
        }, 300)

        return () => clearTimeout(delayedSearch)
    }, [searchTerm, searchMoviesAPI])

    const getPosterUrl = (path: string) => {
        return path.includes('http') ? path : `https://suggesto.xyz/App/${path}`
    }

    const renderMovieGrid = (movies: any[], showBadge: boolean = false, badgeType?: 'suggestions' | 'watchlisted') => (
        <div className="grid grid-cols-2 gap-4">
            {movies.map((movie, index) => (
                <Link href={`/submit-cast-suggestion?movie_id=${movie.movie_id}`} key={`${movie.movie_id}-${index}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative flex w-full h-[230px] rounded-lg overflow-hidden cursor-pointer"
                    >
                        <Image
                            src={getPosterUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                        {/* Rating badge */}
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-3 h-3 text-white" />
                            {movie.rating}
                        </div>

                        {/* Additional badge for suggestions/watchlisted */}
                        {showBadge && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                {badgeType === 'suggestions' && (
                                    <>
                                        <TrendingUp className="w-3 h-3" />
                                        {movie.total_suggestions}
                                    </>
                                )}
                                {badgeType === 'watchlisted' && (
                                    <>
                                        <Heart className="w-3 h-3" />
                                        {movie.watchlist_users}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="absolute bottom-2 left-2 right-2">
                            <h3 className="text-sm font-medium text-white line-clamp-2">{movie.title}</h3>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    )

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 pb-4 flex items-center justify-between pt-8 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        className="mr-2 p-2 rounded-full bg-[#2b2b2b]"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Cast Suggestion</h1>
                        <p className="text-xs text-gray-400">
                            Discover cast suggestions from your favorites
                        </p>

                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-4 mb-4 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2b2b2b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
            </div>

            {/* Main Content (scrollable only this) */}
            <div className="flex-1 overflow-y-auto px-4">
                {searchTerm ? (
                    /* Search Results */
                    <div className="rounded-lg">
                        {searchLoading ? (
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2">
                                        <Skeleton className="w-16 h-24 bg-[#3b3b3b] rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32 bg-[#3b3b3b]" />
                                            <Skeleton className="h-3 w-16 bg-[#3b3b3b]" />
                                            <Skeleton className="h-3 w-20 bg-[#3b3b3b]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchMovies.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-400">
                                    No movies found matching "{searchTerm}"
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {searchMovies.map((movie, index) => (
                                    <Link
                                        href={`/submit-cast-suggestion?movie_id=${movie.movie_id}`}
                                        key={movie.movie_id}
                                        className="block"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#3b3b3b] transition-colors cursor-pointer"
                                        >
                                            <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.src = "/api/placeholder/64/96"
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-white">{movie.title}</h3>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(movie.release_date).getFullYear()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Rating: {movie.rating}/10
                                                </p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Default Sections */
                    <div>
                        {/* Fan Suggestions */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-[#ff7db8]" />
                                <h2 className="text-lg font-bold text-white">
                                    Top 10 Fan Suggestions
                                </h2>
                            </div>
                            {loading ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <SkeletonMovie key={index} />
                                    ))}
                                </div>
                            ) : fanSuggestionMovies.length === 0 ? (
                                <div className="flex items-center justify-center min-h-[200px]">
                                    <NotFound
                                        title="No Fan Suggestions"
                                        description="No fan suggestions available at the moment"
                                    />
                                </div>
                            ) : (
                                renderMovieGrid(fanSuggestionMovies, true, "suggestions")
                            )}
                        </div>


                    </div>
                )}
            </div>
            <BottomNavigation currentPath="/suggestions-page" />
        </div>
    )

}