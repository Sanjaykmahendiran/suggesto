import { Skeleton } from "@/components/ui/skeleton";


const LoadingSkeleton = () => (
  <div className="px-4">
    {/* Movie Carousel Skeleton */}
    <div className="h-[400px] w-80 flex items-center bg-[#2b2b2b] justify-center mb-8">
      <Skeleton className="h-[400px] rounded-lg " />
    </div>

    {/* Section Skeletons */}
    {[1, 2, 3].map((section) => (
      <div key={section} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40 bg-[#2b2b2b]" />
          <Skeleton className="h-4 w-16 bg-[#2b2b2b]" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="min-w-[120px] h-[180px] rounded-lg bg-[#2b2b2b]" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default LoadingSkeleton;