"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Clock, MessageSquare, XCircle } from "lucide-react"
import Image from "next/image"
import Cookies from "js-cookie"
import { Button } from "../ui/button"

interface Suggestion {
    movsug_id: number
    movie_id: number
    suggested_by: number
    note: string
    status: string
    created_date: string
}

interface Movie {
    movie_id: number
    title: string
    poster_path: string
    rating: string
    genres?: string[]
}

interface Friend {
    friend_id: number
    name: string
    profile_pic: string
}

interface SuggestionsSectionProps {
    suggestions: Suggestion[]
    title?: string
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
    suggestions,
    title = "Suggestions from Friends",
}) => {
    const router = useRouter()
    const [movieDetails, setMovieDetails] = useState<Record<number, Movie>>({})
    const [friendDetails, setFriendDetails] = useState<Record<number, Friend>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSuggestionDetails = async () => {
            if (!suggestions || suggestions.length === 0) return

            try {
                setIsLoading(true)
                const movieRes = await fetch("https://suggesto.xyz/App/api.php?gofor=movieslist")
                const movies: Movie[] = await movieRes.json()

                const user_id = Cookies.get("userID")
                if (!user_id) throw new Error("User ID not found in cookies.")

                const friendRes = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${user_id}`)
                const friends: Friend[] = await friendRes.json()

                const movieMap: Record<number, Movie> = {}
                movies.forEach((movie) => (movieMap[movie.movie_id] = movie))

                const friendMap: Record<number, Friend> = {}
                friends.forEach((friend) => (friendMap[friend.friend_id] = friend))

                setMovieDetails(movieMap)
                setFriendDetails(friendMap)
            } catch (err) {
                console.error("Error fetching data:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSuggestionDetails()
    }, [suggestions])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    const getStatusClass = (status: string) => {
        if (status === "pending") return "text-yellow-400"
        if (status === "accepted") return "text-green-400"
        return "text-gray-400"
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="w-4 h-4 text-green-400" />
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-400" />
            case 'pending':
            default:
                return <Clock className="w-4 h-4 text-yellow-400" />
        }
    }

    const getStatusText = (status: string) => {
        if (status === "pending") return "Pending"
        if (status === "accepted") return "Accepted"
        return "Viewed"
    }

    const renderActionButtons = (suggestion: Suggestion) => {
        return (
            <div className="flex gap-2 items-center justify-end">
                <button
                    className="p-0"
                    onClick={() => router.push(`/suggest/suggest-detail-page?movsug_id=${suggestion.movsug_id}`)}
                >
                    <ArrowRight className="w-8 h-6 text-primary" /> {/* Increased width */}
                </button>
            </div>
        )
    }

    if (!suggestions || suggestions.length === 0 || isLoading) return null

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#6c5ce7]" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <a href="/suggest" className="text-sm text-[#6c5ce7]">
                    See All
                </a>
            </div>

            <div className="space-y-4">
                {suggestions.map((suggestion) => {
                    const movie = movieDetails[suggestion.movie_id]
                    const friend = friendDetails[suggestion.suggested_by]

                    return (
                        <motion.div
                            key={suggestion.movsug_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#292938] rounded-lg overflow-hidden"
                            onClick={
                                suggestion.status === "pending"
                                    ? () => router.push(`/suggest/suggest-detail-page?movsug_id=${suggestion.movsug_id}`)
                                    : undefined
                            }
                        >
                            <div className="flex p-3">
                                {/* Movie Poster */}
                                <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={
                                            movie?.poster_path?.startsWith("http")
                                                ? movie.poster_path
                                                : `https://suggesto.xyz/App/${movie?.poster_path || ""}`
                                        }
                                        alt={movie?.title || "Poster"}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = "/api/placeholder/80/112"
                                        }}
                                    />
                                </div>

                                {/* Movie Info */}
                                <div className="ml-4 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-xs text-gray-400">
                                                Suggested by{" "}
                                                <span className="font-bold pl-1 text-white">{friend?.name || "user"}</span>
                                            </p>
                                            <span className="text-xs text-gray-500">• {formatDate(suggestion.created_date)}</span>
                                        </div>

                                        <h3 className="font-medium text-sm text-white mb-1">
                                            {movie?.title || "Movie Suggestion"}
                                        </h3>

                                        <p className="text-xs text-gray-400 mb-2">
                                            {Array.isArray(movie?.genres) && movie.genres.length > 0
                                                ? movie.genres.join(", ")
                                                : "No genres available"}
                                        </p>
                                        <div className="flex items-center justify-between gap-3 whitespace-nowrap ">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-[#181826] ${getStatusClass(suggestion.status)}`}>
                                                    {getStatusIcon(suggestion.status)}
                                                    {getStatusText(suggestion.status)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Rating: {parseFloat(movie?.rating).toFixed(1)}/10
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                {renderActionButtons(suggestion)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
