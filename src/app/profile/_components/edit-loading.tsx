const  EditSkeletonLoader = () => {
  return (
    <div className="flex flex-col min-h-screen px-6 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-[#2b2b2b]"></div>
        <div className="mx-auto pr-10">
          <div className="h-6 bg-[#2b2b2b] rounded w-32"></div>
        </div>
      </div>

      {/* Profile Picture Skeleton */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#2b2b2b] mb-2"></div>
        <div className="h-4 bg-[#2b2b2b] rounded w-24 mb-2"></div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#2b2b2b] rounded w-12"></div>
          <div className="h-12 bg-[#2b2b2b] rounded-xl"></div>
        </div>

        {/* Email Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#2b2b2b] rounded w-16"></div>
          <div className="h-12 bg-[#2b2b2b] rounded-xl"></div>
        </div>

        {/* Location Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#2b2b2b] rounded w-20"></div>
          <div className="h-12 bg-[#2b2b2b] rounded-xl"></div>
        </div>

        {/* DOB Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#2b2b2b] rounded w-24"></div>
          <div className="h-12 bg-[#2b2b2b] rounded-xl"></div>
        </div>

        {/* Gender Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#2b2b2b] rounded w-16"></div>
          <div className="h-12 bg-[#2b2b2b] rounded-xl"></div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-12 bg-[#2b2b2b] rounded-xl mt-6"></div>
      </div>
    </div>
  )
}

export default EditSkeletonLoader;