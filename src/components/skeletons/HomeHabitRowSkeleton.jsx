import Skeleton from './Skeleton';

export default function HomeHabitRowSkeleton() {
  return <div aria-hidden="true" className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-sm dark:border-[#232936] dark:bg-[#131722] sm:p-4"><div className="flex min-w-0 items-center gap-3.5"><Skeleton className="h-11 w-11 shrink-0 rounded-xl" /><div className="flex flex-col gap-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-7 w-7 rounded-lg" /></div></div>;
}
