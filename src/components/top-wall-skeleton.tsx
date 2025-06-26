export const PodiumSkeleton = () => (
    <div className="px-4">
        <div className="flex items-end justify-center gap-10">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2 rounded-lg bg-[#2b2b2b] animate-pulse"></div>
                <div className="w-12 h-4 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                <div className="w-8 h-3 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
                <div className="bg-[#2b2b2b] rounded-t-lg w-16 h-24 flex items-center justify-center">
                    <div className="w-4 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
                </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-[#2b2b2b]/50 rounded mb-1 animate-pulse"></div>
                <div className="w-20 h-20 mb-2 rounded-lg bg-[#2b2b2b] animate-pulse ring-4 ring-gray-300/50"></div>
                <div className="w-16 h-4 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                <div className="w-10 h-3 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
                <div className="bg-[#2b2b2b] rounded-t-lg w-20 h-32 flex items-center justify-center">
                    <div className="w-6 h-8 bg-[#2b2b2b] rounded animate-pulse"></div>
                </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2 rounded-lg bg-[#2b2b2b] animate-pulse"></div>
                <div className="w-12 h-4 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                <div className="w-8 h-3 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
                <div className="bg-[#2b2b2b] rounded-t-lg w-16 h-22 flex items-center justify-center">
                    <div className="w-4 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
)

export const RankingItemSkeleton = () => (
    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
        <div className="w-6 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
        <div className="w-12 h-16 rounded-lg bg-[#2b2b2b] animate-pulse"></div>
        <div className="flex-1">
            <div className="w-32 h-5 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
            <div className="w-24 h-4 bg-[#2b2b2b] rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#2b2b2b] rounded animate-pulse ml-2"></div>
        </div>
    </div>
)