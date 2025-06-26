"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

type LongTimeWatchListType = {
    movie_id: number;
    title: string;
    poster_path?: string;
    progress: number;
    episode?: string;
};

type ContinueWatchingProps = {
    isLoading: boolean;
    longTimeWatchList: LongTimeWatchListType[];
};

const SkeletonContinueWatching = () => (
    <div className="relative min-w-[160px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#2b2b2b]" />
        <div className="absolute bottom-8 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-1 w-full bg-[#2b2b2b]/60 rounded-full" />
        </div>
    </div>
)

export default function ContinueWatching({ isLoading, longTimeWatchList }: ContinueWatchingProps) {
    const router = useRouter();

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Long Time Watch List</h2>
                {/* <a href="#" className="text-sm text-primary">
                    See All
                </a> */}
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {isLoading ? (
                    <>
                        <SkeletonContinueWatching />
                        <SkeletonContinueWatching />
                    </>
                ) : (
                    longTimeWatchList.map((item) => (
                        <motion.div
                            key={item.movie_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.movie_id * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[160px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/movie-detail-page?movie_id${item.movie_id}`)}
                        >
                            <Image
                                src={item.poster_path || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>


                            <div className="absolute bottom-2 left-2">
                                <h3 className="text-sm font-medium text-white">{item.title}</h3>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
