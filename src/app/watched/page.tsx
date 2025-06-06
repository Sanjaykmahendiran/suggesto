"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie'
import Link from "next/link";
import Image from "next/image"
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition";

const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#292938]" />
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#292938]/80 mb-1" />
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
    const [user, setUser] = useState<User | null>(null)
    const [movies, setMovies] = useState<Movie[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            const user_id = Cookies.get("userID")
            if (!user_id) return

            try {
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${user_id}`)
                const data = await response.json()
                if (data && data.user_id) {
                    setUser(data)
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            }
        }

        fetchUserData()
    }, [])

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true)
                const userId = Cookies.get('userID') || ''
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchlist&user_id=${userId}&status=watched`)

                if (!response.ok) {
                    throw new Error('Failed to fetch movies')
                }

                const data = await response.json()
                setMovies(data)
                setError(null)
            } catch (err) {
                setError('Failed to load movies')
                console.error('Error fetching movies:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [])

    const getPosterUrl = (path: string) => {
        return path.includes('http') ? path : `https://suggesto.xyz/App/${path}`
    }

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (

//   <PageTransitionWrapper>
            <div className="min-h-screen bg-[#181826]">

                {/* Header */}
                <header className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Watched</h1>
                            <p className="text-xs text-gray-400">
                                Explore what you’ve already seen
                            </p>
                        </div>
                    </div>
                    <Link href="/profile">
                        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                            <Image
                                src={user?.imgname || "/placeholder.svg"}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#292938] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Movie Grid */}
                <div className="grid grid-cols-2 gap-4 p-4">
                    {loading ? (
                        <>
                            <SkeletonMovie />
                            <SkeletonMovie />
                            <SkeletonMovie />
                            <SkeletonMovie />
                        </>
                    ) : filteredMovies.length === 0 ? (
                        <p className="text-center text-white col-span-2">No movies found</p>
                    ) : (
                        filteredMovies.map((movie) => (
                            <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id}>
                                <motion.div
                                    key={movie.movie_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: movie.movie_id * 0.001 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative w-full h-[180px] rounded-lg overflow-hidden cursor-pointer"
                                >
                                    <Image
                                        src={getPosterUrl(movie.poster_path)}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
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
            </div>
        // </PageTransitionWrapper>
        
    )
}
