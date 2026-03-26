export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3"></div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg"
          ></div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
}
