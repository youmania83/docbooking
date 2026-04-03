export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="h-10 bg-gray-200 rounded-lg mb-4 w-64"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="h-12 bg-gray-200 rounded-lg w-full mb-4"></div>

          {/* Filter Buttons Skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          </div>
        </div>

        {/* Doctor Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="p-6">
                {/* Name */}
                <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>

                {/* Specialty */}
                <div className="h-4 bg-gray-200 rounded-lg w-24 mb-3"></div>

                {/* Experience */}
                <div className="h-3 bg-gray-200 rounded-lg w-20 mb-4"></div>

                {/* Fee */}
                <div className="h-7 bg-gray-200 rounded-lg w-20 mb-6"></div>

                {/* Button */}
                <div className="h-10 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
