"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowLeft, Users, Film, Share2, Settings, UserPlus, Plus, Search, X, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { motion } from "framer-motion"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

type Member = {
    image: any
    user_id: number
    name: string
    profile_pic?: string
}

type Movie = {
    watchlist_id: any
    status: string
    movie_id: string
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    overview: string
    language: string
    is_adult: string
    genres: string[]
    otts: {
        ott_id: number
        name: string
        logo_url: string
    }[]
}

type RoomData = {
    room_id: number
    room_name: string
    created_date: string
    members: Member[]
    is_creator: boolean
}

type Room = {
    id: string
    name: string
    creator_id: string
    members: Member[]
    suggestedMovies: Movie[]
    addedMovies: Movie[]
    created_date: string
    is_creator: boolean
    description?: string
}

type Friend = {
    image: string
    friend_id: string
    name: string
    profile_pic?: string
    joined_date: string
    genre: string
}


export default function RoomDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("room_id")
    const userId = parseInt(Cookies.get('userID') || '1')

    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [loadingMovies, setLoadingMovies] = useState(false)
    const [activeTab, setActiveTab] = useState<'planned' | 'watched'>('planned')
    const [addingMovie, setAddingMovie] = useState(false)

    // Movie selection popup states
    const [showMovieDialog, setShowMovieDialog] = useState(false)
    const [allMovies, setAllMovies] = useState<Movie[]>([])
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loadingAllMovies, setLoadingAllMovies] = useState(false)

    // Room management states
    const [showManageDialog, setShowManageDialog] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false)
    const [managementMode, setManagementMode] = useState<'add' | 'remove'>('add')
    const [friendSearchQuery, setFriendSearchQuery] = useState("")

    // Fetch room details
    const fetchRoomDetails = async () => {
        if (!roomId) {
            setError("No room ID provided")
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            // Fetch all rooms for the user to find the specific room
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchroomlist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch room list')

            const roomsData: RoomData[] = await response.json()

            // Find the specific room by ID
            const roomData = roomsData.find(r => r.room_id.toString() === roomId)

            if (!roomData) {
                setError("Room not found")
                setLoading(false)
                return
            }

            // Transform the API data to match our Room type
            const transformedRoom: Room = {
                id: roomData.room_id.toString(),
                name: roomData.room_name,
                creator_id: roomData.is_creator ? userId.toString() : roomData.members.find(m => m.user_id !== userId)?.user_id.toString() || '',
                members: roomData.members,
                suggestedMovies: [],
                addedMovies: [],
                created_date: roomData.created_date,
                is_creator: roomData.is_creator,
                description: `Created on ${new Date(roomData.created_date).toLocaleDateString()}`
            }

            setRoom(transformedRoom)

            // Fetch both suggested and added movies
            await Promise.all([
                fetchRoomMovies(roomId),
                fetchAddedMovies(roomId)
            ])

        } catch (err) {
            console.error("Error fetching room details:", err)
            setError("Failed to load room details")
        } finally {
            setLoading(false)
        }
    }

    // Fetch friends list
    const fetchFriends = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch friends')
            const friendsData: Friend[] = await response.json()
            setFriends(friendsData)
        } catch (error) {
            console.error('Error fetching friends:', error)
            setError('Failed to load friends list')
        }
    }

    // Fetch suggested movies (existing API)
    const fetchRoomMovies = async (roomId: string) => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchroommovies&room_id=${roomId}`)
            if (!response.ok) throw new Error('Failed to fetch suggested movies')
            const moviesData: Movie[] = await response.json()

            setRoom(prevRoom => prevRoom ? { ...prevRoom, suggestedMovies: moviesData } : null)
        } catch (error) {
            console.error('Error fetching suggested movies:', error)
        }
    }

    // Fetch added movies (new API)
    const fetchAddedMovies = async (roomId: string) => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchromovlist&room_id=${roomId}`)
            if (!response.ok) throw new Error('Failed to fetch added movies')
            const moviesData: Movie[] = await response.json()

            setRoom(prevRoom => prevRoom ? { ...prevRoom, addedMovies: moviesData } : null)
        } catch (error) {
            console.error('Error fetching added movies:', error)
        }
    }

    // Fetch all movies for selection
    const fetchAllMovies = async () => {
        try {
            setLoadingAllMovies(true)
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=movieslist')
            if (!response.ok) throw new Error('Failed to fetch movies list')
            const moviesData: Movie[] = await response.json()

            setAllMovies(moviesData)
            setFilteredMovies(moviesData)
        } catch (error) {
            console.error('Error fetching all movies:', error)
            setError('Failed to load movies list')
        } finally {
            setLoadingAllMovies(false)
        }
    }

    const getFilteredAvailableFriends = () => {
        if (!room) return []

        // Filter out friends who are already members of the room
        const availableFriends = friends.filter(friend => {
            // Convert both IDs to strings for comparison to avoid type mismatch
            const friendId = friend.friend_id.toString()
            const isAlreadyMember = room.members.some(member =>
                member.user_id.toString() === friendId
            )
            return !isAlreadyMember
        })

        // Apply search filter if there's a search query
        if (!friendSearchQuery.trim()) {
            return availableFriends
        }

        return availableFriends.filter(friend =>
            friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
        )
    }

    const getFilteredRoomFriends = () => {
        if (!room) return []
        const roomFriends = room.members
            .filter(member => member.user_id !== userId)
            .map(member => ({
                image: member.image,
                friend_id: member.user_id.toString(),
                name: member.name,
                profile_pic: member.image,
                joined_date: room.created_date,
                genre: ""
            }))

        if (!friendSearchQuery.trim()) {
            return roomFriends
        }

        return roomFriends.filter(friend =>
            friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
        )
    }

    // Update room members (add/remove)
    const addMembersToRoom = async (userIds: number[]) => {
        try {
            setIsUpdatingRoom(true)
            const payload = {
                gofor: "addwatchmembers",
                room_id: parseInt(room!.id),
                user_ids: userIds
            }

            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to add members')
            const result = await response.json()

            // Refresh the room details after updating
            await fetchRoomDetails()

            return result
        } catch (error) {
            console.error('Error adding members:', error)
            throw error
        } finally {
            setIsUpdatingRoom(false)
        }
    }

    // Remove member from watchroom
    const removeMemberFromRoom = async (userId: number) => {
        try {
            setIsUpdatingRoom(true)
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=removewatmem&room_id=${room!.id}&user_id=${userId}`)

            if (!response.ok) throw new Error('Failed to remove member')
            const result = await response.json()

            // Refresh the room details after updating
            await fetchRoomDetails()

            return result
        } catch (error) {
            console.error('Error removing member:', error)
            throw error
        } finally {
            setIsUpdatingRoom(false)
        }
    }

    // Handle manage room
    const handleManageRoom = () => {
        if (!room) return
        setSelectedFriends([])
        setError(null)
        setManagementMode('add')
        setFriendSearchQuery("")
        setShowManageDialog(true)

        // Fetch friends if not already loaded
        if (friends.length === 0) {
            fetchFriends()
        }
    }

    // Handle update room members
    const handleUpdateRoomMembers = async () => {
        if (!room || selectedFriends.length === 0) return

        try {
            const memberIds = selectedFriends.map(friend => parseInt(friend.friend_id))

            if (managementMode === "add") {
                await addMembersToRoom(memberIds)
            } else {
                // For remove, process one by one since the API only accepts single user_id
                for (const memberId of memberIds) {
                    await removeMemberFromRoom(memberId)
                }
            }

            // Reset form
            setSelectedFriends([])
            setError(null)
            setFriendSearchQuery("")
            setShowManageDialog(false)
        } catch (error) {
            setError(`Failed to ${managementMode} members. Please try again.`)
        }
    }

    // Toggle friend selection
    const toggleFriendSelection = (friend: Friend) => {
        if (selectedFriends.some((f) => f.friend_id === friend.friend_id)) {
            setSelectedFriends(selectedFriends.filter((f) => f.friend_id !== friend.friend_id))
        } else {
            if (selectedFriends.length < 10) {
                setSelectedFriends([...selectedFriends, friend])
            } else {
                setError("You can only select up to 10 friends")
            }
        }
    }

    // Get friends not in the room for adding
    const getAvailableFriends = () => {
        if (!room) return friends
        return friends.filter(friend => {
            // Convert both IDs to strings for comparison
            const friendId = friend.friend_id.toString()
            const isAlreadyMember = room.members.some(member =>
                member.user_id.toString() === friendId
            )
            return !isAlreadyMember
        })
    }

    // Get friends in the room for removing (excluding current user)
    const getRoomFriends = () => {
        if (!room) return []
        return room.members
            .filter(member => member.user_id !== userId)
            .map(member => ({
                image: member.image,
                friend_id: member.user_id.toString(),
                name: member.name,
                profile_pic: member.image,
                joined_date: room.created_date,
                genre: ""
            }))
    }

    // Filter movies based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMovies(allMovies)
        } else {
            const filtered = allMovies.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredMovies(filtered)
        }
    }, [searchQuery, allMovies])

    // Add movie to watchroom
    const addMovieToWatchroom = async (movieId: string) => {
        try {
            setAddingMovie(true)
            const payload = {
                gofor: "addwatchroommovie",
                room_id: roomId,
                member_id: userId.toString(),
                movie_id: movieId
            }

            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to add movie')

            // Refresh added movies list
            await fetchAddedMovies(roomId!)

            // Close the dialog and show success
            setShowMovieDialog(false)

        } catch (error) {
            console.error('Error adding movie:', error)
            setError('Failed to add movie')
        } finally {
            setAddingMovie(false)
        }
    }

    // Handle opening movie selection dialog
    const handleAddMovie = () => {
        setShowMovieDialog(true)
        if (allMovies.length === 0) {
            fetchAllMovies()
        }
    }

    useEffect(() => {
        fetchRoomDetails()
    }, [roomId, userId])

    const formatImageUrl = (path: string) => {
        if (path.startsWith('http')) return path
        return `https://suggesto.xyz/App/${path}`
    }

    const handleMovieClick = (movie: Movie, tab: string) => {
        const typeParam = tab === "watched" ? "watchroomwatched" : "watchroom";
        router.push(`/movie-detail-page?movie_id=${movie.movie_id}&type=${typeParam}&watromov_id=${movie.watchlist_id}`);
    };



    // Get current movies based on active tab

    const getCurrentMovies = () => {
        if (activeTab === 'planned') {
            return room ? room.addedMovies.filter(movie => movie.status === 'planned') : [];
        } else if (activeTab === 'watched') {
            return room ? room.addedMovies.filter(movie => movie.status === 'watched') : [];
        }
        return [];
    };

    const handleViewProfile = (profileId: number) => {
        router.push(`/friends/friend-profile-detail?profile_id=${profileId}`)
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen text-white fixed inset-0">
                <div className="relative ">
                    <div className="p-4 flex items-center justify-center">
                        <button className="absolute left-4 p-2" onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </button>
                        <Skeleton className="h-6 w-32 bg-gray-800" />
                    </div>

                    <div className="px-4 pb-4">
                        <Skeleton className="h-32 w-full bg-gray-800 rounded-lg mb-4" />
                    </div>
                </div>

                <div className="px-4 py-6">
                    <Skeleton className="h-8 w-48 bg-gray-800 mb-2" />
                    <Skeleton className="h-4 w-32 bg-gray-800 mb-4" />

                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-8 w-8 bg-gray-800 rounded-full" />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="aspect-[2/3] bg-gray-800 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col min-h-screen text-white">
                <div className="p-4">
                    <button className="p-2" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                    <div className="bg-red-900/30 p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-semibold mb-2">Error Loading Room</h2>
                        <p className="text-gray-300">{error}</p>
                        <Button
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!room) return null

    const memberCount = room.members.length
    const currentUser = room.members.find(m => m.user_id === userId)

    return (

        // <PageTransitionWrapper>
            <div className="flex flex-col h-screen text-white ">
                {/* Header */}
                <div className="relative ">
                    {/* Background gradient */}
                    <div className="absolute inset-0 "></div>

                    {/* Header content */}
                    <div className="relative z-10 p-4 flex items-center justify-center">
                        <button
                            className="absolute left-4 p-2 rounded-full  bg-[#292938]"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold">Watch Room</h1>
                    </div>

                    {/* Room info card with merged members section */}
                    <div className="relative z-10 px-4 pb-4">
                        <div className="bg-[#292938] rounded-xl p-4 mb-2">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-1">{room.name}</h2>
                                    {room.description && (
                                        <p className="text-gray-400 text-sm mb-2">{room.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            <span>{memberCount} members</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Film size={16} />
                                            <span>{room.suggestedMovies.length + room.addedMovies.length} movies</span>
                                        </div>
                                    </div>
                                </div>
                                {room.is_creator && (
                                    <button
                                        className="p-2 rounded-full bg-[#3E3E4E] hover:bg-[#4A4A5E] transition-colors"
                                        onClick={handleManageRoom}
                                    >
                                        <Settings size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Members section integrated */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Members ({memberCount})</h3>
                                </div>

                                {/* Show up to 5 members with photo on top, name on bottom */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {room.members.slice(0, 5).map((member) => {
                                        const isCurrentUser = member.user_id === userId
                                        const isCreator = room.is_creator && isCurrentUser

                                        return (
                                            <div
                                                key={member.user_id}
                                                onClick={() => handleViewProfile(member.user_id)}
                                                className="flex flex-col items-center gap-1 min-w-[60px] p-2"
                                            >
                                                <div className={`relative ${isCreator ? 'ring-2 ring-primary/50 rounded-full' : ''}`}>
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage
                                                            src={member.image ? formatImageUrl(member.image) : "/placeholder.svg"}
                                                            alt={member.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <AvatarFallback className="bg-[#3E3E4E] text-white">
                                                            {member.name[0]?.toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {isCreator && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                            <span className="text-xs">👑</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="text-xs text-center leading-tight max-w-[60px] truncate">
                                                    {isCurrentUser ? "You" : member.name}
                                                </span>
                                            </div>
                                        )
                                    })}

                                    {/* Show +X more if there are more than 5 members */}
                                    {memberCount > 5 && (
                                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                            <div className="h-12 w-12 bg-[#3E3E4E] rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">+{memberCount - 5}</span>
                                            </div>
                                            <span className="text-xs text-center text-gray-400">more</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 pb-6 ">
                    {/* Movies section with tabs */}
                    <div className="mb-6">
                        {/* Tab Headers - Made Full Width */}
                        <div className="flex items-center mb-4">
                            <div className="flex bg-[#292938] rounded-lg p-1 flex-1">
                                <button
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'planned'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    onClick={() => setActiveTab('planned')}
                                >
                                    Planned ({room.addedMovies.filter(movie => movie.status === 'planned').length})
                                </button>
                                <button
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'watched'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    onClick={() => setActiveTab('watched')}
                                >
                                    Watched ({room.addedMovies.filter(movie => movie.status === 'watched').length})
                                </button>
                            </div>
                        </div>

                        {/* Movies Grid */}
                        {loadingMovies ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Skeleton key={i} className="aspect-[2/3] bg-[#292938] rounded-lg" />
                                ))}
                            </div>
                        ) : getCurrentMovies().length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {getCurrentMovies().map((movie) => (
                                    <div
                                        key={movie.movie_id}
                                        className="bg-[#292938] rounded-lg overflow-hidden cursor-pointer hover:bg-[#32324A] transition-colors"
                                        onClick={() => handleMovieClick(movie, activeTab)}  // activeTab could be "watched", "planned", etc.
                                    >
                                        <div className="aspect-[2/3] relative">
                                            <Image
                                                src={formatImageUrl(movie.poster_path)}
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h5 className="font-medium text-sm line-clamp-1 mb-1">{movie.title}</h5>
                                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                                <span>{new Date(movie.release_date).getFullYear()}</span>
                                                <span className="flex items-center gap-1">
                                                    <span style={{ color: 'gold' }}>★</span>
                                                    {movie.rating}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {/* Fixed the error by checking if genres exists and is an array */}
                                                {movie.genres && Array.isArray(movie.genres) && movie.genres.slice(0, 2).map((genre, idx) => (
                                                    <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#292938] rounded-lg p-8 text-center">
                                <Film className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h4 className="font-medium mb-2">
                                    {activeTab === 'planned' ? 'No planned movies yet' : 'No watched movies yet'}
                                </h4>
                                <p className="text-sm text-gray-400 mb-4">
                                    {activeTab === 'planned'
                                        ? 'Movies you plan to watch will appear here'
                                        : 'Movies you have watched will appear here'
                                    }
                                </p>
                                {activeTab === 'planned' && (
                                    <Button
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={handleAddMovie}
                                    >
                                        Add a Movie
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Plus Button - show for both tabs */}
                <motion.button
                    className="fixed bottom-10 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddMovie}
                    disabled={addingMovie}
                >
                    <Plus className="w-6 h-6 text-white" />
                </motion.button>

                {/* Movie Selection Dialog */}
                <Dialog open={showMovieDialog} onOpenChange={setShowMovieDialog}>
                    <DialogContent className="bg-[#1E1E2E] border-[#292938] text-white max-w-md mx-auto max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Add Movie to Room</span>
                                <button
                                    onClick={() => setShowMovieDialog(false)}
                                    className="p-1 hover:bg-[#292938] rounded"
                                >
                                    <X size={16} />
                                </button>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search movies..."
                                    className="bg-[#292938] border-[#3E3E4E] pl-10"
                                />
                            </div>

                            {/* Movies List */}
                            {loadingAllMovies ? (
                                <div className="space-y-3 flex-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-2">
                                            <Skeleton className="w-12 h-16 bg-[#292938] rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 bg-[#292938] rounded" />
                                                <Skeleton className="h-3 bg-[#292938] rounded w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ScrollArea className="flex-1 pr-4 max-h-[500px] overflow-y-auto">
                                    <div className="space-y-2">
                                        {filteredMovies.map((movie) => (
                                            <div
                                                key={movie.movie_id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#292938] cursor-pointer transition-colors"
                                                onClick={() => addMovieToWatchroom(movie.movie_id)}
                                            >
                                                <div className="w-12 h-16 relative flex-shrink-0">
                                                    <Image
                                                        src={formatImageUrl(movie.poster_path)}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                                        <span className="flex items-center gap-1">
                                                            <span style={{ color: 'gold' }}>★</span>
                                                            {movie.rating}
                                                        </span>
                                                    </div>
                                                    {movie.genres && movie.genres.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            <span className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                                                                {movie.genres[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {filteredMovies.length === 0 && !loadingAllMovies && searchQuery && (
                                            <div className="text-center py-8 text-gray-400">
                                                <Film className="mx-auto h-12 w-12 mb-2" />
                                                <p>No movies found matching "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage Room Dialog */}
                <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
                    <DialogContent className="bg-[#1E1E2E] border-[#292938] text-white max-w-md mx-auto">
                        <DialogHeader>
                            <DialogTitle className="truncate">Manage Room: {room.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                            {/* Mode Selection */}
                            <div className="flex bg-[#292938] rounded-lg p-1">
                                <button
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 min-w-0 ${managementMode === 'add'
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    onClick={() => {
                                        setManagementMode('add')
                                        setSelectedFriends([])
                                        setFriendSearchQuery("")
                                        setError(null)
                                    }}
                                >
                                    <UserPlus size={16} className="flex-shrink-0" />
                                    <span className="truncate">Add Friends</span>
                                </button>
                                <button
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 min-w-0 ${managementMode === 'remove'
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    onClick={() => {
                                        setManagementMode('remove')
                                        setSelectedFriends([])
                                        setFriendSearchQuery("")
                                        setError(null)
                                    }}
                                >
                                    <UserMinus size={16} className="flex-shrink-0" />
                                    <span className="truncate">Remove Members</span>
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0 z-10" size={16} />
                                <Input
                                    value={friendSearchQuery}
                                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                                    placeholder={managementMode === 'add' ? "Search friends to add..." : "Search members to remove..."}
                                    className="bg-[#292938] border-[#3E3E4E] pl-10 pr-3 truncate"
                                />
                            </div>

                            <div className="min-w-0">
                                <label className="text-sm text-gray-400 mb-1 flex items-center block">
                                    <span className="truncate inline-block max-w-full">
                                        {managementMode === 'add' ? 'Select Friends to Add' : 'Select Members to Remove'}
                                    </span>
                                    <span className="text-xs ml-1 flex-shrink-0">({selectedFriends.length}/10)</span>
                                </label>

                                <ScrollArea className="h-[200px]  rounded-md border border-[#3E3E4E] p-2">
                                    <div className="space-y-2 pr-2">
                                        {managementMode === 'add' ?
                                            // Show available friends to add
                                            getFilteredAvailableFriends().length > 0 ? (
                                                getFilteredAvailableFriends().map((friend) => (
                                                    <div
                                                        key={`add-${friend.friend_id}`}
                                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer min-w-0 ${selectedFriends.some((f) => f.friend_id === friend.friend_id)
                                                            ? "bg-green-600/20 border border-green-600/50"
                                                            : "hover:bg-[#292938]"
                                                            }`}
                                                        onClick={() => !isUpdatingRoom && toggleFriendSelection(friend)}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                                <AvatarImage
                                                                    src={formatImageUrl(friend.profile_pic || "/placeholder.svg")}
                                                                    alt={friend.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                                                <span className="text-sm truncate whitespace-nowrap">{friend.name}</span>
                                                                {friend.genre && (
                                                                    <span className="text-xs text-gray-400 truncate whitespace-nowrap">{friend.genre}</span>
                                                                )}
                                                            </div>

                                                        </div>
                                                        {selectedFriends.some((f) => f.friend_id === friend.friend_id) && (
                                                            <Badge className="bg-green-600/20 text-green-400 border-green-600/50 ml-2 flex-shrink-0 text-xs">
                                                                Selected
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <Users className="mx-auto h-8 w-8 mb-2 flex-shrink-0" />
                                                    <p className="text-sm px-2">
                                                        {friendSearchQuery ?
                                                            <span className="break-words">No friends found matching "{friendSearchQuery}"</span> :
                                                            "No friends available to add"
                                                        }
                                                    </p>
                                                </div>
                                            )
                                            :
                                            // Show current members to remove
                                            getFilteredRoomFriends().length > 0 ? (
                                                getFilteredRoomFriends().map((friend) => (
                                                    <div
                                                        key={`remove-${friend.friend_id}`}
                                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer min-w-0 ${selectedFriends.some((f) => f.friend_id === friend.friend_id)
                                                            ? "bg-red-600/20 border border-red-600/50"
                                                            : "hover:bg-[#292938]"
                                                            }`}
                                                        onClick={() => !isUpdatingRoom && toggleFriendSelection(friend)}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                                <AvatarImage
                                                                    src={formatImageUrl(friend.profile_pic || "/placeholder.svg")}
                                                                    alt={friend.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                                                <span className="text-sm truncate">{friend.name}</span>
                                                                <span className="text-xs text-gray-400">Room Member</span>
                                                            </div>
                                                        </div>
                                                        {selectedFriends.some((f) => f.friend_id === friend.friend_id) && (
                                                            <Badge className="bg-red-600/20 text-red-400 border-red-600/50 ml-2 flex-shrink-0 text-xs">
                                                                Remove
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <Users className="mx-auto h-8 w-8 mb-2 flex-shrink-0" />
                                                    <p className="text-sm px-2">
                                                        {friendSearchQuery ?
                                                            <span className="break-words">No members found matching "{friendSearchQuery}"</span> :
                                                            "No members to remove"
                                                        }
                                                    </p>
                                                </div>
                                            )
                                        }
                                    </div>
                                </ScrollArea>
                            </div>

                            {error && <div className="text-red-400 text-sm break-words">{error}</div>}

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleUpdateRoomMembers}
                                    className={`flex-1 min-w-0 ${managementMode === 'add'
                                        ? 'bg-green-600 hover:bg-green-600/90'
                                        : 'bg-red-600 hover:bg-red-600/90'
                                        }`}
                                    disabled={isUpdatingRoom || selectedFriends.length === 0}
                                >
                                    <span className="truncate">
                                        {isUpdatingRoom ? "Updating..." :
                                            managementMode === 'add' ? "Add Selected" : "Remove Selected"
                                        }
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowManageDialog(false)}
                                    className="border-[#3E3E4E] text-gray-400 hover:bg-[#292938] flex-shrink-0"
                                    disabled={isUpdatingRoom}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        // </PageTransitionWrapper>

    )
}