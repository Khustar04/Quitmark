import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export default function GoalEditModal({ goal, habits = [], onClose, onSave, isSaving = false, error = '' }) {
  const [formData, setFormData] = useState(() => ({
    name: goal?.name || '',
    category: goal?.category || 'Personal',
    target_date: goal?.target_date || '',
    habit_ids: goal?.habit_ids || [],
  }));

  const selectedHabitIds = useMemo(() => new Set(formData.habit_ids), [formData.habit_ids]);
  const toggleHabit = (habitId) => {
    setFormData((current) => ({
      ...current,
      habit_ids: current.habit_ids.includes(habitId)
        ? current.habit_ids.filter((id) => id !== habitId)
        : [...current.habit_ids, habitId],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const [startYear, startMonth, startDay] = goal.start_date.split('-').map(Number);
    const [targetYear, targetMonth, targetDay] = formData.target_date.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const target = new Date(targetYear, targetMonth - 1, targetDay);
    const durationDays = Math.max(1, Math.round((target - start) / 86400000));
    onSave({ ...goal, ...formData, duration_days: durationDays });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161a1f] p-5 sm:p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-goal-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="edit-goal-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Goal</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close edit goal dialog"><X className="h-4 w-4" /></button>
        </div>

        <label className="mb-4 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Goal name
          <input required maxLength="120" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-white/[0.1] dark:bg-[#101419] dark:text-white" />
        </label>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Category
            <input maxLength="60" value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-white/[0.1] dark:bg-[#101419] dark:text-white" />
          </label>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Target date
            <input required type="date" min={goal?.start_date} value={formData.target_date} onChange={(event) => setFormData((current) => ({ ...current, target_date: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-white/[0.1] dark:bg-[#101419] dark:text-white" />
          </label>
        </div>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Connected habits</legend>
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-white/[0.1]">
            {habits.length === 0 ? <p className="p-2 text-sm text-slate-500">No habits available.</p> : habits.map((habit) => (
              <label key={habit.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                <input type="checkbox" checked={selectedHabitIds.has(habit.id)} onChange={() => toggleHabit(habit.id)} className="h-4 w-4 accent-emerald-500" />
                <span className="text-sm text-slate-800 dark:text-slate-100">{habit.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/[0.08]">Cancel</button>
          <button type="submit" disabled={isSaving} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{isSaving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
