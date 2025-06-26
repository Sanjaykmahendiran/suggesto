import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Film, X, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

type Movie = {
    movie_id: number;
    title: string;
    poster_path?: string;
    release_date: string;
    rating: number;
    genres?: string[];
};

interface CreatePollDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function CreatePollDialog({ isOpen, onClose }: CreatePollDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [question, setQuestion] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(false);
    const [moviesLoading, setMoviesLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const observerRef = useRef<HTMLDivElement>(null);
    const userId = Cookies.get('userID');

    // Fetch movies from API
    const fetchMovies = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setMoviesLoading(true);
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&limit=20&offset=${currentOffset}`);
            const data = await response.json();
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
            if (fetchedMovies.length < 20 || (currentOffset + fetchedMovies.length) >= data.total_count) {
                setHasMore(false);
            }

            if (fetchedMovies.length > 0) {
                setOffset(currentOffset + fetchedMovies.length);
            }

        } catch (error) {
            console.error('Error fetching movies:', error);
            toast.error('Failed to load movies');
        } finally {
            setMoviesLoading(false);
            setInitialLoad(false);
            setLoadingMovies(false);
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !moviesLoading && hasMore && !initialLoad) {
                    fetchMovies(offset, true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        if (observerRef.current && isOpen && currentStep === 2) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [moviesLoading, hasMore, offset, fetchMovies, initialLoad, isOpen, currentStep]);

    useEffect(() => {
        if (isOpen && currentStep === 2 && movies.length === 0) {
            fetchMovies();
        }
    }, [isOpen, currentStep, movies.length]);

    const formatImageUrl = (path: string | undefined) => {
        if (!path) return '/placeholder-movie.jpg';
        return path.startsWith('http') ? path : `https://suggesto.xyz/App/${path}`;
    };

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMovieSelection = (movieId: number) => {
        setSelectedMovies(prev => {
            if (prev.includes(movieId)) {
                return prev.filter(id => id !== movieId);
            } else if (prev.length < 3) {
                return [...prev, movieId];
            } else {
                toast.error('You can select maximum 3 movies');
                return prev;
            }
        });
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !question.trim()) {
            toast.error('Please enter a question');
            return;
        }
        if (currentStep === 2 && selectedMovies.length === 0) {
            toast.error('Please select at least one movie');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleCreatePoll = async () => {
        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: 'createpoll',
                    user_id: userId,
                    question: question,
                    movies: selectedMovies
                })
            });

            const data = await response.json();
            if (data.response === "Poll Created Successfully") {
                toast.success('Poll created successfully!');
                onClose()
                setQuestion('');
                setSelectedMovies([]);
                setCurrentStep(1);
                window.location.reload();
            } else {
                toast.error('Failed to create poll');
            }
        } catch (error) {
            console.error('Error creating poll:', error);
            toast.error('Failed to create poll');
        }
    };

    const resetDialog = () => {
        setCurrentStep(1);
        setQuestion('');
        setSelectedMovies([]);
        setSearchQuery('');
    };

    const getSelectedMovieDetails = () => {
        return movies.filter(movie => selectedMovies.includes(movie.movie_id));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Poll Question
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., Which movie should I watch tonight?"
                                className="w-full px-3 py-2 bg-[#2b2b2b] border border-[#3E3E4E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white">Select Movies</h3>
                            <span className="text-sm text-gray-400">
                                {selectedMovies.length}/3 selected
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="w-full bg-[#2b2b2b] border border-[#3E3E4E] pl-10 px-3 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
                            />
                        </div>

                        {/* Movies List */}
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {loadingMovies ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                            <div className="w-12 h-16 bg-[#2b2b2b] rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-[#2b2b2b] rounded"></div>
                                                <div className="h-3 bg-[#2b2b2b] rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {filteredMovies.map((movie) => {
                                        const isSelected = selectedMovies.includes(movie.movie_id);
                                        return (
                                            <div
                                                key={movie.movie_id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'bg-[#b56bbc]/20 backdrop-blur-sm border border-[#b56bbc]/30'
                                                    : 'hover:bg-[#2b2b2b] border border-transparent'
                                                    }`}
                                                onClick={() => toggleMovieSelection(movie.movie_id)}
                                            >
                                                <div className="w-12 h-16 relative flex-shrink-0">
                                                    <img
                                                        src={formatImageUrl(movie.poster_path)}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-white truncate">{movie.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            {movie.rating}
                                                        </span>
                                                    </div>
                                                    {movie.genres && movie.genres.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            <span className="text-xs bg-[#b56bbc]/20 text-white px-2 py-0.5 rounded">
                                                                {movie.genres[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredMovies.length === 0 && !loadingMovies && searchQuery && (
                                        <div className="text-center py-8 text-gray-400">
                                            <Film className="mx-auto h-12 w-12 mb-2" />
                                            <p>No movies found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {moviesLoading && !initialLoad && !searchQuery && (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                            <div className="w-12 h-16 bg-[#2b2b2b] rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-[#2b2b2b] rounded"></div>
                                                <div className="h-3 bg-[#2b2b2b] rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Intersection observer target - only show when not searching */}
                            {hasMore && !moviesLoading && !searchQuery && (
                                <div ref={observerRef} className="h-4 w-full" />
                            )}
                        </div>
                    </div>

                );



            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Preview</h3>

                        <div className="bg-[#2b2b2b] rounded-lg p-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Question:</h4>
                                <p className="text-white">{question}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">
                                    Selected Movies ({selectedMovies.length}):
                                </h4>
                                <div className="space-y-2">
                                    {getSelectedMovieDetails().map((movie) => (
                                        <div key={movie.movie_id} className="flex items-center gap-3 p-2 bg-[#b56bbc]/20 backdrop-blur-sm border border-[#b56bbc]/30 rounded">
                                            <div className="w-8 h-10 relative flex-shrink-0">
                                                <img
                                                    src={formatImageUrl(movie.poster_path)}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">{movie.title}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(movie.release_date).getFullYear()} • ★ {movie.rating}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );


            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f1f21] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#3E3E4E]">
                    <h2 className="text-xl font-semibold text-white">
                        Create Poll
                    </h2>
                    <button
                        onClick={() => {
                            onClose();
                            resetDialog();
                        }}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-[#3E3E4E]">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNextStep}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-lg hover:bg-[#5b4cdb] transition-colors"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreatePoll}
                            className="px-6 py-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-lg hover:bg-[#5b4cdb] transition-colors"
                        >
                            Create Poll
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePollDialog;