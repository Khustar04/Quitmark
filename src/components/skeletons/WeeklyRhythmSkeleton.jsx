import Skeleton from './Skeleton';

export default function WeeklyRhythmSkeleton({ className = '' }) {
  return (
    <section aria-hidden="true" className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/[0.06] dark:bg-[#141a1e] ${className}`}>
      <div className="mb-3 flex items-center justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-12" /></div>
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {Array.from({ length: 7 }, (_, index) => <div key={index} className="flex flex-col items-center gap-1.5"><Skeleton className="h-3 w-3" /><Skeleton className="min-h-[46px] w-full rounded-lg" /></div>)}
      </div>
    </section>
  );
}
