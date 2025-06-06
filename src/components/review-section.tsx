"use client"
import { useEffect, useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { useRouter } from "next/navigation";

interface Review {
    rating_id: number
    user_id: number
    movie_id: number
    rating: number
    review: string
    created_date: string
    user: {
        user_id: number
        name: string
        imgname: string
    }
    source: "friend" | "other"
}

interface ReviewSectionProps {
    viewer_id: number
    movie_id: number
}

export default function ReviewSection({ viewer_id, movie_id }: ReviewSectionProps) {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([])

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
            // Optional: Show feedback or update UI based on result
        } catch (error) {
            console.error("Error liking review:", error);
        }
    };


    useEffect(() => {
        const fetchReviews = async () => {
            const res = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=ratinglist&viewer_id=${viewer_id}&movie_id=${movie_id}`
            )
            const data = await res.json()
            const friends = (data.friend_ratings || []).map((r: Review) => ({ ...r, source: "friend" }))
            const others = (data.other_ratings || []).map((r: Review) => ({ ...r, source: "other" }))
            setReviews([...friends, ...others])
        }

        fetchReviews()
    }, [viewer_id, movie_id])

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })

    const renderReviewCard = (review: Review) => (
        <div
            key={review.rating_id}
            className="flex-shrink-0 w-70 bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm border border-[#6c5ce7]/20 rounded-xl p-4 shadow-md flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                        <img
                            src={review.user.imgname}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                            <p className="font-semibold text-lg">{review.user.name}</p>
                            <p className="text-sm text-gray-500">{formatDate(review.created_date)}</p>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <Star className="fill-yellow-500 text-yellow-500 mr-1" />
                        <span className="text-lg font-bold">{review.rating}/10</span>
                    </div>
                </div>

                <div className="mb-2">
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${review.source === "friend"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {review.source === "friend" ? "Friend" : "Viewer"}
                    </span>
                </div>

                <p className="mb-4">{review.review}</p>
            </div>

            {/* Footer with Like Button */}
            <div className="flex items-center justify-start mt-auto">
                <button
                    onClick={() => handleLike(review.rating_id)}
                    className="flex items-center text-gray-500 hover:text-[#6c5ce7] transition"
                >
                   <ThumbsUp size={16}  className="w-5 h-5 mr-1" />
                </button>
            </div>
        </div>
    )

    return (
        <div className="w-full  mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Top Reviews</h2>
                <div onClick={() => router.push(`/ratings?movie_id=${movie_id}&viewer_id=${viewer_id}`)} className="flex items-center text-sm text-[#6c5ce7] font-medium cursor-pointer hover:underline">
                    <span className="mr-1">See All</span>
                    <span className="bg-[#6c5ce7]/10 text-[#6c5ce7] px-2 py-0.5 rounded-full text-xs">
                        {reviews.length}
                    </span>
                </div>
            </div>

            {reviews.length > 0 ? (
                <div className="overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex gap-4 pb-4" style={{ width: 'fit-content' }}>
                        {reviews.slice(0, 10).map(renderReviewCard)}
                    </div>
                    <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                </div>
            ) : (
                <p className="text-gray-500">No reviews available.</p>
            )}
        </div>
    )

}