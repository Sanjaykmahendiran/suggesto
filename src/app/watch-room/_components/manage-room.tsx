"use client"

import { useState, useEffect } from "react"
import { UserPlus, UserMinus, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { Room, Friend } from "@/app/watch-room/room-detail/type"

interface ManageRoomDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    room: Room | null
    userId: number
    friends: Friend[]
    onFetchFriends: () => void
    onAddMembers: (userIds: number[]) => Promise<void>
    onRemoveMember: (userId: number) => Promise<void>
}

export default function ManageRoomDialog({
    open,
    onOpenChange,
    room,
    userId,
    friends,
    onFetchFriends,
    onAddMembers,
    onRemoveMember
}: ManageRoomDialogProps) {
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
    const [isUpdating, setIsUpdating] = useState(false)
    const [managementMode, setManagementMode] = useState<'add' | 'remove'>('add')
    const [friendSearchQuery, setFriendSearchQuery] = useState("")

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setSelectedFriends([])
            setManagementMode('add')
            setFriendSearchQuery("")

            // Fetch friends if not already loaded
            if (friends.length === 0) {
                onFetchFriends()
            }
        }
    }, [open, friends.length, onFetchFriends])

    const formatImageUrl = (path: string) => {
        if (path.startsWith('http')) return path
        return `https://suggesto.xyz/App/${path}`
    }

    const getFilteredAvailableFriends = () => {
        if (!room) return []

        // Filter out friends who are already members of the room
        const availableFriends = friends.filter(friend => {
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

    const handleUpdateRoomMembers = async () => {
        if (!room || selectedFriends.length === 0) return

        try {
            setIsUpdating(true)
            const memberIds = selectedFriends.map(friend => parseInt(friend.friend_id))

            if (managementMode === "add") {
                await onAddMembers(memberIds)
            } else {
                // For remove, process one by one since the API only accepts single user_id
                for (const memberId of memberIds) {
                    await onRemoveMember(memberId)
                }
            }

            // Reset form and close dialog
            setSelectedFriends([])
            setFriendSearchQuery("")
            onOpenChange(false)
        } catch (error) {
            toast.error(`Failed to ${managementMode} members. Please try again.`)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleModeChange = (mode: 'add' | 'remove') => {
        setManagementMode(mode)
        setSelectedFriends([])
        setFriendSearchQuery("")
    }

    if (!room) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1f1f21] border-[#2b2b2b] text-white p-2 py-4 mx-auto">
                <DialogHeader>
                    <DialogTitle className="truncate">Manage Room: {room.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Mode Selection */}
                    <div className="flex bg-[#2b2b2b] rounded-lg p-1">
                        <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 min-w-0 ${managementMode === 'add'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => handleModeChange('add')}
                        >
                            <UserPlus size={16} className="flex-shrink-0" />
                            <span className="truncate">Add Friends</span>
                        </button>
                        <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 min-w-0 ${managementMode === 'remove'
                                ? 'bg-red-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => handleModeChange('remove')}
                        >
                            <UserMinus size={16} className="flex-shrink-0" />
                            <span className="truncate">Remove Members</span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0 z-10" size={16} />
                        <input
                            value={friendSearchQuery}
                            onChange={(e) => setFriendSearchQuery(e.target.value)}
                            placeholder={managementMode === 'add' ? "Search friends to add..." : "Search members to remove..."}
                            className="w-full py-2 px-3 pl-10 pr-3 rounded bg-[#2b2b2b] border border-[#3E3E4E] text-white truncate focus:ring-2 focus:ring-[#15F5FD]/50 focus:border-[#15F5FD]/20 outline-none"
                        />

                    </div>

                    {/* Friends/Members List */}
                    <div className="min-w-0">
                        <label className="text-sm text-gray-400 mb-1 flex items-center block">
                            <span className="truncate inline-block max-w-full">
                                {managementMode === 'add' ? 'Select Friends to Add' : 'Select Members to Remove'}
                            </span>
                            <span className="text-xs ml-1 flex-shrink-0">({selectedFriends.length}/10)</span>
                        </label>

                        <ScrollArea className="h-[200px] rounded-md border border-[#3E3E4E] p-2">
                            <div className="space-y-2 pr-2">
                                {managementMode === 'add' ? (
                                    // Show available friends to add
                                    getFilteredAvailableFriends().length > 0 ? (
                                        getFilteredAvailableFriends().map((friend) => (
                                            <div
                                                key={`add-${friend.friend_id}`}
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer min-w-0 ${selectedFriends.some((f) => f.friend_id === friend.friend_id)
                                                    ? "bg-green-600/20 border border-green-600/50"
                                                    : "hover:bg-[#2b2b2b]"
                                                    }`}
                                                onClick={() => !isUpdating && toggleFriendSelection(friend)}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                                        <AvatarImage
                                                            src={formatImageUrl(friend.profile_pic || DefaultImage )}
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
                                                {friendSearchQuery ? (
                                                    <span className="break-words">No friends found matching "{friendSearchQuery}"</span>
                                                ) : (
                                                    "No friends available to add"
                                                )}
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    // Show current members to remove
                                    getFilteredRoomFriends().length > 0 ? (
                                        getFilteredRoomFriends().map((friend) => (
                                            <div
                                                key={`remove-${friend.friend_id}`}
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer min-w-0 ${selectedFriends.some((f) => f.friend_id === friend.friend_id)
                                                    ? "bg-red-600/20 border border-red-600/50"
                                                    : "hover:bg-[#2b2b2b]"
                                                    }`}
                                                onClick={() => !isUpdating && toggleFriendSelection(friend)}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                                        <AvatarImage
                                                            src={formatImageUrl(friend.profile_pic || DefaultImage )}
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
                                                {friendSearchQuery ? (
                                                    <span className="break-words">No members found matching "{friendSearchQuery}"</span>
                                                ) : (
                                                    "No members to remove"
                                                )}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpdateRoomMembers}
                            className={`flex-1 min-w-0 ${managementMode === 'add'
                                ? 'bg-green-600 hover:bg-green-600/90'
                                : 'bg-red-600 hover:bg-red-600/90'
                                }`}
                            disabled={isUpdating || selectedFriends.length === 0}
                        >
                            <span className="truncate">
                                {isUpdating ? "Updating..." :
                                    managementMode === 'add' ? "Add Selected" : "Remove Selected"
                                }
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-[#3E3E4E] text-gray-400 flex-shrink-0"
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}