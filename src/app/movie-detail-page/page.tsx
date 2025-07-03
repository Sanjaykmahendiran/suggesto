"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowLeft, Share2, Users, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/app/movie-detail-page/_components/moviesharecard"
import Cookies from "js-cookie"
import ReviewSection from "@/app/movie-detail-page/_components/review-section"
import { YouMightAlsoLike } from "@/components/you-might-also-like"
import { Movie, WatchlistData } from "@/app/movie-detail-page/type"
import { PageTransitionWrapper } from "@/components/PageTransition"
import Image from "next/image"
import toast from "react-hot-toast"
import RatingPopup from "./_components/ratingpopup"
import CastAndCrew from "./_components/CastAndCrew"
import LoadingSkeleton from "./_components/loadingskeleton"
import MovieBuddiesSection from "./_components/movie-buddies"
import CoinAnimation from "@/components/coin-animation"

export default function MovieDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const MovieType = searchParams.get("type");
    const movie_id = searchParams.get("movie_id")
    const tmdb_movie_id = searchParams.get("tmdb_movie_id")
    const watromovId = searchParams.get("watromov_id")
    const userId = Cookies.get("userID") || ""

    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareCard, setShowShareCard] = useState(false)
    const [showRatingPopup, setShowRatingPopup] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [userReview, setUserReview] = useState("")
    const [submittingRating, setSubmittingRating] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false);
    const [movie, setMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(true)
    const [addingToWatchlist, setAddingToWatchlist] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [walletPosition, setWalletPosition] = useState({ x: 0, y: 0 })
    const [coinsEarned, setCoinsEarned] = useState(0)

    const triggerCoinAnimation = (buttonElement: HTMLElement, coinsEarned = 5) => {
        const buttonRect = buttonElement.getBoundingClientRect();

        // Use the button's center position as the starting point
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;

        // Set wallet position (adjust these coordinates based on where your wallet icon is)
        const walletX = window.innerWidth - 50; // Assuming wallet is top-right
        const walletY = 50;

        setWalletPosition({ x: walletX, y: walletY });
        setCoinsEarned(coinsEarned);
        setShowCoinAnimation(true);

        // Hide animation after 3 seconds
        setTimeout(() => {
            setShowCoinAnimation(false);
        }, 3000);
    };

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

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
            toast.error(
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

    const handleAddToWatchlist = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!userId) {
            toast.error("Please login to add to watchlist")
            return
        }

        // Store the button element reference before async operations
        const buttonElement = event.currentTarget;

        try {
            setAddingToWatchlist(true)

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

            // Check if response indicates success and trigger coin animation
            if (data.response === "Added to Watch List!") {
                // Use coins_earned from API response, fallback to 5 if not provided
                const coinsEarned = data.coins_earned || 5;
                triggerCoinAnimation(buttonElement, coinsEarned);
            }

            toast.success("Added to watchlist successfully")
            setTimeout(() => {
                router.push("/watch-list");
            }, 5000);

            // Update the movie state to reflect the new watchlist status
            setMovie((prevMovie) => {
                if (!prevMovie) return prevMovie

                const newWatchlistEntry: WatchlistData = {
                    watch_id: data.watch_id || 0, // Use the returned watch_id from API
                    user_id: Number.parseInt(userId),
                    movie_id: Number.parseInt(String(prevMovie.movie_id || movie_id || "0")),
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
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to add to watchlist"
                    : "Failed to add to watchlist",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }


    const handleUpdateWatchlist = async () => {
        if (!userId) {
            toast.error("Please login to update watchlist");
            return;
        }

        try {
            setAddingToWatchlist(true);

            // Find the user's watchlist entry to get the watch_id
            const userWatchlistEntry = movie?.watchlist_data?.find(
                (entry) => entry.user_id.toString() === userId.toString()
            );

            if (!userWatchlistEntry) {
                toast.error("Movie not found in your watchlist");
                return;
            }

            // Build URL with query parameters
            const queryParams = new URLSearchParams({
                gofor: "updatewatchlist",
                watch_id: userWatchlistEntry.watch_id.toString(),
            });

            const url = `https://suggesto.xyz/App/api.php?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" || data.response === "Watchroom Updated!") {
                toast.success("Added to watchlist again successfully");
                setTimeout(() => {
                    router.push("/watch-list");
                }, 1000);

                // Update the movie state to reflect the new watchlist status
                setMovie((prevMovie) => {
                    if (!prevMovie || !prevMovie.watchlist_data) return prevMovie;

                    const updatedWatchlistData = prevMovie.watchlist_data.map((entry) =>
                        entry.user_id.toString() === userId.toString()
                            ? { ...entry, status: "planned" }
                            : entry
                    );

                    return {
                        ...prevMovie,
                        watchlist_data: updatedWatchlistData,
                    };
                });
            } else {
                throw new Error(data.message || "Failed to update watchlist");
            }

        } catch (err) {
            console.error("Error updating watchlist:", err);
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to update watchlist"
                    : "Failed to update watchlist"
            );
        } finally {
            setAddingToWatchlist(false);
        }
    };



    const handleMarkAsWatched = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!userId) {
            toast.error("Please login to mark as watched")
            return
        }

        // Store the button element reference before async operations
        const buttonElement = event.currentTarget;

        try {
            setAddingToWatchlist(true)

            const userWatchlistEntry = movie?.watchlist_data?.find((entry) => entry.user_id.toString() === userId.toString())

            if (!userWatchlistEntry) {
                throw new Error("Movie not found in your watchlist")
            }

            const requestBody = {
                gofor: "watchedmovie",
                watch_id: userWatchlistEntry.watch_id.toString(),
                user_id: userId,
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

            if (data.status === "Movie Watched") {
                // Trigger coin animation after successful API call
                const coinsEarned = data.coins_earned || 10;
                triggerCoinAnimation(buttonElement, coinsEarned);

                toast.success("Marked as watched successfully")
                setTimeout(() => {
                    router.back();
                }, 3000);
            }

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
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to mark as watched"
                    : "Failed to mark as watched",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }

    // New function to handle marking watchroom movie as watched
    const handleMarkAsWatchedRoom = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!userId) {
            toast.error("Please login to mark as watched")
            return
        }

        if (!watromovId) {
            toast.error("Movie ID not found")
            return
        }

        // Store the button element reference before async operations
        const buttonElement = event.currentTarget;

        try {
            setAddingToWatchlist(true)
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchedmovieroom&watromov_id=${watromovId}&user_id=${userId}`, {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error(`Failed with status ${response.status}`)
            }

            const data = await response.json()

            if (data.status === "Room Members Watched Movie") {
                // Trigger coin animation after successful API call
                const coinsEarned = data.coins_earned || 15; // Default to 15 for room movies
                triggerCoinAnimation(buttonElement, coinsEarned);

                toast.success("Marked as watched room movie successfully")
                setTimeout(() => {
                    router.back();
                }, 5000);
            } else {
                throw new Error(data.message || "Failed to mark as watched")
            }

        } catch (err) {
            console.error("Error marking watchroom movie as watched:", err)
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to mark as watched"
                    : "Failed to mark as watched",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }

    const handleRatingSubmit = async (buttonElement?: HTMLElement) => {
        if (!userId) {
            toast.error("Please login to rate this movie")
            return
        }

        if (userRating === 0) {
            toast.error("Please select a rating")
            return
        }

        try {
            setSubmittingRating(true)
            const requestBody = {
                gofor: "movierating",
                movie_id: parseInt(String(movie?.movie_id || movie_id || "0")),
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
                // Trigger coin animation if button element is provided and coins earned
                if (buttonElement && data.coins_earned) {
                    triggerCoinAnimation(buttonElement, data.coins_earned);
                }

                toast.success("Your rating was submitted successfully!");
            } else {
                toast.error("Failed to submit rating");
            }

            // Close the rating popup and reset form
            setShowRatingPopup(false)
            setUserRating(0)
            setUserReview("")
            setHoverRating(0)

            fetchMovieDetails()

        } catch (err) {
            console.error("Error submitting rating:", err)
            toast.error(
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
            <LoadingSkeleton />
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
    ].filter(Boolean);

    const videoreleaseInfo = [
        releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : "",
        audience,
    ].filter(Boolean);


    // Determine what action button to show based on MovieType and watchlist status
    const getActionButton = () => {
        // If MovieType is watchroom, show watchroom-specific button
        if (MovieType === "watchroomwatched") {
            return {
                text: "Watched",
                action: undefined,
                className: "bg-[#2b2b2b] cursor-default",
            };
        }

        if (MovieType === "watchroom") {
            return {
                text: "Mark as watched",
                action: handleMarkAsWatchedRoom,
                className: "bg-[#2b2b2b]",
            };
        }


        // Original logic for non-watchroom types
        if (!userId) {
            return {
                text: "Add to watchlist",
                action: handleAddToWatchlist,
                className: "bg-[#2b2b2b]",
            }
        }

        switch (watchlist_status) {
            case "planned":
                return {
                    text: "Mark as watched",
                    action: handleMarkAsWatched,
                    className: "bg-[#2b2b2b]",
                }
            case "watched":
                return {
                    text: "Add to watchlist Again",
                    action: handleUpdateWatchlist,
                    className: "bg-[#2b2b2b]",
                }
            default:
                return {
                    text: "Add to watchlist",
                    action: handleAddToWatchlist,
                    className: "bg-[#2b2b2b]",
                }
        }
    }

    const handleDeleteMovie = async () => {
        if (MovieType === "watchroom" || MovieType === "watchroomwatched") {
            if (!watromovId) {
                toast.error("Watchroom movie ID not found");
                return;
            }

            try {
                setAddingToWatchlist(true);
                ;

                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletewatroommov&watromov_id=${watromovId}`);
                const result = await response.json();

                if (result.response === "Movie removed from Watchroom") {
                    toast.success("Movie removed from Watchroom")
                    setTimeout(() => {
                        router.back();
                    }, 3000);
                } else {
                    toast.error(result.message || "Failed to delete watchroom movie");
                }
            } catch (error) {
                console.error("Error deleting watchroom movie:", error);
                toast.error("Network error: Failed to delete watchroom movie");
            } finally {
                setAddingToWatchlist(false);
            }
        } else {
            const userWatchlistEntry = movie?.watchlist_data?.find(
                (entry) => entry.user_id.toString() === userId.toString()
            );

            if (userWatchlistEntry) {
                handleDeleteFromWatchlist(userWatchlistEntry.watch_id);
            } else {
                toast.error("Movie not found in your watchlist");
            }
        }
    };

    const handleDeleteFromWatchlist = async (watchId: any) => {
        try {
            setAddingToWatchlist(true);
            ;

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletewatmov&watch_id=${watchId}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.response === "Movie removed from Watchlist") {
                toast.success("Movie removed from watchlist")
                setTimeout(() => {
                    router.back();
                }, 1000);
            } else {
                toast.error(data.message || "Failed to remove from watchlist");
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            toast.error("Network error: Failed to remove from watchlist");
        } finally {
            setAddingToWatchlist(false);
        }
    };

    const handleToggleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (addingToWatchlist) return;

        // Store the button element reference before async operations
        const buttonElement = event.currentTarget;

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
                // Check if the response indicates success and trigger coin animation
                if (data.response === "Liked Successfully" && data.coins_earned) {
                    triggerCoinAnimation(buttonElement, data.coins_earned);
                }

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

    const handleAlreadySeen = async () => {
        if (!userId) {
            toast.error("Please login to mark as already seen")
            return
        }

        try {
            setAddingToWatchlist(true)


            const requestBody = {
                gofor: "alreadywatched",
                user_id: userId,
                movie_id: parseInt(String(movie?.movie_id ?? movie_id ?? "0"))
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

            // Show success and navigate back
            toast.success("Marked as already seen successfully")
            setTimeout(() => {
                router.back()
            }, 1000)

        } catch (err) {
            console.error("Error marking as already seen:", err)
            toast.error(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || "Failed to mark as already seen"
                    : "Failed to mark as already seen",
            )
        } finally {
            setAddingToWatchlist(false)
        }
    }


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

    const extractYouTubeVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url?.match(regex);
        return match ? match[1] : null;
    };

    return (

        // <PageTransitionWrapper>
        <div className="flex flex-col min-h-screen overflow-y-auto ">
            {/* Header with backdrop */}
            <div className="relative pt-8">
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
                <div className="relative z-10 px-4 flex items-center justify-between">
                    {/* Back Button */}
                    <button
                        className="p-2 rounded-full bg-[#2b2b2b]"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Delete Button - Positioned right */}
                    <div className="absolute right-2">
                        <button
                            className="p-2 rounded-full bg-[#2b2b2b] flex items-center justify-center"
                            onClick={() => setShowShareCard(true)}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Movie poster section */}
                <div className="relative z-10 px-4 pb-4">
                    <div className="relative w-[80%] aspect-[2/3] max-w-sm mx-auto mb-4 rounded-lg overflow-hidden shadow-2xl">
                        <img
                            src={posterUrl || "/placeholder.svg"}
                            alt={`${title} poster`}
                            className="w-full h-full object-cover"
                        />
                        {/* Play button overlay - only show if video exists */}
                        {movie.video && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <button
                                    onClick={() => setShowVideo(true)}
                                    className="w-12 h-12 bg-white/70 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                                >
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
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
                        <div
                            className="absolute inset-0 z-10"
                            onClick={() => setShowVideo(false)}
                        />

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
                                            src={ott.logo_url}
                                            alt={ott.name}
                                            fill
                                            className="object-contain rounded"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-300">{ott.name}</span>
                                </div>
                            ))}
                            {movie.available_on_ott.length > 3 && (
                                <span className="text-xs text-gray-400">
                                    +{movie.available_on_ott.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}


                <div className="flex items-center justify-center w-full ">
                    {/* Watchlist statistics - Only show for non-watchroom types */}
                    {MovieType !== "watchroom" && actionButton.text === "Add to watchlist" && (
                        <div className="flex space-x-2 text-sm text-gray-400 mt-4 mb-4">
                            <div className="bg-[#2b2b2b] px-3 py-1 rounded-full flex items-center space-x-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span>{getWatchlistCountLastWeek(movie?.watchlist_data)} Watchlisted last week</span>
                            </div>
                        </div>
                    )}
                    {actionButton.text === "Add to watchlist" && (
                        <Button
                            variant="link"
                            onClick={handleAlreadySeen}
                            disabled={addingToWatchlist}
                        >
                            <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                {addingToWatchlist ? "Processing..." : "Already Seen"}</span>
                        </Button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
                    <div className="relative flex items-center justify-center w-full">

                        {/* Delete Button - Left */}

                        <button
                            className="absolute w-12 h-12 left-0 p-2 flex items-center justify-center rounded-full bg-[#2b2b2b]"
                            onClick={() => setShowConfirm(true)}
                        >
                            <Trash2 size={20} />
                        </button>

                        {/* Centered Action Button */}
                        {actionButton && (
                            <button
                                className={cn(
                                    "px-6 py-3 rounded-full text-lg font-semibold",
                                    actionButton.className,
                                    addingToWatchlist && "opacity-70"
                                )}
                                onClick={(e) => actionButton.action && actionButton.action(e)}
                                disabled={!!addingToWatchlist}
                            >
                                <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                    {addingToWatchlist ? "Processing..." : actionButton.text}
                                </span>
                            </button>
                        )}

                        {/* Favorite Button - Right */}
                        {MovieType !== "watchroom" && MovieType !== "watchroomwatched" && (
                            <div className="absolute right-0">
                                <button
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                        isFavorite
                                            ? "bg-gradient-to-br from-green-500/60 to-green-700/60 backdrop-blur-md border border-white/20 shadow-lg"
                                            : "bg-[#2b2b2b]"
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
                    </div>
                </div>


                {/* Cast and Crew Section */}
                <CastAndCrew movieData={movie} actorId={movie.actor_id} />

                <MovieBuddiesSection movies={movie.movie_buddies} />

                {/* Review Section */}
                <ReviewSection viewer_id={parseInt(userId)} movie_id={parseInt(movie_id || "")} />

                {/* You Might Also Like Section */}
                <YouMightAlsoLike movie_id={parseInt(movie_id || "")} user_id={parseInt(userId)} />
            </div>

            {/* Rating Popup */}
            <RatingPopup
                show={showRatingPopup}
                title={title}
                userRating={userRating}
                userReview={userReview}
                hoverRating={hoverRating}
                submittingRating={submittingRating}
                onClose={() => {
                    setShowRatingPopup(false)
                    setUserRating(0)
                    setUserReview("")
                    setHoverRating(0)
                }}
                onRatingChange={(value) => setUserRating(value)}
                onReviewChange={(value) => setUserReview(value)}
                onSubmit={(buttonElement) => handleRatingSubmit(buttonElement)}
                setHoverRating={(value) => setHoverRating(value)}
            />

            {/* Bottom Slide Filter Component */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 transition-all duration-300">
                    {/* Full-screen blur layer */}
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard
                            onClick={() => setShowShareCard(false)}
                            movieTitle={title}
                            ratings={rating}
                            releaseDate={releaseYear ? `${releaseYear} (${language?.toUpperCase() || "Unknown"})` : ""}
                            genresArray={genresArray}
                            movieImage={posterUrl}
                            movieId={parseInt(movie_id || "")}
                        />
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg text-white w-full text-center">
                        <p className="mb-4">Are you sure you want to delete this movie?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-[#2b2b2b] hover:bg-[#2b2b2b] px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteMovie}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />
        </div>
        // </PageTransitionWrapper>

    )
}