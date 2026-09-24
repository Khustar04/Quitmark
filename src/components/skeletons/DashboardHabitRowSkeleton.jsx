import Skeleton from './Skeleton';

export default function DashboardHabitRowSkeleton() {
  return (
    <article aria-hidden="true" className="flex min-h-16 items-center justify-between rounded-xl bg-white p-3.5 dark:bg-[#191c1f] sm:p-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2"><Skeleton className="h-4 w-36 sm:w-44" /><Skeleton className="h-5 w-16 rounded-full" /></div>
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="hidden h-4 w-16 sm:block" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="hidden h-8 w-8 rounded-lg sm:block" />
      </div>
    </article>
  );
}
