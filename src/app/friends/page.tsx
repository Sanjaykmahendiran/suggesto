"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, MoreVertical, Search, Heart, X, UserPlus, Plus, ArrowRight, EyeIcon, StarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import DefaultImage from "@/assets/default-user.webp"
import NotFound from "@/components/notfound"
import { motion } from "framer-motion"
import React from "react"
import { Friend, SearchUser } from "./type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"


type Tab = "friends" | "requests" | "suggested"
type Step = "list" | "search"

const tabAPIMap: Record<Tab, string> = {
    friends: "friendslist",
    requests: "friendreqlist",
    suggested: "suggested_friends",
}

export default function FriendsPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>("list")
    const [friends, setFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>("friends")
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Search functionality states
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState<SearchUser[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

    const handleFavoriteClick = async (friendId: number) => {
        const userId = Cookies.get("userID");
        if (!userId) return;

        setActionLoading(friendId);
        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=favfriend&sender_id=${userId}&receiver_id=${friendId}`
            );
            const data = await response.json();
            if (data) {
                fetchFriends()
                setFriends((prev) =>
                    prev.map((friend) =>
                        friend.friend_id === friendId
                            ? { ...friend, is_starred: friend.is_starred === 1 ? 0 : 1 }
                            : friend
                    )
                );
            }
        } catch (error) {
            console.error("Failed to favorite friend:", error);
        } finally {
            setActionLoading(null);
        }
    };


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

    const searchUsers = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        setSearchLoading(true)
        try {
            const endpoint = `https://suggesto.xyz/App/api.php?gofor=searchusers&searchtext=${encodeURIComponent(searchQuery)}`
            const res = await fetch(endpoint)
            const data = await res.json()

            if (Array.isArray(data)) {
                setSearchResults(data)
            } else {
                setSearchResults([])
            }
        } catch (err) {
            console.error("Failed to search users:", err)
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }

    // Debounced search
    useEffect(() => {
        if (searchDebounce) {
            clearTimeout(searchDebounce)
        }

        const timeout = setTimeout(() => {
            if (searchText) {
                searchUsers(searchText)
            } else {
                setSearchResults([])
            }
        }, 500)

        setSearchDebounce(timeout)

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [searchText])

    useEffect(() => {
        if (step === "list") {
            fetchFriends()
        }
    }, [activeTab, step])

    const handleViewProfile = (profileId: number) => {
        let url = `/friends/friend-profile-detail?profile_id=${profileId}`;

        if (activeTab === 'requests' || activeTab === 'suggested') {
            url += `&type=${activeTab}`;
        }

        router.push(url);
    };


    const renderSearchResults = () => {
        if (searchLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[#292938] rounded-xl">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="w-32 h-4 rounded" />
                                    <Skeleton className="w-20 h-3 rounded" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-16 h-8 rounded-full" />
                                <Skeleton className="w-10 h-10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (searchResults.length === 0 && searchText) {
            return (
                <div className="mt-16">
                    <NotFound title="No users found" />
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {searchResults.map((user) => (
                    <div
                        onClick={() => handleViewProfile(user.friend_id)}
                        key={user.friend_id} className="flex items-center justify-between p-4 bg-[#292938] rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <Image
                                    src={user.profile_pic || DefaultImage}
                                    alt={user.name}
                                    fill
                                    className="rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = DefaultImage.src
                                    }}
                                />
                            </div>
                            <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-gray-400 text-sm">{user.genre}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleViewProfile(user.friend_id)}
                                className="flex items-center justify-center w-10 h-10 bg-[#6c5ce7] hover:bg-[#5d4fd7] rounded-full transition-colors"
                            >
                                <ArrowRight size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (

        // <PageTransitionWrapper>
            <div className="flex flex-col min-h-screen fixed inset-0">
                {step === "list" ? (
                    <div className="min-h-screen text-white mb-16">
                        <header className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className="text-xl font-semibold">Friends List</h1>
                            </div>
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
                                    Friends
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
                                <NotFound
                                    title="No data found :(" />
                            ) : (
                                <div className="space-y-4">
                                    {friends.map((friend) => {
                                        const rawGenres = activeTab === "suggested" ? (friend.common_genres || friend.genre) : friend.genre;
                                        const genres = rawGenres ? rawGenres.split(", ").slice(0, 3) : [];

                                        return (
                                            <div
                                                key={friend.friend_id}
                                                onClick={() => {
                                                    if (activeTab === "suggested") {
                                                        handleViewProfile(friend.user_id);
                                                    } else {
                                                        handleViewProfile(friend.friend_id);
                                                    }
                                                }}
                                                className="flex items-center justify-between p-4 bg-[#292938] rounded-2xl shadow-md"
                                            >
                                                <div className="flex items-center gap-4">
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
                                                            src={friend.profile_pic || DefaultImage}
                                                            alt={friend.name}
                                                            fill
                                                            className={`rounded-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                                            onLoad={() => setImageLoaded(true)}
                                                            onError={() => {
                                                                setImageError(true);
                                                                setImageLoaded(true);
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-white font-medium text-base">{friend.name}</p>
                                                        <div className="text-gray-400 text-sm flex gap-1 flex-wrap">
                                                            {genres.map((genre, index) => (
                                                                <React.Fragment key={index}>
                                                                    <span>{genre}</span>
                                                                    {index < genres.length - 1 && <span className="text-white mx-0">|</span>}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {activeTab === "friends" ? (
                                                    <div className="flex flex-col items-center text-gray-400 text-sm gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFavoriteClick(friend.friend_id);
                                                            }}
                                                            className="hover:text-yellow-400 transition px-2 py-1"
                                                        >
                                                            <StarIcon className={`w-5 h-5 ${friend.is_starred === 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <EyeIcon className="w-4 h-4" />
                                                            <span>{friend.friends_count || 0}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewProfile(activeTab === "suggested" ? friend.user_id : friend.friend_id);
                                                            }}
                                                            className="flex items-center justify-center w-10 h-10 bg-[#6c5ce7] hover:bg-[#5d4fd7] rounded-full transition-colors"
                                                        >
                                                            <ArrowRight size={16} className="text-white" />
                                                        </button>
                                                    </div>
                                                )}


                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Floating Action Button */}
                        <motion.button
                            className="fixed bottom-8 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep("search")}
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex flex-col min-h-screen px-6 text-white">
                        {/* Back button and title */}
                        <div className="flex items-center pt-12 pb-6 mb-6">
                            <button
                                onClick={() => setStep("list")}
                                className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center mr-4"
                            >
                                <ArrowLeft className="h-5 w-5 text-white" />
                            </button>
                            <h1 className="text-2xl font-bold text-white">Add Friends</h1>
                            <div className="flex-1 text-center">

                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="bg-[#292938] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef]"
                                placeholder="Search by name, email, or mobile..."
                                autoFocus
                            />
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto">
                            {searchText ? renderSearchResults() : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="animate-bounce mb-4">
                                        <Search size={56} className="text-[#6c5ce7]" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                                        Connect with friends globally
                                    </h2>
                                    <p className="text-gray-400 text-sm sm:text-base max-w-md">
                                        Start typing a name, email, or mobile number to find and add new friends from around the world.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        // </PageTransitionWrapper>

    )
}