"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowLeft, Share2, Users, Check, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/app/movie-detail-page/_components/moviesharecard"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"

export default function MovieDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const movsug_id = searchParams.get("movsug_id")
    const userId = Cookies.get("userID") || "1"

    const [showShareCard, setShowShareCard] = useState(false)

    type SuggestedMovie = {
        movsug_id: number
        movie_id: number
        title: string
        poster_path: string
        backdrop_path: string
        release_date: string
        rating: string
        genres: string[]
        suggested_by_user_id: number
        suggested_by_name: string
        suggested_to_user_id: number
        suggested_to_name: string
        status: string
        added_date: string

    }

    const [movie, setMovie] = useState<SuggestedMovie | null>(null)
    const [loading, setLoading] = useState(true)
    const [processingAccept, setProcessingAccept] = useState(false)
    const [processingReject, setProcessingReject] = useState(false)
    const [actionSuccess, setActionSuccess] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSuggestedMovieDetails = async () => {
            try {
                setLoading(true)

                if (!movsug_id) {
                    throw new Error("No movie suggestion ID provided")
                }

                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmoviedetail&movsug_id=${movsug_id}`)

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`)
                }

                const responseData = await response.json()

                // Check if the response has the expected structure
                if (responseData && responseData.movsug_id) {
                    setMovie(responseData)
                } else {
                    throw new Error("Invalid response format from API")
                }
            } catch (err) {
                console.error("Error fetching suggested movie details:", err)
                toast.error(
                    typeof err === "object" && err !== null && "message" in err
                        ? (err as { message?: string }).message || "Failed to load movie details"
                        : "Failed to load movie details",
                )
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestedMovieDetails()
    }, [movsug_id])

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
                friend_id: movie.suggested_by_user_id.toString(),
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
                setActionSuccess(null)
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
            setActionError(null)

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
            console.error("No movie to remove.");
            return;
        }
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletemovsug&movsug_id=${movie.movsug_id}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.response === "Movie removed from Suggested List") {
                toast.success("Movie successfully removed from watchlist");
                router.back();
            } else {
                toast.error("Failed to remove from watchlist:", data.message || data);
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
        }
    };

    // Show loading skeletons while fetching data
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen text-white">
                <div className="relative">
                    <div className="p-4 flex items-center">
                        <button className="p-2" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold ml-4">Movie Suggestion</h1>
                    </div>
                    <Skeleton className="h-[400px] w-full bg-[#2b2b2b]" />
                </div>

                <div className="px-4 py-6">
                    <Skeleton className="h-8 w-36 bg-[#2b2b2b] mb-2" />
                    <Skeleton className="h-4 w-48 bg-[#2b2b2b] mb-4" />

                    <div className="flex gap-2 mb-6">
                        <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                        <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                        <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                    </div>

                    <div className="flex justify-between mt-6">
                        <Skeleton className="h-10 w-10 bg-[#2b2b2b] rounded-full" />
                        <Skeleton className="h-10 w-32 bg-[#2b2b2b] rounded-full" />
                        <Skeleton className="h-10 w-10 bg-[#2b2b2b] rounded-full" />
                    </div>
                </div>
            </div>
        )
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
        suggested_by_name,
        status,
        added_date,
    } = movie

    // Example: Determine if already in watchlist (replace with real logic if available)
    const already_in_watchlist = movie && (movie as any).already_in_watchlist === true;

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
    const ratingText = rating ? (
        <span>
            <span style={{ color: 'gold' }}>★</span> {rating}
        </span>
    ) : ""

    const releaseInfo = [releaseYear, ratingText].filter(Boolean)

    // Format suggestion date
    const suggestionDate = added_date ? new Date(added_date).toLocaleDateString() : ""

    return (

        //   <PageTransitionWrapper>
        <div className="flex flex-col min-h-screen fixed inset-0">
            {/* Header with backdrop */}
            <div className="relative pt-6">
                {/* Backdrop image */}
                {backdropUrl && (
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={backdropUrl}
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
                <div className="relative z-10 px-4 pb-4">
                    <div className="relative w-[80%] aspect-[2/3] max-w-sm mx-auto mb-4 rounded-lg overflow-hidden shadow-2xl">
                        <img
                            src={posterUrl || "/placeholder.svg"}
                            alt={`${title} poster`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Movie details */}
            <div className="px-4 flex flex-col items-center -mt-4 relative z-10">
                <h2 className="text-2xl font-bold text-center mb-1">{title}</h2>
                <p className="text-sm text-gray-400 text-center mb-2">{releaseInfo.map((info, i) => (
                    <span key={i}>
                        {i > 0 && " | "}
                        {info}
                    </span>
                ))}</p>

                {/* Suggestion info */}
                <div className="bg-[#121214] px-4 py-2 rounded-lg mb-4 text-center">
                    <p className="text-sm font-medium text-gray-300">
                        Suggested by <span className="font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">{suggested_by_name}</span>
                    </p>
                    {suggestionDate && (
                        <p className="text-xs text-gray-400 mt-1">on {suggestionDate}</p>
                    )}
                </div>

                {/* Genre tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {genresArray.map((genre, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                            {genre}
                        </span>
                    ))}
                </div>

                {/* Action buttons - Accept/Reject */}
                {/* Action buttons or watchlist status */}
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
                                    onClick={handleAcceptSuggestion}
                                    disabled={processingAccept}
                                    className={cn(
                                        "px-6 py-2 rounded-full border border-green-500 text-green-500 bg-[#2b2b2b] hover:bg-green-800/10 shadow-lg transition-transform transform hover:scale-105",
                                        processingAccept && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    Add to Watchlist
                                </button>

                                {/* Remove Button */}
                                <button
                                    onClick={handleRejectSuggestion}
                                    disabled={processingReject}
                                    className={cn(
                                        "px-6 py-2 rounded-full border border-red-500 text-red-500 bg-[#2b2b2b] hover:bg-red-800/10 shadow-lg transition-transform transform hover:scale-105",
                                        processingReject && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    Remove
                                </button>

                            </div>

                        ) : (
                            <div
                                className={cn(
                                    "mt-4 px-6 py-2 rounded-full text-white text-center",
                                    status === "accepted" ? "bg-green-600" : "bg-red-600"
                                )}
                            >
                                {status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                            </div>
                        )}
                    </>
                )}

                {/* Show status if already processed */}
                {status !== "pending" && (
                    <div className={cn(
                        "px-6 py-2 rounded-full text-white text-center",
                        status === "accepted" ? "bg-green-600" : "bg-red-600"
                    )}>
                        {status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </div>
                )}

            </div>


            {/* Action status messages */}
            {actionSuccess && (
                <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                        {actionSuccess}
                    </div>
                </div>
            )}

            {actionError && (
                <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">{actionError}</div>
                </div>
            )}

            {/* Share card modal */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 transition-all duration-300">
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard onClick={() => setShowShareCard(false)}
                            movieTitle={title}
                            genresArray={genresArray}
                            ratings={rating}
                            releaseDate={release_date}
                            movieImage={posterUrl} />
                    </div>
                </div>
            )}
        </div>
        // {/* </PageTransitionWrapper> */}

    )
}