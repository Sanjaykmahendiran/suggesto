"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Star, Play, Heart, Share2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import MovieShareCard from "@/components/moviesharecard"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from 'js-cookie'

export default function MovieDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const movie_id = searchParams.get('movie_id');
    const tmdb_movie_id = searchParams.get('tmdb_movie_id');
    const userId = Cookies.get('userID') || '';

    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareCard, setShowShareCard] = useState(false);
    type Movie = {
        movie_id?: string;
        tmdb_movie_id?: string;
        title?: string;
        poster_path?: string;
        backdrop_path?: string;
        genres?: string[];
        rating?: number | string;
        release_date?: string;
        language?: string;
        overview?: string;
        watchlist_status?: string;
        otts?: { name: string; logo?: string }[];
        // Add other fields as needed
    };
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToWatchlist, setAddingToWatchlist] = useState(false);
    const [watchlistSuccess, setWatchlistSuccess] = useState(false);
    const [watchlistError, setWatchlistError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!movie_id && !tmdb_movie_id) {
                    throw new Error('No movie ID provided');
                }
                
                // Create the request body with the required parameters
                const requestBody: any = {
                    gofor: 'moviedetail'
                };
                
                // Add either movie_id or tmdb_movie_id
                if (movie_id) {
                    requestBody.movie_id = movie_id;
                } else if (tmdb_movie_id) {
                    requestBody.tmdb_movie_id = tmdb_movie_id;
                }
                
                // Add user_id if available to get personalized watchlist status
                if (userId) {
                    requestBody.user_id = userId;
                }
                
                const response = await fetch('https://suggesto.xyz/App/api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                
                const responseData = await response.json();
                
                // Check if the response has the expected structure
                if (responseData.status === "success" && responseData.data) {
                    setMovie(responseData.data);
                } else {
                    throw new Error('Invalid response format from API');
                }
            } catch (err) {
                console.error('Error fetching movie details:', err);
                setError(
                    typeof err === "object" && err !== null && "message" in err
                        ? (err as { message?: string }).message || 'Failed to load movie details'
                        : 'Failed to load movie details'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movie_id, tmdb_movie_id, userId]);

    const handleAddToWatchlist = async () => {
        if (!userId) {
            setWatchlistError('Please login to add to watchlist');
            return;
        }

        try {
            setAddingToWatchlist(true);
            setWatchlistError(null);
            
            // Create the request body with the required parameters
            const requestBody = {
                gofor: 'addwatchlist',
                user_id: userId,
                movie_id: movie?.movie_id || movie_id,
                friend_id: '0'
            };
            
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed with status ${response.status}`);
            }
            
            const data = await response.json();
            setWatchlistSuccess(true);
            
            // Update the movie state to reflect the new watchlist status
            setMovie(prevMovie => ({
                ...prevMovie,
                watchlist_status: 'planned'
            }));
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setWatchlistSuccess(false);
            }, 3000);
            
        } catch (err) {
            console.error('Error adding to watchlist:', err);
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || 'Failed to add to watchlist'
                    : 'Failed to add to watchlist'
            );
        } finally {
            setAddingToWatchlist(false);
        }
    };
    
    const handleMarkAsWatched = async () => {
        if (!userId) {
            setWatchlistError('Please login to mark as watched');
            return;
        }

        try {
            setAddingToWatchlist(true);
            setWatchlistError(null);
            
            // Create the request body with the required parameters
            const requestBody = {
                gofor: 'watchedmovie',
                watch_id: movie?.movie_id || movie_id
            };
            
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed with status ${response.status}`);
            }
            
            const data = await response.json();
            setWatchlistSuccess(true);
            
            // Update the movie state to reflect the new watchlist status
            setMovie(prevMovie => ({
                ...prevMovie,
                watchlist_status: 'watched'
            }));
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setWatchlistSuccess(false);
            }, 3000);
            
        } catch (err) {
            console.error('Error marking as watched:', err);
            setWatchlistError(
                typeof err === "object" && err !== null && "message" in err
                    ? (err as { message?: string }).message || 'Failed to mark as watched'
                    : 'Failed to mark as watched'
            );
        } finally {
            setAddingToWatchlist(false);
        }
    };

    // Show loading skeletons while fetching data
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#181826] text-white">
                <div className="relative h-80">
                    <Skeleton className="h-80 w-full bg-gray-800" />
                    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
                        <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold">Detail</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>
                
                <div className="relative -mt-20 px-4">
                    <div className="flex gap-4">
                        <Skeleton className="w-28 h-40 rounded-lg bg-gray-800" />
                        <div className="flex-1">
                            <Skeleton className="h-7 w-36 bg-gray-800 mb-2" />
                            <Skeleton className="h-4 w-48 bg-gray-800 mb-2" />
                            <Skeleton className="h-4 w-24 bg-gray-800 mb-2" />
                            <Skeleton className="h-4 w-40 bg-gray-800 mb-2" />
                            <Skeleton className="h-8 w-32 bg-gray-800 mt-2 rounded-full" />
                        </div>
                    </div>
                </div>
                
                <div className="px-4 py-4">
                    <Skeleton className="h-5 w-32 bg-gray-800 mb-3" />
                    <Skeleton className="h-20 w-full bg-gray-800 mb-6" />
                    <Skeleton className="h-5 w-40 bg-gray-800 mb-3" />
                    <div className="flex gap-6">
                        <Skeleton className="w-12 h-16 bg-gray-800 rounded" />
                        <Skeleton className="w-12 h-16 bg-gray-800 rounded" />
                        <Skeleton className="w-12 h-16 bg-gray-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-[#181826] text-white">
                <div className="p-4">
                    <button className="mr-4 p-2 rounded-full bg-[#292938] mb-4" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                    <div className="bg-red-900/30 p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-semibold mb-2">Error Loading Movie</h2>
                        <p className="text-gray-300">{error}</p>
                        <Button 
                            className="mt-4 bg-[#6c5ce7]"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return null; // Prevent rendering with missing data
    }

    // Destructure movie data for easier access with fallbacks
    const {
        title = 'Unknown Title',
        poster_path,
        backdrop_path,
        genres = [],
        rating = 0,
        release_date,
        language = 'Unknown',
        overview = 'No synopsis available',
        watchlist_status,
        otts = []
    } = movie || {};

    // Format genres as a comma-separated string
    const genresString = Array.isArray(genres) && genres.length > 0 
        ? genres.filter(genre => genre && genre !== "").join(', ') 
        : 'Unknown Genre';

    // Default poster and backdrop if not available
    const posterUrl = poster_path 
        ? poster_path.startsWith('http') 
            ? poster_path 
            : `https://image.tmdb.org/t/p/w342${poster_path}`
        : '/placeholder-poster.jpg';
        
    const backdropUrl = backdrop_path
        ? backdrop_path.startsWith('http') 
            ? backdrop_path 
            : `https://image.tmdb.org/t/p/w1280${backdrop_path}`
        : '/placeholder-backdrop.jpg';
        
    // Determine what action button to show based on watchlist status
    const getActionButton = () => {
        if (!userId) {
            return {
                text: "Add to watchlist",
                action: handleAddToWatchlist
            };
        }
        
        switch (watchlist_status) {
            case "planned":
                return {
                    text: "Mark as watched",
                    action: handleMarkAsWatched
                };
            case "watched":
                return {
                    text: "Added to watched",
                    action: () => {},
                    disabled: true
                };
            default:
                return {
                    text: "Add to watchlist",
                    action: handleAddToWatchlist
                };
        }
    };
    
    const actionButton = getActionButton();

    return (
        <div className="flex flex-col min-h-screen bg-[#181826] text-white">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header with background image */}
                <div className="relative h-80">
                    {backdropUrl.startsWith('http') ? (
                        <img
                            src={backdropUrl}
                            alt={`${title} backdrop`}
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#181826]/60 to-[#181826]" />

                    {/* Header navigation */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 ">
                        <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold">Detail</h1>
                        <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Movie info card */}
                <div className="relative -mt-20 px-4">
                    <div className="flex gap-4">
                        {/* Movie poster */}
                        <div className="relative w-28 h-40 rounded-lg overflow-hidden flex-shrink-0">
                            {release_date && new Date(release_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-xs px-2 py-0.5 rounded-full">NEW</div>
                            )}
                            <img src={posterUrl} alt={`${title} poster`} className="w-full h-full object-cover" />
                        </div>

                        {/* Movie details */}
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h2 className="text-2xl font-bold">{title}</h2>
                                <p className="text-sm text-gray-300">{genresString}</p>

                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="ml-1 text-sm">{rating ? parseFloat(String(rating)).toFixed(1) : '0.0'}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                                    <span>{language?.toUpperCase() || 'Unknown'}</span>
                                    {release_date && (
                                        <>
                                            <span>•</span>
                                            <span>{new Date(release_date).getFullYear()}</span>
                                        </>
                                    )}
                                    {otts && otts.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                Available on: {otts.map(ott => ott.name).join(', ')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Favorite button */}
                        <button className="absolute top-2 right-4" onClick={() => setIsFavorite(!isFavorite)}>
                            <Heart className={cn("w-6 h-6", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="px-4 py-4">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {overview || "No synopsis available for this movie."}
                            </p>
                        </div>

                        {/* OTT Platforms */}
                        {otts && otts.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Available On</h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {otts.map((ott, index) => (
                                        <div key={index} className="flex flex-col items-center min-w-[4rem]">
                                            <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden mb-1 flex items-center justify-center">
                                                {ott.logo ? (
                                                    <img 
                                                        src={ott.logo}
                                                        alt={ott.name}
                                                        className="w-10 h-10 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-center">{ott.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-center">{ott.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Watchlist status messages */}
            {watchlistSuccess && (
                <div className="fixed top-16 left-0 right-0 flex justify-center">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                        Added to watchlist successfully
                    </div>
                </div>
            )}
            
            {watchlistError && (
                <div className="fixed top-16 left-0 right-0 flex justify-center">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
                        {watchlistError}
                    </div>
                </div>
            )}

            {/* Bottom action buttons */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-[#181826]/90 backdrop-blur-sm">
                <div className="flex gap-6">
                    <button className="flex flex-col items-center" onClick={() => setShowShareCard(true)}>
                        <Share2 className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <Button
                    className={cn(
                        "bg-[#6c5ce7] text-white rounded-full px-6 py-2.5 font-medium",
                        (addingToWatchlist || actionButton.disabled) && "opacity-70"
                    )}
                    onClick={actionButton.action}
                    disabled={addingToWatchlist || actionButton.disabled}
                >
                    {addingToWatchlist ? "Processing..." : actionButton.text}
                </Button>
            </div>

            {/* Bottom Slide Filter Component */}
            {showShareCard && (
                <div className="fixed inset-0 z-50 backdrop-blur-xs bg-white/5 transition-all duration-300">
                    {/* Full-screen blur layer */}
                    <div className="absolute bottom-0 w-full shadow-xl">
                        <MovieShareCard onClick={() => setShowShareCard(false)} movieTitle={title} />
                    </div>
                </div>
            )}
        </div>
    )
}