"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type MovieType = {
    id: number;
    title: string;
    imageSrc?: string;
    rating: number;
};

type YourWatchListProps = {
    isLoading: boolean;
    yourWatchList: MovieType[];
};

const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#2b2b2b]" />
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
        </div>
    </div>
)

export default function YourWatchList({ isLoading, yourWatchList }: YourWatchListProps) {
    const router = useRouter();

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Your Watchlist</h2>
                </div>
                <a href="#" className="text-sm text-primary">
                    See All
                </a>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {isLoading ? (
                    <>
                        <SkeletonMovie />
                        <SkeletonMovie />
                        <SkeletonMovie />
                        <SkeletonMovie />
                    </>
                ) : (
                    yourWatchList.map((movie) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: movie.id * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/movie/${movie.id}`)}
                        >
                            <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                                {movie.rating}
                            </div>
                            <div className="absolute bottom-2 left-2">
                                <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                            </div>
                        </motion.div>
                    )))}
            </div>
        </div>
    );
}
