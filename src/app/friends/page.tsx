"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, MoreVertical, Search, Plus } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

interface Friend {
    friend_id: number
    name: string
    profile_pic: string
    genre: string
    joined_date: string
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

    useEffect(() => {
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

        fetchFriends()
    }, [activeTab])

    return (
        <div className="min-h-screen text-white mb-16">
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
                <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar mb-6">
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                            activeTab === "friends"
                                ? "bg-[#6c5ce7] text-white"
                                : "bg-transparent text-gray-300 border border-gray-600"
                        }`}
                    >
                        All Friends
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                            activeTab === "requests"
                                ? "bg-[#6c5ce7] text-white"
                                : "bg-transparent text-gray-300 border border-gray-600"
                        }`}
                    >
                        Request List
                    </button>
                    <button
                        onClick={() => setActiveTab("suggested")}
                        className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                            activeTab === "suggested"
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
                            <div key={index} className="flex items-center justify-between p-3  rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-12 h-12 rounded-full bg-[#292938]" />
                                    <div className="space-y-2">
                                        <Skeleton className="w-32 h-4 rounded bg-[#292938]" />
                                        <Skeleton className="w-20 h-3 rounded bg-[#292938]" />
                                    </div>
                                </div>
                                <Skeleton className="w-24 h-4 rounded bg-[#292938]" />
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
                                    <Image
                                        src={friend.profile_pic || "/placeholder.svg"}
                                        alt={friend.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium">{friend.name}</p>
                                        <p className="text-gray-400 text-sm">{friend.genre}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">
                                        Joined: {new Date(friend.joined_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
