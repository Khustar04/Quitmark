import { Check, Flame, ShieldCheck } from 'lucide-react';

export default function ProductPreview() {
  // 14-day visual check-in history representation
  const checkInDays = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    completed: i < 12,
    isToday: i === 11,
  }));

  return (
    <section className="product-preview-section max-w-2xl mx-auto px-4 pb-16 sm:pb-24">
      {/* Container Frame */}
      <div className="product-preview-card relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl dark:shadow-black/40 p-5 sm:p-7 transition-colors">
        {/* Subtle top indicator bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white text-base sm:text-lg">
              Daily Habit
            </h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Quit Goal
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Day 12 • Streak Active</span>
          </div>
        </div>

        {/* Central Metric */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
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

        {/* 14-Day Visual Grid */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Recent History (Last 14 Days)</span>
            <span>12 / 14 Days</span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
            {checkInDays.map((item) => (
              <div
                key={item.day}
                className="flex flex-col items-center gap-1"
                title={`Day ${item.day}: ${item.completed ? 'Completed' : 'Upcoming'}`}
              >
                <div
                  className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold transition-all ${
                    item.completed
                      ? item.isToday
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-sm shadow-emerald-500/30'
                        : 'bg-emerald-500/20 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-600 border border-zinc-200/50 dark:border-zinc-800'
                  }`}
                >
                  {item.completed ? (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <span>{item.day}</span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                  D{item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection Snippet */}
        <div className="rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/40 p-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="italic">"Stayed consistent today."</span>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Today</span>
        </div>
      </div>
    </section>
  );
}
