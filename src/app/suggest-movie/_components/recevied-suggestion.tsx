"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Calendar,
    ArrowRight,
    Inbox,
    X,
    Check,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import NotFound from "@/components/notfound";
import SuggestNotFound from "@/assets/not-found-suggest.png"
import { RequestCardSkeleton, MovieCardSkeleton } from "@/app/suggest-movie/_components/loading"
import { Movie, SuggestionRequestType } from "@/app/suggest-movie/type"
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from "@/components/coin-animation";

// Movie Card Skeleton Component
const MovieSkeleton = () => (
    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#2b2b2b] animate-pulse">
        <div className="w-full h-full bg-[#2b2b2b]"></div>
        <div className="absolute bottom-0.5 left-0.5 right-0.5">
            <div className="h-3 bg-[#2b2b2b] rounded mb-1"></div>
        </div>
    </div>
);

// Updated Movie interface to match your API response
interface MovieResponse {
    total_count: number;
    data: Movie[];
}

// Suggestion Form Popup Component with Pagination
const SuggestionFormPopup = ({
    selectedRequest,
    onClose,
    userId,
    respondsText,
    requestedGenre
}: {
    selectedRequest: SuggestionRequestType;
    onClose: () => void;
    userId: string | undefined;
    respondsText: string
    requestedGenre: string
}) => {
    const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
    const [responseNote, setResponseNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [movies, setMovies] = useState<Movie[]>([]);
    const [moviesLoading, setMoviesLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const observerRef = useRef<HTMLDivElement>(null);
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [coinsEarned, setCoinsEarned] = useState(0)

    // Fetch movies with pagination
    const fetchMovies = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setMoviesLoading(true);
            }

            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=movieslist&limit=20&offset=${currentOffset}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data: MovieResponse = await response.json();
            const fetchedMovies = data?.data || [];

            // Set total count from API response
            if (data?.total_count !== undefined) {
                setTotalCount(data.total_count);
            }

            if (isLoadMore) {
                setMovies(prev => [...prev, ...fetchedMovies]);
            } else {
                setMovies(fetchedMovies);
            }

            // Check if there are more movies to load
            if (fetchedMovies.length < 20) {
                setHasMore(false);
            }

            if (fetchedMovies.length > 0) {
                setOffset(currentOffset + fetchedMovies.length);
            }

        } catch (error) {
            console.error("Failed to fetch movie list", error);
            toast.error("Failed to load movies");
        } finally {
            setMoviesLoading(false);
            setInitialLoad(false);
        }
    }, []);

    // Load initial movies when popup opens
    useEffect(() => {
        if (selectedRequest) {
            fetchMovies(0, false);
            // Disable body scroll when popup is open
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable body scroll when popup is closed
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is re-enabled
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedRequest, fetchMovies]);

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !moviesLoading && hasMore && !initialLoad && searchQuery === '') {
                    fetchMovies(offset, true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [moviesLoading, hasMore, offset, fetchMovies, initialLoad, searchQuery]);

    const getFilteredMovies = () => {
        if (!searchQuery) return movies;
        return movies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const toggleMovieSelection = (movieId: string) => {
        setSelectedMovies(prev => {
            if (prev.includes(movieId)) {
                return prev.filter(id => id !== movieId);
            } else {
                const maxItems = 5;
                if (prev.length >= maxItems) {
                    toast.error(`You can only select ${maxItems} movie(s).`);
                    return prev;
                }
                return [...prev, movieId];
            }
        });
    };

    const handleSubmit = async () => {
        if (!userId || !selectedRequest || selectedMovies.length === 0) {
            toast.error("Please select at least one movie.");
            return;
        }

        const payload = {
            gofor: "submitSuggestionResponse",
            request_id: selectedRequest.request_id,
            responder_id: Number(userId),
            movie_ids: selectedMovies.map(id => Number(id)),
            response_note: responseNote.trim()
        };

        try {
            setSubmitting(true);
            const res = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data?.status === "success") {
                toast.success("Suggestion submitted successfully!");

                if (data.coins_earned) {
                    setCoinsEarned(data.coins_earned);
                    setShowCoinAnimation(true);

                    // Wait for animation to complete before closing
                    setTimeout(() => {
                        onClose();
                    }, 3000); // Match the animation duration
                } else {
                    // No coins earned, close immediately
                    onClose();
                }
            } else {
                toast.error("An error occurred while submitting.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred while submitting.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMovies = getFilteredMovies();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#1f1f21] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <h2 className="text-sm font-semibold text-white">{respondsText}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-3 pt-2 space-y-4">
                    {/* Movie Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white">
                                Select {requestedGenre} Movies
                                {totalCount > 0 && (
                                    <span className="text-xs text-gray-400 ml-2">
                                        ({totalCount} total)
                                    </span>
                                )}
                            </h3>
                            <span className="text-xs text-gray-400">
                                {selectedMovies.length} selected
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm rounded-md bg-[#2b2b2b] border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7db8]"
                            />
                            <Search className="absolute right-2 top-1.5 text-gray-400" size={16} />
                        </div>

                        {/* Movies Grid */}
                        <div className="max-h-64 overflow-y-auto">
                            {initialLoad ? (
                                <div className="grid grid-cols-4 gap-3 p-4">
                                    {[...Array(8)].map((_, index) => (
                                        <MovieSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredMovies.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3 p-4">
                                    {filteredMovies.map((movie) => (
                                        <div
                                            key={movie.movie_id}
                                            className={`relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer transition-transform border-2 ${selectedMovies.includes(String(movie.movie_id))
                                                ? "border-[#ff7db8] scale-105"
                                                : "border-transparent hover:scale-105"
                                                }`}
                                            onClick={() => toggleMovieSelection(String(movie.movie_id))}
                                        >
                                            <img
                                                src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                            <div className="absolute bottom-0.5 left-0.5 right-0.5">
                                                <h4 className="text-xs font-medium text-white truncate">{movie.title}</h4>
                                            </div>
                                            {selectedMovies.includes(String(movie.movie_id)) && (
                                                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                        {selectedMovies.indexOf(String(movie.movie_id)) + 1}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Loading more movies */}
                                    {moviesLoading && !initialLoad && searchQuery === '' && (
                                        <>
                                            {[...Array(4)].map((_, index) => (
                                                <MovieSkeleton key={`loading-${index}`} />
                                            ))}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-white/60 text-center w-full py-8">
                                    <Inbox className="mx-auto mb-2 w-8 h-8 text-white/70" />
                                    <p className="text-sm">
                                        {searchQuery ? "No movies found matching your search" : "No movies available"}
                                    </p>
                                </div>
                            )}

                            {/* Intersection observer target - only show when not searching */}
                            {hasMore && !moviesLoading && searchQuery === '' && (
                                <div ref={observerRef} className="h-4 w-full" />
                            )}
                        </div>
                    </div>

                    {/* Response Note */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">
                            Why are you suggesting this? (optional)
                        </label>
                        <textarea
                            placeholder="Add a personal note..."
                            rows={2}
                            value={responseNote}
                            onChange={(e) => setResponseNote(e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff7db8]"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 text-sm py-1.5"
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={submitting || selectedMovies.length === 0}
                        className="flex-1 text-sm py-1.5"
                    >
                        {submitting ? "Submitting..." : "Send Suggestion"}
                    </Button>
                </div>
            </div>

            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => {
                    setShowCoinAnimation(false);
                    onClose();
                }}
                duration={3000}
            />

        </div>
    );
};

// Response Viewer Popup Component
const ResponseViewerPopup = ({
    selectedRequest,
    onClose,
    userId,
}: {
    selectedRequest: SuggestionRequestType;
    onClose: () => void;
    userId: string | undefined;
}) => {
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const response = await fetch(
                    `https://suggesto.xyz/App/api.php?gofor=getSuggestionresponse&request_id=${selectedRequest.request_id}&user_id=${userId}`
                );
                const data = await response.json();

                if (data.status === "success") {
                    setResponses(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch responses:", error);
                toast.error("Failed to load responses");
            } finally {
                setLoading(false);
            }
        };

        if (selectedRequest && userId) {
            fetchResponses();
            // Disable body scroll when popup is open
            document.body.style.overflow = 'hidden';
        }

        // Cleanup function to ensure scroll is re-enabled
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedRequest, userId]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#1f1f21] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <h2 className="text-sm font-semibold text-white">Suggestion Responses</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-3 pt-2 space-y-4 pb-4">
                    {/* Request Info */}
                    <div className="bg-[#2b2b2b] rounded-lg p-3 border border-white/10">
                        <p className="text-sm text-gray-300 mb-2">Your Request:</p>
                        <p className="text-white text-sm font-medium">{selectedRequest.request_text}</p>
                        {selectedRequest.genre && (
                            <p className="text-gray-400 text-xs mt-1">Genre: {selectedRequest.genre}</p>
                        )}
                    </div>

                    {/* Responses */}
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(2)].map((_, index) => (
                                <div key={index} className="bg-[#2b2b2b] rounded-lg p-3 animate-pulse">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="aspect-[2/3] bg-gray-600 rounded-md"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : responses.length > 0 ? (
                        <div className="space-y-4">
                            {responses.map((response, index) => (
                                <div key={index} className="bg-[#2b2b2b] rounded-lg p-3 border border-white/10">
                                    {/* Responder Info */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <img
                                            src={response.responder_detail.profile_pic || DefaultImage}
                                            alt={response.responder_detail.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    response.responder_detail.name
                                                )}&background=ff7db8&color=fff`;
                                            }}
                                        />
                                        <div>
                                            <h4 className="text-white text-sm font-medium">{response.responder_detail.name}</h4>
                                            <p className="text-gray-400 text-xs">Suggested {response.movies.length} movie{response.movies.length > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {/* Movies Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {response.movies.map((movie: any) => (
                                            <div key={movie.movie_id} className="relative aspect-[2/3] rounded-md overflow-hidden group">
                                                <img
                                                    src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-1">
                                                    <h5 className="text-white text-xs font-medium truncate">{movie.title}</h5>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-yellow-400 text-xs">★ {movie.rating}</span>
                                                        {movie.in_watchlist === 1 && (
                                                            <span className="text-[#ff7db8] text-xs">✓ In Watchlist</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Response Note */}
                                    {response.movies[0]?.response_note && (
                                        <div className="bg-[#1f1f21] rounded-md p-2 border border-white/5">
                                            <p className="text-gray-400 text-xs mb-1">Note:</p>
                                            <p className="text-white text-sm">{response.movies[0].response_note}</p>
                                        </div>
                                    )}

                                    {/* Response Date */}
                                    <div className="mt-2 text-right">
                                        <span className="text-gray-500 text-xs">
                                            {new Date(response.movies[0].response_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Inbox className="mx-auto mb-2 w-8 h-8 text-white/70" />
                            <p className="text-sm text-white/60">No responses found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const ReceviedSuggestion = () => {
    const [requests, setRequests] = useState<SuggestionRequestType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<SuggestionRequestType | null>(null);

    const userId = Cookies.get("userID")

    useEffect(() => {
        fetchSuggestionRequests();
    }, []);

    const fetchSuggestionRequests = async () => {
        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=getSuggestionRequests&user_id=${userId}`,
            );
            const data = await response.json();

            setRequests(data.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClick = (request: SuggestionRequestType) => {
        // Always allow clicking - different behavior based on status
        setSelectedRequest(request);
    };

    const handleClosePopup = () => {
        setSelectedRequest(null);
        fetchSuggestionRequests();
    };

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    return (
        <div className="max-w-2xl mx-auto px-4">
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <RequestCardSkeleton key={index} />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <NotFound
                    imageSrc={SuggestNotFound}
                    title="No suggestion requests found"
                    description="You haven't received any suggestion requests yet."
                />
            ) : (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <div
                            key={request.request_id}
                            onClick={() => handleRequestClick(request)}
                            className={`rounded-lg bg-[#2b2b2b] border border-white/10 transition-shadow ${request.is_suggested === 0
                                ? "hover:shadow-lg cursor-pointer"
                                : "opacity-70 cursor-not-allowed"
                                }`}
                        >
                            <div className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={request.from_user.profile_pic || (typeof DefaultImage === "string" ? DefaultImage : DefaultImage.src)}
                                            alt={request.from_user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    request.from_user.name
                                                )}&background=ff7db8&color=fff`;
                                            }}
                                        />
                                        <div>
                                            <h3 className="font-medium text-sm">{request.from_user.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-400 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(request.created_date)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-100">{request.request_text || "No question provided"}</p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.is_suggested === 1
                                            ? "bg-[#121212] text-[#ff7db8]  "
                                            : "bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] text-white"
                                            }`}>
                                            {request.is_suggested === 1 ? "Responded" : "Suggestion Request"}
                                        </span>
                                    </div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${request.is_suggested === 0
                                        ? "bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] cursor-pointer"
                                        : "bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] cursor-not-allowed"
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequestClick(request);
                                        }}>
                                        {request.is_suggested === 1 ? (
                                            <Check className="text-white" size={14} />
                                        ) : (
                                            <ArrowRight className="text-white" size={14} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestion Form Popup with Pagination */}
            {selectedRequest && (
                selectedRequest.is_suggested === 1 ? (
                    <ResponseViewerPopup
                        selectedRequest={selectedRequest}
                        onClose={handleClosePopup}
                        userId={userId}
                    />
                ) : (
                    <SuggestionFormPopup
                        selectedRequest={selectedRequest}
                        onClose={handleClosePopup}
                        userId={userId}
                        respondsText={`Respond to "${selectedRequest.request_text}"`}
                        requestedGenre={selectedRequest.genre || ""}
                    />
                )
            )}
        </div>
    );
};

export default ReceviedSuggestion;