"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { ArrowLeft, Users, Film, Settings, UserPlus, Plus, Search, UserMinus, Edit2, LogOut, Delete, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"
import { Movie, Room, RoomData, Friend } from "@/app/watch-room/room-detail/type"
import ManageRoomDialog from "../_components/manage-room"
import EditRoomNameDialog from "../_components/edit-room-name"
import { useTourIntegration } from "@/hooks/useTourIntegration"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import DefaultImage from "@/assets/default-user.webp"
import RoomDetailLoading from "../_components/roomdetail-loading"


export default function RoomDetailPage() {
    const { user, setUser } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("room_id")
    const userId = parseInt(typeof window !== 'undefined' ? localStorage.getItem('userID') || '' : '')

    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
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
    const [showConfirm, setShowConfirm] = useState(false);
    const [addedMoviesLoading, setAddedMoviesLoading] = useState(false)
    const [hasMoreAddedMovies, setHasMoreAddedMovies] = useState(true)
    const [addedMoviesOffset, setAddedMoviesOffset] = useState(0)
    const [addedMoviesInitialLoad, setAddedMoviesInitialLoad] = useState(true)
    const [totalAddedMoviesCount, setTotalAddedMoviesCount] = useState(0)
    const addedMoviesObserverRef = useRef<HTMLDivElement>(null)
    const [showManageDialog, setShowManageDialog] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false)
    const [showEditNameDialog, setShowEditNameDialog] = useState(false)
    const [isUpdatingRoomName, setIsUpdatingRoomName] = useState(false)
    const [currentOffset, setCurrentOffset] = useState(0)
    const [hasMoreMovies, setHasMoreMovies] = useState(true)
    const [totalMoviesCount, setTotalMoviesCount] = useState(0)

    useTourIntegration('roomDetail', [loading], !loading)

    // Fetch room details
    const fetchRoomDetails = async () => {
        if (!roomId) {
            toast.error("No room ID provided")
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
                toast.error("Room not found")
                setLoading(false)
                return
            }

            // Transform the API data to match our Room type
            const transformedRoom: Room = {
                id: roomData.room_id.toString(),
                name: roomData.room_name,
                creator_id: roomData.members.find(m => m.is_creator)?.user_id.toString() || '',  // Find actual creator
                members: roomData.members,
                suggestedMovies: [],
                addedMovies: [],
                created_date: roomData.created_date,
                is_creator: !!roomData.members.find(m => m.user_id === userId)?.is_creator,  // Check if current user is creator
                description: `Created on ${new Date(roomData.created_date).toLocaleDateString()}`
            }

            setRoom(transformedRoom)

            // Fetch both suggested and added movies
            await Promise.all([
                fetchRoomMovies(roomId),
                fetchAddedMovies(roomId, 0, false) // Updated call
            ])

        } catch (err) {
            console.error("Error fetching room details:", err)
            toast.error("Failed to load room details")
        } finally {
            setLoading(false)
        }
    }

    // Fetch friends list
    const fetchFriends = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch friends')
            const result = await response.json()

            // Extract the data array from the paginated response
            const friendsData: Friend[] = result.data || []
            setFriends(friendsData)
        } catch (error) {
            console.error('Error fetching friends:', error)
            toast.error('Failed to load friends list')
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
    // Replace the existing fetchAddedMovies function with this:
    const fetchAddedMovies = useCallback(async (roomId: string, currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setAddedMoviesLoading(true)
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchromovlist&room_id=${roomId}&limit=10&offset=${currentOffset}`)
            if (!response.ok) throw new Error('Failed to fetch added movies')

            const result = await response.json()
            const moviesData = result.data || []

            // Set total count from API response
            if (result.total_count !== undefined) {
                setTotalAddedMoviesCount(result.total_count)
            }

            setRoom(prevRoom => {
                if (!prevRoom) return null

                const updatedMovies = isLoadMore
                    ? [...prevRoom.addedMovies, ...moviesData]
                    : moviesData

                return { ...prevRoom, addedMovies: updatedMovies }
            })

            // Check if there are more movies to load
            if (moviesData.length < 10) {
                setHasMoreAddedMovies(false)
            }

            if (moviesData.length > 0) {
                setAddedMoviesOffset(currentOffset + moviesData.length)
            }

        } catch (error) {
            console.error('Error fetching added movies:', error)
        } finally {
            setAddedMoviesLoading(false)
            setAddedMoviesInitialLoad(false)
        }
    }, [])

    // Add this useEffect after your existing useEffects
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !addedMoviesLoading && hasMoreAddedMovies && !addedMoviesInitialLoad && roomId) {
                    fetchAddedMovies(roomId, addedMoviesOffset, true)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        )

        if (addedMoviesObserverRef.current) {
            observer.observe(addedMoviesObserverRef.current)
        }

        return () => observer.disconnect()
    }, [addedMoviesLoading, hasMoreAddedMovies, addedMoviesOffset, fetchAddedMovies, addedMoviesInitialLoad, roomId])

    // Fetch all movies for selection
    const fetchAllMovies = async (offset = 0, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoadingAllMovies(true)
            }

            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&limit=20&offset=${offset}`)
            if (!response.ok) throw new Error('Failed to fetch movies list')

            const result = await response.json()
            const moviesData = result.data || []

            // Set total count from API response
            if (result.total_count !== undefined) {
                setTotalMoviesCount(result.total_count)
            }

            if (isLoadMore) {
                setAllMovies(prev => [...prev, ...moviesData])
                setFilteredMovies(prev => [...prev, ...moviesData])
            } else {
                setAllMovies(moviesData)
                setFilteredMovies(moviesData)
            }

            // Check if there are more movies to load
            if (moviesData.length < 20) {
                setHasMoreMovies(false)
            }

            // Update offset for next load
            setCurrentOffset(offset + moviesData.length)

        } catch (error) {
            console.error('Error fetching all movies:', error)
            toast.error('Failed to load movies list')
        } finally {
            setLoadingAllMovies(false)
        }
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

    const handleExitRoom = async () => {
        setIsUpdatingRoom(true)

        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=leavewatroom&room_id=${room!.id}&user_id=${userId}`
            )

            if (!response.ok) throw new Error('Failed to remove member')

            const result = await response.json()

            if (result.response === 'Left Watchroom Successfully') {
                toast.success('You left the room')
                router.push('/watch-room')
            } else {
                toast.error(result.message || 'Something went wrong')
            }

            return result
        } catch (error) {
            console.error('Error removing member:', error)
            toast.error('Failed to leave the room')
        } finally {
            setIsUpdatingRoom(false)
        }
    }

    const handleDeleteRoom = async () => {
        setIsUpdatingRoom(true)

        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=removewatchroom&room_id=${room!.id}`
            )

            if (!response.ok) throw new Error('Failed to delete room')

            const result = await response.json()

            if (result.response === 'Watchroom Deleted') {
                toast.success('Watchroom Deleted Successfully')
                router.push('/watch-room')
            } else {
                toast.error(result.message || 'Something went wrong')
            }

            return result
        } catch (error) {
            console.error('Error removing member:', error)
            toast.error('Failed to delete the room')
        } finally {
            setIsUpdatingRoom(false)
        }
    }


    // Add this function with your other API functions
    const updateRoomName = async (newName: string) => {
        try {
            setIsUpdatingRoomName(true)

            const url = `https://suggesto.xyz/App/api.php?gofor=editwatchroom&room_id=${parseInt(room!.id)}&room_name=${encodeURIComponent(newName)}`

            const response = await fetch(url, {
                method: 'GET',
            })

            if (!response.ok) throw new Error('Failed to update room name')

            // Update local state
            setRoom(prevRoom => prevRoom ? { ...prevRoom, name: newName } : null)
            setShowEditNameDialog(false)
            toast.success("Room name updated successfully")

        } catch (error) {
            console.error('Error updating room name:', error)
            toast.error('Failed to update room name')
        } finally {
            setIsUpdatingRoomName(false)
        }
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
            toast.error('Failed to add movie')
        } finally {
            setAddingMovie(false)
        }
    }

    // Handle opening movie selection dialog
    const handleAddMovie = () => {
        setShowMovieDialog(true)
        if (allMovies.length === 0) {
            // Reset pagination state when opening dialog
            setCurrentOffset(0)
            setHasMoreMovies(true)
            fetchAllMovies(0, false)
        }
    }

    useEffect(() => {
        if (!showMovieDialog) {
            // Reset search and pagination when dialog closes
            setSearchQuery("")
            setCurrentOffset(0)
            setHasMoreMovies(true)
        }
    }, [showMovieDialog])

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

    const handleMovieDialogScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

        // Load more when user scrolls to bottom
        if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingAllMovies && hasMoreMovies) {
            fetchAllMovies(currentOffset, true)
        }
    }


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
        <RoomDetailLoading />
    }

    if (!room) return null

    const memberCount = room.members.length

    const handleManageRoom = () => {
        setShowManageDialog(true)
    }

    return (
        // <PageTransitionWrapper>
        <div className="text-white min-h-screen mb-22">
            {/* Header */}
            <header className="p-4 flex items-center justify-between pt-8">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Watch Room</h1>
                        <p className="text-xs text-gray-400">
                            Watch movies with friends
                        </p>
                    </div>
                </div>
                <Link href="/profile">
                    <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#15F5FD] to-[#036CDA]">
                        <div className="h-full w-full rounded-full overflow-hidden bg-black">
                            <Image
                                src={user?.imgname || DefaultImage}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </Link>
            </header>

            <div className="flex flex-col flex-1 relative">
                {/* Room info card with merged members section */}
                <div className="relative z-10 px-4 pb-4">
                    <div className="bg-[#2b2b2b] rounded-xl p-4 mb-2" data-tour-target="room-info-card">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-bold">{room.name}</h2>
                                    {room.is_creator && (
                                        <button
                                            onClick={() => setShowEditNameDialog(true)}
                                            className="p-1 rounded-full bg-[#3E3E4E] hover:bg-[#4A4A5E] transition-colors"
                                            data-tour-target="edit-room-name"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
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
                                        <span>{room.addedMovies.length} movies</span>
                                    </div>
                                </div>
                            </div>
                            {room.is_creator ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-full bg-[#3E3E4E] hover:bg-[#4A4A5E] transition-colors"
                                        onClick={handleManageRoom}
                                        data-tour-target="room-settings"
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button
                                        className="p-2 rounded-full bg-[#3E3E4E] hover:bg-[#4A4A5E] transition-colors"
                                        onClick={handleDeleteRoom}
                                        data-tour-target="delete-room"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="p-2 rounded-full bg-[#3E3E4E] hover:bg-[#4A4A5E] transition-colors"
                                    onClick={() => setShowConfirm(true)}
                                    data-tour-target="leave-room"
                                >
                                    <LogOut size={16} />
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
                                    const isCreator = Boolean(member.is_creator)

                                    return (
                                        <div
                                            key={member.user_id}
                                            onClick={() => handleViewProfile(member.user_id)}
                                            className="flex flex-col items-center gap-1 min-w-[60px] p-2"
                                        >
                                            <div className={`relative ${isCreator ? 'ring-2 ring-[#15F5FD]/50 rounded-full' : ''}`}>
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
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#15F5FD] to-[#036CDA] rounded-full flex items-center justify-center">
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
                        <div className="flex bg-[#2b2b2b] rounded-lg p-1 flex-1" data-tour-target="movie-tabs">
                            <button
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'planned'
                                    ? 'bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setActiveTab('planned')}
                                data-tour-target="planned-movies"
                            >
                                Planned ({room.addedMovies.filter(movie => movie.status === 'planned').length})
                            </button>
                            <button
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'watched'
                                    ? 'bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setActiveTab('watched')}
                                data-tour-target="watched-movies"
                            >
                                Watched ({room.addedMovies.filter(movie => movie.status === 'watched').length})
                            </button>
                        </div>
                    </div>

                    {/* Movies Grid */}
                    {loadingMovies ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="aspect-[2/3] bg-[#2b2b2b] rounded-lg" />
                            ))}
                        </div>
                    ) : getCurrentMovies().length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-tour-target="movie-grid">
                            {getCurrentMovies().map((movie, index) => (
                                <motion.div
                                    key={movie.movie_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative flex w-full h-[230px] rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => handleMovieClick(movie, activeTab)}
                                >
                                    <Image
                                        src={formatImageUrl(movie.poster_path)}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Star className="w-3 h-3 text-white" />
                                        {movie.rating}
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#2b2b2b] rounded-lg p-8 text-center">
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
                                    variant="default"
                                    onClick={handleAddMovie}
                                >
                                    Add a Movie
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {/* Loading more indicator */}
                {addedMoviesLoading && !addedMoviesInitialLoad && (
                    <div className="flex justify-center py-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map(i => (
                                <Skeleton key={i} className="aspect-[2/3] bg-[#2b2b2b] rounded-lg" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Intersection observer target */}
                {hasMoreAddedMovies && !addedMoviesLoading && getCurrentMovies().length > 0 && (
                    <div ref={addedMoviesObserverRef} className="h-4 w-full" />
                )}

                {/* End of list indicator */}
                {!hasMoreAddedMovies && !addedMoviesInitialLoad && getCurrentMovies().length > 0 && (
                    <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">You've reached the end of the list</p>
                    </div>
                )}
            </div>

            {/* Floating Plus Button - show for both tabs */}
            <motion.button
                className="fixed bottom-10 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#15F5FD] to-[#036CDA] flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddMovie}
                disabled={addingMovie}
                data-tour-target="add-movie-button"
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>

            {/* Movie Selection Dialog */}
            <Dialog open={showMovieDialog} onOpenChange={setShowMovieDialog}>
                <DialogContent className="bg-[#1f1f21] border-[#2b2b2b] text-white max-w-md mx-auto max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Add Movie to Room</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                data-tour-target="movie-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="w-full py-2 px-3 pl-10 pr-3 rounded bg-[#2b2b2b] border border-[#3E3E4E] text-white truncate focus:ring-2 focus:ring-[#15F5FD]/50 focus:border-[#15F5FD]/20 outline-none"
                            />
                        </div>

                        {/* Movies List */}
                        {loadingAllMovies ? (
                            <div className="space-y-3 flex-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-2">
                                        <Skeleton className="w-12 h-16 bg-[#2b2b2b] rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 bg-[#2b2b2b] rounded" />
                                            <Skeleton className="h-3 bg-[#2b2b2b] rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ScrollArea
                                className="flex-1 pr-4 max-h-[500px] overflow-y-auto"
                                onScrollCapture={handleMovieDialogScroll}
                            >
                                <div className="space-y-2">
                                    {filteredMovies.map((movie) => (
                                        <div
                                            key={movie.movie_id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2b2b2b] cursor-pointer transition-colors"
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
                                                        <span className="text-xs bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white px-1 py-0.5 rounded">
                                                            {movie.genres[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {loadingAllMovies && currentOffset > 0 && (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center gap-3 p-2">
                                                    <Skeleton className="w-12 h-16 bg-[#2b2b2b] rounded" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 bg-[#2b2b2b] rounded" />
                                                        <Skeleton className="h-3 bg-[#2b2b2b] rounded w-3/4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* End of list indicator */}
                                    {!hasMoreMovies && allMovies.length > 0 && (
                                        <div className="text-center py-4">
                                            <p className="text-gray-400 text-sm">No more movies to load</p>
                                        </div>
                                    )}

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
            <ManageRoomDialog
                open={showManageDialog}
                onOpenChange={setShowManageDialog}
                room={room}
                userId={userId}
                friends={friends}
                onFetchFriends={fetchFriends}
                onAddMembers={addMembersToRoom}
                onRemoveMember={removeMemberFromRoom}
            />

            {/* Edit Room Name Dialog */}
            <EditRoomNameDialog
                open={showEditNameDialog}
                onOpenChange={setShowEditNameDialog}
                currentRoomName={room?.name || ""}
                onUpdateRoomName={updateRoomName}
                isUpdating={isUpdatingRoomName}
            />

            {
                showConfirm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg text-white w-full text-center">
                            <p className="mb-4">Are you sure you want to Leave the room?</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExitRoom}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
        // </PageTransitionWrapper>

    )
}