"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { ArrowLeft, Search, ArrowRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import DefaultImage from "@/assets/default-user.webp"
import NotFound from "@/components/notfound"
import React from "react"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"

interface MovieUser {
    user_id: number
    name: string
    mobilenumber: string
    otp: string | null
    otp_status: string
    register_level_status: number
    email: string
    location: string
    imgname: string
    dob: string | null
    gender: string | null
    referral_code: string
    referred_by: string | null
    status: string
    created_date: string
    modified_date: string
}

interface SavedTop10Item {
    savetop_id: number
    user_id: number
    friend_id: number
    status: number
    created_date: string
    friend: MovieUser // Updated to match API response structure
}

const SkeletonItem = () => (
    <div className="flex items-center justify-between p-3 bg-[#2b2b2b] rounded-xl">
        <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full bg-gray-600" />
            <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded bg-gray-600" />
                <Skeleton className="w-20 h-3 rounded bg-gray-600" />
            </div>
        </div>
        <Skeleton className="w-24 h-4 rounded bg-gray-600" />
    </div>
)

export default function SavedTop10WallPage() {
    const router = useRouter()
    const [savedItems, setSavedItems] = useState<SavedTop10Item[]>([])
    const [filteredItems, setFilteredItems] = useState<SavedTop10Item[]>([])
    const [loading, setLoading] = useState(true)
    const [searchText, setSearchText] = useState("")
    const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({})
    const [imageError, setImageError] = useState<{ [key: number]: boolean }>({})

    // Pagination states
    const [itemsLoading, setItemsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    // Fetch saved items with pagination
    const fetchSavedTop10 = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            if (!isLoadMore) {
                setItemsLoading(true)
            }

            const endpoint = `https://suggesto.xyz/App/api.php?gofor=savedtop10&user_id=${userId}&limit=10&offset=${currentOffset}`
            const res = await fetch(endpoint)

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const response = await res.json()

            if (response.status === "success") {
                const fetchedItems = response.data || []

                // Set total count from API response
                if (response.total_count !== undefined) {
                    setTotalCount(response.total_count)
                }

                if (isLoadMore) {
                    setSavedItems(prev => [...prev, ...fetchedItems])
                } else {
                    setSavedItems(fetchedItems)
                }

                // Check if there are more items to load
                if (fetchedItems.length < 10) {
                    setHasMore(false)
                }

                if (fetchedItems.length > 0) {
                    setOffset(currentOffset + fetchedItems.length)
                }
            } else {
                setSavedItems([])
                setHasMore(false)
            }
        } catch (err) {
            console.error("Failed to fetch saved top 10 data:", err)
            toast.error('Failed to load saved items')
            setSavedItems([])
            setHasMore(false)
        } finally {
            setItemsLoading(false)
            setInitialLoad(false)
            setLoading(false) // Set main loading to false after first fetch
        }
    }, [])

    // Load initial items when component mounts
    useEffect(() => {
        fetchSavedTop10(0, false)
    }, [fetchSavedTop10])

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !itemsLoading && hasMore && !initialLoad && searchText === '') {
                    fetchSavedTop10(offset, true)
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
    }, [itemsLoading, hasMore, offset, fetchSavedTop10, initialLoad, searchText])

    // Handle search functionality
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredItems(savedItems)
        } else {
            const filtered = savedItems.filter(item =>
                item.friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.friend.email.toLowerCase().includes(searchText.toLowerCase()) ||
                item.friend.location.toLowerCase().includes(searchText.toLowerCase())
            )
            setFilteredItems(filtered)
        }
    }, [searchText, savedItems])

    const handleViewProfile = (profileId: number) => {
        router.push(`/top-10-wall?friend_id=${profileId}`)
    }

    const handleImageLoad = (userId: number) => {
        setImageLoaded(prev => ({ ...prev, [userId]: true }))
    }

    const handleImageError = (userId: number) => {
        setImageError(prev => ({ ...prev, [userId]: true }))
        setImageLoaded(prev => ({ ...prev, [userId]: true }))
    }

    const getImageSrc = (item: SavedTop10Item) => {
        // Return default image if there's an error or no image name
        if (imageError[item.friend.user_id] || !item.friend.imgname) {
            return DefaultImage
        }
        return item.friend.imgname
    }

    return (
        <div className="flex flex-col min-h-screen ">
            <div className="flex-1 text-white mb-16">
                <header className="px-4 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className="mr-2 p-2 rounded-full bg-[#2b2b2b] hover:bg-[#32313f] transition-colors"
                            onClick={() => router.back()}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold">Saved Top 10 Wall</h1>
                            <p className="text-xs text-gray-400">
                                {totalCount > 0 && `${totalCount} saved items`}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-4">
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="bg-[#2b2b2b] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef] placeholder-gray-400"
                            placeholder="Search saved items..."
                        />
                    </div>

                    {/* Loading & Results */}
                    {initialLoad ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }, (_, index) => (
                                <SkeletonItem key={index} />
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <NotFound
                            title="No saved items found :("
                            description={searchText
                                ? `No saved items found matching "${searchText}"`
                                : "You haven't saved any top 10 walls yet."
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-4">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.savetop_id}
                                        onClick={() => router.push(`/top-10-wall?friend_id=${item?.friend_id}`)}
                                        className="flex items-center justify-between p-4 bg-[#2b2b2b] rounded-2xl shadow-md cursor-pointer hover:bg-[#32313f] transition-colors"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleViewProfile(item.friend_id)
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <Image
                                                    src={getImageSrc(item)}
                                                    alt={`${item.friend.name}'s profile picture`}
                                                    fill
                                                    className="rounded-full object-cover"
                                                    onLoad={() => handleImageLoad(item.friend.user_id)}
                                                    onError={() => handleImageError(item.friend.user_id)}
                                                    sizes="48px"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-white font-medium text-base truncate">
                                                    {item.friend.name}
                                                </p>
                                                {item.friend.email && (
                                                    <p className="text-gray-400 text-sm truncate">
                                                        {item.friend.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <ArrowRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                    </div>
                                ))}
                            </div>

                            {/* Loading more indicator */}
                            {itemsLoading && !initialLoad && searchText === '' && (
                                <div className="space-y-4 mt-4">
                                    {Array.from({ length: 3 }, (_, index) => (
                                        <SkeletonItem key={index} />
                                    ))}
                                </div>
                            )}

                            {/* Intersection observer target - only show when not searching */}
                            {hasMore && !itemsLoading && searchText === '' && (
                                <div ref={observerRef} className="h-4 w-full" />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}