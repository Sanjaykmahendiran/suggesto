"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PlusCircle, Users, Film, ChevronRight, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

type Friend = {
    id: string
    name: string
    imgname?: string
}

type Room = {
    id: string
    name: string
    friends: Friend[]
    suggestedMovies: Movie[]
}

type Movie = {
    id: string
    title: string
    poster: string
    year: string
    rating: string
}

export default function WatchRoomPage() {
      const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])
    const [friends, setFriends] = useState<Friend[]>([])
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [newRoomName, setNewRoomName] = useState("")
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {

        // Mock data for rooms - in a real app, this would be fetched from an API
        const mockRooms: Room[] = [
            {
                id: "1",
                name: "Weekend Movie Night",
                friends: [
                    { id: "f1", name: "Alex", imgname: "/placeholder.svg?height=40&width=40" },
                    { id: "f2", name: "Jamie", imgname: "/placeholder.svg?height=40&width=40" },
                    { id: "f3", name: "Taylor", imgname: "/placeholder.svg?height=40&width=40" },
                ],
                suggestedMovies: [
                    {
                        id: "m1",
                        title: "Inception",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "2010",
                        rating: "8.8",
                    },
                    {
                        id: "m2",
                        title: "The Matrix",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "1999",
                        rating: "8.7",
                    },
                    {
                        id: "m3",
                        title: "Interstellar",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "2014",
                        rating: "8.6",
                    },
                ],
            },
            {
                id: "2",
                name: "Sci-Fi Lovers",
                friends: [
                    { id: "f2", name: "Jamie", imgname: "/placeholder.svg?height=40&width=40" },
                    { id: "f4", name: "Morgan", imgname: "/placeholder.svg?height=40&width=40" },
                ],
                suggestedMovies: [
                    {
                        id: "m2",
                        title: "The Matrix",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "1999",
                        rating: "8.7",
                    },
                    {
                        id: "m3",
                        title: "Interstellar",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "2014",
                        rating: "8.6",
                    },
                    {
                        id: "m4",
                        title: "Blade Runner 2049",
                        poster: "/placeholder.svg?height=150&width=100",
                        year: "2017",
                        rating: "8.0",
                    },
                ],
            },
        ]

        // Mock data for friends
        const mockFriends: Friend[] = [
            { id: "f1", name: "Alex", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f2", name: "Jamie", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f3", name: "Taylor", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f4", name: "Morgan", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f5", name: "Jordan", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f6", name: "Casey", imgname: "/placeholder.svg?height=40&width=40" },
            { id: "f7", name: "Riley", imgname: "/placeholder.svg?height=40&width=40" },
        ]

        setRooms(mockRooms)
        setFriends(mockFriends)
        setIsLoading(false)
    }, [])

    const handleCreateRoom = () => {
        if (rooms.length >= 5) {
            setError("You can only create up to 5 rooms")
            return
        }

        if (!newRoomName.trim()) {
            setError("Please enter a room name")
            return
        }

        if (selectedFriends.length === 0) {
            setError("Please select at least one friend")
            return
        }

        if (selectedFriends.length > 5) {
            setError("You can only invite up to 5 friends")
            return
        }

        const newRoom: Room = {
            id: `room-${Date.now()}`,
            name: newRoomName,
            friends: selectedFriends,
            suggestedMovies: [],
        }

        setRooms([...rooms, newRoom])
        setNewRoomName("")
        setSelectedFriends([])
        setError(null)
    }

    const toggleFriendSelection = (friend: Friend) => {
        if (selectedFriends.some((f) => f.id === friend.id)) {
            setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id))
        } else {
            if (selectedFriends.length < 5) {
                setSelectedFriends([...selectedFriends, friend])
            } else {
                setError("You can only invite up to 5 friends")
            }
        }
    }

    const handleRoomSelect = (room: Room) => {
        setSelectedRoom(room)
    }

    return (
        <div className="text-white min-h-screen mb-22">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Watch Room</h1>
                        <p className="text-xs text-gray-400">
                            Watch movies with friends
                        </p>
                    </div>
                </div>
            </header>

            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <div className="px-4 pb-24">
                    {/* Create Room Button */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full mb-6 flex items-center gap-2 bg-primary hover:bg-primary/90"
                                disabled={rooms.length >= 5}
                            >
                                <PlusCircle size={18} />
                                Create New Watch Room
                                {rooms.length >= 5 && <span className="text-xs ml-2">(Max 5)</span>}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1E1E2E] border-[#292938] text-white">
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
                                        className="bg-[#292938] border-[#3E3E4E]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">
                                        Invite Friends <span className="text-xs">({selectedFriends.length}/5)</span>
                                    </label>
                                    <ScrollArea className="h-[200px] rounded-md border border-[#3E3E4E] p-2">
                                        <div className="space-y-2">
                                            {friends.map((friend) => (
                                                <div
                                                    key={friend.id}
                                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFriends.some((f) => f.id === friend.id)
                                                            ? "bg-primary/20 border border-primary/50"
                                                            : "hover:bg-[#292938]"
                                                        }`}
                                                    onClick={() => toggleFriendSelection(friend)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={friend.imgname || "/placeholder.svg"} alt={friend.name} />
                                                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{friend.name}</span>
                                                    </div>
                                                    {selectedFriends.some((f) => f.id === friend.id) && (
                                                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {error && <div className="text-red-400 text-sm">{error}</div>}

                                <Button onClick={handleCreateRoom} className="w-full bg-primary hover:bg-primary/90">
                                    Create Room
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Room List */}
                    {rooms.length === 0 ? (
                        <div className="bg-[#292938] rounded-lg p-6 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <h3 className="text-lg font-semibold mb-2">No Watch Rooms Yet</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Create your first watch room to start watching movies with friends
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rooms.map((room) => (
                                <Dialog key={room.id}>
                                    <DialogTrigger asChild>
                                        <div
                                            className="bg-[#292938] rounded-lg p-4 cursor-pointer hover:bg-[#32324A] transition-colors"
                                            onClick={() => handleRoomSelect(room)}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-semibold">{room.name}</h3>
                                                <ChevronRight size={18} className="text-gray-400" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex -space-x-2">
                                                    {room.friends.slice(0, 3).map((friend, index) => (
                                                        <Avatar key={friend.id} className="h-6 w-6 border border-[#1E1E2E]">
                                                            <AvatarImage src={friend.imgname || "/placeholder.svg"} alt={friend.name} />
                                                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                {room.friends.length > 3 && (
                                                    <span className="text-xs text-gray-400 ml-1">+{room.friends.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#1E1E2E] border-[#292938] text-white max-w-[90vw] w-full md:max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>{room.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-6">
                                            {/* Friends in this room */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Friends in this room</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {room.friends.map((friend) => (
                                                        <div
                                                            key={friend.id}
                                                            className="flex items-center gap-2 bg-[#292938] rounded-full px-3 py-1"
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={friend.imgname || "/placeholder.svg"} alt={friend.name} />
                                                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">{friend.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Suggested Movies */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Movies</h4>
                                                {room.suggestedMovies.length > 0 ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {room.suggestedMovies.map((movie) => (
                                                            <div key={movie.id} className="bg-[#292938] rounded-lg overflow-hidden">
                                                                <div className="aspect-[2/3] relative">
                                                                    <Image
                                                                        src={movie.poster || "/placeholder.svg"}
                                                                        alt={movie.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="p-2">
                                                                    <h5 className="font-medium text-sm line-clamp-1">{movie.title}</h5>
                                                                    <div className="flex justify-between text-xs text-gray-400">
                                                                        <span>{movie.year}</span>
                                                                        <span>⭐ {movie.rating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#292938] rounded-lg p-4 text-center">
                                                        <Film className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-400">No movies suggested yet</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Suggest a Movie Button */}
                                            <Button className="w-full bg-primary hover:bg-primary/90">Suggest a Movie for this Group</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <BottomNavigation currentPath="/watch-room" />
        </div>
    )
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <div className="px-4">
        <Skeleton className="h-12 w-full rounded-lg bg-[#292938] mb-6" />

        {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-lg bg-[#292938] mb-4" />
        ))}
    </div>
)
