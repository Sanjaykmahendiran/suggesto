"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowLeft, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/components/moviesharecard"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"

export default function MovieDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const movie_id = searchParams.get("movie_id")
    const tmdb_movie_id = searchParams.get("tmdb_movie_id")
    const userId = Cookies.get("userID") || "1"

    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareCard, setShowShareCard] = useState(false)

    type WatchlistData = {
        watch_id: number
        user_id: number
        movie_id: number
        friend_id: number
        status: string
        created_date: string
    }

    type Movie = {
        movie_id?: string
        tmdb_movie_id?: string
        title?: string
        poster_path?: string
        backdrop_path?: string
        genres?: string[]
        rating?: number | string
        release_date?: string
        language?: string
        overview?: string
        runtime?: string
        watchlist_data?: WatchlistData[]
        otts?: { name: string; logo?: string }[]
    }

    const [movie, setMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingToWatchlist, setAddingToWatchlist] = useState(false)
    const [watchlistSuccess, setWatchlistSuccess] = useState(false)
    const [watchlistError, setWatchlistError] = useState<string | null>(null)

    // Helper function to get watchlist status
    const getWatchlistStatus = (movie: Movie | null): string | undefined => {
        if (!movie?.watchlist_data || !Array.isArray(movie.watchlist_data) || movie.watchlist_data.length === 0) {
            return undefined
        }

        // If user is logged in, find their specific watchlist entry
        if (userId) {
            const userWatchlistEntry = movie.watchlist_data.find((entry) => entry.user_id.toString() === userId.toString())
            return userWatchlistEntry?.status
        }

        // Fallback to first entry if no user ID
        return movie.watchlist_data[0]?.status
    }

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true)
                setError(null)

                if (!movie_id && !tmdb_movie_id) {
                    throw new Error("No movie ID provided")
                }

                // Create the request body with the required parameters
                const requestBody: any = {
                    gofor: "moviedetail",
                }

                // Add either movie_id or tmdb_movie_id
                if (movie_id) {
                    requestBody.movie_id = movie_id
                } else if (tmdb_movie_id) {
                    requestBody.tmdb_movie_id = tmdb_movie_id
                }

                // Add user_id if available to get personalized watchlist status
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
                    setMovie(responseData.data)
                } else {
                    throw new Error("Invalid response format from API")
                }
            } catch (err) {
                console.error("Error fetching movie details:", err)
                setError(
                    typeof err === "object" && err !== null && "message" in err
                        ? (err as { message?: string }).message || "Failed to load movie details"
                        : "Failed to load movie details",
                )
            } finally {
                setLoading(false)
            }
        }

        fetchMovieDetails()
    }, [movie_id, tmdb_movie_id, userId])

    const handleAddToWatchlist = async () => {
        if (!userId) {
            setWatchlistError("Please login to add to watchlist")
            return
        }

        try {
            setAddingToWatchlist(true)
            setWatchlistError(null)

            // Create the request body with the required parameters
            const requestBody = {
                gofor: "addwatchlist",
                user_id: userId,
                movie_id: movie?.movie_id || movie_id,
                friend_id: "0",
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
            setTimeout(() => {
                setWatchlistSuccess(false);
                router.push("/watch-now");
            }, 1000);

            // Update the movie state to reflect the new watchlist status
            setMovie((prevMovie) => {
                if (!prevMovie) return prevMovie

                const newWatchlistEntry: WatchlistData = {
                    watch_id: data.watch_id || 0, // Use the returned watch_id from API
                    user_id: Number.parseInt(userId),
                    movie_id: Number.parseInt(prevMovie.movie_id || movie_id || "0"),
                    friend_id: 0,
                    status: "planned",
                    created_date: new Date().toISOString(),
                }

                const existingWatchlistData = prevMovie.watchlist_data || []
                const updatedWatchlistData = [...existingWatchlistData, newWatchlistEntry]

                return {
                    ...prevMovie,
                    watchlist_data: updatedWatchlistData,
                }
            })

            // Reset success message after 3 seconds
            setTimeout(() => {
                setWatchlistSuccess(false)
            }, 3000)
        } catch (err) {
            console.error("Error adding to watchlist:", err)
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to add to watchlist"
                    : "Failed to add to watchlist",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }

    const handleMarkAsWatched = async () => {
        if (!userId) {
            setWatchlistError("Please login to mark as watched")
            return
        }

        try {
            setAddingToWatchlist(true)
            setWatchlistError(null)

            // Find the user's watchlist entry to get the watch_id
            const userWatchlistEntry = movie?.watchlist_data?.find((entry) => entry.user_id.toString() === userId.toString())

            if (!userWatchlistEntry) {
                throw new Error("Movie not found in your watchlist")
            }

            // Create the request body with the required parameters
            const requestBody = {
                gofor: "watchedmovie",
                watch_id: userWatchlistEntry.watch_id.toString(),
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
            setTimeout(() => {
                setWatchlistSuccess(false);
                router.push("/watch-now");
            }, 1000);


            // Update the movie state to reflect the new watchlist status
            setMovie((prevMovie) => {
                if (!prevMovie || !prevMovie.watchlist_data) return prevMovie

                const updatedWatchlistData = prevMovie.watchlist_data.map((entry) =>
                    entry.user_id.toString() === userId.toString() ? { ...entry, status: "watched" } : entry,
                )

                return {
                    ...prevMovie,
                    watchlist_data: updatedWatchlistData,
                }
            })

            // Reset success message after 3 seconds
            setTimeout(() => {
                setWatchlistSuccess(false)
            }, 3000)
        } catch (err) {
            console.error("Error marking as watched:", err)
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to mark as watched"
                    : "Failed to mark as watched",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }

    // Show loading skeletons while fetching data
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen text-white">
                <div className="relative">
                    <div className="p-4 flex items-center">
                        <button className="p-2" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold ml-4">Movies</h1>
                    </div>
                    <Skeleton className="h-[400px] w-full bg-gray-800" />
                </div>

                <div className="px-4 py-6">
                    <Skeleton className="h-8 w-36 bg-gray-800 mb-2" />
                    <Skeleton className="h-4 w-48 bg-gray-800 mb-4" />

                    <div className="flex gap-2 mb-6">
                        <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                        <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                        <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                    </div>

                    <div className="flex justify-between mt-6">
                        <Skeleton className="h-10 w-10 bg-gray-800 rounded-full" />
                        <Skeleton className="h-10 w-32 bg-gray-800 rounded-full" />
                        <Skeleton className="h-10 w-10 bg-gray-800 rounded-full" />
                    </div>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col min-h-screen text-white">
                <div className="p-4">
                    <button className="p-2" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                    <div className="bg-red-900/30 p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-semibold mb-2">Error Loading Movie</h2>
                        <p className="text-gray-300">{error}</p>
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
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
        title = "Unknown Title",
        poster_path,
        backdrop_path,
        genres = [],
        release_date,
        language = "Unknown",
        runtime = "",
    } = movie || {}

    // Get the current watchlist status
    const watchlist_status = getWatchlistStatus(movie)

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

    // Format release year and country
    const releaseYear = release_date ? new Date(release_date).getFullYear() : ""
    const formattedRuntime = runtime || ""
    const releaseInfo = [releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : "", formattedRuntime]
        .filter(Boolean)
        .join(" - ")

    // Determine what action button to show based on watchlist status
    const getActionButton = () => {
        if (!userId) {
            return {
                text: "Add to watchlist",
                action: handleAddToWatchlist,
                className: "bg-primary",
            }
        }

        switch (watchlist_status) {
            case "planned":
                return {
                    text: "Mark as watched",
                    action: handleMarkAsWatched,
                    className: "bg-primary",
                }
            case "watched":
                return {
                    text: "Already seen",
                    action: () => { },
                    disabled: true,
                    className: "bg-primary",
                }
            default:
                return {
                    text: "Add to watchlist",
                    action: handleAddToWatchlist,
                    className: "bg-primary",
                }
        }
    }

    const actionButton = getActionButton()

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header with backdrop */}
            <div className="relative">
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
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#181826] to-transparent"></div>
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
                    <h1 className="text-xl font-semibold">Details</h1>
                </div>

                {/* Movie poster section with backdrop */}
                <div className="relative z-10 px-4 pb-8">
                    <div className="relative w-full aspect-[2/3] max-w-xs mx-auto mb-4 rounded-lg overflow-hidden shadow-2xl">
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
                <p className="text-sm text-gray-400 text-center mb-4">{releaseInfo}</p>

                {/* Genre tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {genresArray.map((genre, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-gray-800 rounded-full">
                            {genre}
                        </span>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center w-full max-w-xs mt-4">
                    <button
                        className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
                        onClick={() => setShowShareCard(true)}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    <Button
                        className={cn(
                            "px-6 py-2 rounded-full text-white",
                            actionButton.className,
                            (addingToWatchlist || actionButton.disabled) && "opacity-70",
                        )}
                        onClick={actionButton.action}
                        disabled={addingToWatchlist || actionButton.disabled}
                    >
                        {addingToWatchlist ? "Processing..." : actionButton.text}
                    </Button>

                    <button
                        className={cn(
                            "w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center",
                            isFavorite && "bg-gray-700",
                        )}
                        onClick={() => setIsFavorite(!isFavorite)}
                    >
                        <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
                    </button>
                </div>
            </div>

            {/* Watchlist status messages */}
            {watchlistSuccess && (
                <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                        {watchlist_status === "watched" ? "Marked as watched successfully" : "Added to watchlist successfully"}
                    </div>
                </div>
            )}

            {watchlistError && (
                <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">{watchlistError}</div>
                </div>
            )}

            {/* Bottom Slide Filter Component */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 transition-all duration-300">
                    {/* Full-screen blur layer */}
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard onClick={() => setShowShareCard(false)} movieTitle={title} />
                    </div>
                </div>
            )}
        </div>
    )
}