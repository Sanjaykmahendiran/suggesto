"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Trophy, Heart, Bookmark, Plus, X, Search, ArrowLeft, Share2, Target, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/UserContext"
import { getMockData } from "./type"
import { Top10MovieEntry, Movie } from "./type"
import { PodiumSkeleton, RankingItemSkeleton } from "@/components/top-wall-skeleton"
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from "@/components/coin-animation"
import { useTourIntegration } from "@/hooks/useTourIntegration"
import NotFound from "@/components/notfound"
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import toast from "react-hot-toast"
import logo from "@/assets/white-bg-logo.png"
import sharebgimage from "@/assets/share-bg.png"
import { ShareTopTenList } from "./_components/share-top-10-list"


// New interface for guess session
interface GuessSession {
    session_id: number
    target_user_id: number
    guesser_id: number
    status: 'active' | 'completed'
}

// Interface for guess results
interface GuessResult {
    position: number
    guessed_movie: Movie | null
    actual_movie: Movie | null
    is_correct: boolean
    points: number
}

interface GuessResults {
    session_id: number
    total_score: number
    max_score: number
    results: GuessResult[]
    friend_name?: string
}

export default function Top10Wall() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, setUser } = useUser()
    const [top10Movies, setTop10Movies] = useState<Top10MovieEntry[]>([])
    const [allMovies, setAllMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [usingMockData, setUsingMockData] = useState(false)
    const [mockDataCount, setMockDataCount] = useState(0)
    const [justCompletedTop10, setJustCompletedTop10] = useState(false)

    // Existing modal state (for own wall)
    const [showRankingModal, setShowRankingModal] = useState(false)
    const [selectedRanking, setSelectedRanking] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedMovieForRanking, setSelectedMovieForRanking] = useState<number | null>(null)
    const [moviesLoading, setMoviesLoading] = useState(false)
    const [hasMoreMovies, setHasMoreMovies] = useState(true)
    const [moviesOffset, setMoviesOffset] = useState(0)
    const [totalMoviesCount, setTotalMoviesCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [hasShownCoinAnimation, setHasShownCoinAnimation] = useState(false)

    // New state for guessing game
    const [gameMode, setGameMode] = useState<'view' | 'guess' | 'results'>('view')
    const [guessSession, setGuessSession] = useState<GuessSession | null>(null)
    const [userGuesses, setUserGuesses] = useState<{ [position: number]: number }>({})
    const [guessResults, setGuessResults] = useState<GuessResults | null>(null)
    const [friendName, setFriendName] = useState<string>('')
    const [isSubmittingGuesses, setIsSubmittingGuesses] = useState(false)

    // New state for guess modal (separate from ranking modal)
    const [showGuessModal, setShowGuessModal] = useState(false)
    const [guessSearchQuery, setGuessSearchQuery] = useState("")
    const [selectedPositionForGuess, setSelectedPositionForGuess] = useState<number>(1)
    const [selectedMovieForGuess, setSelectedMovieForGuess] = useState<number | null>(null)
    const [guessMoviesLoading, setGuessMoviesLoading] = useState(false)
    const [friendMovies, setFriendMovies] = useState<Movie[]>([])
    const [randomizedFriendMovies, setRandomizedFriendMovies] = useState<Movie[]>([])

    // New state for game intro modal
    const [showGameIntroModal, setShowGameIntroModal] = useState(false)
    const [hasPlayedGame, setHasPlayedGame] = useState(false)
    const [hasAlreadyGuessed, setHasAlreadyGuessed] = useState(false)

    const friendId = searchParams.get("friend_id")
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userID') || '' : ''
    const isViewingFriend = Boolean(friendId)
    const previousRealMoviesCount = useRef(0)
    const searchTimeout = useRef<NodeJS.Timeout>()

    useTourIntegration('top10wall', [loading], !loading)

    // Function to shuffle array using Fisher-Yates algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    // Create guess session
    const createGuessSession = async () => {
        if (!friendId || !userId) return

        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=t10guess_create&guesser_id=${userId}&target_user_id=${friendId}`)
            const data = await response.json()

            if (data && data.session_id) {
                setGuessSession({
                    session_id: data.session_id,
                    target_user_id: parseInt(friendId),
                    guesser_id: parseInt(userId),
                    status: 'active'
                })

                setShowGameIntroModal(false)
                setGameMode('guess')

                // Mark that user has played the game to prevent popup from showing again
                setHasPlayedGame(true)

                // Load movies for guess mode
                if (allMovies.length === 0) {
                    fetchAllMovies(0, false)
                }
            } else {
                toast.error('Failed to start guessing game')
            }
        } catch (error) {
            console.error('Error creating guess session:', error)
            toast.error('Failed to start guessing game')
        }
    }

    // Submit guesses
    const submitGuesses = async () => {
        if (!guessSession || Object.keys(userGuesses).length !== 10) {
            toast.error('Please guess all 10 positions!')
            return
        }

        setIsSubmittingGuesses(true)

        try {
            const guesses = Object.entries(userGuesses).map(([position, movieId]) => ({
                position: parseInt(position),
                guessed_movie_id: movieId
            }))

            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "t10guess_submit",
                    session_id: guessSession.session_id,
                    guesses: guesses
                })
            })

            const data = await response.json()

            if (data && data.status && data.answers) {
                // Create a map for quick movie lookup from BOTH allMovies AND friendMovies
                const movieMap = new Map()

                // Add movies from allMovies
                allMovies.forEach(movie => {
                    movieMap.set(movie.movie_id, movie)
                })

                // Add movies from friendMovies (will overwrite if duplicates exist)
                friendMovies.forEach(movie => {
                    movieMap.set(movie.movie_id, movie)
                })

                // Create a map for actual movies from top10Movies (friend's actual list)
                const actualMovieMap = new Map()
                top10Movies.forEach(entry => {
                    if (entry.movie && !entry.isMockData) {
                        actualMovieMap.set(entry.order_no, entry.movie)
                    }
                })

                // Transform API response to include both guessed and actual movies
                const results = data.answers.map(answer => {
                    const guessedMovie = movieMap.get(answer.guessed_movie_id) || null
                    const actualMovie = actualMovieMap.get(answer.position) || null

                    return {
                        position: answer.position,
                        guessed_movie: guessedMovie,
                        actual_movie: actualMovie,
                        is_correct: answer.is_correct === 1,
                        points: answer.is_correct === 1 ? 10 : 0
                    }
                })

                setGuessResults({
                    session_id: guessSession.session_id,
                    total_score: data.score || 0,
                    max_score: data.total || 10,
                    results: results,
                    friend_name: friendName
                })
                setGameMode('results')
            } else {
                toast.error('Failed to submit guesses - invalid response')
            }
        } catch (error) {
            console.error('Error submitting guesses:', error)
            toast.error('Failed to submit guesses')
        } finally {
            setIsSubmittingGuesses(false)
        }
    }

    // Modified fetch function to get friend info
    const fetchTop10Movies = async () => {
        try {
            let response;

            if (isViewingFriend) {
                response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendtop10wall&user_id=${userId}&friend_id=${friendId}`)
            } else {
                response = await fetch(`https://suggesto.xyz/App/api.php?gofor=top10wall_get&user_id=${userId}`)
            }

            const data = await response.json()

            if (isViewingFriend && data && data.moviedetails && Array.isArray(data.moviedetails)) {
                const movieDetails = data.moviedetails
                const sortedMovies = movieDetails.sort((a: Top10MovieEntry, b: Top10MovieEntry) => (a.order_no || 0) - (b.order_no || 0))

                const realMovies: Top10MovieEntry[] = sortedMovies.map((movie: Top10MovieEntry) => ({
                    ...movie,
                    isMockData: false
                }))

                setTop10Movies(realMovies)
                setMockDataCount(0)
                setUsingMockData(false)
                setIsLiked(data.is_liked || false)
                setIsSaved(data.is_saved || false)

                // Set friend name if available
                if (data.friend_name) {
                    setFriendName(data.friend_name)
                }

                // Check if user has already guessed
                setHasAlreadyGuessed(data.is_guessed === 1)

                // Show game intro modal for friends with top 10 lists if they haven't played yet AND haven't guessed before
                if (realMovies.length > 0 && !hasPlayedGame && data.is_guessed !== 1) {
                    setShowGameIntroModal(true)
                }

            } else if (!isViewingFriend && data && (Array.isArray(data) || (data.top10 && Array.isArray(data.top10)))) {
                // Existing logic for own wall
                const moviesData = Array.isArray(data) ? data : data.top10
                const sortedMovies = moviesData.sort((a: Top10MovieEntry, b: Top10MovieEntry) => (a.order_no || 0) - (b.order_no || 0))

                const completeTop10: Top10MovieEntry[] = []
                const mockData = getMockData()

                for (let i = 1; i <= 10; i++) {
                    const existingMovie = sortedMovies.find((movie: Top10MovieEntry) => movie.order_no === i)

                    if (existingMovie) {
                        completeTop10.push({
                            ...existingMovie,
                            isMockData: false
                        })
                    } else {
                        const mockMovie = mockData.find(mock => mock.order_no === i)
                        if (mockMovie) {
                            completeTop10.push({
                                ...mockMovie,
                                order_no: i,
                                user_id: userId,
                                top_id: `mock_${i}`,
                                is_liked: false,
                                is_saved: false,
                                isMockData: true
                            })
                        }
                    }
                }

                setTop10Movies(completeTop10)
                const mockCount = completeTop10.filter(movie => movie.isMockData).length
                setMockDataCount(mockCount)
                setUsingMockData(mockCount === 10)

                const hasRealData = sortedMovies.length > 0
                if (hasRealData && sortedMovies.length > 0) {
                    setIsLiked(sortedMovies[0].is_liked)
                    setIsSaved(sortedMovies[0].is_saved)
                } else {
                    setIsLiked(false)
                    setIsSaved(false)
                }
            } else {
                if (isViewingFriend) {
                    setTop10Movies([])
                    setUsingMockData(false)
                    setMockDataCount(0)
                } else {
                    const mockData = getMockData()
                    setTop10Movies(mockData)
                    setUsingMockData(true)
                    setMockDataCount(10)
                }
                setIsLiked(false)
                setIsSaved(false)
            }
        } catch (error) {
            console.error('Error fetching top 10 movies:', error)
            if (isViewingFriend) {
                setTop10Movies([])
                setUsingMockData(false)
                setMockDataCount(0)
            } else {
                const mockData = getMockData()
                setTop10Movies(mockData)
                setUsingMockData(true)
                setMockDataCount(10)
            }
            setIsLiked(false)
            setIsSaved(false)
        } finally {
            setLoading(false)
        }
    }

    const fetchFriendMovies = async () => {
        if (!friendId) return

        setGuessMoviesLoading(true)
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendtop10wall&user_id=${userId}&friend_id=${friendId}`)
            const data = await response.json()

            if (data && data.moviedetails && Array.isArray(data.moviedetails)) {
                const movies = data.moviedetails
                    .filter(entry => entry.movie && !entry.isMockData)
                    .map(entry => entry.movie)

                setFriendMovies(movies)

                // Randomize the movies for the guess modal
                const randomized = shuffleArray(movies)
                setRandomizedFriendMovies(randomized)
            }
        } catch (error) {
            console.error('Error fetching friend movies:', error)
        } finally {
            setGuessMoviesLoading(false)
        }
    }

    // Game Introduction Modal Component
    const GameIntroModal = () => {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#1f1f21] rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Guess My Top 10 Movies
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Can you guess their favorite movies?
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setShowGameIntroModal(false)
                                setHasPlayedGame(true)
                            }}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-4 text-center">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center mb-3">
                            <Target size={32} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            Guess My Top 10!
                        </h3>
                        <p className="text-sm text-gray-300">
                            {friendName} has created their top 10 movie list.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Think you know their taste? Try to guess all 10 movies and see how well you know them!
                        </p>
                    </div>

                    <div className="p-4">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowGameIntroModal(false)
                                    setHasPlayedGame(true)
                                }}
                                className="w-full h-12 bg-[#2b2b2b] text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Just Show Me The List
                            </button>
                            <button
                                onClick={createGuessSession}
                                className="w-full h-12 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm"
                            >
                                Start Guessing Game
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Separate Guess Modal Component with randomized movies
    const GuessModal = () => {
        const filteredGuessMovies = useMemo(() => {
            const alreadyGuessedIds = Object.values(userGuesses)
            // Use randomizedFriendMovies instead of friendMovies
            return randomizedFriendMovies.filter(movie => {
                const matchesSearch = guessSearchQuery === '' || movie.title.toLowerCase().includes(guessSearchQuery.toLowerCase())
                const notAlreadyGuessed = !alreadyGuessedIds.includes(movie.movie_id)
                return matchesSearch && notAlreadyGuessed
            })
        }, [randomizedFriendMovies, guessSearchQuery, userGuesses])

        const handleGuessMovieSelect = () => {
            if (!selectedMovieForGuess) return

            console.log('Updating guess for position:', selectedPositionForGuess, 'movie:', selectedMovieForGuess);
            setUserGuesses(prev => ({
                ...prev,
                [selectedPositionForGuess]: selectedMovieForGuess
            }))
            setShowGuessModal(false)
            setSelectedMovieForGuess(null)
            setGuessSearchQuery("")
        }

        const handleGuessModalClose = () => {
            setShowGuessModal(false)
            setSelectedMovieForGuess(null)
            setGuessSearchQuery("")
        }

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1f1f21] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">
                            Guess Position #{selectedPositionForGuess}
                        </h2>
                        <button
                            onClick={handleGuessModalClose}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={guessSearchQuery}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setGuessSearchQuery(value)
                                }}
                                className="w-full pl-10 pr-4 py-3 bg-[#2b2b2b] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-96 p-4">
                        <div className="space-y-3">
                            {filteredGuessMovies.map((movie, index) => (
                                <div
                                    key={`guess-${movie.movie_id}-${index}`}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedMovieForGuess === movie.movie_id
                                        ? 'bg-[#b56bbc]/20 border border-[#b56bbc]'
                                        : 'bg-[#2b2b2b] hover:bg-gray-700'
                                        }`}
                                    onClick={() => setSelectedMovieForGuess(movie.movie_id)}
                                >
                                    <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={
                                                movie.poster_path
                                                    ? `https://suggesto.xyz/App/${movie.poster_path}`
                                                    : "/placeholder.svg"
                                            }
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{movie.title}</p>
                                        <p className="text-gray-400 text-sm">
                                            {movie.release_date ? movie.release_date.split('-')[0] : ''} • {' '}
                                            {movie.language ? movie.language.toUpperCase() : ''}
                                        </p>
                                        <p className="text-gray-400 text-sm">★ {movie.rating || 'N/A'}</p>
                                    </div>
                                    {selectedMovieForGuess === movie.movie_id && (
                                        <div className="w-6 h-6 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {filteredGuessMovies.length === 0 && !guessMoviesLoading && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">
                                        {guessSearchQuery
                                            ? `No movies found matching "${guessSearchQuery}"`
                                            : "No available movies"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-700">
                        <div className="flex gap-3">
                            <button
                                onClick={handleGuessModalClose}
                                className="flex-1 py-3 px-4 bg-[#2b2b2b] text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGuessMovieSelect}
                                disabled={!selectedMovieForGuess}
                                className={`flex-1 py-3 px-4 rounded-lg transition-colors ${selectedMovieForGuess
                                    ? 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white hover:opacity-90'
                                    : 'bg-[#2b2b2b] text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Save Guess
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Fixed fetchAllMovies function to prevent duplicate keys
    const fetchAllMovies = useCallback(async (currentOffset = 0, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setMoviesLoading(true);
            }

            console.log('Fetching movies with offset:', currentOffset);
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&limit=30&offset=${currentOffset}`);
            const data = await response.json();

            console.log('Movies API response:', data);

            if (data && data.data && Array.isArray(data.data)) {
                const fetchedMovies = data.data;

                if (data.total_count !== undefined) {
                    setTotalMoviesCount(data.total_count);
                }

                if (isLoadMore) {
                    setAllMovies(prev => {
                        // Remove duplicates by creating a Map with movie_id as key
                        const movieMap = new Map();

                        // Add existing movies
                        prev.forEach(movie => {
                            movieMap.set(movie.movie_id, movie);
                        });

                        // Add new movies (will overwrite duplicates)
                        fetchedMovies.forEach(movie => {
                            movieMap.set(movie.movie_id, movie);
                        });

                        // Convert back to array
                        return Array.from(movieMap.values());
                    });
                } else {
                    // For initial load, also remove duplicates
                    const uniqueMovies = fetchedMovies.filter((movie, index, arr) =>
                        arr.findIndex(m => m.movie_id === movie.movie_id) === index
                    );
                    setAllMovies(uniqueMovies);
                }

                if (fetchedMovies.length < 30) {
                    setHasMoreMovies(false);
                }

                if (fetchedMovies.length > 0) {
                    setMoviesOffset(currentOffset + fetchedMovies.length);
                }
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setMoviesLoading(false);
        }
    }, []);

    // Modified handleRankingClick function
    const handleRankingClick = (orderNo) => {
        console.log('Rank clicked:', orderNo, 'Game mode:', gameMode, 'Is viewing friend:', isViewingFriend);

        if (isViewingFriend && gameMode === 'guess') {
            setSelectedPositionForGuess(orderNo)
            setSelectedMovieForGuess(userGuesses[orderNo] || null)
            setGuessSearchQuery("")
            setShowGuessModal(true)

            // Fetch friend's movies instead of all movies if not already loaded
            if (friendMovies.length === 0) {
                console.log('Loading friend movies for guessing...');
                fetchFriendMovies();
            }
        } else if (!isViewingFriend) {
            // Original behavior for own wall
            setSelectedRanking(orderNo)
            setShowRankingModal(true)
            setSearchQuery("")
            setSelectedMovieForRanking(null)

            if (allMovies.length === 0) {
                fetchAllMovies(0, false)
            }
        }
    }

    // Original update function for own wall only
    const updateRankingPosition = async () => {
        if (!selectedMovieForRanking) {
            console.log('No movie selected for ranking');
            return;
        }

        // This is only for own wall now
        if (!isViewingFriend) {
            const movieData = [{
                order_no: selectedRanking,
                movie_id: selectedMovieForRanking
            }]

            try {
                const response = await fetch('https://suggesto.xyz/App/api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gofor: "top10wall",
                        user_id: userId,
                        movies: movieData
                    })
                })
                const data = await response.json()
                if (data && data.response === "Top 10 Wall updated") {
                    setShowRankingModal(false)
                    setSelectedMovieForRanking(null)
                    setSearchQuery("")

                    const currentRealMoviesCount = top10Movies.filter(movie => !movie.isMockData).length
                    if (currentRealMoviesCount === 9 && !hasShownCoinAnimation) {
                        setJustCompletedTop10(true)
                    }

                    fetchTop10Movies()
                }
            } catch (error) {
                console.error('Error updating ranking position:', error)
            }
        }
    }

    // Get already selected movie IDs (for own wall)
    const getAlreadySelectedMovieIds = () => {
        return top10Movies
            .filter(entry => !entry.isMockData && entry.order_no !== selectedRanking)
            .map(entry => entry.movie?.movie_id)
            .filter(id => id !== undefined) as number[]
    }

    // Filtered movies for own wall only
    const filteredMovies = useMemo(() => {
        const moviesToFilter = allMovies.filter(movie => {
            const matchesSearch = searchQuery === '' || movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            const alreadySelected = getAlreadySelectedMovieIds().includes(movie.movie_id)
            return matchesSearch && !alreadySelected
        })
        return moviesToFilter
    }, [allMovies, searchQuery, top10Movies, selectedRanking])

    // Get movie by ID helper
    const getMovieById = (movieId: number): Movie | null => {
        // First check allMovies, then friendMovies
        let movie = allMovies.find(movie => movie.movie_id === movieId)
        if (movie) return movie

        movie = friendMovies.find(movie => movie.movie_id === movieId)
        if (movie) return movie

        return null
    }

    // Calculate guess completion
    const guessCompletion = Object.keys(userGuesses).length
    const canSubmitGuesses = guessCompletion === 10

    // Handle modal close for own wall
    const handleModalClose = () => {
        setShowRankingModal(false)
        setSelectedMovieForRanking(null)
        setSearchQuery("")
    }

    // Load movies when entering guess mode
    useEffect(() => {
        if (gameMode === 'guess' && allMovies.length === 0) {
            console.log('Game mode changed to guess, loading movies...');
            fetchAllMovies(0, false);
        }
    }, [gameMode, allMovies.length, fetchAllMovies]);

    // Other effects
    useEffect(() => {
        if (isViewingFriend) return

        const realMoviesCount = top10Movies.filter(movie => !movie.isMockData).length

        if (realMoviesCount === 10 && previousRealMoviesCount.current === 9 && !hasShownCoinAnimation) {
            setShowCoinAnimation(true)
            setHasShownCoinAnimation(true)
            setJustCompletedTop10(true)
        }

        previousRealMoviesCount.current = realMoviesCount
    }, [top10Movies, isViewingFriend, hasShownCoinAnimation])

    const autoLoadForSearch = useCallback(async () => {
        if (!searchQuery || moviesLoading || !hasMoreMovies) return

        if (filteredMovies.length < 5 && hasMoreMovies) {
            await fetchAllMovies(moviesOffset, true)
        }
    }, [searchQuery, moviesLoading, hasMoreMovies, filteredMovies.length, moviesOffset, fetchAllMovies])

    // Toggle functions
    const toggleLike = async () => {
        if (top10Movies.length === 0 || usingMockData) return

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "top10like",
                    user_id: userId,
                    friend_id: friendId || 0
                })
            })
            const data = await response.json()

            if (data && typeof data.liked === 'boolean') {
                setIsLiked(data.liked)
                fetchTop10Movies()
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    const toggleSave = async () => {
        if (top10Movies.length === 0 || usingMockData) return

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "top10save",
                    user_id: userId,
                    friend_id: friendId || 0,
                }),
            })

            const data = await response.json()

            if (data && data.liked !== undefined) {
                setIsSaved(data.liked)
                fetchTop10Movies()
            }
        } catch (error) {
            console.error('Error toggling save:', error)
        }
    }

    // Main effects
    useEffect(() => {
        fetchTop10Movies()
        if (!isViewingFriend || gameMode === 'guess') {
            fetchAllMovies(0, false)
            setTimeout(() => {
                if (hasMoreMovies) {
                    fetchAllMovies(20, true)
                }
            }, 100)
        }
    }, [userId, friendId, fetchAllMovies, gameMode])

    useEffect(() => {
        if (searchQuery && filteredMovies.length < 5 && hasMoreMovies && !moviesLoading) {
            const timer = setTimeout(() => {
                fetchAllMovies(moviesOffset, true)
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [filteredMovies.length, searchQuery, hasMoreMovies, moviesLoading, moviesOffset, fetchAllMovies])

    useEffect(() => {
        if ((isViewingFriend && gameMode !== 'guess')) return

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !moviesLoading && hasMoreMovies && allMovies.length > 0) {
                    fetchAllMovies(moviesOffset, true)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [moviesLoading, hasMoreMovies, moviesOffset, fetchAllMovies, allMovies.length, isViewingFriend, gameMode])


    if (loading) {
        return (
            <div className="h-screen text-white relative">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="mr-4 p-2 rounded-full bg-[#2b2b2b] animate-pulse w-10 h-10"></div>
                        <div className="w-32 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-[#2b2b2b] p-2 rounded-full w-10 h-10 animate-pulse"></div>
                    </div>
                </div>
                <PodiumSkeleton />
                <div className="bg-white/10 backdrop-blur-sm rounded-t-3xl px-4 py-6 flex-1 mt-8">
                    <div className="space-y-4">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <RankingItemSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // RESULTS VIEW
    if (gameMode === 'results' && guessResults) {
        return (
            <div className="min-h-screen text-white relative mb-18">
                <header className="flex justify-between items-center p-4 pt-8">
                    <div className="flex items-center gap-2">
                        <button
                            className="mr-2 p-2 rounded-full bg-[#2b2b2b]"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Guess Results</h1>
                        </div>
                    </div>
                </header>

                {/* Score Summary Card */}
                <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-[#b56bbc]/20 to-[#7a71c4]/20 rounded-xl border border-primary/30">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Final Score</h2>
                        <div className="text-3xl font-bold text-primary">
                            {guessResults.total_score}/{guessResults.max_score}
                        </div>
                    </div>
                </div>


                {/* Results List */}
                <div className="px-4 space-y-3 pb-20">
                    {guessResults.results.map((result) => {
                        const guessedMovie = result.guessed_movie
                        const actualMovie = result.actual_movie

                        return (
                            <div
                                key={result.position}
                                className={`p-2 rounded-xl border-2 ${result.is_correct
                                    ? " border-green-500/50"
                                    : " border-red-500/50"
                                    }`}
                            >
                                {/* Position and Score Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white bg-[#2b2b2b] w-6 h-6 rounded-full flex items-center justify-center">
                                            {result.position}
                                        </span>
                                        {result.is_correct ? (
                                            <div className="flex items-center gap-1 text-green-400">
                                                <span className="text-sm font-medium">Correct!</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-400">
                                                <span className="text-sm font-medium">Wrong</span>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className={`text-sm font-bold  rounded-full ${result.is_correct
                                            ? "text-green-400 "
                                            : "text-red-400 "
                                            }`}
                                    >
                                        {result.points ?? 0} Points
                                    </div>
                                </div>

                                {/* Movies Comparison */}
                                <div className="flex items-center gap-2">
                                    {/* Your Guess */}
                                    <div className="bg-[#2b2b2b]/50 rounded-lg p-3 flex-1">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                            Your Guess
                                        </p>
                                        {guessedMovie ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                                                    {guessedMovie.poster_path ? (
                                                        <img
                                                            src={`https://suggesto.xyz/App/${guessedMovie.poster_path}`}
                                                            alt={guessedMovie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                                                            ?
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-sm break-words line-clamp-1">
                                                        {guessedMovie.title}
                                                    </p>

                                                    <p className="text-gray-400 text-xs">
                                                        {guessedMovie.release_date
                                                            ? guessedMovie.release_date.split("-")[0]
                                                            : ""}{" "}
                                                        • {guessedMovie.language?.toUpperCase() ?? ""}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        ★ {guessedMovie.rating || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No guess made</p>
                                        )}
                                    </div>

                                    {/* Actual Movie */}
                                    <div className="bg-[#1a1a1a]/50 rounded-lg p-3 border border-gray-700 flex-1">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                            Actual Movie
                                        </p>
                                        {actualMovie ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                                                    {actualMovie.poster_path ? (
                                                        <img
                                                            src={`https://suggesto.xyz/App/${actualMovie.poster_path}`}
                                                            alt={actualMovie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                                                            ?
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-sm break-words line-clamp-1">
                                                        {actualMovie.title}
                                                    </p>

                                                    <p className="text-gray-400 text-xs">
                                                        {actualMovie.release_date
                                                            ? actualMovie.release_date.split("-")[0]
                                                            : ""}{" "}
                                                        • {actualMovie.language?.toUpperCase() ?? ""}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        ★ {actualMovie.rating || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 rounded overflow-hidden bg-gray-600 flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">?</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-400">
                                                        Movie details unavailable
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Position had no movie
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>


                {/* Bottom Action Button */}
                <div className="fixed bottom-4 left-0 w-full z-50 px-4">
                    <button
                        onClick={() => {
                            setHasPlayedGame(true)
                            setGameMode('view')
                            setGuessResults(null)
                            setUserGuesses({})
                            setGuessSession(null)
                        }}
                        className="w-full py-4 px-6 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-xl hover:opacity-90 transition-opacity font-semibold"
                    >
                        View Actual List
                    </button>
                </div>
            </div>
        )
    }

    // GUESSING VIEW
    if (isViewingFriend && gameMode === 'guess') {
        const top3Guesses = [1, 2, 3]
        const otherGuesses = [4, 5, 6, 7, 8, 9, 10]

        return (
            <div className="min-h-screen text-white relative mb-18">
                <header className="flex justify-between items-center p-4 pt-8">
                    <div className="flex items-center gap-2">
                        <button
                            className="mr-2 p-2 rounded-full bg-[#2b2b2b]"
                            onClick={() => setGameMode('view')}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Guess {friendName}'s Top 10</h1>
                            <p className="text-sm text-white/60">
                                {guessCompletion}/10 guesses made
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setGameMode('view')}
                        className="text-sm px-3 py-1 bg-[#2b2b2b] rounded-full transition-colors"
                    >
                        Back
                    </button>
                </header>

                <div className="mx-4 mb-4">
                    <div className="w-full bg-[#2b2b2b] rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(guessCompletion / 10) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        {guessCompletion === 10 ? 'All guesses made!' : `${10 - guessCompletion} more to go`}
                    </p>
                </div>

                <div className="px-4 mb-6">
                    <div className="flex items-end justify-center">
                        {[2, 1, 3].map((position, index) => {
                            const guessedMovieId = userGuesses[position]
                            const guessedMovie = guessedMovieId ? getMovieById(guessedMovieId) : null
                            const isFirst = position === 1
                            const avatarSize = isFirst ? "w-14 h-22" : "w-12 h-16"
                            const podiumHeight = isFirst ? "h-34 w-24" : position === 2 ? "h-26 w-24" : "h-24 w-24"
                            const podiumBg = isFirst
                                ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]"
                                : position === 2 ? "bg-[#b56bbc]/80" : "bg-[#b56bbc]/60"

                            return (
                                <div key={position} className="flex flex-col items-center">
                                    {isFirst && <Trophy className="w-6 h-6 text-primary mb-1" />}

                                    <div
                                        className={`${avatarSize} mb-2 rounded-lg overflow-hidden ${isFirst ? "ring-4 ring-primary" : "ring-2 ring-white/50"
                                            } cursor-pointer hover:scale-105 transition-transform ${!guessedMovie ? "bg-[#2b2b2b] flex items-center justify-center" : ""
                                            }`}
                                        onClick={() => handleRankingClick(position)}
                                    >
                                        {guessedMovie ? (
                                            <img
                                                src={`https://suggesto.xyz/App/${guessedMovie.poster_path}`}
                                                alt={guessedMovie.title}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Plus className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>

                                    <p className="text-sm font-medium mb-1 text-center max-w-20 truncate">
                                        {guessedMovie ? guessedMovie.title : "Your Guess"}
                                    </p>

                                    {guessedMovie && (
                                        <p className="text-xs text-gray-200 mb-2">★ {guessedMovie.rating}</p>
                                    )}

                                    <div
                                        className={`${podiumBg} rounded-t-lg w-16 ${podiumHeight} flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
                                        onClick={() => handleRankingClick(position)}
                                    >
                                        <span className={`${isFirst ? "text-3xl" : "text-2xl"} font-bold text-white`}>
                                            {position}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="px-4 space-y-3 pb-24">
                    {otherGuesses.map((position) => {
                        const guessedMovieId = userGuesses[position]
                        const guessedMovie = guessedMovieId ? getMovieById(guessedMovieId) : null

                        return (
                            <div
                                key={position}
                                className="flex items-center gap-4 bg-[#2b2b2b] p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => handleRankingClick(position)}
                            >
                                <span className="text-lg font-semibold text-white w-6">{position}</span>
                                <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#2b2b2b] flex items-center justify-center">
                                    {guessedMovie ? (
                                        <img
                                            src={`https://suggesto.xyz/App/${guessedMovie.poster_path}`}
                                            alt={guessedMovie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Plus className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {guessedMovie ? guessedMovie.title : "Make your guess"}
                                    </p>
                                    {guessedMovie && (
                                        <p className="text-gray-200 text-sm">
                                            {guessedMovie.release_date ? guessedMovie.release_date.split('-')[0] : ""} • {guessedMovie.language ? guessedMovie.language.toUpperCase() : ""}
                                        </p>
                                    )}
                                </div>
                                {guessedMovie && (
                                    <div className="flex items-center">
                                        <p className="text-gray-200 text-sm">★ {guessedMovie.rating}</p>
                                    </div>
                                )}
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    {guessedMovie ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-white" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="fixed bottom-4 left-0 w-full z-50">
                    <div className="flex justify-center px-4">
                        <button
                            onClick={submitGuesses}
                            disabled={!canSubmitGuesses || isSubmittingGuesses}
                            className={`w-full max-w-md py-4 px-6 rounded-xl font-bold transition-all ${canSubmitGuesses
                                ? 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white hover:scale-105'
                                : 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSubmittingGuesses ? 'Submitting...' :
                                canSubmitGuesses ? 'Submit All Guesses' :
                                    `Submit Guesses (${guessCompletion}/10)`}
                        </button>
                    </div>
                </div>

                {/* Separate Guess Modal - Only shown in guess mode */}
                {showGuessModal && <GuessModal />}
            </div>
        )
    }

    // MAIN VIEW (Original + Friend View + Guess Trigger)
    return (
        <div className="min-h-screen text-white relative mb-18">
            {/* Game Introduction Modal */}
            {showGameIntroModal && !hasAlreadyGuessed && <GameIntroModal />}

            {/* Header */}
            <header className="flex justify-between items-center p-4 pt-8">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">
                            {isViewingFriend ? `Friend's Top 10` : "Top 10 Wall"}
                        </h1>
                        <p className="text-sm text-white/60">
                            {isViewingFriend ? "Friend's top picks." : "Your top favorites."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/saved-top10-wall" data-tour-target="saved-top10-link">
                        <Bookmark size={30} className="text-primary" />
                    </Link>
                    <Link href="/profile">
                        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                            <Image
                                src={user?.imgname || DefaultImage}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Mock Data Notice - Show only for own wall */}
            {mockDataCount > 0 && !isViewingFriend && (
                <div className="mx-4 mb-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg" data-tour-target="mock-data-notice">
                    <p className="text-blue-200 text-sm text-center">
                        {mockDataCount === 10
                            ? "This is sample data. Add your own movies to create your personalized top 10 wall! Click on any position to add your movies!"
                            : `${mockDataCount} position${mockDataCount > 1 ? 's are' : ' is'} using sample data. Click on any position to add your movies!`}
                    </p>
                </div>
            )}

            {/* No Data Message for Friends */}
            {isViewingFriend && top10Movies.length === 0 && (
                <NotFound
                    title="No Top 10 Movies Yet"
                    description="Your friend hasn't created their top 10 movie list yet."
                />
            )}

            {/* Content when movies exist */}
            {top10Movies.length > 0 && (
                <>
                    {/* Like and Save Actions - Show for friends in view mode */}
                    {isViewingFriend && gameMode === 'view' && (
                        <div className="fixed bottom-4 left-0 w-full z-40">
                            <div className="flex justify-center px-4 py-3">

                                <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 text-white bg-[#1f1f21] text-sm">
                                    <button
                                        onClick={toggleLike}
                                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                                        <span className={isLiked ? 'text-red-400' : ''}>
                                            {isLiked ? 'Liked' : 'Like'}
                                        </span>
                                    </button>
                                    <span className="mx-2 text-white/30">|</span>
                                    <button
                                        onClick={toggleSave}
                                        className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                                    >
                                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                        <span className={isSaved ? 'text-yellow-400' : ''}>
                                            {isSaved ? 'Saved' : 'Save'}
                                        </span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Podium - Only show if >= 3 movies OR if not viewing friend */}
                    {(!isViewingFriend || top10Movies.length >= 3) && (
                        <div className="px-4" data-tour-target="podium-section">
                            <div className="flex items-end justify-center">
                                {[2, 1, 3].map((position, index) => {
                                    const movieEntry = top10Movies.find(entry => entry.order_no === position)
                                    if (!movieEntry && isViewingFriend) return <div key={position} className="w-16"></div>

                                    const movie = movieEntry?.movie
                                    const isFirst = position === 1
                                    const avatarSize = isFirst ? "w-14 h-22" : "w-12 h-16"
                                    const podiumHeight = isFirst ? "h-34 w-24" : position === 2 ? "h-26 w-24" : "h-24 w-24"
                                    const podiumBg = isFirst
                                        ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]"
                                        : position === 2 ? "bg-[#b56bbc]/80" : "bg-[#b56bbc]/60"

                                    return (
                                        <div
                                            data-tour-target={position === 1 ? "podium-position-1" : undefined}
                                            key={position}
                                            className="flex flex-col items-center"
                                        >
                                            {isFirst && <Trophy className="w-6 h-6 text-primary mb-1" />}

                                            <div
                                                className={`${avatarSize} mb-2 rounded-lg overflow-hidden ${isFirst ? "ring-4 ring-primary" : "ring-2 ring-white/50"
                                                    } cursor-pointer hover:scale-105 transition-transform ${!movieEntry || movieEntry.isMockData ? "opacity-60 bg-[#2b2b2b] flex items-center justify-center" : ""
                                                    }`}
                                                onClick={() => {
                                                    console.log('Podium click:', position, 'gameMode:', gameMode, 'isViewingFriend:', isViewingFriend);
                                                    if (!isViewingFriend) {
                                                        handleRankingClick(position);
                                                    } else if (gameMode === 'view' && !movieEntry?.isMockData) {
                                                        router.push(`/movie-detail-page?movie_id=${movie?.movie_id}`)
                                                    }
                                                }}
                                            >
                                                {!movieEntry || movieEntry.isMockData ? (
                                                    <Plus className="w-6 h-6 text-gray-400" />
                                                ) : (
                                                    <img
                                                        src={`https://suggesto.xyz/App/${movie?.poster_path}`}
                                                        alt={movie?.title || "Movie"}
                                                        className="w-full h-full object-contain"
                                                    />
                                                )}
                                            </div>

                                            <p className={`text-sm font-medium mb-1 text-center max-w-20 truncate ${!movieEntry || movieEntry.isMockData ? "opacity-60" : ""
                                                }`}>
                                                {!movieEntry || movieEntry.isMockData ? "Add Movie" : movie?.title || ""}
                                            </p>

                                            {movieEntry && !movieEntry.isMockData && (
                                                <p className="text-xs text-gray-200 mb-2">★ {movie?.rating ?? "0"}</p>
                                            )}

                                            <div
                                                className={`${podiumBg} rounded-t-lg w-16 ${podiumHeight} flex items-center justify-center ${!isViewingFriend ? "cursor-pointer hover:scale-105 transition-transform" : ""
                                                    } ${!movieEntry || movieEntry.isMockData ? "opacity-60" : ""}`}
                                                onClick={() => !isViewingFriend && handleRankingClick(position)}
                                            >
                                                <span className={`${isFirst ? "text-3xl" : "text-2xl"} font-bold text-white`}>
                                                    {position}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Other Rankings */}
                    <div className="px-4 pb-6 flex-1" data-tour-target="ranking-list">
                        <div className="space-y-4">
                            {(isViewingFriend && top10Movies.length < 3 ? top10Movies : top10Movies.slice(3)).map((movieEntry) => {
                                const movie = movieEntry.movie
                                return (
                                    <div
                                        data-tour-target={movieEntry.order_no === 4 ? "ranking-item-4" : undefined}
                                        key={movieEntry.top_id}
                                        className={`flex items-center gap-4 bg-[#2b2b2b] p-3 rounded-lg ${!isViewingFriend ? 'cursor-pointer hover:bg-white/10 transition-colors' : 'cursor-pointer hover:bg-white/10 transition-colors'
                                            } ${movieEntry.isMockData ? 'opacity-60' : ''}`}
                                        onClick={() => {
                                            if (isViewingFriend && !movieEntry.isMockData) {
                                                router.push(`/movie-detail-page?movie_id=${movie?.movie_id}`)
                                            } else if (!isViewingFriend) {
                                                handleRankingClick(movieEntry.order_no)
                                            }
                                        }}
                                    >
                                        <span className="text-lg font-semibold text-white w-6">{movieEntry.order_no}</span>
                                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#2b2b2b] flex items-center justify-center">
                                            {movieEntry.isMockData ? (
                                                <Plus className="w-6 h-6 text-gray-400" />
                                            ) : (
                                                <img
                                                    src={movie?.poster_path ? `https://suggesto.xyz/App/${movie.poster_path}` : "/placeholder.svg"}
                                                    alt={movie?.title || "Movie"}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {movieEntry.isMockData ? "Add Movie" : (movie?.title || "")}
                                            </p>
                                            {!movieEntry.isMockData && (
                                                <p className="text-gray-200 text-sm">
                                                    {movie?.release_date ? movie.release_date.split('-')[0] : ""} • {movie?.language ? movie.language.toUpperCase() : ""}
                                                </p>
                                            )}
                                        </div>
                                        {!movieEntry.isMockData && (
                                            <div className="flex items-center">
                                                <p className="text-gray-200 text-sm">★ {movie?.rating || "0"}</p>
                                            </div>
                                        )}
                                        {movieEntry.isMockData && !isViewingFriend && (
                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Modal for adding/updating rankings - Only for OWN wall */}
            {showRankingModal && !isViewingFriend && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1f1f21] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                Update Rank #{selectedRanking}
                            </h2>
                            <button
                                onClick={handleModalClose}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setSearchQuery(value)
                                        if (value && searchTimeout.current) {
                                            clearTimeout(searchTimeout.current)
                                        }
                                        if (value) {
                                            searchTimeout.current = setTimeout(() => {
                                                autoLoadForSearch()
                                            }, 300)
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-3 bg-[#2b2b2b] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-96 p-4">
                            <div className="space-y-3">
                                {filteredMovies.map((movie, index) => (
                                    <div
                                        key={`ranking-${movie.movie_id}-${index}`}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedMovieForRanking === movie.movie_id
                                            ? 'bg-[#b56bbc]/20 border border-[#b56bbc]'
                                            : 'bg-[#2b2b2b] hover:bg-gray-700'
                                            }`}
                                        onClick={() => setSelectedMovieForRanking(movie.movie_id)}
                                    >
                                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={
                                                    movie.poster_path
                                                        ? `https://suggesto.xyz/App/${movie.poster_path}`
                                                        : "/placeholder.svg"
                                                }
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{movie.title}</p>
                                            <p className="text-gray-400 text-sm">
                                                {movie.release_date ? movie.release_date.split('-')[0] : ''} • {' '}
                                                {movie.language ? movie.language.toUpperCase() : ''}
                                            </p>
                                            <p className="text-gray-400 text-sm">★ {movie.rating || 'N/A'}</p>
                                        </div>
                                        {selectedMovieForRanking === movie.movie_id && (
                                            <div className="w-6 h-6 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {filteredMovies.length === 0 && !moviesLoading && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">
                                            {searchQuery
                                                ? `No movies found matching "${searchQuery}"`
                                                : "No available movies"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {moviesLoading && (
                            <div className="p-4">
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={`loading-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-[#2b2b2b]">
                                            <div className="w-12 h-16 bg-gray-600 rounded-lg animate-pulse"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4"></div>
                                                <div className="h-3 bg-gray-600 rounded animate-pulse w-1/2"></div>
                                                <div className="h-3 bg-gray-600 rounded animate-pulse w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasMoreMovies && !moviesLoading && (
                            <div ref={observerRef} className="h-4 w-full" />
                        )}

                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleModalClose}
                                    className="flex-1 py-3 px-4 bg-[#2b2b2b] text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateRankingPosition}
                                    disabled={!selectedMovieForRanking}
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors ${selectedMovieForRanking
                                        ? 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white hover:opacity-90'
                                        : 'bg-[#2b2b2b] text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={20}
                message="Top 10 Complete!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />

            <ShareTopTenList
                top10Movies={top10Movies}
                userName={user?.name || friendName || 'User'}
            />
        </div>
    )
}
