"use client"
import { useEffect, useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Review {
    is_liked_by_me: any;
    total_likes: number;
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

    // Fixed fetchReviews function to handle the actual API response structure
    const fetchReviews = async () => {
        try {
            const res = await fetch(
                `https://suggesto.xyz/App/api.php?gofor=ratinglist&viewer_id=${viewer_id}&movie_id=${movie_id}`
            )
            const data = await res.json()
            
            // Handle the actual response structure where ratings are in data.ratings
            if (data.ratings && Array.isArray(data.ratings)) {
                // You can categorize reviews here if needed based on some criteria
                // For now, treating all as "other" since the API doesn't specify friend/other distinction
                const processedReviews = data.ratings.map((r: any) => ({ 
                    ...r, 
                    source: "other" as const // You can add logic here to determine friend vs other
                }))
                setReviews(processedReviews)
            } else {
                // Fallback to handle your original expected structure if API changes
                const friends = (data.friend_ratings || []).map((r: Review) => ({ ...r, source: "friend" }))
                const others = (data.other_ratings || []).map((r: Review) => ({ ...r, source: "other" }))
                setReviews([...friends, ...others])
            }
        } catch (error) {
            console.error("Error fetching reviews:", error)
            setReviews([])
        }
    }

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

            if (result.liked) {
                toast.success("Liked Successfully");
                fetchReviews()
            } else {
                toast.success("Unliked Successfully");
                fetchReviews()
            }

        } catch (error) {
            console.error("Error liking review:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
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
            className="flex-shrink-0 w-70 bg-[#2b2b2b] backdrop-blur-sm border  rounded-xl p-4 shadow-md flex flex-col justify-between"
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
                    className="flex items-center text-gray-500 transition"
                >
                    <ThumbsUp
                        size={16}
                        className={`w-5 h-5 mr-1  ${review.is_liked_by_me ? "text-white fill-white/70" : "text-gray-500"}`}
                    />

                    {review.total_likes > 0 && (
                        <span className="ml-1 text-sm text-white">{review.total_likes}</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Top Reviews</h2>
                {reviews.length > 0 && (
                    <div
                        onClick={() =>
                            router.push(`/ratings?movie_id=${movie_id}&viewer_id=${viewer_id}`)
                        }
                        className="flex items-center text-sm text-[#b56bbc] font-medium cursor-pointer hover:underline"
                    >
                        <span className="mr-1">See All</span>
                        <span className="bg-[#b56bbc]/10 text-[#b56bbc] px-2 py-0.5 rounded-full text-xs">
                            {reviews.length}
                        </span>
                    </div>
                )}
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