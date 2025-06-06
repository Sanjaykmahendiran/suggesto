"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowLeft, Share2, Users, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/components/moviesharecard"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"
import ReviewSection from "@/components/review-section"
import { YouMightAlsoLike } from "@/components/you-might-also-like"
import { Movie, WatchlistData } from "@/app/movie-detail-page/type"
import { PageTransitionWrapper } from "@/components/PageTransition"

export default function MovieDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const MovieType = searchParams.get("type");
    const movie_id = searchParams.get("movie_id")
    const tmdb_movie_id = searchParams.get("tmdb_movie_id")
    const watromovId = searchParams.get("watromov_id")
    const userId = Cookies.get("userID") || "1"

    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareCard, setShowShareCard] = useState(false)
    const [showRatingPopup, setShowRatingPopup] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [userReview, setUserReview] = useState("")
    const [submittingRating, setSubmittingRating] = useState(false)

    const [movie, setMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingToWatchlist, setAddingToWatchlist] = useState(false)
    const [watchlistSuccess, setWatchlistSuccess] = useState(false)
    const [watchlistError, setWatchlistError] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(false);
    const [ratingSuccessMessage, setRatingSuccessMessage] = useState("");


    const toggleOverview = () => setIsExpanded(!isExpanded);

    const truncateOverview = (text: string, maxLength: number = 80) => {
        if (!text) return "";
        if (isExpanded || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

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

    // Move fetchMovieDetails outside useEffect so it can be reused
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
                // Set the favorite status based on the liked field from API
                setIsFavorite(responseData.data.liked === 1)
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

    useEffect(() => {
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
            setWatchlistSuccess(true)
            setTimeout(() => {
                setWatchlistSuccess(false);
                router.push("/watch-list");
            }, 1000);

            // Update the movie state to reflect the new watchlist status
            setMovie((prevMovie) => {
                if (!prevMovie) return prevMovie

                const newWatchlistEntry: WatchlistData = {
                    watch_id: data.watch_id || 0, // Use the returned watch_id from API
                    user_id: Number.parseInt(userId),
                    movie_id: Number.parseInt(prevMovie.movie_id || movie_id || "0"),
                    friend_id: movie?.watchlist_data?.[0]?.friend_id ?? 0,
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
            setWatchlistSuccess(true)
            setTimeout(() => {
                setWatchlistSuccess(false);
                router.push("/watch-list");
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

    // New function to handle marking watchroom movie as watched
    const handleMarkAsWatchedRoom = async () => {
        if (!userId) {
            setWatchlistError("Please login to mark as watched")
            return
        }

        if (!watromovId) {
            setWatchlistError("Movie ID not found")
            return
        }

        try {
            setAddingToWatchlist(true)
            setWatchlistError(null)

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchedmovieroom&watromov_id=${watromovId}`, {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error(`Failed with status ${response.status}`)
            }

            const data = await response.json()

            // Check for successful response
            if (data.status === "Room Members Watched Movie") {
                setWatchlistSuccess(true)
                setTimeout(() => {
                    setWatchlistSuccess(false);
                    router.back();
                }, 1000);
            } else {
                throw new Error(data.message || "Failed to mark as watched")
            }

        } catch (err) {
            console.error("Error marking watchroom movie as watched:", err)
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to mark as watched"
                    : "Failed to mark as watched",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }

    const handleRatingSubmit = async () => {
        if (!userId) {
            setWatchlistError("Please login to rate this movie")
            return
        }

        if (userRating === 0) {
            setWatchlistError("Please select a rating")
            return
        }

        try {
            setSubmittingRating(true)
            setWatchlistError(null)

            const requestBody = {
                gofor: "movierating",
                movie_id: parseInt(movie?.movie_id || movie_id || "0"),
                user_id: parseInt(userId),
                rating: userRating,
                review: userReview.trim()
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

            // Check for specific success message
            if (data.response === "Movie Rated Successfully") {
                setRatingSuccessMessage("Your rating was submitted successfully!");
            } else {
                setWatchlistSuccess(true);
                setTimeout(() => setWatchlistSuccess(false), 2000);
            }


            // Close the rating popup and reset form
            setShowRatingPopup(false)
            setUserRating(0)
            setUserReview("")
            setHoverRating(0)
            setTimeout(() => {
                setRatingSuccessMessage("");
            }, 2000);

            fetchMovieDetails()

        } catch (err) {
            console.error("Error submitting rating:", err)
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to submit rating"
                    : "Failed to submit rating",
            )
        } finally {
            setSubmittingRating(false)
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
                    <button className="p-2 " onClick={() => router.back()}>
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
        overview = "",
        rating,
        is_adult = "",
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

    // Format release year and country with rating
    const releaseYear = release_date ? new Date(release_date).getFullYear() : "";
    const formattedRuntime = runtime || "";
    const audience = is_adult === "1" ? "A" : "GA";
    const ratingText = rating ? (
        <><span className="inline-flex items-center gap-2">
            <span style={{ color: 'gold' }}>★</span> {rating}
        </span>
            {movie?.rated === 1 ? (
                <button
                    className="text-xs border border-primary text-white  px-2 py-0.5 rounded ml-4 cursor-default"
                    disabled
                >
                    Rated
                </button>
            ) : (
                <button
                    className="text-xs border border-primary text-white px-2 py-0.5 rounded ml-4"
                    onClick={() => setShowRatingPopup(true)}
                >
                    Rate Now
                </button>
            )}
        </>
    ) : "";


    const releaseInfo = [
        releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : "",
        audience,
        ratingText,
        formattedRuntime
    ].filter(Boolean);


    // Determine what action button to show based on MovieType and watchlist status
    const getActionButton = () => {
        // If MovieType is watchroom, show watchroom-specific button
        if (MovieType === "watchroomwatched") {
            return {
                text: "Watched",
                action: undefined,
                className: "bg-[#292938] cursor-default",
            };
        }

        if (MovieType === "watchroom") {
            return {
                text: "Mark as watched",
                action: handleMarkAsWatchedRoom,
                className: "bg-[#292938]",
            };
        }


        // Original logic for non-watchroom types
        if (!userId) {
            return {
                text: "Add to watchlist",
                action: handleAddToWatchlist,
                className: "bg-[#292938]",
            }
        }

        switch (watchlist_status) {
            case "planned":
                return {
                    text: "Mark as watched",
                    action: handleMarkAsWatched,
                    className: "bg-[#292938]",
                }
            default:
                return {
                    text: "Add to watchlist",
                    action: handleAddToWatchlist,
                    className: "bg-[#292938]",
                }
        }
    }

    const handleDeleteMovie = async () => {
        if (MovieType === "watchroom" || MovieType === "watchroomwatched") {
            if (!watromovId) {
                setWatchlistError("Watchroom movie ID not found");
                return;
            }

            try {
                setAddingToWatchlist(true);
                setWatchlistError(null);

                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletewatroommov&watromov_id=${watromovId}`);
                const result = await response.json();

                if (result.response === "Movie removed from Watchroom") {
                    setWatchlistSuccess(true);
                    setTimeout(() => {
                        setWatchlistSuccess(false);
                        router.back();
                    }, 1000);
                } else {
                    setWatchlistError(result.message || "Failed to delete watchroom movie");
                }
            } catch (error) {
                console.error("Error deleting watchroom movie:", error);
                setWatchlistError("Network error: Failed to delete watchroom movie");
            } finally {
                setAddingToWatchlist(false);
            }
        } else {
            const userWatchlistEntry = movie?.watchlist_data?.find(
                (entry) => entry.user_id.toString() === userId.toString()
            );

            if (userWatchlistEntry) {
                handleRemoveFromWatchlist(userWatchlistEntry.watch_id);
            } else {
                setWatchlistError("Movie not found in your watchlist");
            }
        }
    };

    const handleRemoveFromWatchlist = async (watchId: any) => {
        try {
            setAddingToWatchlist(true);
            setWatchlistError(null);

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletewatmov&watch_id=${watchId}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.response === "Movie removed from watchlist") {
                setWatchlistSuccess(true);
                setTimeout(() => {
                    setWatchlistSuccess(false);
                    router.back();
                }, 1000);
            } else {
                setWatchlistError(data.message || "Failed to remove from watchlist");
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            setWatchlistError("Network error: Failed to remove from watchlist");
        } finally {
            setAddingToWatchlist(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (addingToWatchlist) return;

        setAddingToWatchlist(true);

        try {
            const res = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "watmovlike",
                    user_id: userId,
                    movie_id: movie.movie_id,
                }),
            });

            const data = await res.json();

            if (data.liked !== undefined) {
                setIsFavorite(data.liked);
                setMovie(prev => prev ? { ...prev, liked: data.liked ? 1 : 0 } : prev);
                fetchMovieDetails();
            } else {
                console.error("API Error:", data.message || "Failed to update favorite.");
            }
        } catch (error) {
            console.error("Network Error:", error);
        } finally {
            setAddingToWatchlist(false);
        }
    };


    // Helper to count how many users added this movie to their watchlist in the last week
    function getWatchlistCountLastWeek(watchlist_data?: WatchlistData[]): number {
        if (!Array.isArray(watchlist_data)) return 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return watchlist_data.filter(entry => {
            const created = new Date(entry.created_date);
            return created >= oneWeekAgo;
        }).length;
    }

    const actionButton = getActionButton()

    return (

        // <PageTransitionWrapper>
            <div className="flex flex-col h-screen fixed inset-0 overflow-y-auto mb-16">
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
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#181826] to-transparent"></div>
                        </div>
                    )}

                    {/* Header content */}
                    <div className="relative z-10 px-4 flex items-center justify-between">
                        {/* Back Button */}
                        <button
                            className="p-2 rounded-full bg-[#292938]"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {/* Title (optional) */}
                        {/* <h1 className="text-xl font-semibold">Title</h1> */}

                        {/* Share Button */}
                        <button
                            className="p-2 rounded-full hover:bg-black/10 transition"
                            onClick={() => setShowShareCard(true)}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
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
                    <p className="text-sm text-gray-400 text-center mb-2">
                        {releaseInfo.map((info, i) => (
                            <span key={i}>
                                {i > 0 && " | "}
                                {info}
                            </span>
                        ))}
                    </p>

                    {overview && (
                        <p className="text-sm text-gray-300 text-center mb-2 px-4 leading-tight max-w-sm">
                            {truncateOverview(overview)}{" "}
                            {overview.length > 80 && (
                                <span
                                    onClick={toggleOverview}
                                    className="text-primary cursor-pointer hover:underline"
                                >
                                    {isExpanded ? "less" : "more"}
                                </span>
                            )}
                        </p>
                    )}


                    {/* Genre tags */}
                    <div className="flex flex-wrap justify-center gap-2 ">
                        {genresArray.map((genre, index) => (
                            <span key={index} className="px-3 py-1 text-sm bg-gray-800 rounded-full">
                                {genre}
                            </span>
                        ))}
                    </div>

                    {/* Watchlist statistics - Only show for non-watchroom types */}
                    {MovieType !== "watchroom" && actionButton.text === "Add to watchlist" && (
                        <div className="flex space-x-2 text-sm text-gray-400 mt-4 mb-4">
                            <div className="bg-gray-800/50 px-3 py-1 rounded-full flex items-center space-x-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span>{getWatchlistCountLastWeek(movie?.watchlist_data)} Watchlisted last week</span>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="fixed bottom-0 left-0 bg-[#181826] right-0 px-4 py-2 z-50 backdrop-blur-sm ">
                        <div className="relative flex justify-center items-center w-full">
                            {/* Favorite Button - Positioned left if visible */}
                            {MovieType !== "watchroom" && MovieType !== "watchroomwatched" && (
                                <div className="absolute left-0">
                                    <button
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                            isFavorite
                                                ? "bg-gradient-to-br from-green-500/60 to-green-700/60 backdrop-blur-md border border-white/20 shadow-lg"
                                                : "bg-[#292938]"
                                        )}
                                        onClick={handleToggleFavorite}
                                        disabled={addingToWatchlist}
                                    >
                                        <Heart
                                            className={cn(
                                                "w-5 h-5",
                                                isFavorite ? "fill-green-500 text-green-500" : "text-white"
                                            )}
                                        />
                                    </button>
                                </div>
                            )}


                            {/* Centered Action Button */}
                            {actionButton && (
                                <button
                                    className={cn(
                                        "px-6 py-3 rounded-full text-lg text-primary font-semibold",
                                        actionButton.className,
                                        addingToWatchlist && "opacity-70"
                                    )}
                                    onClick={actionButton.action}
                                    disabled={!!addingToWatchlist}
                                >
                                    {addingToWatchlist ? "Processing..." : actionButton.text}
                                </button>
                            )}


                            {/* Delete Button - Positioned right */}
                            <div className="absolute right-0">
                                <button
                                    className="w-12 h-12 rounded-full bg-[#292938] flex items-center justify-center"
                                    onClick={handleDeleteMovie}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Review Section */}
                    <ReviewSection viewer_id={parseInt(userId)} movie_id={parseInt(movie_id || "")} />

                    {/* You Might Also Like Section */}
                    <YouMightAlsoLike movie_id={parseInt(movie_id || "")} user_id={parseInt(userId)} />
                </div>

                {ratingSuccessMessage && (
                    <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                        <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                            {ratingSuccessMessage}
                        </div>
                    </div>
                )}

                {watchlistSuccess && (
                    <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                        <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                            {MovieType === "watchroom"
                                ? "Marked as watched room movie successfully"
                                : watchlist_status === "watched"
                                    ? "Marked as watched successfully"
                                    : "Added to watchlist successfully"}
                        </div>
                    </div>
                )}

                {watchlistError && (
                    <div className="fixed top-16 left-0 right-0 flex justify-center z-50">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">{watchlistError}</div>
                    </div>
                )}

                {/* Rating Popup */}
                {showRatingPopup && (
                    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-700">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Rate & Review</h3>
                                <button
                                    onClick={() => {
                                        setShowRatingPopup(false)
                                        setUserRating(0)
                                        setUserReview("")
                                        setHoverRating(0)
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Movie Title */}
                            <p className="text-gray-300 text-center mb-4">{title}</p>

                            {/* Star Slider Rating */}
                            <div className="flex flex-col items-center mb-6 px-2">
                                <div className="w-full relative">
                                    {/* Range Slider with custom star thumb */}
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={userRating}
                                        onChange={(e) => setUserRating(Number(e.target.value))}
                                        className="w-full appearance-none custom-star-thumb"
                                        style={{
                                            '--slider-value': `${(userRating / 10) * 100}%`,
                                        } as React.CSSProperties & Record<string, any>}
                                    />

                                </div>

                                {/* Rating Display */}
                                <div className="flex justify-between w-full mt-3 text-sm">
                                    <span className="text-gray-400 italic">Slide to rate →</span>
                                    <span className="text-white font-semibold">{userRating}/10</span>
                                </div>

                                {/* Description */}
                                <p className="mt-4 text-center text-2xl text-white font-[Pacifico]">
                                    Your ratings matter!
                                </p>
                                <p className="text-xs text-gray-400 text-center mt-1">
                                    They help others decide what to watch next.
                                </p>

                            </div>


                            {/* Review Textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Review (Optional)
                                </label>
                                <textarea
                                    value={userReview}
                                    onChange={(e) => setUserReview(e.target.value)}
                                    placeholder="Share your thoughts about this movie..."
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-400 mt-1">{userReview.length}/500 characters</p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRatingPopup(false)
                                        setUserRating(0)
                                        setUserReview("")
                                        setHoverRating(0)
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                                    disabled={submittingRating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRatingSubmit}
                                    disabled={submittingRating || userRating === 0}
                                    className={cn(
                                        "flex-1 px-4 py-2 rounded-md font-semibold transition-colors",
                                        userRating === 0
                                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                            : "bg-primary text-white hover:bg-blue-700",
                                        submittingRating && "opacity-70"
                                    )}
                                >
                                    {submittingRating ? "Submitting..." : "Submit "}
                                </button>
                            </div>
                        </div>
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
        // </PageTransitionWrapper>

    )
}