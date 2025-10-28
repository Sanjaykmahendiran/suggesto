"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Calendar, User, ThumbsUp, ArrowRight, ArrowLeft, Lightbulb, CheckCircle, BarChart3, Eye, Users, Trash2, Plus, X, ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotFound from "@/components/notfound"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import CreatePollDialog from "./_componets/craete-poll"
import {  Poll } from "@/app/polls/type"
import PollCardSkeleton from "@/app/polls/_componets/poll-loading"
import CoinAnimation from "@/components/coin-animation";

export default function PollPage() {
    const router = useRouter()
    const [allPolls, setAllPolls] = useState<Poll[]>([])
    const [myPolls, setMyPolls] = useState<Poll[]>([])
    const [loading, setLoading] = useState(true)
    const [myPollsLoading, setMyPollsLoading] = useState(true)
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
    const [currentTab, setCurrentTab] = useState<string>("all-polls")
    const [selectedMovies, setSelectedMovies] = useState<{ [pollId: number]: number }>({})
    const [submittingPolls, setSubmittingPolls] = useState<Set<number>>(new Set())
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
    const [showCreatePollDialog, setShowCreatePollDialog] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [userPollCount, setUserPollCount] = useState(0)
    const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set())
    const [pollResults, setPollResults] = useState<{ [pollId: number]: Poll }>({})
    const [pollsLoading, setPollsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [coinsEarned, setCoinsEarned] = useState(0)
    const [myPollsTab, setMyPollsTab] = useState<"active" | "closed">("active")
    const [isMyPollsDropdownOpen, setIsMyPollsDropdownOpen] = useState(false)

    const activePolls = myPolls.filter(poll => poll.status === 1)
    const closedPolls = myPolls.filter(poll => poll.status !== 1)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMyPollsDropdownOpen) {
                const target = event.target as HTMLElement
                if (!target.closest('.relative')) {
                    setIsMyPollsDropdownOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMyPollsDropdownOpen])

    // Fetch poll results
    const fetchPollResults = async (pollId: number): Promise<Poll | null> => {
        if (!userId) return null

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "pollresult",
                    user_id: userId,
                    poll_id: pollId.toString()
                })
            })
            const data = await response.json()

            if (data.status === 'success') {
                // Find the original poll to merge with results
                const originalPoll = allPolls.find(p => p.poll_id === pollId) || myPolls.find(p => p.poll_id === pollId)

                if (originalPoll) {
                    return {
                        ...originalPoll,
                        total_votes: data.total_votes,
                        is_voted: 1,
                        user_voted_movie_id: data.user_voted_movie_id.toString(),
                        movies: data.result.map((resultMovie: any) => ({
                            movie_id: resultMovie.movie_id,
                            title: resultMovie.title,
                            poster_path: resultMovie.poster_path,
                            vote_count: resultMovie.vote_count,
                            percentage: resultMovie.percentage,
                            release_date: originalPoll.movies.find(m => m.movie_id === resultMovie.movie_id)?.release_date || ''
                        }))
                    }
                }
            }
            return null
        } catch (error) {
            console.error('Error fetching poll results:', error)
            return null
        }
    }


    // Delete poll
    const deletePoll = async (pollId: number) => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deletepoll&poll_id=${pollId}`)

            const data = await response.json()

            if (data.status === 'Poll  Deleted') {
                toast.success('Poll deleted successfully!')
                await fetchMyPolls()
                setShowDeleteConfirm(null)
            } else {
                toast.error('Failed to delete poll. Please try again.')
            }
        } catch (error) {
            console.error('Error deleting poll:', error)
            alert('Error deleting poll. Please try again.')
        }
    }

    // Submit poll vote
    const submitPollVote = async (pollId: number, movieId: number) => {
        if (!userId) return

        setSubmittingPolls(prev => new Set([...prev, pollId]))

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "submitpoll",
                    user_id: userId,
                    poll_id: pollId.toString(),
                    movie_id: movieId.toString()
                })
            })

            const data = await response.json()

            if (data.status === 'success') {
                // Show coin animation if coins were earned
                if (data.coins_earned) {
                    setCoinsEarned(data.coins_earned)
                    setShowCoinAnimation(true)
                }

                toast.success(data.message || 'Vote submitted successfully!');

                // Mark this poll as voted
                setVotedPolls(prev => new Set([...prev, pollId]))

                // **NEW: Fetch the latest poll results after successful vote**
                const latestResults = await fetchPollResults(pollId)

                if (latestResults) {
                    // Update pollResults cache with fresh data
                    setPollResults(prev => ({
                        ...prev,
                        [pollId]: latestResults
                    }))

                    // Update allPolls with the fresh results
                    setAllPolls(prevPolls =>
                        prevPolls.map(poll => {
                            if (poll.poll_id === pollId) {
                                return latestResults
                            }
                            return poll
                        })
                    )

                    // Also update myPolls if the poll exists there
                    setMyPolls(prevPolls =>
                        prevPolls.map(poll => {
                            if (poll.poll_id === pollId) {
                                return latestResults
                            }
                            return poll
                        })
                    )
                }

                // Clear the selected movie for this poll
                setSelectedMovies(prev => {
                    const newSelected = { ...prev };
                    delete newSelected[pollId];
                    return newSelected;
                });

                if (selectedPoll && selectedPoll.poll_id === pollId) {
                    setSelectedPoll(latestResults)
                }
            } else {
                toast.error(data.message || 'Failed to submit vote. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting poll:', error)
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setSubmittingPolls(prev => {
                const newSet = new Set(prev)
                newSet.delete(pollId)
                return newSet
            })
        }
    }


    // Handle movie selection
    const handleMovieSelect = (pollId: number, movieId: number) => {
        setSelectedMovies(prev => ({
            ...prev,
            [pollId]: movieId
        }))
    }

    // Fetch all polls
    const fetchAllPolls = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setPollsLoading(true)
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=polllist&user_id=${userId}&limit=10&offset=${currentOffset}`)
            const data = await response.json()

            if (data.status === 'success') {
                const fetchedPolls = data.data || []

                // Set total count from API response
                if (data?.total_count !== undefined) {
                    setTotalCount(data.total_count)
                }

                // Process polls - user details now come directly from API
                const processedPolls = fetchedPolls.map((poll: Poll) => {
                    // Mark voted polls in state
                    if (poll.is_voted === 1) {
                        setVotedPolls(prev => new Set([...prev, poll.poll_id]))
                    }

                    return {
                        ...poll,
                        user_has_voted: poll.is_voted === 1,
                        // User details now come directly from the API response
                        created_by: {
                            name: poll.user_name,
                            imgname: poll.user_img || ""
                        }
                    }
                })

                if (isLoadMore) {
                    setAllPolls(prev => [...prev, ...processedPolls])
                } else {
                    setAllPolls(processedPolls)
                }

                // Check if there are more polls to load
                if (fetchedPolls.length < 10) {
                    setHasMore(false)
                }

                if (fetchedPolls.length > 0) {
                    setOffset(currentOffset + fetchedPolls.length)
                }
            }
        } catch (error) {
            console.error('Error fetching all polls:', error)
        } finally {
            setPollsLoading(false)
            setInitialLoad(false)
        }
    }, [userId])

    // Update the fetchMyPolls function
    const fetchMyPolls = async () => {
        try {
            setMyPollsLoading(true) // Set loading to true when starting fetch
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userpolllist&user_id=${userId}`)
            const data = await response.json()

            if (data.status === 'success') {
                const processedPolls = data.data.map((poll: Poll) => {
                    return {
                        ...poll,
                        total_votes: poll.total_votes,
                        created_by: {
                            name: poll.user_name,
                            imgname: poll.user_img || ""
                        }
                    }
                })
                setMyPolls(processedPolls)
                setUserPollCount(processedPolls.length)
            }
        } catch (error) {
            console.error('Error fetching my polls:', error)
        } finally {
            setMyPollsLoading(false) // Set loading to false when done
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setMyPollsLoading(true)
            await Promise.all([fetchAllPolls(0, false), fetchMyPolls()])
            setLoading(false)
        }

        fetchData()
    }, [userId, fetchAllPolls])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !pollsLoading && hasMore && !initialLoad && currentTab === "all-polls") {
                    fetchAllPolls(offset, true)
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
    }, [pollsLoading, hasMore, offset, fetchAllPolls, initialLoad, currentTab])

    const handlePollClick = async (poll: Poll, fromMyPolls: boolean = false) => {
        // If we need to show results and don't have them cached, fetch them
        if ((poll.is_voted === 1 || fromMyPolls || poll.user_id === parseInt(userId || "")) && !pollResults[poll.poll_id]) {
            const results = await fetchPollResults(poll.poll_id)
            if (results) {
                setPollResults(prev => ({
                    ...prev,
                    [poll.poll_id]: results
                }))
                setSelectedPoll(results)
            } else {
                setSelectedPoll(poll)
            }
        } else if (pollResults[poll.poll_id]) {
            setSelectedPoll(pollResults[poll.poll_id])
        } else {
            setSelectedPoll(poll)
        }

        setCurrentTab(fromMyPolls ? "my-polls" : "all-polls")
    }

    const renderMovieOptions = (poll: Poll, isInModal: boolean = false, forceResultsView: boolean = false) => {
        if (!poll.movies || poll.movies.length === 0) {
            return (
                <div className="text-white/60 text-center w-full py-8">
                    <Lightbulb className="mx-auto mb-3 w-8 h-8 text-white/70" />
                    No movies available
                </div>
            )
        }

        const selectedMovieId = selectedMovies[poll.poll_id]
        const isSubmitting = submittingPolls.has(poll.poll_id)
        const isOwnPoll = poll.user_id === parseInt(userId || "")
        const hasUserVoted = poll.is_voted === 1 || votedPolls.has(poll.poll_id)
        const showAsResults = forceResultsView || (currentTab === "my-polls") || isOwnPoll || hasUserVoted

        return (
            <div className="space-y-4">
                {/* Movie Grid - Only show when NOT showing results */}
                {!showAsResults && (
                    <div className="grid grid-cols-3 gap-3">
                        {poll.movies.map((movie) => {
                            const isSelected = selectedMovieId === movie.movie_id

                            return (
                                <div
                                    key={movie.movie_id}
                                    className={`relative h-[150px] rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 ${isSelected
                                        ? 'border-[#b56bbc] ring-2 ring-[#7a71c4]/50 scale-105'
                                        : 'border-white/20 hover:border-white/40 hover:scale-102'
                                        }`}
                                    onClick={() => handleMovieSelect(poll.poll_id, movie.movie_id)}
                                >
                                    <img
                                        src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="w-6 h-6 text-primary bg-white rounded-full" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 left-2 right-2">
                                        <h3 className="text-sm font-medium text-white line-clamp-2">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-gray-300">
                                            {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Results Section - Show when displaying results */}
                {showAsResults && (
                    <div className="space-y-3">
                        {/* Show voted message if user has voted */}
                        {hasUserVoted && !isOwnPoll && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                                <div className="flex items-center space-x-2 text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        You voted for: {poll.movies.find(m => m.movie_id === parseInt(poll.user_voted_movie_id || "0"))?.title || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Individual Movie Results - Fix progress bar */}
                        {poll.movies
                            .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                            .map((movie, index) => {
                                const voteCount = movie.vote_count || 0
                                const votePercentage = movie.percentage || 0
                                const isUserVoted = movie.movie_id === parseInt(poll.user_voted_movie_id || "0")

                                return (
                                    <div
                                        key={movie.movie_id}
                                        className={`rounded-lg p-3 border ${isUserVoted
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {/* Movie Poster Thumbnail */}
                                            <img
                                                src={`https://suggesto.xyz/App/${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />

                                            {/* Movie Details and Results */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium text-white">{movie.title}</h4>
                                                        {isUserVoted && (
                                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                                                Your Vote
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-white">{voteCount} votes</div>
                                                        <div className="text-sm text-primary font-bold">{Math.round(votePercentage)}%</div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar - Fixed calculation */}
                                                <div className="w-full bg-white/20 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${isUserVoted
                                                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                                                            : 'bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]'
                                                            }`}
                                                        style={{
                                                            width: `${votePercentage > 0 ? Math.max(votePercentage, 2) : 0}%`
                                                        }}
                                                    >
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                        {/* Poll Summary */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Total votes: {poll.total_votes || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vote Button - Only show for voting */}
                {selectedMovieId && !showAsResults && currentTab === "all-polls" && !isOwnPoll && !hasUserVoted && (
                    <button
                        onClick={() => submitPollVote(poll.poll_id, selectedMovieId)}
                        disabled={isSubmitting}
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <ThumbsUp className="w-5 h-5" />
                                <span>Submit Vote</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        )
    }

    const renderMyPollCard = (poll: Poll) => {
        const totalVotes = poll.total_votes || 0

        return (
            <div
                key={poll.poll_id}
                className="rounded-xl bg-[#2b2b2b] border border-white/10 hover:shadow-xl transition-shadow"
            >
                <div className="p-4 space-y-4">
                    {/* Poll Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-2">{poll.question}</h3>


                            {/* Poll Stats */}
                            <div className="flex items-center justify-between space-x-4 text-sm text-gray-400 mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{totalVotes} votes</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>{poll.movies?.length || 0} options</span>
                                    </div>
                                    {poll.created_at && (
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                {/* View Results aligned right */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handlePollClick(poll, true)}
                                        className="flex items-center space-x-2 text-sm font-medium transition-colors group"
                                    >
                                        <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                            View Results
                                        </span>
                                        <Eye className="w-4 h-4 text-[#b56bbc] transition-colors" />
                                    </button>
                                </div>
                            </div>




                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderPollList = (polls: Poll[], isMyPolls: boolean = false) => {
        // Show skeleton loading for initial load OR when my polls are loading
        if (loading || (isMyPolls && myPollsLoading)) {
            return (
                <div className="space-y-6 px-4">
                    {[...Array(3)].map((_, index) => (
                        <PollCardSkeleton key={index} />
                    ))}
                </div>
            )
        }

        if (polls.length === 0) {
            return (
                <NotFound
                    title="No polls found"
                    description={
                        isMyPolls
                            ? "You haven't created any polls yet. Start by creating a new poll!"
                            : "No polls are currently available. Check back later!"
                    }
                />
            )
        }

        return (
            <div className="space-y-6 px-4">
                {polls.map((poll) =>
                    isMyPolls ? renderMyPollCard(poll) : (
                        <div
                            key={poll.poll_id}
                            className="rounded-xl bg-[#2b2b2b] border border-white/10 hover:shadow-xl transition-shadow"
                        >
                            <div className="p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-2 flex items-center justify-between gap-2">
                                            {poll.question}
                                            {(poll.is_voted === 1 || votedPolls.has(poll.poll_id)) && (
                                                <CheckCircle className="h-4 w-4 text-[#b56bbc] shrink-0" />
                                            )}
                                        </h3>


                                        {/* Show voted status */}
                                        {/* {(poll.is_voted === 1 || votedPolls.has(poll.poll_id)) && (
                                            <p className="flex items-center space-x-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent text-sm mb-3">
                                                <CheckCircle className="h-4 w-4 text-[#b56bbc]" />
                                            
                                            </p>
                                        )} */}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                {poll.created_by && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="flex items-center space-x-2">
                                                            <img
                                                                src={poll.user_img}
                                                                alt={poll.user_name}
                                                                className="w-6 h-6 rounded-full object-cover"
                                                            />
                                                            <span>{poll.user_name}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Show different button text based on poll ownership and vote status */}
                                            {poll.user_id !== parseInt(userId || "") ? (
                                                (poll.is_voted === 1 || votedPolls.has(poll.poll_id)) ? (
                                                    <button
                                                        onClick={() => handlePollClick(poll, false)}
                                                        className="flex items-center space-x-2 text-sm font-medium transition-colors group" >
                                                        <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                                            View Results
                                                        </span>
                                                        <Eye className="w-4 h-4 text-[#b56bbc] transition-colors" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePollClick(poll, false)}
                                                        className="flex items-center space-x-2 text-sm font-medium transition-colors group"
                                                    >
                                                        <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                                            Vote Now
                                                        </span>
                                                        <ArrowRight className="h-4 w-4 text-[#7a71c4] transition-colors" />
                                                    </button>

                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handlePollClick(poll, false)}
                                                    className="flex items-center space-x-2 text-sm font-medium transition-colors group" >
                                                    <span className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                                                        View Results
                                                    </span>
                                                    <Eye className="w-4 h-4 text-[#b56bbc] transition-colors" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        )
    }

    return (
        <div className="text-white min-h-screen mb-22">
            <header className="flex justify-between items-center p-4 pt-8 mb-2">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Polls</h1>
                        <p className="text-sm text-white/60">Vote and explore what others think</p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="all-polls" className="w-full">
                <div className="px-4 mb-4">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent">
                        <TabsTrigger
                            value="all-polls"
                            className="data-[state=active]:bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] transition-colors duration-200"
                        >
                            All Polls
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-polls"
                            className="data-[state=active]:bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] transition-colors duration-200"
                        >
                            My Polls
                            {/* ({userPollCount}/3) */}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all-polls">{renderPollList(allPolls)}</TabsContent>
                {/* Loading more indicator */}
                {pollsLoading && !initialLoad && currentTab === "all-polls" && (
                    <div className="flex justify-center py-8">
                        <div className="space-y-6">
                            {[...Array(2)].map((_, index) => (
                                <PollCardSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Intersection observer target - only show for all-polls tab */}
                {hasMore && !pollsLoading && currentTab === "all-polls" && (
                    <div ref={observerRef} className="h-4 w-full" />
                )}
                <TabsContent value="my-polls">
                    <div className="px-4 mb-4">
                        <div className="flex justify-end">
                            <div className="relative">
                                <button
                                    onClick={() => setIsMyPollsDropdownOpen(!isMyPollsDropdownOpen)}
                                    className="flex items-center space-x-2 bg-[#2b2b2b] px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    <span>
                                        {myPollsTab === "active" ? "Active" : "Closed"}
                                        {!myPollsLoading && ` (${myPollsTab === "active" ? activePolls.length : closedPolls.length})`}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isMyPollsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isMyPollsDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#2b2b2b] border border-white/10 rounded-lg shadow-lg z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setMyPollsTab("active")
                                                    setIsMyPollsDropdownOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${myPollsTab === "active"
                                                    ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                Active {!myPollsLoading && `(${activePolls.length})`}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMyPollsTab("closed")
                                                    setIsMyPollsDropdownOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${myPollsTab === "closed"
                                                    ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                Closed {!myPollsLoading && `(${closedPolls.length})`}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Show skeleton loading until myPollsLoading is false */}
                    {myPollsLoading ? (
                        <div className="space-y-6 px-4">
                            {[...Array(3)].map((_, index) => (
                                <PollCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        myPollsTab === "active" ? renderPollList(activePolls, true) : renderPollList(closedPolls, true)
                    )}
                </TabsContent>
            </Tabs>

            {/* Poll Detail Modal */}
            {selectedPoll && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1f1f21] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white ml-2">
                                    {currentTab === "my-polls" ? 'Poll Results' : 'Vote on Poll'}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {/* Delete button inside modal for My Polls */}
                                    {currentTab === "my-polls" && (
                                        <button
                                            onClick={() => setShowDeleteConfirm(selectedPoll.poll_id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete Poll"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedPoll(null)}
                                        className="p-2"
                                    >
                                        <X size={20} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Rest of the modal content remains the same */}
                            <div className="space-y-4">
                                <div>
                                    {selectedPoll.created_by && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                                            <User className="h-4 w-4" />
                                            <span>{currentTab === "my-polls" ? 'Created by you' : 'Requested by'}</span>
                                            {currentTab !== "my-polls" && (
                                                <span className="flex items-center space-x-2">
                                                    <img
                                                        src={selectedPoll.created_by.imgname}
                                                        alt={selectedPoll.created_by.name}
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                    <span>{selectedPoll.created_by.name}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <h3 className="text-lg font-semibold text-white mb-2">{selectedPoll.question}</h3>
                                    {currentTab === "my-polls" && selectedPoll.total_votes !== undefined && (
                                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-4 w-4" />
                                                <span>{selectedPoll.total_votes} total votes</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-md font-medium text-white mb-3">
                                        {currentTab === "my-polls" || selectedPoll.user_id === parseInt(userId || "") ? 'Poll Results:' : 'Choose a movie:'}
                                    </h4>
                                    {renderMovieOptions(selectedPoll, true, currentTab === "my-polls")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1f1f21] rounded-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Delete Poll</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete this poll? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-[#2b2b2b] text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deletePoll(showDeleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {userPollCount < 3 ? (
                <motion.button
                    className="fixed bottom-10 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] flex items-center justify-center shadow-lg z-40"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setShowCreatePollDialog(true);
                        setIsOpen(false);
                    }}
                >
                    <Plus className="w-6 h-6 text-white" />
                </motion.button>
            ) : (
                <motion.button
                    className="fixed bottom-10 right-4 w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center shadow-lg z-40 cursor-not-allowed"
                    onClick={() => toast.error('You can only create 3 polls maximum')}
                >
                    <Plus className="w-6 h-6 text-gray-400" />
                </motion.button>
            )}

            <CreatePollDialog
                isOpen={showCreatePollDialog}
                onClose={() => setShowCreatePollDialog(false)}
            />
            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />

        </div>
    )
}