"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/app/movie-detail-page/_components/moviesharecard"
import { Skeleton } from "@/components/ui/skeleton"
import toast from "react-hot-toast"
import type { SuggestedMovieDetail } from "../type"
import Image from "next/image"
import CastAndCrew from "@/app/movie-detail-page/_components/CastAndCrew"
import MovieBuddiesSection from "@/app/movie-detail-page/_components/movie-buddies"
import ReviewSection from "@/app/movie-detail-page/_components/review-section"
import { YouMightAlsoLike } from "@/components/you-might-also-like"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useTourIntegration } from "@/hooks/useTourIntegration"
import DetailLoading from "../_components/detail-loading"

export default function SuggestedMovieDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const movsug_id = searchParams.get("movsug_id")
    const movie_id = searchParams.get("movie_id")
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") || "" : ""

    const [showShareCard, setShowShareCard] = useState(false)
    const [movie, setMovie] = useState<SuggestedMovieDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [processingAccept, setProcessingAccept] = useState(false)
    const [processingReject, setProcessingReject] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    useTourIntegration('suggestedMovieDetail', [loading], !loading)

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0)
    }, [])

    // Move fetchMovieDetails outside useEffect so it can be reused (same as MovieDetailPage)
    const fetchMovieDetails = async () => {
        try {
            if (!movie_id) {
                throw new Error("No movie ID provided")
            }

            // Create the request body with the required parameters
            const requestBody: any = {
                gofor: "moviedetail",
            }

            // Add movie_id
            if (movie_id) {
                requestBody.movie_id = movie_id
            }

            // Add user_id if available to get personalized data
            if (userId) {
                requestBody.user_id = userId
            }

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
            }

            const responseData = await response.json()

            // Check if the response has the expected structure
            if (responseData.status === "success" && responseData.data) {
                return responseData.data
            } else {
                throw new Error("Invalid response format from API")
            }
        } catch (err) {
            console.error("Error fetching movie details:", err)
            throw err
        }
    }

    const fetchSuggestedMovieDetails = async () => {
        try {
            if (!movsug_id) {
                throw new Error("No movie suggestion ID provided")
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmoviedetail&movsug_id=${movsug_id}`)

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
            }

            const responseData = await response.json()

            // Check if the response has the expected structure
            if (responseData.status === "success" && responseData.data) {
                return responseData.data
            } else {
                throw new Error("Invalid response format from API")
            }
        } catch (err) {
            console.error("Error fetching suggested movie details:", err)
            throw err
        }
    }

    useEffect(() => {
        const fetchAllMovieData = async () => {
            try {
                setLoading(true)

                // Fetch both movie details and suggestion details in parallel
                const [movieData, suggestionData] = await Promise.all([fetchMovieDetails(), fetchSuggestedMovieDetails()])

                // Merge the data - suggestion data takes precedence for suggestion-specific fields
                const mergedData = {
                    ...movieData,
                    // Suggestion-specific fields from suggestedmoviedetail API
                    movsug_id: suggestionData.movsug_id,
                    suggested_by: suggestionData.suggested_by,
                    status: suggestionData.status,
                    added_date: suggestionData.added_date,
                    note: suggestionData.note,
                    already_in_watchlist: suggestionData.already_in_watchlist,
                    // Keep movie details from moviedetail API for comprehensive data
                    cast: movieData.cast || [],
                    crew: movieData.crew || [],
                    movie_buddies: movieData.movie_buddies || [],
                    available_on_ott: movieData.available_on_ott || [],
                    watchlist_data: movieData.watchlist_data || [],
                    liked: movieData.liked || 0,
                    rated: movieData.rated || 0,
                    video: movieData.video || null,
                    actor_id: movieData.actor_id || null,
                }

                setMovie(mergedData)
            } catch (err) {
                console.error("Error fetching movie data:", err)
                toast.error(
                    typeof err === "object" && err !== null && "message" in err
                        ? (err as { message?: string }).message || "Failed to load movie details"
                        : "Failed to load movie details",
                )
            } finally {
                setLoading(false)
            }
        }

        fetchAllMovieData()
    }, [movsug_id, movie_id, userId])

    const handleAcceptSuggestion = async () => {
        if (!userId || !movie) {
            toast.error("Unable to accept suggestion")
            return
        }

        try {
            setProcessingAccept(true)
            // Create the request body for adding to watchlist
            const requestBody = {
                gofor: "addwatchlist",
                user_id: userId,
                movie_id: movie.movie_id.toString(),
                friend_id: movie.suggested_by.user_id.toString(), // Fixed variable reference
            }

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed with status ${response.status}`)
            }

            const data = await response.json()
            toast.success("Movie accepted and added to your watchlist!")

            // Redirect after a short delay
            setTimeout(() => {
                router.push("/suggest")
            }, 3000)
        } catch (err) {
            console.error("Error accepting suggestion:", err)
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to accept suggestion"
                    : "Failed to accept suggestion",
            )
        } finally {
            setProcessingAccept(false)
        }
    }

    const handleRejectSuggestion = async () => {
        if (!movsug_id) {
            toast.error("Unable to reject suggestion")
            return
        }

        try {
            setProcessingReject(true)
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=rejectsugmovie&movsug_id=${movsug_id}`)

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
            }

            const data = await response.json()
            toast.success("Movie suggestion rejected")

            // Redirect after a short delay
            setTimeout(() => {
                router.back()
            }, 3000)
        } catch (err) {
            console.error("Error rejecting suggestion:", err)
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to reject suggestion"
                    : "Failed to reject suggestion",
            )
        } finally {
            setProcessingReject(false)
        }
    }

    const handleRemoveSuggestion = async (watchId: any) => {
        if (!movie) {
            console.error("No movie to remove.")
            return
        }

        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletemovsug&movsug_id=${movie.movsug_id}`, {
                method: "GET",
            })

            const data = await response.json()
            if (data.response === "Movie removed from Suggested List") {
                toast.success("Movie successfully removed from watchlist")
                router.back()
            } else {
                toast.error("Failed to remove from watchlist:", data.message || data)
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error)
        }
    }

    const truncateOverview = (text: string, maxLength = 80) => {
        if (!text) return ""
        if (isExpanded || text.length <= maxLength) return text
        return text.substring(0, maxLength).trim() + "..."
    }

    const toggleOverview = () => setIsExpanded(!isExpanded)

    const extractYouTubeVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        const match = url?.match(regex)
        return match ? match[1] : null
    }

    // Show loading skeletons while fetching data
    if (loading) {
       <DetailLoading />
    }

    if (!movie) {
        return null
    }

    // Destructure movie data for easier access with fallbacks
    const {
        title,
        poster_path,
        backdrop_path,
        genres = [],
        release_date,
        rating,
        suggested_by,
        status,
        added_date,
        note,
        overview = "",
        language = "",
        is_adult = "",
    } = movie

    // Example: Determine if already in watchlist (replace with real logic if available)
    const already_in_watchlist = movie && (movie as any).already_in_watchlist === true

    // Format genres as a comma-separated string
    const genresArray = Array.isArray(genres) ? genres.filter((genre) => genre && genre !== "") : []

    // Default poster if not available
    const posterUrl = poster_path
        ? poster_path.startsWith("http")
            ? poster_path
            : `https://suggesto.xyz/App/${poster_path}`
        : "/placeholder-poster.jpg"

    // Backdrop image URL
    const backdropUrl = backdrop_path
        ? backdrop_path.startsWith("http")
            ? backdrop_path
            : `https://suggesto.xyz/App/${backdrop_path}`
        : null

    // Format release year and rating
    const releaseYear = release_date ? new Date(release_date).getFullYear() : ""
    const audience = is_adult === "1" ? "A" : "GA"
    const ratingText = rating ? (
        <span>
            <span style={{ color: "gold" }}>★</span> {rating}
        </span>
    ) : (
        ""
    )

    const releaseInfo = [
        releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : "",
        audience,
        ratingText,
    ].filter(Boolean)

    const videoreleaseInfo = [
        releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : "",
        audience,
    ].filter(Boolean)

    const suggested_by_name = suggested_by.name

    // Format suggestion date
    const suggestionDate = added_date ? new Date(added_date).toLocaleDateString() : ""

    return (
        <div className="flex flex-col min-h-screen overflow-y-auto">
            {/* Header with backdrop */}
            <div className="relative pt-6">
                {/* Backdrop image */}
                {backdropUrl && (
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={backdropUrl || "/placeholder.svg"}
                            alt={`${title} backdrop`}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90"></div>
                        {/* Bottom gradient for smooth transition */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121214] to-transparent"></div>
                    </div>
                )}

                {/* Header content */}
                <div className="relative z-10 p-4 flex items-center justify-center">
                    <button
                        className="absolute left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Movie Suggestion</h1>
                </div>

                {/* Movie poster section with backdrop */}
                <div className="relative z-10 px-4 pb-4" data-tour-target="movie-poster">
                    <div className="relative w-[80%] aspect-[2/3] max-w-sm mx-auto mb-4 rounded-lg overflow-hidden shadow-2xl">
                        <img src={posterUrl || "/placeholder.svg"} alt={`${title} poster`} className="w-full h-full object-cover" />
                        {/* Play button overlay - only show if video exists */}
                        {movie.video && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <button
                                    onClick={() => setShowVideo(true)}
                                    className="w-12 h-12 bg-white/70 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                                >
                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Popup Modal */}
                {showVideo && movie.video && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        {/* Click outside to close */}
                        <div className="absolute inset-0 z-10" onClick={() => setShowVideo(false)} />
                        <div className="relative z-20 w-full mx-2 flex flex-col items-center">
                            {/* Video Player */}
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
                                <iframe
                                    src={`https://www.youtube.com/embed/${extractYouTubeVideoId(movie.video)}?autoplay=1&modestbranding=1&rel=0&disablekb=1&controls=1`}
                                    title={title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {/* Video Info */}
                            <div className="mt-4 mb-2 px-4 text-white text-center">
                                <h2 className="text-2xl font-bold mb-1">{title}</h2>
                                <p className="text-sm text-gray-400 mb-2">
                                    {videoreleaseInfo.map((info, i) => (
                                        <span key={i}>
                                            {i > 0 && " | "}
                                            {info}
                                        </span>
                                    ))}
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {genresArray.map((genre, index) => (
                                        <span key={index} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Close button */}
                        <button
                            onClick={() => setShowVideo(false)}
                            className="absolute top-10 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-30"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* Movie details */}
            <div className="px-4 flex flex-col items-center -mt-4 relative z-10" >
                <div data-tour-target="movie-info">
                    <h2 className="text-2xl font-bold text-center mb-1">{title}</h2>
                    <p className="text-sm text-gray-400 text-center mb-2">
                        {releaseInfo.map((info, i) => (
                            <span key={i}>
                                {i > 0 && " | "}
                                {info}
                            </span>
                        ))}
                    </p>
                </div>

                {overview && (
                    <p className="text-sm text-gray-300 text-center mb-2 px-4 leading-tight max-w-sm" data-tour-target="movie-overview">
                        {truncateOverview(overview)}{" "}
                        {overview.length > 80 && (
                            <span onClick={toggleOverview} className="text-primary cursor-pointer hover:underline">
                                {isExpanded ? "less" : "more"}
                            </span>
                        )}
                    </p>
                )}

                {/* Suggestion info */}
                <div className="bg-[#121214] px-4 py-2 rounded-lg mb-4 text-center" data-tour-target="suggestion-info">
                    <p className="text-sm font-medium text-gray-300 flex items-center justify-center gap-2">
                        Suggested by
                        <Link href={`/friends/friend-profile-detail?profile_id=${suggested_by.user_id}`} >
                            <span className="flex items-center gap-2">
                                <Avatar key={suggested_by.user_id} className="h-8 w-8 border border-[#b56bbc]">
                                    <AvatarImage
                                        src={suggested_by.imgname}
                                        alt={suggested_by.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]">
                                        {suggested_by.name?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                    {suggested_by_name}
                                </span>
                            </span>
                        </Link>
                    </p>
                    {note && <p className="text-xs text-gray-400 mt-1">"{note}"</p>}
                    {suggestionDate && <p className="text-xs text-gray-400 mt-1">on {suggestionDate}</p>}
                </div>


                {/* Genre tags */}
                <div className="flex flex-wrap justify-center gap-2 ">
                    {genresArray.map((genre, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                            {genre}
                        </span>
                    ))}
                </div>

                {/* OTT platforms */}
                {Array.isArray(movie.available_on_ott) && movie.available_on_ott.length > 0 && (
                    <div className="flex gap-2 items-center mt-4">
                        <span className="text-xs text-gray-400">Available on:</span>
                        <div className="flex gap-2 items-center">
                            {movie.available_on_ott.map((ott) => (
                                <div key={ott.ott_id} className="flex items-center gap-1">
                                    <div className="w-5 h-5 relative">
                                        <Image
                                            src={ott.logo_url || "/placeholder.svg"}
                                            alt={ott.name}
                                            fill
                                            className="object-contain rounded"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none"
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-300">{ott.name}</span>
                                </div>
                            ))}
                            {movie.available_on_ott.length > 3 && (
                                <span className="text-xs text-gray-400">+{movie.available_on_ott.length - 3} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action buttons - Accept/Reject - UNCHANGED AS REQUESTED */}
                <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
                    <div className="relative flex items-center justify-center w-full">
                        {already_in_watchlist ? (
                            <div className="mb-4 flex items-center justify-between">
                                <Button
                                    disabled
                                    className="px-6 py-2 rounded-full font-semibold text-primary bg-[#2b2b2b] cursor-not-allowed"
                                >
                                    Already in watchlist
                                </Button>
                                <button
                                    onClick={handleRemoveSuggestion}
                                    className="w-12 h-12 ml-3 rounded-full bg-[#2b2b2b] flex items-center justify-center"
                                    title="Remove from watchlist"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                {status === "pending" ? (
                                    <div className="flex justify-center items-center gap-8 w-full max-w-xs mb-4">
                                        {/* Add to Watchlist Button */}
                                        <button
                                            data-tour-target="accept-suggestion"
                                            onClick={handleAcceptSuggestion}
                                            disabled={processingAccept}
                                            className={cn(
                                                "px-6 py-2 rounded-full border border-green-500 text-green-500 bg-[#2b2b2b] hover:bg-green-800/10 shadow-lg transition-transform transform hover:scale-105",
                                                processingAccept && "opacity-70 cursor-not-allowed",
                                            )}
                                        >
                                            Add to Watchlist
                                        </button>
                                        {/* Remove Button */}
                                        <button
                                            data-tour-target="reject-suggestion"
                                            onClick={handleRejectSuggestion}
                                            disabled={processingReject}
                                            className={cn(
                                                "px-6 py-2 rounded-full border border-red-500 text-red-500 bg-[#2b2b2b] hover:bg-red-800/10 shadow-lg transition-transform transform hover:scale-105",
                                                processingReject && "opacity-70 cursor-not-allowed",
                                            )}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "mt-4 px-6 py-2 rounded-full text-white text-center",
                                            status === "accepted" ? "bg-green-600" : "bg-red-600",
                                        )}
                                    >
                                        {status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                                    </div>
                                )}
                            </>
                        )}
                        {/* Show status if already processed */}
                        {status !== "pending" && (
                            <div
                                className={cn(
                                    "px-6 py-2 rounded-full text-white text-center",
                                    status === "accepted" ? "bg-green-600" : "bg-red-600",
                                )}
                            >
                                {status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cast and Crew Section */}
                <CastAndCrew movieData={movie} actorId={movie.actor_id} />

                {/* Movie Buddies Section */}
                <MovieBuddiesSection movies={movie.movie_buddies} />

                {/* Review Section */}
                <ReviewSection viewer_id={Number.parseInt(userId)} movie_id={Number.parseInt(movie_id || "")} />

                {/* You Might Also Like Section */}
                <YouMightAlsoLike movie_id={Number.parseInt(movie_id || "")} user_id={Number.parseInt(userId)} />
            </div>

            {/* Share card modal */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 transition-all duration-300">
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard
                            onClick={() => setShowShareCard(false)}
                            movieTitle={title}
                            genresArray={genresArray}
                            ratings={rating}
                            releaseDate={release_date}
                            movieImage={posterUrl}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
