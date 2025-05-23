"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { Share2, Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SuggestionType {
  movsug_id: number;
  title: string;
  imageSrc: string | StaticImageData;
  friend: string;
  friendAvatar: string | StaticImageData;
  note: string;
  date: string;
}

type SuggestionProps = {
    isLoading: boolean;
    receivedSuggestions: SuggestionType[];
};

  const SkeletonSuggestion = () => (
    <div className="bg-[#292938] rounded-lg w-full">
      <div className="flex p-3">
        <Skeleton className="w-20 h-28 rounded-lg bg-[#181826]" />
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-5 h-5 rounded-full bg-[#181826]" />
            <Skeleton className="h-3 w-24 bg-[#181826]" />
          </div>
          <Skeleton className="h-4 w-32 mb-2 bg-[#181826]" />
          <Skeleton className="h-16 w-full bg-[#181826] rounded-lg mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
            <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
            <Skeleton className="h-8 w-8 rounded-full bg-[#181826] ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )

export default function ReceivedSuggestions({ isLoading, receivedSuggestions }: SuggestionProps) {
    const router = useRouter();

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Suggestions from Friends</h2>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                    See All
                </a>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {isLoading ? (
                    <>
                        <SkeletonSuggestion />
                        <SkeletonSuggestion />
                    </>
                ) : (
                    receivedSuggestions.map((suggestion) => (
                        <motion.div
                            key={suggestion.movsug_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#292938] rounded-lg  w-full"
                        >
                            <div className="flex p-3">
                                <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={suggestion.imageSrc || "/placeholder.svg"}
                                        alt={suggestion.title || "Suggestion"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage
                                                src={
                                                    typeof suggestion.friendAvatar === "string"
                                                        ? suggestion.friendAvatar
                                                        : suggestion.friendAvatar?.src || "/placeholder.svg"
                                                }
                                                alt={suggestion.friend || "Friend"}
                                            />
                                            <AvatarFallback>{suggestion.friend?.[0] || "F"}</AvatarFallback>
                                        </Avatar>
                                        <span>{suggestion.friend} suggested</span>
                                        <span className="text-gray-500">• {suggestion.date}</span>
                                    </div>
                                    <h3 className="font-medium mb-1 text-sm">{suggestion.title}</h3>
                                    <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">{suggestion.note}</p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                                            onClick={() => router.push("/movie-detail-page")}
                                        >
                                            Watch Now
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs h-8 px-3 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                                        >
                                            Add to List
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs h-8 w-8 p-0 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                                        >
                                            <Share2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )))}
            </div>
        </div>
    );
}
