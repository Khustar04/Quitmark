import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import gsap from 'gsap';

export default function EditHabitModal({ habit, isOpen, onClose, onUpdate }) {
  const [name, setName] = useState(habit?.name || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && modalRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.96, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        );
      });
      return () => ctx.revert();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  if (!isOpen || !habit) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Habit name cannot be empty.');
      return;
    }

    if (trimmed.length > 60) {
      setError('Habit name cannot exceed 60 characters.');
      return;
    }

    if (trimmed === habit.name) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onUpdate(habit.id, trimmed);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update habit.');
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-habit-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-2xl p-6 sm:p-7 text-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#232936]">
          <h2 id="edit-habit-title" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Edit Habit
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#131722] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="edit-habit-name"
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Habit Name
              </label>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                {name.length}/60
              </span>
            </div>
            <input
              id="edit-habit-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={saving}
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#131722] text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
