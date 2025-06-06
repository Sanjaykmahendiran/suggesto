"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Search, ArrowRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import DefaultImage from "@/assets/default-user.webp"
import NotFound from "@/components/notfound"
import React from "react"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

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
    movie: MovieUser
}

export default function SavedTop10WallPage() {
    const router = useRouter()
    const [savedItems, setSavedItems] = useState<SavedTop10Item[]>([])
    const [filteredItems, setFilteredItems] = useState<SavedTop10Item[]>([])
    const [loading, setLoading] = useState(true)
    const [searchText, setSearchText] = useState("")
    const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({})
    const [imageError, setImageError] = useState<{ [key: number]: boolean }>({})

    const fetchSavedTop10 = async () => {
        const userId = Cookies.get("userID")
        if (!userId) {
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const endpoint = `https://suggesto.xyz/App/api.php?gofor=savedtop10&user_id=${userId}`
            const res = await fetch(endpoint)
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            
            const data = await res.json()

            if (Array.isArray(data)) {
                setSavedItems(data)
                setFilteredItems(data)
            } else {
                setSavedItems([])
                setFilteredItems([])
            }
        } catch (err) {
            console.error("Failed to fetch saved top 10 data:", err)
            setSavedItems([])
            setFilteredItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSavedTop10()
    }, [])

    // Handle search functionality
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredItems(savedItems)
        } else {
            const filtered = savedItems.filter(item =>
                item.movie.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.movie.email.toLowerCase().includes(searchText.toLowerCase()) ||
                item.movie.location.toLowerCase().includes(searchText.toLowerCase())
            )
            setFilteredItems(filtered)
        }
    }, [searchText, savedItems])

    const handleViewProfile = (profileId: number) => {
        router.push(`/movie-top-wall?friend_id=${profileId}`)
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
        if (imageError[item.movie.user_id] || !item.movie.imgname) {
            return DefaultImage
        }
        return item.movie.imgname
    }

    return (

//   <PageTransitionWrapper>
        <div className="flex flex-col min-h-screen ">
            <div className="flex-1 text-white mb-16">
                <header className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button 
                            className="mr-2 p-2 rounded-full bg-[#292938] hover:bg-[#32313f] transition-colors" 
                            onClick={() => router.back()}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold">Saved Top 10 Wall</h1>
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
                            className="bg-[#292938] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef] placeholder-gray-400"
                            placeholder="Search saved items..."
                        />
                    </div>

                    {/* Loading & Results */}
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }, (_, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-[#292938] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-12 h-12 rounded-full bg-gray-600" />
                                        <div className="space-y-2">
                                            <Skeleton className="w-32 h-4 rounded bg-gray-600" />
                                            <Skeleton className="w-20 h-3 rounded bg-gray-600" />
                                        </div>
                                    </div>
                                    <Skeleton className="w-24 h-4 rounded bg-gray-600" />
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <NotFound title="No saved items found :(" />
                    ) : (
                        <div className="space-y-4">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.savetop_id}
                                     onClick={() => router.push(`/movie-top-wall?friend_id=${item?.friend_id}`)}
                                    className="flex items-center justify-between p-4 bg-[#292938] rounded-2xl shadow-md cursor-pointer hover:bg-[#32313f] transition-colors"
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
                                                alt={`${item.movie.name}'s profile picture`}
                                                fill
                                                className="rounded-full object-cover"
                                                onLoad={() => handleImageLoad(item.movie.user_id)}
                                                onError={() => handleImageError(item.movie.user_id)}
                                                sizes="48px"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-medium text-base truncate">
                                                {item.movie.name}
                                            </p>
                                            {item.movie.email && (
                                                <p className="text-gray-400 text-sm truncate">
                                                    {item.movie.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <ArrowRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        // {/* </PageTransitionWrapper> */}
           
    )
}