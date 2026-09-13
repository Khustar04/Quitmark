import { useState, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import gsap from 'gsap';

export default function DeleteHabitDialog({ habit, isOpen, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && dialogRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          dialogRef.current,
          { opacity: 0, scale: 0.96, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        );
      });
      return () => ctx.revert();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleting, onClose]);

  if (!isOpen || !habit) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !deleting) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      setError(null);
      await onDelete(habit.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete habit.');
      setDeleting(false);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-habit-title"
      aria-describedby="delete-habit-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-2xl p-6 text-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 id="delete-habit-title" className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Delete this habit?
            </h2>
            <p id="delete-habit-desc" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This will permanently delete{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                "{habit.name}"
              </span>{' '}
              and all of its daily check-in history. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#131722] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-600/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
