const PremiumSkeleton = () => {
    return (
        <div className="fixed inset-0 max-w-sm mx-auto min-h-screen animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center px-4 py-2 pt-8">
                <div className="w-6 h-6 bg-gray-300/20 rounded-full"></div>
            </div>

            {/* Logo Skeleton */}
            <div className="relative px-6 py-2">
                <div className="w-full max-w-xs mx-auto relative h-24">
                    <div className="w-full h-full bg-gray-300/20 rounded-lg"></div>
                </div>
            </div>

            {/* Title Skeleton */}
            <div className="text-center px-6 mb-8">
                <div className="h-6 bg-gray-300/20 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300/20 rounded w-1/2 mx-auto"></div>
            </div>

            {/* Feature Cards Skeleton */}
            <div className="px-6 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="bg-gradient-to-br from-[#2b2b2b]/10 to-[#2b2b2b]/5 backdrop-blur-sm border border-[#2b2b2b]/20 rounded-xl p-3 text-center shadow flex flex-col items-center justify-start max-h-[180px] h-[180px]"
                        >
                            <div className="w-16 h-16 rounded-lg bg-gray-300/20 mb-3"></div>
                            <div className="w-full space-y-2">
                                <div className="h-2 bg-gray-300/20 rounded"></div>
                                <div className="h-2 bg-gray-300/20 rounded w-4/5 mx-auto"></div>
                                <div className="h-2 bg-gray-300/20 rounded w-3/5 mx-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Dots Skeleton */}
                <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3].map((dot) => (
                        <div
                            key={dot}
                            className="w-3 h-3 rounded-full bg-gray-300/30"
                        />
                    ))}
                </div>
            </div>

            {/* Pricing Card Skeleton */}
            <div className="px-6 mb-6">
                <div className="bg-gradient-to-br from-[#2b2b2b]/50 to-[#2b2b2b] backdrop-blur-sm border border-[#2b2b2b]/20 rounded-full p-4 flex items-center justify-between shadow-lg w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-300/20 rounded-full"></div>
                        <div className="space-y-1">
                            <div className="h-3 bg-gray-300/20 rounded w-16"></div>
                            <div className="h-4 bg-gray-300/20 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="h-5 bg-gray-300/20 rounded w-20"></div>
                        <div className="h-3 bg-gray-300/20 rounded w-16"></div>
                    </div>
                </div>
            </div>

            {/* Terms Checkbox Skeleton */}
            <div className="px-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-300/20 rounded"></div>
                    <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-300/20 rounded"></div>
                        <div className="h-3 bg-gray-300/20 rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="px-6 mb-4">
                <div className="w-full h-12 bg-gray-300/20 rounded-full"></div>
            </div>

            {/* Contact Links Skeleton */}
            <div className="text-center px-6 mb-6">
                <div className="h-3 bg-gray-300/20 rounded w-2/3 mx-auto"></div>
            </div>
        </div>
    )
}

export default PremiumSkeleton