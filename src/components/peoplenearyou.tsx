"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { Share2, Sparkles, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface MovieType {
  id: number;
  title: string;
  imageSrc: string | StaticImageData;
  rating: number;
}

type PeopleNearYouProps = {
    isLoading: boolean;
    peopleNearYou: MovieType[];
};

const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full bg-[#2b2b2b]" />
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
        </div>
    </div>
)

const SkeletonPeopleNearby = () => (
    <div className="bg-[#2b2b2b] rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                <div className="flex -space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
                    <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
                    <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
                </div>
                <div className="ml-2">
                    <Skeleton className="h-4 w-24 mb-1 bg-[#181826]" />
                    <Skeleton className="h-3 w-32 bg-[#181826]" />
                </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full bg-[#181826]" />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <SkeletonMovie />
            <SkeletonMovie />
            <SkeletonMovie />
        </div>
    </div>
)


  const requestLocationPermission = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success callback
          // In a real app, you would send these coordinates to your backend
          console.log("Location access granted:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })

          // Here you would fetch nearby trending movies based on location
          // For now we'll just show a success message
          alert("Location updated! Showing trending titles near you.")
        },
        (error) => {
          // Error callback
          console.error("Error getting location:", error)
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please enable location services to see what people near you are watching.")
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

export default function PeopleNearYouWatching({ isLoading, peopleNearYou }: PeopleNearYouProps) {
    const router = useRouter();

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#9370ff]" />
                    <h2 className="text-lg font-semibold">People Near You Watching</h2>
                </div>
                <a href="#" className="text-sm text-[#9370ff]">
                    See All
                </a>
            </div>

            {isLoading ? (
                <SkeletonPeopleNearby />
            ) : (
                <div className="bg-[#2b2b2b] rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <div className="relative">
                                {/* Stacked avatars showing multiple nearby users */}
                                <div className="flex -space-x-2">
                                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                                        <AvatarImage src="/placeholder.svg" alt="User" />
                                        <AvatarFallback>U1</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                                        <AvatarImage src="/placeholder.svg" alt="User" />
                                        <AvatarFallback>U2</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                                        <AvatarImage src="/placeholder.svg" alt="User" />
                                        <AvatarFallback>U3</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <div className="ml-2">
                                <p className="text-sm font-medium">12 people nearby</p>
                                <p className="text-xs text-gray-400">Within 5 miles of you</p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs rounded-full h-8 border-gray-600 hover:bg-[#b56bbc]/20"
                            onClick={() => requestLocationPermission()}
                        >
                            Refresh
                        </Button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {peopleNearYou.slice(0, 3).map((movie) => (
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
                                <div className="absolute top-2 right-2 bg-[#b56bbc] text-white text-xs px-1.5 py-0.5 rounded">
                                    Trending
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
