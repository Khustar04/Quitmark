import { useState, useEffect, useRef } from 'react';
import { X, Bell, Trash2, Loader2, AlertCircle, Clock } from 'lucide-react';
import gsap from 'gsap';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getTimeParts = (time24 = '07:00') => {
  const [rawHour = 7, rawMinute = 0] = time24.split(':').map(Number);
  const period = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 || 12;

  return {
    hour: String(hour),
    minute: String(rawMinute).padStart(2, '0'),
    period,
  };
};

const to24HourTime = (hour12, minute, period) => {
  let hour = Number(hour12);
  hour = period === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
  return `${String(hour).padStart(2, '0')}:${minute}:00`;
};

export default function ReminderModal({
  isOpen,
  onClose,
  habitName,
  reminder,
  onSave,
  onDelete,
}) {
  const initialTime = getTimeParts(reminder?.reminder_time?.slice(0, 5));
  const [hour, setHour] = useState(() => initialTime.hour);
  const [minute, setMinute] = useState(() => initialTime.minute);
  const [period, setPeriod] = useState(() => initialTime.period);
  const [repeatType, setRepeatType] = useState(() =>
    reminder?.repeat_type || 'DAILY'
  );
  const [repeatDays, setRepeatDays] = useState(() =>
    reminder?.repeat_days || [1, 2, 3, 4, 5]
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);


  // GSAP entrance animation
  useEffect(() => {
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

  // Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, deleting, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting && !deleting) {
      onClose();
    }
  };

  const toggleDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (submitting) return;

    // Validate selected days
    if (repeatType === 'SELECTED_DAYS' && repeatDays.length === 0) {
      setError('Please select at least one day.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave({
        enabled: true,
        reminderTime: to24HourTime(hour, minute, period),
        repeatType,
        repeatDays: repeatType === 'SELECTED_DAYS' ? repeatDays : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save reminder.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      setError(null);
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete reminder.');
      setDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-2xl p-6 sm:p-7 text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#232936]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 id="reminder-modal-title" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Set Reminder
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                {habitName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#131722] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 space-y-5">
          {/* Time Picker */}
          <div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              Reminder Time
            </span>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 dark:border-[#232936] dark:bg-[#131722]">
              <select
                aria-label="Reminder hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                disabled={submitting}
                className="min-w-0 appearance-none rounded-lg bg-zinc-100 px-3 py-2.5 text-center text-base font-semibold tabular-nums text-zinc-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 dark:bg-[#0D0F17] dark:text-white"
              >
                {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <span aria-hidden="true" className="text-xl font-bold text-zinc-400 dark:text-zinc-500">:</span>
              <select
                aria-label="Reminder minute"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                disabled={submitting}
                className="min-w-0 appearance-none rounded-lg bg-zinc-100 px-3 py-2.5 text-center text-base font-semibold tabular-nums text-zinc-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 dark:bg-[#0D0F17] dark:text-white"
              >
                {Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0')).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <div className="grid overflow-hidden rounded-lg border border-zinc-200 text-xs font-bold dark:border-[#2B3342]">
                {['AM', 'PM'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriod(value)}
                    disabled={submitting}
                    aria-pressed={period === value}
                    className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
                      period === value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-[#0D0F17] dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Automatic reminders will notify you at {hour}:{minute} {period}, with a 60-min follow-up and streak protection alert if still incomplete.
            </p>
          </div>

          {/* Repeat Type */}
          <div>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Repeat
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRepeatType('DAILY')}
                disabled={submitting}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  repeatType === 'DAILY'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-[#232936] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-[#334155]'
                }`}
              >
                Every day
              </button>
              <button
                type="button"
                onClick={() => setRepeatType('SELECTED_DAYS')}
                disabled={submitting}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  repeatType === 'SELECTED_DAYS'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-[#232936] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-[#334155]'
                }`}
              >
                Selected days
              </button>
            </div>
          </div>

          {/* Day Selector (shown only when SELECTED_DAYS) */}
          {repeatType === 'SELECTED_DAYS' && (
            <div className="flex flex-wrap gap-1.5">
              {DAY_LABELS.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  disabled={submitting}
                  className={`min-w-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    repeatDays.includes(index)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'border-zinc-200 dark:border-[#232936] text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-[#334155] hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#232936]">
            {/* Delete (only show if reminder already exists) */}
            {reminder ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting || deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || deleting}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting || deleting}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Reminder</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
