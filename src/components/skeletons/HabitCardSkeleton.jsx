import Skeleton from './Skeleton';

export default function HabitCardSkeleton() {
  return <article aria-hidden="true" className="flex min-h-[320px] flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-[#232936] dark:bg-[#131722] sm:p-6"><Skeleton className="h-7 w-3/5" /><div className="mt-5 flex items-center gap-3.5"><Skeleton className="h-12 w-12 shrink-0 rounded-xl" /><div className="flex flex-col gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-20" /></div></div><div className="flex-grow" /><div className="border-t border-zinc-100 pt-4 dark:border-[#232936]"><Skeleton className="mb-3 h-3 w-24" /><div className="flex flex-col gap-2.5 sm:flex-row"><Skeleton className="h-11 flex-1 rounded-xl" /><Skeleton className="h-11 flex-1 rounded-xl" /></div></div><div className="mt-4 flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800"><Skeleton className="h-7 w-20" /><Skeleton className="h-7 w-16" /></div></article>;
}
