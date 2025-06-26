import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for suggestions
const SkeletonSuggestion = () => (
  <div className="bg-[#2b2b2b] rounded-lg w-full">
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

const RequestCardSkeleton = () => (
    <div className="rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-600/50 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-600/50 rounded"></div>
                    <div className="h-3 w-1/3 bg-gray-600/50 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-600/50 rounded"></div>
                    <div className="h-3 w-12 bg-gray-600/50 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

const MovieCardSkeleton = () => (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 animate-pulse">
        <div className="aspect-[2/3] bg-gray-600/50 rounded-md mb-3"></div>
        <div className="space-y-2">
            <div className="h-4 w-full bg-gray-600/50 rounded"></div>
            <div className="h-3 w-2/3 bg-gray-600/50 rounded mx-auto"></div>
        </div>
    </div>
);

export  { SkeletonSuggestion, RequestCardSkeleton, MovieCardSkeleton };