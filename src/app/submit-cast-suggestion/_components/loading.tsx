

export default function CastLoading() {
return (
<div className="bg-[#121212] text-gray-100 min-h-screen">
                <div className="mx-auto min-h-screen p-4">
                    {/* Header Skeleton */}
                    <header className="flex items-center gap-3 mb-6 pt-6">
                        <div className="w-10 h-10 bg-[#2b2b2b] rounded-full animate-pulse"></div>
                        <div className="flex flex-col">
                            <div className="w-24 h-5 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                            <div className="w-32 h-3 bg-[#2b2b2b] rounded animate-pulse"></div>
                        </div>
                    </header>

                    {/* Movie Card Skeleton */}
                    <div className="bg-[#1f1f1f] rounded-2xl p-3 shadow-lg mb-4 flex items-start gap-4">
                        <div className="w-20 h-28 bg-[#2b2b2b] rounded-lg animate-pulse"></div>
                        <div className="flex-1">
                            <div className="w-3/4 h-6 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
                            <div className="flex items-center gap-3 mt-2 mb-2">
                                <div className="w-16 h-6 bg-[#2b2b2b] rounded animate-pulse"></div>
                                <div className="w-8 h-4 bg-[#2b2b2b] rounded animate-pulse"></div>
                            </div>
                            <div className="w-full h-3 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                            <div className="w-full h-3 bg-[#2b2b2b] rounded animate-pulse mb-1"></div>
                            <div className="w-2/3 h-3 bg-[#2b2b2b] rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Roles Skeleton */}
                    <div className="relative mb-6">
                        <div className="w-16 h-6 bg-[#2b2b2b] rounded animate-pulse mb-2"></div>
                        <div className="flex gap-3 overflow-x-auto">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex-shrink-0 w-26 p-2 bg-[#2b2b2b] rounded-lg animate-pulse">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-600 rounded-full mb-2"></div>
                                        <div className="w-16 h-3 bg-gray-600 rounded mb-1"></div>
                                        <div className="w-20 h-3 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Role Skeleton */}
                    <div className="bg-[#2b2b2b] rounded-xl p-3 shadow mb-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="w-24 h-4 bg-gray-600 rounded mb-2"></div>
                                <div className="w-32 h-3 bg-gray-600 rounded"></div>
                            </div>
                            <div className="w-16 h-8 bg-gray-600 rounded"></div>
                        </div>
                        <div className="mt-3 w-40 h-3 bg-gray-600 rounded"></div>
                    </div>

                    {/* Most Fan Suggestions Skeleton */}
                    <div className="space-y-3 mb-6">
                        <div className="w-40 h-6 bg-[#2b2b2b] rounded animate-pulse mb-3"></div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#2b2b2b] rounded-xl p-3 shadow flex items-center gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="w-32 h-4 bg-gray-600 rounded mb-2"></div>
                                    <div className="w-full h-2 bg-gray-700 rounded mb-1"></div>
                                    <div className="flex justify-between">
                                        <div className="w-12 h-3 bg-gray-600 rounded"></div>
                                        <div className="w-8 h-3 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Fan Suggestions Skeleton */}
                    <div className="space-y-3 mb-20">
                        <div className="w-32 h-6 bg-[#2b2b2b] rounded animate-pulse mb-3"></div>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#2b2b2b] rounded-xl p-3 shadow flex items-center gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="w-28 h-4 bg-gray-600 rounded mb-2"></div>
                                    <div className="w-full h-2 bg-gray-700 rounded mb-1"></div>
                                    <div className="flex justify-between">
                                        <div className="w-16 h-3 bg-gray-600 rounded"></div>
                                        <div className="w-10 h-3 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )
        }