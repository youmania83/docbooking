"use client";

/**
 * DoctorCardSkeleton
 * High-performance skeleton loader with shimmer effect
 * - Pure Tailwind CSS animation
 * - GPU-optimized (uses opacity only)
 * - ~200 bytes gzipped
 */

export default function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="p-6">
        {/* Avatar Skeleton */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse mb-4"></div>

        {/* Doctor Name Skeleton */}
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-lg mb-3 w-3/4"></div>

        {/* Specialty Skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-lg mb-4 w-1/2"></div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Experience */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-100 animate-pulse rounded w-16"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-20"></div>
          </div>
          {/* Fee */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-100 animate-pulse rounded w-12"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        {/* Button Skeleton 1 */}
        <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-lg"></div>
        {/* Button Skeleton 2 */}
        <div className="flex-1 h-10 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
}
