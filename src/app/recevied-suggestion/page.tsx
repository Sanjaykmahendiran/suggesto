"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    Calendar,
    MessageSquare,
    ArrowRight,
    ArrowLeft,
    Inbox,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button";
import NotFound from "@/components/notfound";

type UserType = {
    name: string;
    location: string;
    imgname?: string;
};

type SuggestionRequestType = {
    request_id: string | number;
    from_user: UserType;
    genre: string;
    status: string;
    request_text: string;
    num_of_items: number;
    created_date: string;
};

type Movie = {
    poster_path: any;
    movie_id: string;
    title: string;
    poster: string;
};

// Skeleton Components
const RequestCardSkeleton = () => (
    <div className="rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-600/50"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-600/50 rounded"></div>
                        <div className="h-3 w-20 bg-gray-600/50 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-16 bg-gray-600/50 rounded"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-gray-600/50 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-600/50 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-gray-600/50 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-20 bg-gray-600/50 rounded"></div>
                </div>
                <div className="w-10 h-10 bg-gray-600/50 rounded-full"></div>
            </div>
        </div>
    </div>
);

const MovieCardSkeleton = () => (
    <div className="min-w-[90px] h-[150px] rounded-lg bg-gray-600/50 animate-pulse">
        <div className="w-full h-full rounded-lg bg-gradient-to-t from-gray-700/80 to-gray-600/50"></div>
    </div>
);

const SuggestionRequestsApp = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [requests, setRequests] = useState<SuggestionRequestType[]>([]);
    const [loading, setLoading] = useState(true);
    const [moviesLoading, setMoviesLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<SuggestionRequestType | null>(null);
    const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
    const [responseNote, setResponseNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch("https://suggesto.xyz/App/api.php?gofor=movieslist");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMovies(data);
                }
            } catch (error) {
                console.error("Failed to fetch movie list", error);
            } finally {
                setMoviesLoading(false);
            }
        };

        if (selectedRequest) {
            fetchMovies();
        }
    }, [selectedRequest]);

    const toggleMovieSelection = (movieId: string) => {
        setSelectedMovies(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
    };

    const handleSubmit = async () => {
        if (!userId || !selectedRequest || selectedMovies.length === 0) {
            setMessage({ type: "error", text: "Please select at least one movie." });
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
                setMessage({ type: "success", text: "Suggestion submitted successfully!" });
                setSelectedRequest(null);
                setSelectedMovies([]);
                setResponseNote("");
            } else {
                setMessage({ type: "error", text: "An error occurred while submitting." });
            }
        } catch (error) {
            console.error("Submission error:", error);
            setMessage({ type: "error", text: "An error occurred while submitting." });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const handleBack = () => {
        if (selectedRequest) {
            setSelectedRequest(null);
        } else {
            router.back();
        }
    };

    // Step 1: List View
    if (!selectedRequest) {
        return (
            <div className="min-h-screen bg-[#181826] text-white">
                <header className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="p-2.5 rounded-full bg-[#292938] transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Suggestion Requests</h1>
                            <p className="text-gray-400 text-sm">respond to user suggestions</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[...Array(3)].map((_, index) => (
                                <RequestCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : requests.length === 0 ? (
                        <NotFound
                            title="No suggestion requests found"
                        />
                        // <div className="text-center py-16">
                        //     <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        //     <p className="text-gray-500">No suggestion requests found</p>
                        // </div>
                    ) : (
                        <div className="space-y-6">
                            {requests.map((request) => (
                                <div
                                    key={request.request_id}
                                    onClick={() => setSelectedRequest(request)}
                                    className="rounded-xl bg-white/5 border border-white/10 hover:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={request.from_user.imgname || "/api/placeholder/40/40"}
                                                    alt={request.from_user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            request.from_user.name
                                                        )}&background=6c5ce7&color=fff`;
                                                    }}
                                                />
                                                <div>
                                                    <h3 className="font-semibold">{request.from_user.name}</h3>
                                                    <p className="text-sm text-gray-400">{request.from_user.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(request.created_date)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-100">{request.request_text}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-[#6c5ce7]/20 text-[#6c5ce7] border border-[#6c5ce7]/40 rounded-full text-xs font-medium">
                                                {request.genre}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>{request.num_of_items} items requested</span>
                                            </div>
                                            <div className="flex items-center justify-center w-10 h-10 bg-[#6c5ce7] hover:bg-[#5d4fd7] rounded-full transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRequest(request);
                                                }}>
                                                <ArrowRight className="text-white" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Step 2: Suggestion Form
    return (
        <div className="min-h-screen bg-[#181826] text-white">
            <header className="flex items-center gap-3 p-4 ">
                <button
                    onClick={handleBack}
                    className="p-2.5 rounded-full bg-[#292938]"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <h2 className="text-lg font-semibold">Suggestion Request</h2>
            </header>

            <div className="max-w-xl mx-auto p-6 space-y-6">
                {/* From */}
                <div>
                    <p className="text-sm text-gray-400 mb-2">From:</p>
                    <div className="flex items-center space-x-2">
                        <img
                            src={selectedRequest.from_user.imgname || "/api/placeholder/32/32"}
                            alt={selectedRequest.from_user.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    selectedRequest.from_user.name
                                )}&background=6c5ce7&color=fff`;
                            }}
                        />
                        <span className="text-lg font-medium">{selectedRequest.from_user.name}</span>
                    </div>
                </div>

                {/* Request text */}
                <div>
                    <p className="text-sm text-gray-400 mb-1">Request:</p>
                    <p className="text-white/90">{selectedRequest.request_text}</p>
                </div>

                {/* Genre */}
                <div>
                    <p className="text-sm text-gray-400 mb-1">Genre:</p>
                    <span className="inline-block bg-[#6c5ce7]/20 text-[#6c5ce7] px-3 py-1 rounded-full text-sm font-medium">
                        {selectedRequest.genre}
                    </span>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-white">Suggest by Movie</h2>

                        {moviesLoading ? (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar p-2">
                                {[...Array(5)].map((_, index) => (
                                    <MovieCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : movies.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar p-2 ">
                                {movies.map((movie) => (
                                    <div
                                        key={movie.movie_id}
                                        className={`relative min-w-[90px] h-[150px] rounded-lg overflow-hidden cursor-pointer transition-transform border-2 ${selectedMovies.includes(movie.movie_id)
                                            ? "border-[#6c5ce7] scale-105"
                                            : "border-transparent hover:scale-105"
                                            }`}
                                        onClick={() => toggleMovieSelection(movie.movie_id)}
                                    >
                                        <img
                                            src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-2 left-2">
                                            <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-white/60 text-center w-full py-8">
                                <Inbox className="mx-auto mb-2 w-8 h-8 text-white/70" />
                                No movies found
                            </div>
                        )}
                    </div>

                    <textarea
                        placeholder="Why are you suggesting this? (optional)"
                        rows={3}
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]"
                    />

                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full  text-lg">
                        {submitting ? "Submitting..." : "Send Suggestion"}
                    </Button>
                    {message && (
                        <div
                            className={`mt-3 text-sm font-medium p-2 rounded-md ${message.type === "success" ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionRequestsApp;