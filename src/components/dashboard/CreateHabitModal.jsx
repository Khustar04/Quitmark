import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2, TrendingUp, BookOpen, Dumbbell, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { getHabitCategory } from '../../utils/habitCategoryUtils';

const HABIT_CATEGORIES = [
  {
    id: 'General',
    label: 'General',
    icon: TrendingUp,
    activeClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-[#34d399] font-semibold',
  },
  {
    id: 'Learning',
    label: 'Learning',
    icon: BookOpen,
    activeClass: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-semibold',
  },
  {
    id: 'Health',
    label: 'Health',
    icon: Dumbbell,
    activeClass: 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-300 font-semibold',
  },
  {
    id: 'Mindfulness',
    label: 'Mindfulness',
    icon: Sparkles,
    activeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300 font-semibold',
  },
];

export default function CreateHabitModal({ isOpen, onClose, onCreate, initialCategory = 'General' }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory || 'General');
  const [hasUserChosenCategory, setHasUserChosenCategory] = useState(Boolean(initialCategory && initialCategory !== 'All' && initialCategory !== 'General'));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (error) setError(null);

    // Smart auto-detect category if user hasn't explicitly clicked a category pill
    if (!hasUserChosenCategory && val.trim().length >= 3) {
      const detected = getHabitCategory(val).name;
      if (detected && HABIT_CATEGORIES.some((c) => c.id.toLowerCase() === detected.toLowerCase())) {
        setCategory(detected);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a habit name.');
      return;
    }

    if (trimmed.length > 50) {
      setError('Habit name cannot exceed 50 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCreate(trimmed, category);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create habit.');
      setSubmitting(false);
    }
  };

  const sampleHabits = [
    { name: 'Quit Social Media', cat: 'Mindfulness' },
    { name: 'Read 20 Mins Daily', cat: 'Learning' },
    { name: 'Stop Procrastinating', cat: 'General' },
    { name: 'Quit Junk Food', cat: 'Health' },
    { name: 'Morning Workout', cat: 'Health' },
    { name: '1.5 Hrs English Practice', cat: 'Learning' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-habit-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-2xl p-6 sm:p-7 text-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#232936]">
          <h2 id="create-habit-title" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Create Habit
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
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
                htmlFor="habit-name"
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Habit Name
              </label>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                {name.length}/50
              </span>
            </div>
            <input
              id="habit-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={handleNameChange}
              disabled={submitting}
              placeholder="e.g. Quit Social Media"
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#131722] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HABIT_CATEGORIES.map((cat) => {
                const isSelected = category.toLowerCase() === cat.id.toLowerCase();
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setHasUserChosenCategory(true);
                    }}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer ${
                      isSelected
                        ? cat.activeClass
                        : 'border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-[#131722] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-[#334155]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Idea Pills */}
          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {sampleHabits.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setName(sample.name);
                    setCategory(sample.cat);
                    setHasUserChosenCategory(true);
                  }}
                  disabled={submitting}
                  className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-[#131722] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-[#334155] transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Habit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

