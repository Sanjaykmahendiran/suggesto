"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ThumbsUp, ThumbsDown, X, Star, Trash2 } from "lucide-react"
import CastLoading from "./_components/loading"
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { BottomNavigation } from "@/components/bottom-navigation"

interface MovieDetail {
    movie_id: number
    movie_code: string
    is_tmdb: number
    title: string
    overview: string
    poster_path: string
    backdrop_path: string
    video: string
    release_date: string
    rating: string
    sug_ratings: string | null
    language: string
    popularity: string
    tagline: string
    revenue: string
}

interface Role {
    role_id: number
    role_name: string
    person_id: number
    actor_name: string
    image_path: string
}

interface FanCastSuggestion {
    is_user_suggest: number
    suggested_by: number
    suggestion_id: number
    person_id: number
    actor_name: string
    image_path: string
    fan_votes: number
}


interface SearchResult {
    person_id: number
    name: string
    role: string
    image_path: string
    tmdb_id: number
    created_date: string
}

export default function SuggestCastApp() {
    const userId = Cookies.get("userID") || ""
    const searchParams = useSearchParams()
    const movieId = searchParams.get('movie_id') || '1'
    const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null)
    const [roles, setRoles] = useState<Role[]>([])
    const [activeRoleId, setActiveRoleId] = useState<number | null>(null)
    const [fanMostCastSuggestions, setMostFanCastSuggestions] = useState<FanCastSuggestion[]>([])
    const [fanSuggestions, setFanSuggestions] = useState<FanCastSuggestion[]>([])
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [actorSearch, setActorSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const [error, setError] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)

    // Fetch movie details
    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                const response = await fetch('https://suggesto.xyz/App/api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gofor: "moviedetail",
                        movie_id: movieId
                    })
                })
                const data = await response.json()
                if (data.status === 'success') {
                    setMovieDetail(data.data)
                }
            } catch (err) {
                console.error('Error fetching movie details:', err)
                setError('Failed to load movie details')
            }
        }

        fetchMovieDetail()
    }, [movieId])

    // Fetch roles/cast list
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movcastlist&movie_id=${movieId}`)
                const data = await response.json()
                if (data.status === 'success') {
                    setRoles(data.data)
                    if (data.data.length > 0 && !activeRoleId) {
                        setActiveRoleId(data.data[0].role_id)
                    }
                }
            } catch (err) {
                console.error('Error fetching roles:', err)
                setError('Failed to load cast roles')
            } finally {
                setLoading(false)
            }
        }

        fetchRoles()
    }, [movieId])

    // Fetch fan cast suggestions for active role
    useEffect(() => {
        if (!activeRoleId) return

        const fetchMostFanCastSuggestions = async () => {
            try {
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=mostfansug&role_id=${activeRoleId}`)
                const data = await response.json()
                if (data.status === 'success') {
                    setMostFanCastSuggestions(data.data || [])
                }
            } catch (err) {
                console.error('Error fetching fan cast suggestions:', err)
            }
        }

        fetchMostFanCastSuggestions()
    }, [activeRoleId])

    // Fetch fan suggestions list for active role
    useEffect(() => {
        if (!activeRoleId) return

        const fetchFanSuggestions = async () => {
            try {
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=fancastlist&role_id=${activeRoleId}&user_id=${userId}`)
                const data = await response.json()
                console.log('Fan suggestions response:', data) // Debug log
                if (data.status === 'success') {
                    setFanSuggestions(data.data.suggestions || [])
                }
            } catch (err) {
                console.error('Error fetching fan suggestions:', err)
            }
        }

        fetchFanSuggestions()
    }, [activeRoleId])

    // Search for actors (only after 3+ characters)
    useEffect(() => {
        if (actorSearch.trim().length < 3) {
            setSearchResults([])
            setShowDropdown(false)
            return
        }

        const searchActors = async () => {
            setSearchLoading(true)
            try {
                const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=searchpeople&searchtext=${encodeURIComponent(actorSearch)}`)
                const data = await response.json()
                setSearchResults(data || [])
                setShowDropdown(true)
            } catch (err) {
                console.error('Error searching actors:', err)
                setSearchResults([])
                setShowDropdown(false)
            } finally {
                setSearchLoading(false)
            }
        }

        const timeoutId = setTimeout(searchActors, 300) // Debounce search
        return () => clearTimeout(timeoutId)
    }, [actorSearch])

    const handleVote = async (suggestionId: number, voteType: 'up' | 'down') => {
        console.log('Voting for suggestion:', suggestionId, 'with vote type:', voteType) // Debug log

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "votefancast",
                    user_id: userId,
                    suggestion_id: suggestionId,
                    vote_type: voteType
                })
            })
            const data = await response.json()
            console.log('Vote response:', data) // Debug log

            if (data.status === 'success') {
                // Refresh both most fan cast suggestions and fan suggestions
                const refreshMostResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=mostfansug&role_id=${activeRoleId}`)
                const refreshMostData = await refreshMostResponse.json()
                if (refreshMostData.status === 'success') {
                    setMostFanCastSuggestions(refreshMostData.data || [])
                }

                const refreshFanResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=fancastlist&role_id=${activeRoleId}&user_id=${userId}`)
                const refreshFanData = await refreshFanResponse.json()
                if (refreshFanData.status === 'success') {
                    setFanSuggestions(refreshFanData.data.suggestions || [])
                }
            }
        } catch (err) {
            console.error('Error voting:', err)
        }
    }

    const handleAddSuggestion = async (personId: number) => {
        // Check if this person is already suggested for this role
        const isAlreadySuggested = fanSuggestions.some(suggestion =>
            suggestion.person_id === personId
        );

        if (isAlreadySuggested) {
            toast.error("This actor has already been suggested for this role");
            return;
        }

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "addfancast",
                    user_id: userId,
                    movie_id: parseInt(movieId),
                    role_id: activeRoleId,
                    person_id: personId
                })
            })
            const data = await response.json()
            if (data.status === 'success') {
                toast.success(data.message)
                // Refresh both suggestions lists
                const refreshMostResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=mostfansug&role_id=${activeRoleId}`)
                const refreshMostData = await refreshMostResponse.json()
                if (refreshMostData.status === 'success') {
                    setMostFanCastSuggestions(refreshMostData.data || [])
                }

                const refreshFanResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=fancastlist&role_id=${activeRoleId}&user_id=${userId}`)
                const refreshFanData = await refreshFanResponse.json()
                if (refreshFanData.status === 'success') {
                    setFanSuggestions(refreshFanData.data.suggestions || [])
                }

                setActorSearch("")
                setSearchResults([])
                setShowDropdown(false)
                setIsModalOpen(false)
            } else {
                // Handle API error response
                toast.error(data.message || "Failed to add suggestion")
            }
        } catch (err) {
            console.error('Error adding suggestion:', err)
            toast.error("An error occurred while adding the suggestion")
        }
    }

    const handleDeleteSuggestion = async (suggestionId: number) => {
        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=deletefansug&suggestion_id=${suggestionId}`
            );

            const data = await response.json();

            if (data.response === "Fan Cast Suggestion Deleted") {
                toast.success("Suggestion deleted successfully");

                // Refresh suggestions
                const refreshFanResponse = await fetch(
                    `https://suggesto.xyz/App/api.php?gofor=fancastlist&role_id=${activeRoleId}&user_id=${userId}`
                );
                const refreshFanData = await refreshFanResponse.json();
                if (refreshFanData.status === "success") {
                    setFanSuggestions(refreshFanData.data.suggestions || []);
                }

                // Also refresh most fan cast suggestions
                const refreshMostResponse = await fetch(
                    `https://suggesto.xyz/App/api.php?gofor=mostfansug&role_id=${activeRoleId}`
                );
                const refreshMostData = await refreshMostResponse.json();
                if (refreshMostData.status === "success") {
                    setMostFanCastSuggestions(refreshMostData.data || []);
                }
            } else {
                toast.error(data.response || "Failed to delete suggestion");
            }
        } catch (err) {
            console.error("Error deleting suggestion:", err);
            toast.error("An error occurred while deleting the suggestion");
        }
    };


    const handleSelectFromDropdown = (person: SearchResult) => {
        // Check if already suggested - if so, don't do anything and show toast
        const isAlreadySuggested = fanSuggestions.some(suggestion =>
            suggestion.person_id === person.person_id
        );

        if (isAlreadySuggested) {
            toast.error("This actor has already been suggested for this role");
            return;
        }

        setActorSearch(person.name)
        setShowDropdown(false)
    }

    const computeTotalVotesForRole = () => {
        return fanSuggestions.reduce((sum, suggestion) => sum + (suggestion.fan_votes || 0), 0)
    }

    const activeRole = roles.find((r) => r.role_id === activeRoleId)
    const totalVotesForRole = computeTotalVotesForRole()
    const sortedFanSuggestions = [...fanSuggestions].sort((a, b) => (b.fan_votes || 0) - (a.fan_votes || 0))

    // Helper function to render suggestion item
    const renderSuggestionItem = (suggestion: FanCastSuggestion, index: number, isYourSuggestion: boolean = false) => {
        const percentage = totalVotesForRole
            ? Math.round(((suggestion.fan_votes || 0) * 100) / totalVotesForRole)
            : 0;

        const isTopVoted = index === 0 && suggestion.fan_votes > 0; // Only if it has votes
        const isUserSuggestion = suggestion.is_user_suggest === 1;

        return (
            <motion.div
                key={`${isYourSuggestion ? 'your' : 'fan'}-suggestion-${suggestion.suggestion_id}`}
                className={`rounded-xl p-3 shadow flex items-center gap-4 mb-8       relative overflow-hidden ${isTopVoted
                    ? 'bg-gradient-to-r from-amber-500/20 via-[#2b2b2b] to-[#2b2b2b] border-2 border-amber-400/50 shadow-lg shadow-amber-500/20'
                    : 'bg-[#2b2b2b]'
                    } ${isUserSuggestion ? 'border-l-4 border-[#ff7db8]' : ''}`}
                initial={{ scale: isTopVoted ? 1.02 : 1 }}
                animate={{ scale: isTopVoted ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Trash icon for user suggestions */}
                {/* Trash icon for user suggestions (always show, even if top voted) */}
                {isUserSuggestion && (
                    <button
                        onClick={() => handleDeleteSuggestion(suggestion.suggestion_id)}
                        className={`absolute ${isTopVoted ? "top-10" : "top-2"} right-2  p-1.5 rounded-full 
                   bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 
                   hover:border-red-500/50 transition-all duration-200 z-10`}
                        title="Delete suggestion"
                    >
                        <Trash2 size={12} className="text-red-400" />
                    </button>
                )}


                {/* Ranking badge for top voted */}
                {isTopVoted && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg">
                        #Top Voted
                    </div>
                )}

                <div className="relative">
                    <img
                        src={suggestion.image_path || "/placeholder.svg"}
                        alt={suggestion.actor_name}
                        className={`rounded-full object-cover ${isTopVoted ? 'w-16 h-16 ring-2 ring-amber-400' : 'w-12 h-12'
                            }`}
                    />
                </div>

                <div className="flex-1">
                    <div className="font-medium text-white flex items-center gap-2 text-sm">
                        {suggestion.actor_name}
                    </div>

                    <div className={`${isTopVoted ? "w-[80%]" : "w-full"} mt-2`}>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-2 rounded-full ${isTopVoted
                                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'
                                    : 'bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b]'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <div className={isTopVoted ? 'text-amber-300 font-semibold' : ''}>
                                {suggestion.fan_votes || 0} votes
                            </div>
                            <div className={isTopVoted ? 'text-amber-300 font-semibold' : ''}>
                                {percentage}%
                            </div>
                        </div>
                    </div>

                </div>

                {/* Voting buttons - only show for non-user suggestions */}
                {!isUserSuggestion && (
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleVote(suggestion.suggestion_id, "up")}
                                className={`p-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${isTopVoted
                                    ? 'bg-gradient-to-br from-green-400/90 to-green-600/70 hover:from-green-500 hover:to-green-700'
                                    : 'bg-gradient-to-br from-green-500/80 to-green-700/60'
                                    }`}
                                title="Thumbs Up">
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleVote(suggestion.suggestion_id, "down")}
                                className={`p-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${isTopVoted
                                    ? 'bg-gradient-to-br from-red-400/70 to-red-600/60 hover:from-red-500 hover:to-red-700'
                                    : 'bg-gradient-to-br from-red-500/60 to-red-700/60'
                                    }`}
                                title="Thumbs Down">
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }

    if (loading) {
        return (
            <CastLoading />
        )
    }

    if (error) {
        return (
            <div className="bg-[#121212] text-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400">{error}</div>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#121212] text-gray-100 min-h-screen">
            <div className="mx-auto min-h-screen p-4">
                {/* Header */}
                <header className="flex items-center gap-3 mb-6 pt-6">
                    {/* Back Button */}
                    <button
                        className="p-2 rounded-full bg-[#2b2b2b] hover:bg-gray-700"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft size={20} className="text-gray-200" />
                    </button>

                    {/* Title + Subtitle */}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-white">Suggest Cast</h1>
                        <p className="text-xs text-gray-400">Pick a role → add or vote fan-cast</p>
                    </div>
                </header>

                {/* Movie card */}
                {movieDetail && (
                    <div className="bg-[#1f1f1f] rounded-2xl p-3 shadow-lg mb-4 flex items-start gap-4 ">
                        {/* Poster */}
                        <img
                            src={movieDetail.poster_path ? `https://suggesto.xyz/App/${movieDetail.poster_path}` : ''}
                            alt="poster"
                            className="w-20 h-28 rounded-lg object-cover shadow-md"
                        />

                        {/* Details */}
                        <div className="flex-1">
                            {/* Title + Year */}
                            <div className="text-lg font-semibold text-white">
                                {movieDetail.title}
                                <span className="text-sm text-gray-300 ml-2">
                                    • {new Date(movieDetail.release_date).getFullYear()}
                                </span>
                            </div>

                            {/* Rating + Language */}
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                                    <span className="text-yellow-400"><Star className="w-4 h-4" /></span>
                                    <span className="text-sm text-yellow-300">{parseFloat(movieDetail.rating).toFixed(1)}</span>
                                </div>
                                <span className="text-sm text-gray-300">{movieDetail.language.toUpperCase()}</span>
                            </div>

                            {/* Tagline */}
                            {movieDetail.tagline && (
                                <div className="text-sm text-gray-200 mt-2 italic border-l-2 border-gray-600 pl-2">
                                    "{movieDetail.tagline}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Role thumbnails */}
                <div className="relative mb-6">
                    {/* Left Heading */}
                    <h3 className="text-xl font-semibold text-white mb-2">Casts</h3>

                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 py-1">
                        {roles.map((role) => {
                            const isActive = role.role_id === activeRoleId
                            const totalVotes = isActive ? totalVotesForRole : 0

                            // Check if user has suggestions for this role
                            const hasUserSuggestions = fanSuggestions.some(s => s.is_user_suggest === 1)

                            return (
                                <div key={role.role_id} className="flex flex-col items-center">
                                    <div
                                        className={`relative flex-shrink-0 w-28 snap-center p-2 rounded-lg text-center shadow-sm cursor-pointer ${isActive
                                            ? "ring-2 ring-[#ff7db8] bg-[#ff7db8]/20"
                                            : "bg-[#2b2b2b]"
                                            }`}
                                        aria-pressed={isActive}
                                        onClick={() => setActiveRoleId(role.role_id)}
                                    >
                                        {/* Badge at top-right */}
                                        {isActive && (
                                            <span className="absolute top-1 right-1 inline-flex items-center px-2 py-0.5 rounded-full bg-[#ff7db8] text-white text-xs font-semibold shadow-md">
                                                {totalVotes}
                                            </span>
                                        )}

                                        {/* Wrap everything in column + center */}
                                        <div className="flex flex-col items-center">
                                            {/* Image */}
                                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2b2b2b] overflow-hidden">
                                                <img
                                                    src={role.image_path || "/placeholder.svg"}
                                                    alt={role.actor_name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>

                                            {/* Text */}
                                            <div className="mt-2 text-center space-y-1 w-full max-w-[100px]">
                                                <div
                                                    className="text-xs font-medium text-white truncate"
                                                    title={role.role_name}
                                                >
                                                    {role.role_name}
                                                </div>
                                                <div
                                                    className="text-xs text-gray-300 truncate"
                                                    title={role.actor_name}
                                                >
                                                    {role.actor_name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Show button only if active AND user doesn't have suggestions for this role */}
                                    {isActive && !hasUserSuggestions && (
                                        <Button
                                            onClick={() => setIsModalOpen(true)}
                                            className="mt-2 px-4 py-2 bg-[#ff7db8] hover:bg-[#a04fae] text-white rounded-lg font-medium"
                                        >
                                            Suggest
                                        </Button>
                                    )}
                                </div>

                            )
                        })}
                    </div>
                </div>

                {/* Your Suggestions list  */}
                <div className="space-y-4 mb-8">
                    {/* Your Suggestions */}
                    <h3 className="text-md font-semibold text-white mb-3">Your Suggestions</h3>
                    {sortedFanSuggestions.filter(s => s.is_user_suggest === 1).length > 0 ? (
                        <>
                            {sortedFanSuggestions
                                .filter(s => s.is_user_suggest === 1)
                                .map((suggestion, index) => renderSuggestionItem(suggestion, index, true))}
                        </>
                    ) : (
                        /* Empty state for Your Suggestions */
                        <div className="text-center text-gray-300 text-sm bg-[#2b2b2b] rounded-xl p-4">
                            You have not made any suggestions yet.
                        </div>
                    )}
                </div>

                {/* Fan Suggestions list */}
                <div className="space-y-4 mb-20">
                    {/* Fan Suggestions */}
                    {sortedFanSuggestions.filter(s => s.is_user_suggest !== 1).length > 0 && (
                        <>
                            {sortedFanSuggestions.filter(s => s.is_user_suggest === 1).length > 0 && (
                                <h3 className="text-md font-semibold text-white mb-3 mt-6">Fans Suggestions</h3>
                            )}
                            {sortedFanSuggestions
                                .filter(s => s.is_user_suggest !== 1)
                                .map((suggestion, index) => renderSuggestionItem(suggestion, index, false))}
                        </>
                    )}

                    {/* Empty state for Fan Suggestions - only show if no fan suggestions exist */}
                    {sortedFanSuggestions.filter(s => s.is_user_suggest !== 1).length === 0 &&
                        sortedFanSuggestions.filter(s => s.is_user_suggest === 1).length > 0 && (
                            <div className="text-center text-gray-300 text-sm bg-[#2b2b2b] rounded-xl p-4 mt-6">
                                <h3 className="text-md font-semibold text-white mb-3">Fans Suggestions</h3>
                                <div>No fan suggestions available yet.</div>
                            </div>
                        )}
                </div>


            </div>

            {/* Modal for Suggest */}
            {isModalOpen && activeRole && (
                <div
                    className="fixed inset-0 flex items-end justify-center bg-black/80 z-50 p-0"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-[#1f1f21] w-full max-w-lg h-[85vh] max-h-[600px] min-h-[400px] rounded-t-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed */}
                        <div className="flex items-center justify-between p-4  flex-shrink-0">
                            <div>
                                <div className="text-sm text-gray-300">Suggest for</div>
                                <div className="font-semibold text-white">{activeRole.role_name}</div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-300 p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Search */}
                            <div className="relative mb-4">
                                <Input
                                    type="text"
                                    placeholder="Search actor or type a name (min 3 characters)"
                                    value={actorSearch}
                                    onChange={(e) => setActorSearch(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg focus:outline-none bg-[#2b2b2b] text-gray-100"
                                />

                                {/* Dropdown */}
                                {showDropdown && actorSearch.length >= 3 && (
                                    <div className="absolute top-full left-0 right-0 bg-[#2b2b2b] rounded-lg mt-1 max-h-48 overflow-y-auto z-50 shadow-lg border border-gray-600">
                                        {searchLoading ? (
                                            <div className="p-3 space-y-3">
                                                {[...Array(3)].map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 animate-pulse"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 w-32 bg-gray-700 rounded"></div>
                                                            <div className="h-2 w-20 bg-gray-700 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((person) => {
                                                const isAlreadySuggested = fanSuggestions.some(suggestion =>
                                                    suggestion.person_id === person.person_id
                                                );
                                                
                                                return (
                                                    <div
                                                        key={person.person_id}
                                                        onClick={() => handleSelectFromDropdown(person)}
                                                        className={`flex items-center gap-3 p-3 border-b border-gray-600 last:border-b-0 transition-all duration-200 ${isAlreadySuggested
                                                                ? 'cursor-not-allowed bg-red-500/10'
                                                                : 'cursor-pointer hover:bg-gray-700/50'
                                                            }`}
                                                    >
                                                        <div className="relative flex-shrink-0">
                                                            <img
                                                                src={person.image_path || "/placeholder.svg"}
                                                                alt={person.name}
                                                                className={`w-10 h-10 rounded-full object-cover ${isAlreadySuggested ? 'grayscale' : ''
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-medium truncate flex items-center gap-2 ${isAlreadySuggested ? 'text-gray-500' : 'text-white'
                                                                }`}>
                                                                {person.name}
                                                                {isAlreadySuggested && (
                                                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 flex-shrink-0">
                                                                        Already suggested
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`text-xs truncate ${isAlreadySuggested ? 'text-gray-500' : 'text-gray-400'
                                                                }`}>
                                                                {person.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-3 text-center text-gray-400">
                                                No results found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Picks */}
                            <div className="text-xs text-gray-300 mb-3">Quick picks</div>
                            <div className="flex gap-2 flex-wrap mb-6">
                                {fanMostCastSuggestions.length > 0 ? (
                                    fanMostCastSuggestions
                                        .filter(suggestion =>
                                            !fanSuggestions.some(fs => fs.person_id === suggestion.person_id)
                                        )
                                        .slice(0, 6) // show top 6 only
                                        .map((suggestion) => (
                                            <button
                                                key={suggestion.person_id}
                                                onClick={() => setActorSearch(suggestion.actor_name)}
                                                className="px-3 py-2 text-xs rounded-full bg-[#2b2b2b] text-gray-200 hover:bg-gray-700 transition-colors"
                                            >
                                                {suggestion.actor_name}
                                            </button>
                                        ))
                                ) : (
                                    <span className="text-gray-500 text-sm">No quick picks available</span>
                                )}
                            </div>
                        </div>

                        {/* Actions - Fixed at bottom */}
                        <div className="flex gap-2 p-4 pt-2 flex-shrink-0 bg-[#1f1f21] ">
                            <Button
                                onClick={() => setIsModalOpen(false)}
                                variant="outline"
                                className="flex-1 px-4 py-2 rounded-lg border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const selectedPerson = searchResults.find(
                                        (person) =>
                                            person.name.toLowerCase() === actorSearch.toLowerCase()
                                    );

                                    if (selectedPerson) {
                                        handleAddSuggestion(selectedPerson.person_id);
                                    } else {
                                        toast.error("Please select an actor from the search results");
                                    }
                                }}
                                disabled={
                                    !actorSearch.trim() ||
                                    searchResults.length === 0 ||
                                    searchResults.some(person =>
                                        person.name.toLowerCase() === actorSearch.toLowerCase() &&
                                        fanSuggestions.some(suggestion => suggestion.person_id === person.person_id)
                                    )
                                }
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {searchResults.some(person =>
                                    person.name.toLowerCase() === actorSearch.toLowerCase() &&
                                    fanSuggestions.some(suggestion => suggestion.person_id === person.person_id)
                                ) ? 'Already Suggested' : 'Suggest'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* <BottomNavigation currentPath="/suggestions-page" /> */}
        </div>
    )
}
