"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, ArrowRight, Check, Users } from 'lucide-react';
import NotFound from '@/components/notfound';
import SuggestNotFound from "@/assets/not-found-suggest.png"
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Request, Responder } from "@/app/suggest-movie/type"
import { RequestCardSkeleton, MovieCardSkeleton } from "@/app/suggest-movie/_components/loading"

const SuggestionsSent = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [responses, setResponses] = useState<Responder[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [responseCounts, setResponseCounts] = useState<{ [key: string]: number }>({});
    const userId = Cookies.get("userID")

    // Fetch movie requests on component mount
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=getSuggestionRequestssent&user_id=${userId}`);
            const data = await response.json();
            setRequests(data);

            // Fetch response counts for each request
            const counts: { [key: string]: number } = {};
            await Promise.all(data.map(async (request: Request) => {
                try {
                    const countResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=getSuggestionresponse&request_id=${request.request_id}`);
                    const countData = await countResponse.json();
                    counts[request.request_id] = countData.status === 'success' && countData.data ? countData.data.length : 0;
                } catch (error) {
                    console.error('Error fetching response count:', error);
                    counts[request.request_id] = 0;
                }
            }));
            setResponseCounts(counts);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequestDetails = async (requestId: string) => {
        try {
            setDetailLoading(true);
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=getSuggestionresponse&request_id=${requestId}`);
            const data = await response.json();
            // Handle the new API response format
            if (data.status === 'success' && data.data) {
                setResponses(data.data);
            } else {
                setResponses([]);
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
            setResponses([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        fetchRequestDetails(request.request_id);
        setView('detail');
    };

    const handleBackClick = () => {
        setView('list');
        setSelectedRequest(null);
        setResponses([]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (view === 'list') {
        return (
            <div className="max-w-4xl mx-auto px-4">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                            <RequestCardSkeleton key={index} />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <NotFound
                        imageSrc={SuggestNotFound}
                        title="No movie requests found"
                        description="It seems like you haven't made any movie requests yet. Start by requesting a movie!"
                    />
                ) : (
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div
                                key={request.request_id}
                                onClick={() => handleRequestClick(request)}
                                className="rounded-lg bg-[#2b2b2b] border border-white/10 hover:shadow-lg transition-all cursor-pointer hover:border-white/20"
                            >
                                <div className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Main content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white mb-2 text-sm line-clamp-2">
                                                {request.request_text}
                                            </h3>

                                            {/* Users and date in one row */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {request.to_users.slice(0, 3).map((user, index) => (
                                                        <div key={user.user_id} className="w-10 h-10 rounded-full overflow-hidden border border-white/20" style={{ marginLeft: index > 0 ? '-4px' : '0' }}>
                                                            <img
                                                                src={user.imgname || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=b56bbc&color=fff`}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=b56bbc&color=fff`;
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    {request.to_users.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white" style={{ marginLeft: '-4px' }}>
                                                            +{request.to_users.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Bottom row with genre and response info */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className='flex items-center gap-2'>
                                                    <span className="px-2 py-1 bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] text-white rounded-full text-xs font-medium">
                                                        {request.genre}
                                                    </span>
                                                    <div className="flex items-center space-x-1 text-gray-400 text-xs">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(request.created_date)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm font-medium mb-1 bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] bg-clip-text text-transparent">
                                                    <span> {responseCounts[request.request_id] || 0} responses</span>
                                                    <ArrowRight className="h-4 w-4 text-[#ee2a7b]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackClick}
                    className="mr-2 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-lg font-semibold text-white">
                    {selectedRequest?.request_text}
                </h1>
            </div>

            <div>
                {detailLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <MovieCardSkeleton key={index} />
                        ))}
                    </div>
                ) : responses.length === 0 ? (
                    <NotFound
                        imageSrc={SuggestNotFound}
                        title="No responses found for this request"
                        description="It seems like no one has responded to this request yet."
                    />
                ) : (
                    <div className="space-y-8">
                        {responses.map((responder, responderIndex) => {
                            // Check if all movies have the same response_note
                            const allResponseNotes = responder.movies.map(movie => movie.response_note).filter(note => note);
                            const uniqueResponseNotes = [...new Set(allResponseNotes)];
                            const hasSharedResponseNote = uniqueResponseNotes.length === 1 && allResponseNotes.length === responder.movies.length;
                            const sharedResponseNote = hasSharedResponseNote ? uniqueResponseNotes[0] : null;

                            return (
                                <div key={responderIndex} className="space-y-4 border border-white/10 rounded-lg p-4 bg-white/5">
                                    {/* Responder Header */}
                                    <div className="flex items-center space-x-2">
                                        <img
                                            src={responder.responder_detail.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(responder.responder_detail.name)}&background=b56bbc&color=fff`}
                                            alt={responder.responder_detail.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(responder.responder_detail.name)}&background=b56bbc&color=fff`;
                                            }}
                                        />
                                        <div>
                                            <h2 className="text-lg font-medium text-white">
                                                {responder.responder_detail.name}
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                {responder.movies.length} movie{responder.movies.length !== 1 ? 's' : ''} recommended
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shared Response Note */}
                                    {sharedResponseNote && (
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-gray-300 italic text-center">
                                                "{sharedResponseNote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Movies Grid */}
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {responder.movies.map((movie) => (
                                            <div
                                                onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
                                                key={movie.movie_id}
                                                className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-transform border-2 border-transparent hover:scale-105 bg-white/5"
                                            >
                                                <div className="relative w-[120px] h-[180px]">
                                                    {movie.poster_path ? (
                                                        <img
                                                            src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                const parent = (e.target as HTMLImageElement).parentElement;
                                                                if (parent) {
                                                                    const placeholder = parent.querySelector('.placeholder');
                                                                    if (placeholder instanceof HTMLElement) {
                                                                        placeholder.style.display = 'flex';
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="placeholder absolute inset-0 bg-gray-700/50 flex items-center justify-center text-gray-400 text-xs" style={{ display: movie.poster_path ? 'none' : 'flex' }}>
                                                        No Image
                                                    </div>

                                                    {/* Watchlist Indicator */}
                                                    {movie.in_watchlist === 1 && (
                                                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                    <div className="absolute bottom-1 left-1 right-1">
                                                        <h4 className="text-xs font-medium text-white truncate">{movie.title}</h4>
                                                        {movie.rating && (
                                                            <p className="text-xs text-gray-300">★ {movie.rating}/10</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Only show individual response note if it's different from shared note */}
                                                {movie.response_note && !sharedResponseNote && (
                                                    <div className="p-2">
                                                        <p className="text-xs text-gray-300 italic text-center" title={movie.response_note}>
                                                            "{movie.response_note}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionsSent;