import DoctorCardSkeleton from "@/components/DoctorCardSkeleton";

/**
 * Loading Skeleton for /app/doctors/
 * Immediately renders when page is loading
 * Shows professional shimmer skeletons + 6 skeleton cards
 * GPU-optimized animations using pure CSS
 */

export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton with Shimmer */}
        <div className="mb-12">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-lg w-1/2 mb-4"></div>
          <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-lg w-2/3"></div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-lg w-full"></div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-full"
                style={{ width: `${80 + i * 25}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Doctor Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
