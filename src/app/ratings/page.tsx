"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Star, ThumbsUp, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

interface Review {
    rating_id: number
    user_id: number
    movie_id: number
    rating: number
    review: string
    status: number
    created_date: string
    modified_date: string
    user: {
        user_id: number
        name: string
        imgname: string
    }
    is_liked_by_me: boolean
    total_likes: number
}

interface ApiResponse {
    ratings: Review[]
    total_count?: number
}

// Skeleton component for loading state
const SkeletonReview = () => (
    <div className="flex-shrink-0 w-full bg-gradient-to-br from-[#2b2b2b]/15 to-[#2b2b2b]/5 backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-4 shadow-md">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#2b2b2b] mr-3 animate-pulse"></div>
                <div>
                    <div className="h-4 w-24 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-[#2b2b2b] rounded animate-pulse"></div>
                </div>
            </div>
            <div className="flex items-center">
                <div className="h-4 w-12 bg-[#2b2b2b] rounded animate-pulse"></div>
            </div>
        </div>
        <div className="mb-2">
            <div className="h-4 w-16 bg-[#2b2b2b] rounded-full animate-pulse"></div>
        </div>
        <div className="mb-4">
            <div className="h-3 w-full bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
            <div className="h-3 w-3/4 bg-[#2b2b2b] rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-8 bg-[#2b2b2b] rounded animate-pulse"></div>
    </div>
)

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export default function RatingsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const viewer_id = searchParams.get("viewer_id");
    const movie_id = searchParams.get("movie_id");

    const [ratings, setRatings] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    // Pagination states
    const [ratingsLoading, setRatingsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    // Fetch reviews with pagination
    const fetchReviews = useCallback(async (currentOffset: number = 0, isLoadMore: boolean = false) => {
        try {
            if (!isLoadMore) {
                setRatingsLoading(true)
            }

            const res = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=ratinglist&viewer_id=${viewer_id}&movie_id=${movie_id}&limit=20&offset=${currentOffset}`
            )

            if (!res.ok) {
                throw new Error('Failed to fetch reviews')
            }

            const data: ApiResponse = await res.json()

            const fetchedRatings = data.ratings || []

            // Set total count from API response
            if (data?.total_count !== undefined) {
                setTotalCount(data.total_count)
            }

            if (isLoadMore) {
                setRatings(prev => [...prev, ...fetchedRatings])
            } else {
                setRatings(fetchedRatings)
            }

            // Check if there are more ratings to load
            if (fetchedRatings.length < 10) {
                setHasMore(false)
            }

            if (fetchedRatings.length > 0) {
                setOffset(currentOffset + fetchedRatings.length)
            }

        } catch (error) {
            console.error("Error fetching reviews:", error)
        } finally {
            setRatingsLoading(false)
            setInitialLoad(false)
            setLoading(false) // Set main loading to false after first fetch
        }
    }, [viewer_id, movie_id])

    // Load initial reviews when component mounts
    useEffect(() => {
        if (viewer_id && movie_id) {
            fetchReviews(0, false)
        }
    }, [fetchReviews, viewer_id, movie_id])

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && !ratingsLoading && hasMore && !initialLoad) {
                    fetchReviews(offset, true)
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
    }, [ratingsLoading, hasMore, offset, fetchReviews, initialLoad])

    const handleLike = async (ratingId: number) => {
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "ratmovlike",
                    user_id: viewer_id,
                    rating_id: ratingId,
                }),
            });

            const result = await response.json();
            console.log("Like response:", result);

            // Update the local state to reflect the like action
            setRatings(prev => prev.map(rating =>
                rating.rating_id === ratingId
                    ? {
                        ...rating,
                        is_liked_by_me: !rating.is_liked_by_me,
                        total_likes: rating.is_liked_by_me
                            ? rating.total_likes - 1
                            : rating.total_likes + 1
                    }
                    : rating
            ))
        } catch (error) {
            console.error("Error liking review:", error);
        }
    };

    return (
        // <PageTransitionWrapper>
        <div className="max-w-2xl mx-auto min-h-screen">
            <header className="flex items-center px-4 pt-8 relative mb-4">
                <button
                    className="p-2 rounded-full bg-[#2b2b2b]"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="pl-4 text-xl font-medium">
                    Reviews {totalCount > 0 && `(${totalCount})`}
                </h1>
            </header>

            <div className="p-4">

                {initialLoad ? (
                    // Show skeleton loading for initial load
                    <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonReview key={index} />
                        ))}
                    </div>
                ) : ratings.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No reviews found.</p>
                ) : (
                    <div className="grid gap-4">
                        {ratings.map((rating) => (
                            <div
                                key={rating.rating_id}
                                className="flex-shrink-0 w-full bg-[#2b2b2b] backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-4 shadow-md flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <img
                                                src={rating.user.imgname}
                                                alt={rating.user.name}
                                                className="w-10 h-10 rounded-full object-cover mr-3"
                                            />
                                            <div>
                                                <p className="font-semibold text-lg">{rating.user.name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(rating.created_date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="fill-yellow-500 text-yellow-500 mr-1" />
                                            <span className="text-lg font-bold">{rating.rating}/10</span>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-primary">
                                            Review
                                        </span>
                                    </div>

                                    <p className="mb-4 text-sm ">{rating.review}</p>
                                </div>

                                <div className="flex items-center justify-start mt-auto">
                                    <button
                                        onClick={() => handleLike(rating.rating_id)}
                                        className={`flex items-center transition ${rating.is_liked_by_me
                                                ? "text-[#b56bbc]"
                                                : "text-gray-500 hover:text-[#b56bbc]"
                                            }`}
                                    >
                                        <ThumbsUp
                                            size={16}
                                            className={`w-5 h-5 mr-1 ${rating.is_liked_by_me ? "fill-current" : ""
                                                }`}
                                        />
                                        {rating.total_likes > 0 && (
                                            <span className="text-sm">{rating.total_likes}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading more indicator */}
                {ratingsLoading && !initialLoad && (
                    <div className="flex justify-center py-8">
                        <div className="grid gap-4 w-full">
                            <SkeletonReview />
                            <SkeletonReview />
                        </div>
                    </div>
                )}

                {/* Intersection observer target */}
                {hasMore && !ratingsLoading && (
                    <div ref={observerRef} className="h-4 w-full" />
                )}
            </div>
        </div>
        // </PageTransitionWrapper>
    )
}