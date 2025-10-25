"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from 'js-cookie'
import Link from "next/link";
import Image from "next/image"
import { ArrowLeft, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition";
import toast from "react-hot-toast";
import NotFound from "@/components/notfound";
import { useUser } from "@/contexts/UserContext";
import DefaultImage from "@/assets/default-user.webp"

const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#2b2b2b]" />
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
        </div>
    </div>
)

interface Movie {
    watchlist_id: string
    movie_id: number
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    status: string
    added_date: string
    overview?: string
}

type User = {
    user_id: string
    name: string
    imgname?: string
}

export default function WatchNow() {
    const router = useRouter()
    const { user, setUser } = useUser()
    const [movies, setMovies] = useState<Movie[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    // Pagination states
    const [moviesLoading, setMoviesLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    // Fetch movies with pagination
    const fetchMovies = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setMoviesLoading(true)
            }

            const userId = Cookies.get('userID') || ''
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=watchlist&user_id=${userId}&status=watched&limit=10&offset=${currentOffset}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch movies')
            }

            const data = await response.json()
            const fetchedMovies = data?.data || []

            // Set total count from API response
            if (data?.total_count !== undefined) {
                setTotalCount(data.total_count)
            }

            if (isLoadMore) {
                setMovies(prev => [...prev, ...fetchedMovies])
            } else {
                setMovies(fetchedMovies)
            }

            // Check if there are more movies to load
            if (fetchedMovies.length < 10) {
                setHasMore(false)
            }

            if (fetchedMovies.length > 0) {
                setOffset(currentOffset + fetchedMovies.length)
            }

        } catch (err) {
            toast.error('Failed to load movies')
            console.error('Error fetching movies:', err)
        } finally {
            setMoviesLoading(false)
            setInitialLoad(false)
            setLoading(false) // Set main loading to false after first fetch
        }
    }, [])

    // Load initial movies when component mounts
    useEffect(() => {
        fetchMovies(0, false)
    }, [fetchMovies])

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !moviesLoading && hasMore && !initialLoad) {
                    fetchMovies(offset, true)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [moviesLoading, hasMore, offset, fetchMovies, initialLoad])

    const getPosterUrl = (path: string) => {
        return path.includes('http') ? path : `https://suggesto.xyz/App/${path}`
    }

    const filteredMovies = Array.isArray(movies)
        ? movies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        //   <PageTransitionWrapper>
        <div className="min-h-screen">

            {/* Header */}
            <header className="p-4 flex items-center justify-between pt-8">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Watched</h1>
                        <p className="text-xs text-gray-400">
                            Explore what you've already seen ({totalCount || movies.length} movies)
                        </p>
                    </div>
                </div>
                <Link href="/profile">
                    <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                        <Image
                            src={user?.imgname || DefaultImage}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </Link>
            </header>

            {/* Search Bar */}
            <div className="px-6 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2b2b2b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
            </div>

            {/* Movie Grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
                {initialLoad ? (
                    // Show skeleton loading for initial load
                    Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonMovie key={index} />
                    ))
                ) : filteredMovies.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[40vh] col-span-2">
                        <NotFound
                            title="No Movies Found"
                            description={searchTerm
                                ? `No movies found matching "${searchTerm}"`
                                : "It seems you haven't watched any movies yet. Start exploring our collection!"
                            }
                        />
                    </div>
                ) : (
                    filteredMovies.map((movie, index) => (
                        <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={`${movie.watchlist_id}-${index}`}>
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
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Star className="w-3 h-3 text-white" />
                                    {movie.rating}
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>

            {/* Loading more indicator */}
            {moviesLoading && !initialLoad && searchTerm === '' && (
                <div className="flex justify-center py-8">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <SkeletonMovie />
                        <SkeletonMovie />
                    </div>
                </div>
            )}

            {/* Intersection observer target - only show when not searching */}
            {hasMore && !moviesLoading && searchTerm === '' && (
                <div ref={observerRef} className="h-4 w-full" />
            )}

        </div>
        // </PageTransitionWrapper>
    )
}