"use client";

import React from "react";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface MovieBuddy {
    user_id: number;
    name?: string;
    imgname?: string;
}

interface MovieBuddiesSectionProps {
    movies?: MovieBuddy[];
}

const MovieBuddiesSection: React.FC<MovieBuddiesSectionProps> = ({ movies = [] }) => {
    const router = useRouter();

    if (!movies || movies.length === 0) return null; // Don't render if no movie buddies

    return (
        <div className="w-full mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Movie Buddies</h3>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                {movies.slice(0, 10).map((buddy, index) => (
                    <div
                        key={index}
                        onClick={() =>
                            router.push(`/friends/friend-profile-detail?profile_id=${buddy.user_id}`)
                        }
                        className="text-center min-w-16 cursor-pointer"
                    >
                        <img
                            src={buddy.imgname?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                            alt={buddy.name || "Movie Buddy"}
                            className="w-18 h-18 rounded-full object-cover  shadow"
                        />
                        {buddy.name && (
                            <div className="text-sm text-white/80 mt-1 truncate w-16">
                                {buddy.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieBuddiesSection;
