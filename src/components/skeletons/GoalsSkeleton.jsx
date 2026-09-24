import Skeleton from './Skeleton';

export default function GoalsSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-left animate-in fade-in duration-200">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col mb-8">
        <Skeleton className="h-3 w-16 mb-2" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-44 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl self-start sm:self-auto" />
        </div>
      </div>

      {/* 2. Grid of Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((key) => (
          <div
            key={key}
            className="flex flex-col p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-1.5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            <div className="space-y-2 my-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between mt-auto">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
