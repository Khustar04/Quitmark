import { ArrowRight } from 'lucide-react';
import { getGoalIcon } from '../../utils/goalIcons';

export default function GoalSuccessStep({
  goal,
  onViewGoal,
  onCreateAnother,
}) {
  const iconMeta = getGoalIcon(goal?.icon);
  const IconComponent = iconMeta.icon;

  const duration = Number(goal?.duration_days) || 60;
  const habitsCount = goal?.habit_ids?.length || 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = String(dateStr).split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const startDateFormatted = formatDate(goal?.start_date);
  const targetDateFormatted = formatDate(goal?.target_date);

  return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto animate-in zoom-in-95 duration-200">
      {/* 1. Compact Visual Celebration: Target with Party Popper & Confetti */}
      <div className="relative w-24 h-24 flex items-center justify-center my-1 shrink-0">
        <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent rounded-full blur-xl pointer-events-none" />

        <svg
          className="w-20 h-20 drop-shadow-[0_8px_16px_rgba(16,185,129,0.25)]"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Confetti party popper cone top-left */}
          <g transform="translate(32, 28) rotate(-25)">
            <path d="M0 20 L16 0 L24 16 Z" fill="#f59e0b" />
            <path d="M0 20 L8 8 L18 18 Z" fill="#ef4444" />
            <circle cx="8" cy="-8" r="2" fill="#38bdf8" />
            <circle cx="20" cy="-6" r="2" fill="#a855f7" />
            <rect x="2" y="-14" width="4" height="2" transform="rotate(20 2 -14)" fill="#34d399" />
            <rect x="14" y="-16" width="3" height="3" fill="#f59e0b" />
            <path d="M12 -2 C16 -8 20 -4 24 -10" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Sparkles around target */}
          <path d="M125 35 L129 35 M127 33 L127 37" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <path d="M135 60 L141 60 M138 57 L138 63" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 80 L31 80 M28 77 L28 83" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          <path d="M120 100 L126 100 M123 97 L123 103" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

          {/* Target rings */}
          <circle cx="80" cy="74" r="48" className="fill-emerald-950/80 dark:fill-[#0b241b] stroke-emerald-500/40" strokeWidth="3" />
          <circle cx="80" cy="74" r="38" className="fill-emerald-900/70 dark:fill-[#0e3327] stroke-emerald-400/50" strokeWidth="3" />
          <circle cx="80" cy="74" r="28" className="fill-emerald-800/80 dark:fill-[#134937] stroke-emerald-300/60" strokeWidth="3.5" />
          <circle cx="80" cy="74" r="18" className="fill-emerald-500 dark:fill-[#5af0b3] stroke-white" strokeWidth="2.5" />
          <circle cx="80" cy="74" r="7" className="fill-white" />

          {/* Bullseye Arrow / Dart */}
          <g transform="translate(80, 74) rotate(-45)">
            <line x1="-32" y1="0" x2="0" y2="0" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M-32 0 L-40 -6 L-36 0 L-40 6 Z" fill="#34d399" />
            <path d="M-36 0 L-44 -6 L-40 0 L-44 6 Z" fill="#10b981" />
            <circle cx="0" cy="0" r="3" fill="#ef4444" />
          </g>

          {/* Stand Legs */}
          <path
            d="M52 116 L46 140 M80 120 L80 142 M108 116 L114 140"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <ellipse cx="80" cy="142" rx="42" ry="5" fill="#000000" fillOpacity="0.35" />
        </svg>
      </div>

      {/* 2. Success Heading */}
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-0.5">
        Goal Created!
      </h1>
      <p className="text-xs text-slate-500 dark:text-[#85948b] mb-3.5">
        You&apos;re one step closer to a better you.
      </p>

      {/* 3. Compact Goal Snapshot Panel (Fits neatly without vertical scrolling) */}
      <div className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-left mb-4 shadow-2xs">
        {/* Header: Icon + Goal Name */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-[#5af0b3]">
            <IconComponent className="w-4 h-4 stroke-[2]" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {goal?.name}
          </h2>
        </div>

        {/* Rows: Duration, Start Date, Target Date, Habits */}
        <div className="flex flex-col text-xs divide-y divide-slate-200/50 dark:divide-white/[0.04]">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 dark:text-[#85948b]">Duration</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {duration} days
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 dark:text-[#85948b]">Start Date</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {startDateFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 dark:text-[#85948b]">Target Date</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {targetDateFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 dark:text-[#85948b]">Habits</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {habitsCount} {habitsCount === 1 ? 'habit' : 'habits'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onViewGoal}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#5af0b3] dark:hover:bg-[#4de1a5] text-slate-950 dark:text-[#003825] font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <span>View Goal</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={onCreateAnother}
          className="text-xs font-semibold text-emerald-600 dark:text-[#5af0b3] hover:underline transition-colors py-1 cursor-pointer"
        >
          Create Another Goal
        </button>
      </div>
    </div>
  );
}
