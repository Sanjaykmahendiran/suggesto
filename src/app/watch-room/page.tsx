"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Users, Film, ChevronRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import NotFound from "@/components/notfound"
import WatchRoomNotFound from "@/assets/not-found-watchroom.png"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import { WatchRoomAPIResponse, Room, Friend, CreateRoomPayload, FriendsAPIResponse } from "@/app/watch-room/type"
import toast from "react-hot-toast"
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from "@/components/coin-animation"

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <div className="px-4">
        <Skeleton className="h-12 w-full rounded-lg bg-[#2b2b2b] mb-6" />

        {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-lg bg-[#2b2b2b] mb-4" />
        ))}
    </div>
)

export default function WatchRoomPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])
    const [friends, setFriends] = useState<Friend[]>([])
    const [newRoomName, setNewRoomName] = useState("")
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const { user, setUser } = useUser()
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [coinsEarned, setCoinsEarned] = useState(0)

    const userId = Cookies.get('userID') || ''

    // Fetch watch rooms list
    const fetchWatchRooms = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchroomlist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch watch rooms')

            const roomsData: WatchRoomAPIResponse[] = await response.json()

            // Transform API response to match our Room type
            const transformedRooms: Room[] = roomsData.map(room => {
                // Find if current user is creator
                const currentUserMember = room.members.find(member => member.user_id.toString() === userId);
                const isCreator = currentUserMember ? currentUserMember.is_creator : false;

                return {
                    id: room.room_id.toString(),
                    name: room.room_name,
                    is_creator: isCreator,
                    members: room.members.map(member => member.user_id.toString()),
                    friends: room.members
                        .filter(member => member.user_id.toString() !== userId)
                        .map(member => ({
                            image: member.image,
                            friend_id: Number(member.user_id),
                            name: member.name,
                            profile_pic: member.image,
                            joined_date: room.created_date,
                            genre: "",
                            friends_count: 0,
                            watchlist_count: 0,
                            is_starred: 0,
                            is_creator: member.is_creator
                        })),
                    suggestedMovies: [],
                    created_date: room.created_date,
                    member_count: room.members.length,
                    movie_count: room.movie_count
                }
            })

            setRooms(transformedRooms)
        } catch (error) {
            console.error('Error fetching watch rooms:', error)
            toast.error('Failed to load watch rooms')
        }
    }

    // Fetch friends list
    const fetchFriends = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch friends')
            const friendsResponse: FriendsAPIResponse = await response.json() // Changed this line
            setFriends(friendsResponse.data) // Changed this line - use .data property
        } catch (error) {
            console.error('Error fetching friends:', error)
            toast.error('Failed to load friends list')
        }
    }

    // Create new watch room
    // Create new watch room
    const createWatchRoom = async (payload: CreateRoomPayload) => {
        try {
            setIsCreatingRoom(true)
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to create room')
            const result = await response.json()

            // Fixed: Check for coins_earned and trigger animation
            if (result.coins_earned && result.coins_earned > 0) {
                setCoinsEarned(result.coins_earned)
                setShowCoinAnimation(true)
            }

            // Refresh the rooms list after creating a new room
            await fetchWatchRooms()

            return result
        } catch (error) {
            console.error('Error creating room:', error)
            throw error
        } finally {
            setIsCreatingRoom(false)
        }
    }

    useEffect(() => {
        const initializeData = async () => {
            if (userId) {
                setIsLoading(true)
                try {
                    // Fetch both rooms and friends concurrently
                    await Promise.all([
                        fetchWatchRooms(),
                        fetchFriends()
                    ])
                } catch (error) {
                    console.error('Error initializing data:', error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                toast.error('User not logged in')
                setIsLoading(false)
            }
        }

        initializeData()
    }, [userId])

    const handleCreateRoom = async () => {
        if (rooms.length >= 5) {
            toast.error("You can only create up to 5 rooms")
            return
        }

        if (!newRoomName.trim()) {
            toast.error("Please enter a room name")
            return
        }

        if (selectedFriends.length === 0) {
            toast.error("Please select at least one friend")
            return
        }

        if (selectedFriends.length > 5) {
            toast.error("You can only invite up to 5 friends")
            return
        }

        try {
            const memberIds = selectedFriends.map(friend => parseInt(friend.friend_id.toString()))
            memberIds.push(parseInt(userId))

            const payload: CreateRoomPayload = {
                gofor: "watchroom",
                creator_id: parseInt(userId),
                room_name: newRoomName,
                members: memberIds
            }

            await createWatchRoom(payload)

            // Reset form
            setNewRoomName("")
            setSelectedFriends([])
            setShowCreateDialog(false)
        } catch (error) {
            toast.error("Failed to create room. Please try again.")
        }
    }

    const toggleFriendSelection = (friend: Friend) => {
        if (selectedFriends.some((f) => f.friend_id === friend.friend_id)) {
            setSelectedFriends(selectedFriends.filter((f) => f.friend_id !== friend.friend_id))
        } else {
            if (selectedFriends.length < 10) {
                setSelectedFriends([...selectedFriends, friend])
            } else {
                toast.error("You can only select up to 10 friends")
            }
        }
    }

    const handleRoomClick = (room: Room) => {
        // Navigate to room detail page instead of opening popup
        router.push(`/watch-room/room-detail?room_id=${room.id}`)
    }

    const formatImageUrl = (path: string) => {
        if (!path) return "/placeholder.svg"
        if (path.startsWith('http')) return path
        return `https://suggesto.xyz/App/${path}`
    }

    const isRoomOwner = (room: Room) => {
        return room.is_creator
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

            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <div className="px-4 pb-24">
                    {/* Room List */}
                    {rooms.length === 0 ? (
                        <NotFound
                            imageSrc={WatchRoomNotFound}
                            title="No Watch Rooms"
                            description="You haven't created any watch rooms yet. Start by creating a new room to invite friends and suggest movies."
                        />
                    ) : (
                        <div className="space-y-4">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className={`rounded-lg p-4 cursor-pointer transition-colors relative ${isRoomOwner(room)
                                        ? "bg-[#2b2b2b]"
                                        : "bg-[#2b2b2b]"
                                        }`}
                                    onClick={() => handleRoomClick(room)}
                                >


                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold">
                                            {room.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {/* Owner badge */}
                                            {isRoomOwner(room) && (
                                                <span className="bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white text-xs rounded-lg px-2 py-1">
                                                    Owner
                                                </span>
                                            )}
                                            <ChevronRight size={18} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <div className="flex -space-x-2">
                                                {room.friends.slice(0, 3).map((friend, index) => (
                                                    <Avatar key={friend.friend_id} className="h-8 w-8 border border-[#1E1E2E]">
                                                        <AvatarImage
                                                            src={formatImageUrl(friend.profile_pic)}
                                                            alt={friend.name}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-gradient-to-r from-[#15F5FD] to-[#036CDA]">{friend.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                            {room.friends.length > 3 && (
                                                <span className="text-xs text-gray-400 ml-1">+{room.friends.length - 3} more</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Users size={12} />
                                                <span>{room.member_count || room.friends.length + 1}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Film size={12} />
                                                <span>{room.movie_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Floating Plus Button */}
            <motion.button
                className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#15F5FD] to-[#036CDA] flex items-center justify-center shadow-lg z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateDialog(true)}
                disabled={rooms.length >= 5 || !userId}
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>

            {/* Create Room Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="bg-[#1f1f21] border-[#121212] text-white max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle>Create a Watch Room</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Room Name</label>
                            <Input
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Enter room name"
                                className="bg-[#2b2b2b] border-[#3E3E4E]"
                                disabled={isCreatingRoom}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">
                                Invite Friends <span className="text-xs">({selectedFriends.length}/10)</span>
                            </label>

                            {friends.length === 0 ? (
                                <div className="h-[200px] rounded-md border border-[#3E3E4E] p-4">
                                    <div className="h-full flex flex-col items-center justify-center gap-3">
                                        <p className="text-gray-400 text-sm text-center">
                                            You need friends to create a watch room
                                        </p>
                                        <Link href="/friends">
                                            <Button variant="default">
                                                Add Friends First
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-[200px] rounded-md border border-[#3E3E4E] p-2">
                                    <div className="space-y-2">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.friend_id}
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFriends.some((f) => f.friend_id === friend.friend_id)
                                                    ? "bg-[2dffeb] border border-[9bffb7]"
                                                    : "hover:bg-[#2b2b2b]"
                                                    }`}
                                                onClick={() => !isCreatingRoom && toggleFriendSelection(friend)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={formatImageUrl(friend.profile_pic)}
                                                            alt={friend.name}
                                                        />
                                                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{friend.name}</span>
                                                        <span className="text-xs text-gray-400">{friend.genre}</span>
                                                    </div>
                                                </div>
                                                {selectedFriends.some((f) => f.friend_id === friend.friend_id) && (
                                                    <Badge variant="outline" className="bg-gradient-to-r from-[#15F5FD] to-[#036CDA] text-white ">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>


                        <Button
                            variant="default"
                            onClick={handleCreateRoom}
                            className="w-full"
                            disabled={isCreatingRoom || friends.length === 0}
                        >
                            {isCreatingRoom ? "Creating..." : "Create Room"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Coin Animation */}
            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />
            <BottomNavigation currentPath="/watch-room" />
        </div >

        // {/* </PageTransitionWrapper> */ }


    )
}
