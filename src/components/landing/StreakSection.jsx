import { Flame } from 'lucide-react';

export default function StreakSection() {
  return (
    <section className="streak-section max-w-4xl mx-auto px-4 py-16 sm:py-24 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="streak-card rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950/90 p-8 sm:p-12 text-center relative overflow-hidden transition-colors shadow-sm">
        {/* Subtle decorative streak pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6">
          <Flame className="w-4 h-4 fill-emerald-500/20" />
          <span>The Streak Mindset</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
          One day at a time.
        </h2>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          You don't need to think about quitting forever.
          <br className="hidden sm:inline" /> You only need to focus on completing today.
        </p>

        {/* Visual streak emphasis card */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              12 day streak
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Every streak is built one day at a time.
          </span>
        </div>
      </div>
    </section>
  );
}
