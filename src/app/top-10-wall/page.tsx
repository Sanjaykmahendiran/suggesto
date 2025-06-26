"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Trophy, Heart, Bookmark, Plus, X, Search, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/UserContext"
import { getMockData } from "./type"
import { Top10MovieEntry, Movie } from "./type"
import { PodiumSkeleton, RankingItemSkeleton } from "@/components/top-wall-skeleton"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import DefaultImage from "@/assets/default-user.webp"

export default function Leaderboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, setUser } = useUser()
    const [top10Movies, setTop10Movies] = useState<Top10MovieEntry[]>([])
    const [allMovies, setAllMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [usingMockData, setUsingMockData] = useState(false)
    const [mockDataCount, setMockDataCount] = useState(0)

    // New state for ranking popup
    const [showRankingModal, setShowRankingModal] = useState(false)
    const [selectedRanking, setSelectedRanking] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedMovieForRanking, setSelectedMovieForRanking] = useState<number | null>(null)
    const [moviesLoading, setMoviesLoading] = useState(false)
    const [hasMoreMovies, setHasMoreMovies] = useState(true)
    const [moviesOffset, setMoviesOffset] = useState(0)
    const [totalMoviesCount, setTotalMoviesCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    // Modified: Get friend_id from search params and user_id from cookies
    const friendId = searchParams.get("friend_id")
    const userId = Cookies.get('userID') || ''
    const isViewingFriend = Boolean(friendId)

    // Updated fetch top 10 movies data
    const fetchTop10Movies = async () => {
        try {
            let response;

            if (isViewingFriend) {
                // Use friend's API endpoint
                response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendtop10wall&user_id=${userId}&friend_id=${friendId}`)
            } else {
                // Use own API endpoint
                response = await fetch(`https://suggesto.xyz/App/api.php?gofor=top10wall_get&user_id=${userId}`)
            }

            const data = await response.json()

            // Handle friend's API response structure
            if (isViewingFriend && data && data.moviedetails && Array.isArray(data.moviedetails)) {
                const movieDetails = data.moviedetails

                // Sort by order_no to maintain proper ranking
                const sortedMovies = movieDetails.sort((a: Top10MovieEntry, b: Top10MovieEntry) => (a.order_no || 0) - (b.order_no || 0))

                // For friends, only use real data - no mock data
                const realMovies: Top10MovieEntry[] = sortedMovies.map((movie: Top10MovieEntry) => ({
                    ...movie,
                    isMockData: false
                }))

                setTop10Movies(realMovies)
                setMockDataCount(0)
                setUsingMockData(false)

                // Use the actual like/save status from the API response
                setIsLiked(data.is_liked || false)
                setIsSaved(data.is_saved || false)

            } else if (!isViewingFriend && data && Array.isArray(data)) {
                // Handle own wall API response (existing logic with mock data)
                const sortedMovies = data.sort((a, b) => (a.order_no || 0) - (b.order_no || 0))

                const completeTop10: Top10MovieEntry[] = []
                const mockData = getMockData()

                for (let i = 1; i <= 10; i++) {
                    const existingMovie = sortedMovies.find(movie => movie.order_no === i)

                    if (existingMovie) {
                        completeTop10.push({
                            ...existingMovie,
                            isMockData: false
                        })
                    } else {
                        const mockMovie = mockData.find(mock => mock.order_no === i)
                        if (mockMovie) {
                            completeTop10.push({
                                ...mockMovie,
                                order_no: i,
                                user_id: userId,
                                top_id: `mock_${i}`,
                                is_liked: false,
                                is_saved: false,
                                isMockData: true
                            })
                        }
                    }
                }

                setTop10Movies(completeTop10)
                const mockCount = completeTop10.filter(movie => movie.isMockData).length
                setMockDataCount(mockCount)
                setUsingMockData(mockCount === 10)

                // Set like/save status from first real movie if exists
                const hasRealData = sortedMovies.length > 0
                if (hasRealData && sortedMovies.length > 0) {
                    setIsLiked(sortedMovies[0].is_liked)
                    setIsSaved(sortedMovies[0].is_saved)
                } else {
                    setIsLiked(false)
                    setIsSaved(false)
                }
            } else {
                // For friends: set empty array (no mock data)
                // For own wall: use complete mock data
                if (isViewingFriend) {
                    setTop10Movies([])
                    setUsingMockData(false)
                    setMockDataCount(0)
                } else {
                    const mockData = getMockData()
                    setTop10Movies(mockData)
                    setUsingMockData(true)
                    setMockDataCount(10)
                }
                setIsLiked(false)
                setIsSaved(false)
            }
        } catch (error) {
            console.error('Error fetching top 10 movies:', error)
            // For friends: set empty array on error
            // For own wall: use mock data on error
            if (isViewingFriend) {
                setTop10Movies([])
                setUsingMockData(false)
                setMockDataCount(0)
            } else {
                const mockData = getMockData()
                setTop10Movies(mockData)
                setUsingMockData(true)
                setMockDataCount(10)
            }
            setIsLiked(false)
            setIsSaved(false)
        } finally {
            setLoading(false)
        }
    }

    // Fetch all movies list (only for current user)
    const fetchAllMovies = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        if (isViewingFriend) return // Don't fetch movies list for friends

        try {
            if (!isLoadMore) {
                setMoviesLoading(true)
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&limit=10&offset=${currentOffset}`)
            const data = await response.json()

            if (data && data.data && Array.isArray(data.data)) {
                const fetchedMovies = data.data

                // Set total count from API response
                if (data.total_count !== undefined) {
                    setTotalMoviesCount(data.total_count)
                }

                if (isLoadMore) {
                    setAllMovies(prev => [...prev, ...fetchedMovies])
                } else {
                    setAllMovies(fetchedMovies)
                }

                // Check if there are more movies to load
                if (fetchedMovies.length < 10) {
                    setHasMoreMovies(false)
                }

                if (fetchedMovies.length > 0) {
                    setMoviesOffset(currentOffset + fetchedMovies.length)
                }
            }
        } catch (error) {
            console.error('Error fetching movies:', error)
        } finally {
            setMoviesLoading(false)
        }
    }, [isViewingFriend])



    // New function to update specific ranking position (only for current user)
    const updateRankingPosition = async () => {
        if (!selectedMovieForRanking || isViewingFriend) return

        const movieData = [{
            order_no: selectedRanking,
            movie_id: selectedMovieForRanking
        }]

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "top10wall",
                    user_id: userId,
                    movies: movieData
                })
            })
            const data = await response.json()
            if (data && data.response === "Top 10 Wall updated") {
                setShowRankingModal(false)
                setSelectedMovieForRanking(null)
                setSearchQuery("")
                fetchTop10Movies() // Refresh top 10 movies
            }
        } catch (error) {
            console.error('Error updating ranking position:', error)
        }
    }

    // Handle ranking click (only for current user)
    const handleRankingClick = (orderNo: number) => {
        if (isViewingFriend) return // Disable for friends

        setSelectedRanking(orderNo)
        setShowRankingModal(true)
        setSearchQuery("")
        setSelectedMovieForRanking(null)
    }

    // Get already selected movie IDs from top 10 (excluding mock data and current position)
    const getAlreadySelectedMovieIds = () => {
        return top10Movies
            .filter(entry => !entry.isMockData && entry.order_no !== selectedRanking)
            .map(entry => entry.movie?.movie_id)
            .filter(id => id !== undefined) as number[]
    }

    // Filter movies based on search query and exclude already selected movies
    const filteredMovies = allMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        const alreadySelected = getAlreadySelectedMovieIds().includes(movie.movie_id)
        return matchesSearch && !alreadySelected
    })

    // Common toggle like function
    const toggleLike = async () => {
        if (top10Movies.length === 0 || usingMockData) return

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "top10like",
                    user_id: userId,
                    friend_id: friendId || 0
                })
            })
            const data = await response.json()

            if (data && typeof data.liked === 'boolean') {
                setIsLiked(data.liked)
                fetchTop10Movies()
                console.log('Toggle like response:', data.response)
            } else {
                console.warn('Unexpected response:', data)
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    // Common save/unsave function
    const toggleSave = async () => {
        if (top10Movies.length === 0 || usingMockData) return;

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "top10save",
                    user_id: userId,
                    friend_id: friendId || 0,
                }),
            });

            const data = await response.json();

            if (data && data.liked !== undefined) {
                setIsSaved(data.liked);
                fetchTop10Movies(); // Refresh to update save status
            } else {
                console.warn('Unexpected response:', data);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    useEffect(() => {
        fetchTop10Movies()
        fetchAllMovies(0, false)
    }, [userId, friendId, fetchAllMovies])

    useEffect(() => {
        if (isViewingFriend) return

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !moviesLoading && hasMoreMovies && allMovies.length > 0) {
                    fetchAllMovies(moviesOffset, true)
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
    }, [moviesLoading, hasMoreMovies, moviesOffset, fetchAllMovies, allMovies.length, isViewingFriend])

    // Get top 3 movies for podium display
    const top3Movies = top10Movies.slice(0, 3)
    const otherMovies = top10Movies.slice(3)

    // Arrange top 3 in podium order: [2nd, 1st, 3rd]
    const podiumOrder = top3Movies.length >= 3 ? [top3Movies[1], top3Movies[0], top3Movies[2]] :
        top3Movies.length === 2 ? [null, top3Movies[0], top3Movies[1]] :
            top3Movies.length === 1 ? [null, top3Movies[0], null] : []

    if (loading) {
        return (
            <div className="h-screen text-white relative">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="mr-4 p-2 rounded-full bg-[#2b2b2b] animate-pulse w-10 h-10"></div>
                        <div className="w-32 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-[#2b2b2b] p-2 rounded-full w-10 h-10 animate-pulse"></div>
                    </div>
                </div>

                {/* Podium Skeleton */}
                <PodiumSkeleton />

                {/* Other Rankings Skeleton */}
                <div className="bg-white/10 backdrop-blur-sm rounded-t-3xl px-4 py-6 flex-1 mt-8">
                    <div className="space-y-4">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <RankingItemSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (

        // <PageTransitionWrapper>
        <div className="min-h-screen text-white relative mb-18">
            {/* Header */}
            <header className="flex justify-between items-center p-4 pt-8">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">
                            {isViewingFriend ? "Friend's Top 10" : "Top 10 Wall"}
                        </h1>
                        <p className="text-sm text-white/60">
                            {isViewingFriend ? "Friend's top picks." : "Your top favorites."}
                        </p>
                    </div>
                </div>

                {!isViewingFriend &&
                    <div className="flex items-center gap-3">
                        <Link href="/saved-top10-wall">
                            <Bookmark size={30} className="text-primary" />
                        </Link>
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
                    </div>
                }
            </header>


            {/* Mock Data Notice - Show only for own wall */}
            {mockDataCount > 0 && !isViewingFriend && (
                <div className="mx-4 mb-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                    <p className="text-blue-200 text-sm text-center">
                        {mockDataCount === 10
                            ? "This is sample data. Add your own movies to create your personalized top 10 wall! Click on any position to add your movies!"
                            : `${mockDataCount} position${mockDataCount > 1 ? 's are' : ' is'} using sample data. Click on any position to add your movies!`}
                    </p>
                </div>
            )}

            {/* No Data Message for Friends */}
            {isViewingFriend && top10Movies.length === 0 && (
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="mb-4">
                            <Trophy className="w-16 h-16 text-gray-400 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Top 10 Movies Yet</h3>
                        <p className="text-gray-400 text-center max-w-sm">
                            Your friend hasn't created their top 10 movie list yet.
                        </p>
                    </div>
                </div>
            )}

            {/* Content when movies exist */}
            {top10Movies.length > 0 && (
                <>
                    {/* Like and Save Actions - Show for all friends */}
                    {isViewingFriend && (
                        <div className="fixed bottom-4 left-0 w-full  z-50">
                            <div className="flex justify-center px-4 py-3">
                                <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 text-white bg-[#1f1f21] text-sm">
                                    <button
                                        onClick={toggleLike}
                                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                                        <span className={isLiked ? 'text-red-400' : ''}>
                                            {isLiked ? 'Liked' : 'Like'}
                                        </span>
                                    </button>
                                    <span className="mx-2 text-white/30">|</span>
                                    <button
                                        onClick={toggleSave}
                                        className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                                    >
                                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                        <span className={isSaved ? 'text-yellow-400' : ''}>
                                            {isSaved ? 'Saved' : 'Save'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Podium - Only show if >= 3 movies OR if not viewing friend */}
                    {(!isViewingFriend || top10Movies.length >= 3) && top3Movies.length > 0 && (
                        <div className="px-4">
                            <div className="flex items-end justify-center ">
                                {podiumOrder.map((movieEntry, index) => {
                                    if (!movieEntry) return <div key={index} className="w-16"></div>

                                    const position = movieEntry.order_no
                                    const movie = movieEntry.movie
                                    const isFirst = position === 1
                                    const avatarSize = isFirst ? "w-14 h-22" : "w-12 h-16"
                                    const podiumHeight = isFirst ? "h-34 w-24" : position === 2 ? "h-26 w-24" : "h-24 w-24"
                                    const podiumBg =
                                        isFirst
                                            ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]"
                                            : position === 2
                                                ? "bg-[#b56bbc]/80"
                                                : "bg-[#b56bbc]/60";

                                    return (
                                        <div key={movieEntry.top_id} className="flex flex-col items-center">
                                            {isFirst && <Trophy className="w-6 h-6 text-primary mb-1" />}
                                            <Link href={`/movie-detail-page?movie_id=${movie?.movie_id}`}>
                                                <div
                                                    className={`${avatarSize} mb-2 rounded-lg overflow-hidden ${isFirst ? 'ring-4 ring-primary' : 'ring-2 ring-white/50'} ${!isViewingFriend ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${movieEntry.isMockData ? 'opacity-60' : ''}`}
                                                    onClick={() => !isViewingFriend && handleRankingClick(position)}
                                                >
                                                    <img
                                                        src={
                                                            movie && movie.poster_path && !movieEntry.isMockData
                                                                ? `https://suggesto.xyz/App/${movie.poster_path}`
                                                                : movieEntry.isMockData && movie?.poster_path
                                                                    ? typeof movie.poster_path === "object" && "src" in movie.poster_path
                                                                        ? (movie.poster_path as { src: string }).src
                                                                        : movie.poster_path
                                                                    : "/placeholder.svg"
                                                        }
                                                        alt={movie ? movie.title : "Movie"}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </Link>
                                            <p className={`text-sm font-medium mb-1 text-center max-w-20 truncate ${movieEntry.isMockData ? 'opacity-60' : ''}`}>
                                                {movie ? movie.title : ""}
                                            </p>
                                            <p className={`text-xs text-gray-200 mb-2 ${movieEntry.isMockData ? 'opacity-60' : ''}`}>
                                                ★ {movie ? movie.rating : "0"}
                                            </p>
                                            <div
                                                className={`${podiumBg} rounded-t-lg w-16 ${podiumHeight} flex items-center justify-center ${!isViewingFriend ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${movieEntry.isMockData ? 'opacity-60' : ''}`}
                                                onClick={() => !isViewingFriend && handleRankingClick(position)}
                                            >
                                                <span className={`${isFirst ? 'text-3xl' : 'text-2xl'} font-bold text-white`}>{position}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Other Rankings */}
                    <div className=" rounded-t-3xl px-4 pb-6 flex-1 ">
                        <div className="space-y-4 ">
                            {/* Show movies based on conditions:
                                - If viewing friend and < 3 movies: show all movies in ranking format
                                - Otherwise: show movies from position 4 onwards */}
                            {(isViewingFriend && top10Movies.length < 3 ? top10Movies : otherMovies).map((movieEntry) => {
                                const movie = movieEntry.movie
                                return (
                                    <div
                                        key={movieEntry.top_id}
                                        className={`flex items-center gap-4 bg-[#2b2b2b] p-3 rounded-lg ${!isViewingFriend ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''} ${movieEntry.isMockData ? 'opacity-60' : ''}`}
                                        onClick={() => {
                                            if (isViewingFriend) {
                                                router.push(`/movie-detail-page?movie_id=${movie?.movie_id}`);
                                            } else {
                                                handleRankingClick(movieEntry.order_no);
                                            }
                                        }}
                                    >
                                        <span className="text-lg font-semibold text-white w-6">{movieEntry.order_no}</span>
                                        <div className="w-12 h-16 rounded-lg overflow-hidden">
                                            <img
                                                src={
                                                    movie && movie.poster_path && !movieEntry.isMockData
                                                        ? `https://suggesto.xyz/App/${movie.poster_path}`
                                                        : movieEntry.isMockData && movie?.poster_path
                                                            ? (typeof movie.poster_path === "object" && "src" in movie.poster_path
                                                                ? (movie.poster_path as { src: string }).src
                                                                : movie.poster_path)
                                                            : "/placeholder.svg"
                                                }
                                                alt={movie ? movie.title : "Movie"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{movie ? movie.title : ""}</p>
                                            <p className="text-gray-200 text-sm">{movie && movie.release_date ? movie.release_date.split('-')[0] : ""} • {movie && movie.language ? movie.language.toUpperCase() : ""}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <p className="text-gray-200 text-sm">★ {movie ? movie.rating : "0"}</p>
                                        </div>
                                        {/* Visual indicator for mock data - only show for own wall */}
                                        {movieEntry.isMockData && !isViewingFriend && (
                                            <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                                                Sample
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Ranking Update Modal - Only show for current user */}
            {!isViewingFriend && showRankingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1f1f21] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                Update Rank #{selectedRanking}
                            </h2>
                            <button
                                onClick={() => setShowRankingModal(false)}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#2b2b2b] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
                                />
                            </div>
                        </div>

                        {/* Movies List */}
                        <div className="flex-1 overflow-y-auto max-h-96 p-4">
                            <div className="space-y-3">
                                {filteredMovies.map((movie) => (
                                    <div
                                        key={movie.movie_id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedMovieForRanking === movie.movie_id
                                            ? 'bg-[#b56bbc ]/20 border border-[#b56bbc ]'
                                            : 'bg-[#2b2b2b] hover:bg-gray-700'
                                            }`}
                                        onClick={() => setSelectedMovieForRanking(movie.movie_id)}
                                    >
                                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={
                                                    movie.poster_path
                                                        ? `https://suggesto.xyz/App/${movie.poster_path}`
                                                        : "/placeholder.svg"
                                                }
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{movie.title}</p>
                                            <p className="text-gray-400 text-sm">
                                                {movie.release_date ? movie.release_date.split('-')[0] : ''} • {' '}
                                                {movie.language ? movie.language.toUpperCase() : ''}
                                            </p>
                                            <p className="text-gray-400 text-sm">★ {movie.rating || 'N/A'}</p>
                                        </div>
                                        {selectedMovieForRanking === movie.movie_id && (
                                            <div className="w-6 h-6 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {filteredMovies.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">
                                            {searchQuery
                                                ? "No movies found matching your search"
                                                : "No available movies (all movies are already in your top 10)"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Loading more movies indicator */}
                        {moviesLoading && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}

                        {/* Intersection observer target for infinite scroll */}
                        {hasMoreMovies && !moviesLoading && searchQuery === '' && (
                            <div ref={observerRef} className="h-4 w-full" />
                        )}

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRankingModal(false)}
                                    className="flex-1 py-3 px-4 bg-[#2b2b2b] text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateRankingPosition}
                                    disabled={!selectedMovieForRanking}
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors ${selectedMovieForRanking
                                        ? 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white hover:bg-[#5b4bd6]'
                                        : 'bg-[#2b2b2b] text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
        // </PageTransitionWrapper>


    )
}