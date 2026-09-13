import { Plus, Target } from 'lucide-react';

export default function EmptyHabitsState({ onCreateClick }) {
  return (
    <div className="empty-state-card text-center py-16 sm:py-20 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-[#232936] bg-zinc-50/50 dark:bg-[#0D0F17]/60">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
        <Target className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
        Nothing to track yet.
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
        Create your first habit and start with today.
      </p>

      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-600/25 hover:shadow-emerald-600/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        <Plus className="w-4 h-4" />
        <span>+ Create Your First Habit</span>
      </button>
    </div>
  );
}

