import { Flame, ShieldCheck } from 'lucide-react';

export default function ProductPreview() {

  return (
    <section className="product-preview-section max-w-2xl mx-auto px-4 pb-16 sm:pb-24">
      {/* Container Frame */}
      <div className="product-preview-card relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-lg shadow-zinc-900/5 dark:shadow-2xl dark:shadow-black/40 px-6 py-7 sm:px-8 sm:py-8 transition-colors">
        {/* Subtle top indicator bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white text-base sm:text-lg">
              Daily Habit
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Quit Goal
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Day 12 • Streak Active</span>
          </div>
        </div>

        {/* Central Metric */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Current Progress
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                12 day streak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Checked in today</span>
          </div>
        </div>
      </div>
    </section>
  );
}
