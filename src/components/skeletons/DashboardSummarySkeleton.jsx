import Skeleton from './Skeleton';

export default function DashboardSummarySkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[0, 1].map((index) => <div key={index} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.04] dark:bg-[#191c1f]"><Skeleton className="mb-4 h-3 w-24" /><Skeleton className="h-8 w-16" /><Skeleton className="mt-2 h-3 w-20" /></div>)}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.04] dark:bg-[#191c1f]"><Skeleton className="mb-4 h-3 w-20" /><div className="flex gap-1.5">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-6 flex-1 rounded-sm" />)}</div></div>
    </div>
  );
}
