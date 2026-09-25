import { Flame } from 'lucide-react';

export default function StreakSection() {
  return (
    <section className="streak-section max-w-4xl mx-auto px-4 py-10 sm:py-14 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="streak-card rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 p-6 sm:p-10 text-center relative overflow-hidden transition-colors shadow-sm">
        {/* Subtle decorative streak pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-5">
          <Flame className="w-4 h-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          <span>The Streak Mindset</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          One day at a time.
        </h2>

        <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          You don't need to think about quitting forever.
          <br className="hidden sm:inline" /> You only need to focus on completing today.
        </p>

        {/* Visual streak emphasis card */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              12 day streak
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Every streak is built one day at a time.
          </span>
        </div>
      </div>
    </section>
  );
}
