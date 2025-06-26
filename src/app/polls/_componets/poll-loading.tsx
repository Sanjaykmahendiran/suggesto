
const PollCardSkeleton = () => (
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
)

export default PollCardSkeleton;