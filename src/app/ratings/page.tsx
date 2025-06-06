"use client"

import { useEffect, useState } from "react"
import { Star, ThumbsUp, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

interface Review {
    rating_id: string
    user_id: number
    movie_id: number
    rating: number
    review: string
    status: number
    created_date: string
    modified_date: string
    source: "friend" | "other"
    user: {
        user_id: number
        name: string
        imgname: string
    }
}

interface ApiResponse {
    friend_ratings: Omit<Review, 'source'>[]
    other_ratings: Omit<Review, 'source'>[]
    friend_count: number
    total_count: number
}

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

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(
                    `https://suggesto.xyz/App/api.php?gofor=ratinglist&viewer_id=${viewer_id}&movie_id=${movie_id}`
                )
                const data: ApiResponse = await res.json()

                const friends = (data.friend_ratings || []).map((r) => ({ ...r, source: "friend" as const }))
                const others = (data.other_ratings || []).map((r) => ({ ...r, source: "other" as const }))

                setRatings([...friends, ...others])
            } catch (error) {
                console.error("Error fetching reviews:", error)
            }
        }

        if (viewer_id && movie_id) {
            fetchReviews()
        }
    }, [viewer_id, movie_id])

    const handleLike = async (ratingId: string) => {
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
            // Optional: Show feedback or update UI based on result
        } catch (error) {
            console.error("Error liking review:", error);
        }
    };

    return (

        // <PageTransitionWrapper>
            <div className="max-w-2xl mx-auto min-h-screen">
                <header className="flex items-center p-4 relative">
                    <button
                        className="p-2 rounded-full bg-[#292938]"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-medium">
                        Movie Reviews
                    </h1>
                </header>

                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Reviews</h2>

                    {ratings.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">No reviews found.</p>
                    ) : (
                        <div className="grid gap-4">
                            {ratings.map((rating) => (
                                <div
                                    key={rating.rating_id}
                                    className="flex-shrink-0 w-full bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm border border-[#6c5ce7]/20 rounded-xl p-4 shadow-md flex flex-col justify-between"
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
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full ${rating.source === "friend"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {rating.source === "friend" ? "Friend" : "Viewer"}
                                            </span>
                                        </div>

                                        <p className="mb-4 text-sm ">{rating.review}</p>
                                    </div>

                                    <div className="flex items-center justify-start mt-auto">
                                        <button
                                            onClick={() => handleLike(rating.rating_id)}
                                            className="flex items-center text-gray-500 hover:text-[#6c5ce7] transition"
                                        >
                                            <ThumbsUp size={16} className="w-5 h-5 mr-1" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        // </PageTransitionWrapper>

    )
}