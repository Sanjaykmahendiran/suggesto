"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Share2, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"

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

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    return match ? match[2] : null
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

                // Fetch movie data
                const movieResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=movieslist")
                const moviesData: Movie[] = await movieResponse.json()

                // Get user ID from cookies
                const user_id = Cookies.get("userID")
                if (!user_id) throw new Error("User ID not found in cookies.")

                // Fetch friends data
                const friendResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${user_id}`)
                const friendsData: Friend[] = await friendResponse.json()

                // Map movie and friend details
                const movieMap: Record<number, Movie> = {}
                moviesData.forEach((movie) => {
                    movieMap[movie.movie_id] = movie
                })

                const friendMap: Record<number, Friend> = {}
                friendsData.forEach((friend) => {
                    friendMap[friend.friend_id] = friend
                })

                setMovieDetails(movieMap)
                setFriendDetails(friendMap)
            } catch (err) {
                console.error("Error fetching suggestion details:", err)
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

    if (!suggestions || suggestions.length === 0 || isLoading) return null

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#6c5ce7]" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <a href="/suggestions" className="text-sm text-[#6c5ce7]">
                    See All
                </a>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion) => {
                    const movie = movieDetails[suggestion.movie_id]
                    const friend = friendDetails[suggestion.suggested_by]

                    return (
                        <motion.div
                            key={suggestion.movsug_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#292938] rounded-lg w-full"
                        >
                            <div className="flex p-3">
                                <div
                                    className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                    onClick={() => router.push(`/movie-detail-page?movie_id=${suggestion.movie_id}`)}
                                >
                                    <img
                                        src={
                                            movie.poster_path.startsWith("http")
                                                ? movie.poster_path
                                                : `https://suggesto.xyz/App/${movie.poster_path}`
                                        }
                                        alt={movie?.title || "Movie poster"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="ml-3 flex-1">
                                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage
                                                src={friend?.profile_pic || "/api/placeholder/20/20"}
                                                alt={friend?.name || "Friend"}
                                            />
                                            <AvatarFallback>{friend?.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <span>{friend?.name || "A friend"} suggested</span>
                                        <span className="text-gray-500">• {formatDate(suggestion.created_date)}</span>
                                    </div>

                                    <h3
                                        className="font-medium mb-1 text-sm cursor-pointer"
                                        onClick={() => router.push(`/movie-detail-page?movie_id=${suggestion.movie_id}`)}
                                    >
                                        {movie?.title || "Movie suggestion"}
                                    </h3>

                                    <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">
                                        {suggestion.note || "Check this out!"}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                                            onClick={() =>
                                                router.push(`/movie-detail-page?movie_id=${suggestion.movie_id}`)
                                            }
                                        >
                                            Watch Now
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs h-8 px-3 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                                            onClick={() => {
                                                alert("Added to watchlist!")
                                            }}
                                        >
                                            {suggestion.status === "pending" ? "Accept" : "Add to List"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs h-8 w-8 p-0 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                                            onClick={() => {
                                                navigator
                                                    .share?.({
                                                        title: movie?.title || "Movie suggestion",
                                                        text: suggestion.note,
                                                        url: `https://suggesto.xyz/movie/${suggestion.movie_id}`,
                                                    })
                                                    .catch(console.error)
                                            }}
                                        >
                                            <Share2 className="w-3 h-3" />
                                        </Button>
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
