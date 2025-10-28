"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, MoreVertical, Search, Heart, X, UserPlus, Plus, ArrowRight, EyeIcon, StarIcon, Cake } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import DefaultImage from "@/assets/default-user.webp"
import NotFound from "@/components/notfound"
import FriendsNotFound from "@/assets/not-found-friends.png"
import { motion } from "framer-motion"
import React from "react"
import { Friend, SearchUser } from "./type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTourIntegration } from "@/hooks/useTourIntegration"

type Tab = "friends" | "requests" | "suggested" | "starred" | "contacts"
type Step = "list" | "search"


export default function FriendsPage() {
    const router = useRouter()
    const { user, setUser } = useUser()
    const searchParams = useSearchParams()
    const pageType = searchParams.get("type");
    const friendId = searchParams.get("friend_id");

    const [step, setStep] = useState<Step>("list")
    const [friends, setFriends] = useState<Friend[]>([])
    const [allFriends, setAllFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        const savedTab = typeof window !== 'undefined' ? localStorage.getItem('friends-active-tab') as Tab : null;
        if (pageType === "new_login") return "contacts";
        return savedTab && ['friends', 'requests', 'suggested', 'starred', 'contacts'].includes(savedTab)
            ? savedTab
            : "friends";
    });
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Search functionality states
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState<SearchUser[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [requestType, setRequestType] = useState<"received" | "sent">("received")
    const [friendsLoading, setFriendsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    useTourIntegration('friends', [loading], !loading)
    const tabContainerRef = useRef<HTMLDivElement>(null)
    // Check if this is profile detail friends view
    const isProfileDetailFriends = pageType === "profiledetailfriends"

    const tabAPIMap: Record<Tab, string> = {
        friends: "friendslist",
        requests: requestType === "received" ? "friendreqlist" : "friendreqsentlist",
        suggested: "suggested_friends",
        starred: "friendslist",
        contacts: "contactfriendlist"
    }

    useEffect(() => {
        localStorage.setItem('friends-active-tab', activeTab);
    }, [activeTab]);

    // Add this function before the return statement
    const getTabOrder = () => {
        if (pageType === "new_login") {
            return ["contacts", "friends", "suggested", "requests", "starred"];
        }
        if (totalCount < 20) {
            return ["friends", "suggested", "contacts", "requests", "starred"];
        }
        return ["friends", "requests", "suggested", "starred", "contacts"];
    };

    const scrollToActiveTab = useCallback(() => {
        if (tabContainerRef.current) {
            const container = tabContainerRef.current
            const activeTabElement = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement

            if (activeTabElement) {
                const containerRect = container.getBoundingClientRect()
                const tabRect = activeTabElement.getBoundingClientRect()

                // Calculate if tab is outside visible area
                const isTabOutsideLeft = tabRect.left < containerRect.left
                const isTabOutsideRight = tabRect.right > containerRect.right

                if (isTabOutsideLeft || isTabOutsideRight) {
                    // Calculate scroll position to center the tab
                    const tabCenter = activeTabElement.offsetLeft + activeTabElement.offsetWidth / 2
                    const containerCenter = container.offsetWidth / 2
                    const scrollPosition = tabCenter - containerCenter

                    container.scrollTo({
                        left: Math.max(0, scrollPosition),
                        behavior: 'smooth'
                    })
                }
            }
        }
    }, [activeTab])

    useEffect(() => {
        // Small delay to ensure DOM has updated
        const timeoutId = setTimeout(scrollToActiveTab, 100)
        return () => clearTimeout(timeoutId)
    }, [activeTab, scrollToActiveTab])

    const handleFavoriteClick = async (friendId: number) => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null;
        if (!userId) return;

        const selectedFriend = friends.find(f => f.friend_id === friendId);
        if (!selectedFriend) return;

        const isCurrentlyStarred = selectedFriend.is_starred === 1;
        const action = isCurrentlyStarred ? "unfavfriend" : "favfriend";

        setActionLoading(friendId);
        try {
            const response = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=${action}&user_id=${userId}&friend_id=${friendId}`
            );
            const data = await response.json();
            if (data) {
                // Update both friends and allFriends arrays
                const updateFriend = (friend: Friend) =>
                    friend.friend_id === friendId
                        ? { ...friend, is_starred: isCurrentlyStarred ? 0 : 1 }
                        : friend;

                setFriends((prev) => prev.map(updateFriend));
                setAllFriends((prev) => prev.map(updateFriend));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const fetchFriends = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {

        if (activeTab === "suggested" && user?.payment_status !== 1) {
            setLoading(false);
            setFriendsLoading(false);
            setInitialLoad(false);
            return;
        }
        // Determine which user_id to use based on pageType
        let userId;
        if (isProfileDetailFriends && friendId) {
            userId = friendId;
        } else {
            userId = localStorage.getItem("userID");
        }

        if (!userId) return

        if (!isLoadMore) {
            setLoading(true)
            setFriendsLoading(true)
        } else {
            setFriendsLoading(true)
        }

        try {
            let endpoint = `https://suggesto.xyz/App/api.php?gofor=${tabAPIMap[activeTab]}&user_id=${userId}&limit=10&offset=${currentOffset}`

            // Handle requests tab with dynamic endpoint (no offset/limit needed)
            if (activeTab === "requests") {
                const apiEndpoint = requestType === "received" ? "friendreqlist" : "friendreqsentlist"
                endpoint = `https://suggesto.xyz/App/api.php?gofor=${apiEndpoint}&user_id=${userId}`
            }

            const res = await fetch(endpoint)
            const data = await res.json()

            // Handle paginated responses (friendslist and suggested_friends and starred)
            if (activeTab === "friends" || activeTab === "suggested" || activeTab === "starred") {
                const fetchedFriends = (data?.data || []).filter((friend: Friend) => friend.name && friend.name.trim() !== '')

                // Set total count from API response
                if (data?.total_count !== undefined) {
                    setTotalCount(data.total_count)
                }

                if (isLoadMore) {
                    if (activeTab === "starred") {
                        const starredFriends: Friend[] = fetchedFriends.filter((friend: Friend) => friend.is_starred === 1);
                        setFriends(prev => [...prev, ...starredFriends]);
                        setAllFriends(prev => [...prev, ...fetchedFriends]);
                    } else if (activeTab === "friends") {
                        setFriends(prev => [...prev, ...fetchedFriends]);
                        setAllFriends(prev => [...prev, ...fetchedFriends]);
                    } else {
                        setFriends(prev => [...prev, ...fetchedFriends]);
                    }
                } else {
                    if (activeTab === "starred") {
                        const starredFriends = fetchedFriends.filter((friend: Friend) => friend.is_starred === 1);
                        setFriends(starredFriends);
                        setAllFriends(fetchedFriends);
                    } else if (activeTab === "friends") {
                        setFriends(fetchedFriends);
                        setAllFriends(fetchedFriends);
                    } else {
                        setFriends(fetchedFriends);
                    }
                }

                // Check if there are more friends to load
                if (fetchedFriends.length < 10) {
                    setHasMore(false)
                }

                if (fetchedFriends.length > 0) {
                    setOffset(currentOffset + fetchedFriends.length)
                }
            }
            // Handle non-paginated responses (requests)
            else if (Array.isArray(data)) {
                const filteredData = data.filter((friend: Friend) => friend.name && friend.name.trim() !== '')
                setFriends(filteredData);
                setHasMore(false);
            } else {
                setFriends([])
                if (activeTab === "friends" as Tab) {
                    setAllFriends([]);
                }
                setHasMore(false);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err)
            setFriends([])
            if (activeTab === "friends") {
                setAllFriends([]);
            }
            setHasMore(false);
        } finally {
            setLoading(false)
            setFriendsLoading(false)
            setInitialLoad(false)
        }
    }, [activeTab, requestType, isProfileDetailFriends, friendId])

    useEffect(() => {
        if (activeTab === "requests") {
            fetchFriends();
        }
    }, [requestType])


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
                const filteredResults = data.filter((user: SearchUser) => user.name && user.name.trim() !== '')
                setSearchResults(filteredResults)
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

    const filterFriendsLocally = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setFilteredFriends([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const filtered = friends.filter(friend =>
            friend.name && friend.name.trim() !== '' && // Add this condition first
            (friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (friend.genre && friend.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (friend.common_genres && friend.common_genres.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        setFilteredFriends(filtered)
    }

    // Handle tab change for starred
    useEffect(() => {
        // Reset pagination states when changing tabs
        setOffset(0)
        setHasMore(true)
        setInitialLoad(true)
        setTotalCount(0)

        if (activeTab === "starred" && allFriends.length > 0) {
            const starredFriends = allFriends.filter(friend => friend.is_starred === 1);
            setFriends(starredFriends);
            setLoading(false);
            setHasMore(false);
        } else if (activeTab === "suggested" && user?.payment_status !== 1) {
            // For non-paid users on suggested tab, don't call API
            setFriends([]);
            setLoading(false);
            setHasMore(false);
        } else if (step === "list") {
            fetchFriends(0, false);
        }

        // Reset search when changing tabs
        setSearchText("")
        setIsSearching(false)
        setFilteredFriends([])

        // Reset request type when changing tabs
        if (activeTab !== "requests") {
            setRequestType("received")
        }
    }, [activeTab, step, fetchFriends])


    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !friendsLoading && hasMore && !initialLoad && !isSearching) {
                    // Only apply pagination for friends and suggested tabs
                    if (activeTab === "friends" || activeTab === "suggested") {
                        fetchFriends(offset, true)
                    }
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
    }, [friendsLoading, hasMore, offset, fetchFriends, initialLoad, isSearching, activeTab])

    // Debounced search
    useEffect(() => {
        if (searchDebounce) {
            clearTimeout(searchDebounce)
        }

        const timeout = setTimeout(() => {
            if (step === "search") {
                // Global search for add friends
                if (searchText) {
                    searchUsers(searchText)
                } else {
                    setSearchResults([])
                }
            } else {
                // Local search within current tab
                filterFriendsLocally(searchText)
            }
        }, 300)

        setSearchDebounce(timeout)

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [searchText, step, friends])

    const handleViewProfile = (profileId: number) => {
        let url = `/friends/friend-profile-detail?profile_id=${profileId}`;

        if (activeTab === 'requests' || activeTab === 'suggested') {
            // For requests tab, only add type if it's received requests, not sent
            if (activeTab === 'requests' && requestType === 'sent') {
                // Don't add type for sent requests
            } else {
                url += `&type=${activeTab}`;
            }
        }

        // If this is profile detail friends view, add the type parameter
        if (isProfileDetailFriends) {
            url += `&type=profiledetailfriends`;
        }

        router.push(url);
    };

    const isBirthday = (dob: string) => {
        if (!dob) return false;

        const today = new Date();
        const birthDate = new Date(dob);

        // Check if month and day match (ignoring year)
        return today.getMonth() === birthDate.getMonth() &&
            today.getDate() === birthDate.getDate();
    };

    const renderSearchResults = () => {
        if (searchLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[#2b2b2b] rounded-xl">
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
                    <NotFound
                        imageSrc={FriendsNotFound}
                        title="No users found"
                        description="Try searching with a different name or genre."
                    />
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {searchResults.map((user) => (
                    <div
                        onClick={() => handleViewProfile(Number(user.friend_id))}
                        key={user.friend_id} className="flex items-center justify-between p-4 bg-[#2b2b2b] rounded-xl">
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
                                onClick={() => handleViewProfile(Number(user.friend_id))}
                                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#B3EB50] to-[#1ea896] hover:bg-[#5d4fd7] rounded-full transition-colors"
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
        <div className="flex flex-col min-h-screen ">
            {step === "list" ? (
                <div className="min-h-screen text-white mb-16">
                    <header className="p-4 flex items-center justify-between pt-8">
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-semibold">
                                        {isProfileDetailFriends ? "Friends" : "Friends List"}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {isProfileDetailFriends ? "View connections" : "View and manage your connections"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!isProfileDetailFriends && (
                            <Link href="/profile">
                                <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#B3EB50] to-[#1ea896]">
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
                        )}
                    </header>

                    <div className="p-4">
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                data-tour-target="search-friends"
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="bg-[#2b2b2b] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#B3EB50]"
                                placeholder="Search friends..."
                            />
                        </div>

                        {/* Tab Buttons - Hide when it's profile detail friends */}
                        {!isProfileDetailFriends && (
                            <div
                                ref={tabContainerRef}
                                className="flex space-x-2 overflow-x-auto pb-2 mb-6 no-scrollbar"
                                data-tour-target="friends-tabs"
                            >
                                {getTabOrder().map((tab) => {
                                    const tabLabels = {
                                        friends: "Friends",
                                        requests: "Request List",
                                        suggested: "Suggested Friends",
                                        starred: "Starred",
                                        contacts: "Contacts"
                                    };

                                    return (
                                        <button
                                            key={tab}
                                            data-tab={tab} // Add this data attribute
                                            onClick={() => setActiveTab(tab as Tab)}
                                            className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === tab
                                                ? "bg-gradient-to-r from-[#B3EB50] to-[#1ea896] text-white"
                                                : "bg-transparent text-gray-300 border border-gray-600"
                                                }`}
                                        >
                                            {tabLabels[tab as keyof typeof tabLabels]}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Request type selector - Hide when it's profile detail friends */}
                        {activeTab === "requests" && !isProfileDetailFriends && (
                            <div className="mb-6 px-4 flex items-center justify-end" data-tour-target="request-type-filter">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={requestType}
                                        onValueChange={(value: "received" | "sent") => setRequestType(value)}
                                    >
                                        <SelectTrigger className=" bg-[#2b2b2b] text-white border border-gray-600 focus:ring-[#B3EB50]">
                                            <SelectValue placeholder="Select Request Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#2b2b2b] text-white border border-gray-600">
                                            <SelectItem value="received">Received</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Loading & Results */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-[#2b2b2b] rounded-xl">
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
                        ) : (isSearching && filteredFriends.length === 0 && searchText) ? (
                            <NotFound
                                imageSrc={FriendsNotFound}
                                title="No matching friends found"
                                description="Try searching with a different name or genre."
                            />
                        ) : (isSearching ? filteredFriends : friends).length === 0 && !isSearching ? (
                            // Add this condition for suggested tab
                            activeTab === "suggested" && user?.payment_status !== 1 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                                    <div className="mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#B3EB50] to-[#1ea896] rounded-full flex items-center justify-center">
                                            <UserPlus className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white mb-2">
                                            Premium Feature
                                        </h2>
                                        <p className="text-gray-400 text-sm max-w-md">
                                            Get personalized friend suggestions based on your interests and preferences with our premium plan.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/premium')}
                                        className="bg-gradient-to-r from-[#B3EB50] to-[#1ea896] hover:from-[#a3db40] hover:to-[#189086] text-white font-medium px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
                                    >
                                        Upgrade to Premium
                                    </button>
                                </div>
                            ) : (
                                <NotFound
                                    imageSrc={FriendsNotFound}
                                    title={activeTab === "starred" ? "No starred friends yet" : "No data found :("}
                                    description={activeTab === "starred" ? "Star your favorite friends to see them here." : "You haven't added any friends yet."}
                                />
                            )
                        ) : (
                            <div className="space-y-4">
                                {(isSearching ? filteredFriends : friends).map((friend) => {
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
                                            data-tour-target="friend-card"
                                            className="flex items-center justify-between px-2 py-2 bg-[#2b2b2b] rounded-2xl shadow-md"
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
                                                                {index < genres.length - 1 && <span className="text-gray-400  mx-0">l</span>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* For profile detail friends, show simple arrow without star/eye icons */}
                                            {isProfileDetailFriends ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(friend.friend_id);
                                                        }}
                                                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#B3EB50] to-[#1ea896] hover:bg-[#5d4fd7] rounded-full transition-colors"
                                                    >
                                                        <ArrowRight size={16} className="text-white" />
                                                    </button>
                                                </div>
                                            ) : (activeTab === "friends" || activeTab === "starred") ? (
                                                <div className="flex flex-col items-end text-gray-400 text-sm gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFavoriteClick(friend.friend_id);
                                                        }}
                                                        className="hover:text-yellow-400 transition px-2 py-1"
                                                    >
                                                        <StarIcon
                                                            className={`w-5 h-5 ${friend.is_starred === 1
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-gray-400"
                                                                }`}
                                                        />
                                                    </button>

                                                    {/* Cake, Eye, and Count in same line, centered */}
                                                    <div className="flex items-center gap-2">
                                                        {isBirthday(friend.dob) && (
                                                            <Cake className="w-4 h-4 text-[#B3EB50]" />
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <EyeIcon className="w-4 h-4" />
                                                            <span className="text-sm leading-none">{friend.friends_count || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(activeTab === "suggested" ? friend.user_id : friend.friend_id);
                                                        }}
                                                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#B3EB50] to-[#1ea896] hover:bg-[#5d4fd7] rounded-full transition-colors"
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

                        {friendsLoading && !initialLoad && !isSearching && (activeTab === "friends" || activeTab === "suggested") && (
                            <div className="space-y-4 mt-4">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-[#2b2b2b] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-12 h-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="w-32 h-4 rounded" />
                                                <Skeleton className="w-20 h-3 rounded" />
                                            </div>
                                        </div>
                                        <Skeleton className="w-24 h-4 rounded" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Intersection observer target - only show for paginated tabs when not searching */}
                        {hasMore && !friendsLoading && !isSearching && (activeTab === "friends" || activeTab === "suggested") && (
                            <div ref={observerRef} className="h-4 w-full" />
                        )}

                    </div>

                    {/* Floating Action Button - Hide when it's profile detail friends */}
                    {!isProfileDetailFriends && (
                        <motion.button
                            data-tour-target="add-friends-button"
                            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#B3EB50] to-[#1ea896] flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep("search")}
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col min-h-screen px-6 text-white">
                    {/* Back button and title */}
                    <div className="flex items-center pt-12 pb-6 mb-6">
                        <button
                            onClick={() => setStep("list")}
                            className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center mr-4"
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
                            className="bg-[#2b2b2b] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#B3EB50]"
                            placeholder="Search by name, email, or mobile..."
                            autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto">
                        {searchText ? renderSearchResults() : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="animate-bounce mb-4">
                                    <Search size={56} className="text-[#B3EB50]" />
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

            <BottomNavigation currentPath="/friends" />

        </div>
        // </PageTransitionWrapper>

    )
}