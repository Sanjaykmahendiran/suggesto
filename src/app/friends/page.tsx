"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, MoreVertical, Search, Heart, X, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import DefaultImage from "@/assets/default-user.webp"

interface Friend {
    friend_id: number
    name: string
    profile_pic: string
    genre: string
    joined_date: string
    common_genres?: string
    user_id: number
}

type Tab = "friends" | "requests" | "suggested"

const tabAPIMap: Record<Tab, string> = {
    friends: "friendslist",
    requests: "friendreqlist",
    suggested: "suggested_friends",
}

export default function FriendsPage() {
    const router = useRouter()
    const [friends, setFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>("friends")
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const fetchFriends = async () => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setLoading(true)
        try {
            const endpoint = `https://suggesto.xyz/App/api.php?gofor=${tabAPIMap[activeTab]}&user_id=${userId}`
            const res = await fetch(endpoint)
            const data = await res.json()

            if (Array.isArray(data)) {
                setFriends(data)
            } else {
                setFriends([])
            }
        } catch (err) {
            console.error("Failed to fetch data:", err)
            setFriends([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFriends()
    }, [activeTab])

    const handleAcceptRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setActionLoading(friendId)
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "acceptrequest",
                    sender_id: friendId.toString(),
                    receiver_id: userId,
                }),
            })

            const result = await response.json()
            if (result.status === "Friend Request Accepted" || response.ok) {
                await fetchFriends()
            } else {
                console.error("Failed to accept request")
            }
        } catch (error) {
            console.error("Error accepting request:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setActionLoading(friendId)
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "rejectrequest",
                    sender_id: friendId.toString(),
                    receiver_id: userId,
                }),
            })

            const result = await response.json()
            if (result.status === "Friend Request Rejected" || response.ok) {
                await fetchFriends()
            } else {
                console.error("Failed to reject request")
            }
        } catch (error) {
            console.error("Error rejecting request:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleSendRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) {
            console.error("No user ID found in cookies")
            return
        }

        console.log("Sending friend request:", { userId, friendId }) // Debug log

        setActionLoading(friendId)
        try {
            const requestBody = {
                gofor: "sendrequest",
                sender_id: userId,
                receiver_id: friendId.toString(),
            }

            console.log("Request body:", requestBody) // Debug log

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            console.log("Response status:", response.status) // Debug log
            console.log("Response ok:", response.ok) // Debug log

            const result = await response.json()
            console.log("Response data:", result) // Debug log

            if (result.status === "Friend Request Sent!" || response.ok) {
                console.log("Friend request sent successfully")
                await fetchFriends()
            } else {
                console.error("Failed to send request - API response:", result)
            }
        } catch (error) {
            console.error("Error sending request:", error)
            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error("Network error - check your internet connection")
            }
        } finally {
            setActionLoading(null)
        }
    }

    const renderActionButtons = (friend: Friend) => {
        if (activeTab === "requests") {
            return (
                <div className="flex gap-2 ">
                    <button
                        onClick={() => handleAcceptRequest(friend.friend_id)}
                        disabled={actionLoading === friend.friend_id}
                        className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full transition-colors disabled:opacity-50"
                    >
                        <Heart size={16} className="text-white" />
                    </button>
                    <button
                        onClick={() => handleRejectRequest(friend.friend_id)}
                        disabled={actionLoading === friend.friend_id}
                        className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={16} className="text-white" />
                    </button>
                </div>
            )
        }

        if (activeTab === "suggested") {
            return (
                <button
                    onClick={() => handleSendRequest(friend.user_id)}
                    disabled={actionLoading === friend.user_id}
                    className="flex items-center justify-center px-4 py-2 bg-[#6c5ce7] hover:bg-[#5d4fd7] rounded-full transition-colors disabled:opacity-50"
                >
                    <UserPlus size={16} className="text-white mr-2" />
                    <span className="text-white text-sm">Add</span>
                </button>
            )
        }

        return (
            <div className="text-right">
                <p className="text-sm text-gray-400">
                    Joined: {new Date(friend.joined_date).toLocaleDateString()}
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen  text-white mb-16">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Friends List</h1>
                </div>
                <button>
                    <MoreVertical className="w-6 h-6" />
                </button>
            </header>

            <div className="p-4">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-[#292938] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef]"
                        placeholder="Search friends..."
                    />
                </div>

                {/* Tab Buttons */}
                <div className="flex space-x-2 px-4 overflow-x-auto pb-2 mb-6 no-scrollbar">
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === "friends"
                            ? "bg-[#6c5ce7] text-white"
                            : "bg-transparent text-gray-300 border border-gray-600"
                            }`}
                    >
                        All Friends
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === "requests"
                            ? "bg-[#6c5ce7] text-white"
                            : "bg-transparent text-gray-300 border border-gray-600"
                            }`}
                    >
                        Request List
                    </button>
                    <button
                        onClick={() => setActiveTab("suggested")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === "suggested"
                            ? "bg-[#6c5ce7] text-white"
                            : "bg-transparent text-gray-300 border border-gray-600"
                            }`}
                    >
                        Suggested Friends
                    </button>
                </div>

                {/* Loading & Results */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-[#292938] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-12 h-12 rounded-full " />
                                    <div className="space-y-2">
                                        <Skeleton className="w-32 h-4 rounded " />
                                        <Skeleton className="w-20 h-3 rounded " />
                                    </div>
                                </div>
                                <Skeleton className="w-24 h-4 rounded " />
                            </div>
                        ))}
                    </div>
                ) : friends.length === 0 ? (
                    <p className="text-center text-gray-400">No data found.</p>
                ) : (
                    <div className="space-y-4">
                        {friends.map((friend) => (
                            <div key={friend.friend_id} className="flex items-center justify-between p-3 bg-[#292938] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12">
                                        {!imageLoaded && (
                                            <Image
                                                src={DefaultImage}
                                                alt="Default avatar"
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        )}
                                        <Image
                                            src={imageError ? DefaultImage : friend.profile_pic}
                                            alt={friend.name}
                                            fill
                                            className={`rounded-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                            onLoad={() => setImageLoaded(true)}
                                            onError={() => {
                                                setImageError(true)
                                                setImageLoaded(true)
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium">{friend.name}</p>
                                        <p className="text-gray-400 text-sm">
                                            {activeTab === "suggested" ? friend.common_genres || friend.genre : friend.genre}
                                        </p>
                                    </div>
                                </div>
                                {renderActionButtons(friend)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}