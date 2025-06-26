// Skeleton Loading Components
export const MovieCardSkeleton = () => (
  <div className="flex gap-4 py-3 border-b border-gray-800 px-2 animate-pulse">
    <div className="flex-shrink-0 w-16 h-24 bg-[#2b2b2b] rounded-md"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-[#2b2b2b] rounded w-3/4"></div>
      <div className="h-4 bg-[#2b2b2b] rounded w-1/4"></div>
      <div className="h-4 bg-[#2b2b2b] rounded w-full"></div>
      <div className="h-4 bg-[#2b2b2b] rounded w-5/6"></div>
    </div>
  </div>
)

export const SearchResultsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <MovieCardSkeleton key={index} />
    ))}
  </div>
)

export const FilteredResultsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="flex gap-4 py-3 border-b border-gray-800 px-2 animate-pulse">
        <div className="flex-shrink-0 w-16 h-24 bg-[#2b2b2b] rounded-md relative">
          <div className="absolute top-1 right-1 bg-gray-600 rounded-full w-6 h-4"></div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-[#2b2b2b] rounded w-3/4"></div>
          <div className="h-4 bg-[#2b2b2b] rounded w-1/4"></div>
          <div className="h-4 bg-[#2b2b2b] rounded w-full"></div>
          <div className="h-4 bg-[#2b2b2b] rounded w-4/5"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-6 bg-[#2b2b2b] rounded w-16"></div>
            <div className="h-6 bg-[#2b2b2b] rounded w-20"></div>
            <div className="h-6 bg-[#2b2b2b] rounded w-14"></div>
          </div>
          <div className="flex gap-1 items-center mt-2">
            <div className="h-3 bg-[#2b2b2b] rounded w-20"></div>
            <div className="w-4 h-4 bg-[#2b2b2b] rounded"></div>
            <div className="w-4 h-4 bg-[#2b2b2b] rounded"></div>
            <div className="w-4 h-4 bg-[#2b2b2b] rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)