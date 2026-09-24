import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';

const PRESET_DURATIONS = [
  { days: 30, title: '30 days', subtitle: 'Build a new habit' },
  { days: 60, title: '60 days', subtitle: 'Make solid progress' },
  { days: 90, title: '90 days', subtitle: 'Go for a bigger change' },
];

export default function GoalTimelineStep({
  formData,
  onChange,
  onNext,
  onBack,
}) {
  const [isCustom, setIsCustom] = useState(
    Boolean(formData.duration_days && !PRESET_DURATIONS.some((p) => p.days === formData.duration_days))
  );

  const durationDays = Number(formData.duration_days) || 60;

  // Date calculation: Start Date (today) & Target Date (today + durationDays)
  const { startDateFormatted, targetDateFormatted, targetDateIso } = useMemo(() => {
    const start = new Date();
    const target = new Date();
    target.setDate(start.getDate() + durationDays);

    const formatOpts = { month: 'short', day: 'numeric', year: 'numeric' };

    return {
      startDateFormatted: start.toLocaleDateString('en-US', formatOpts),
      targetDateFormatted: target.toLocaleDateString('en-US', formatOpts),
      targetDateIso: target.toISOString().split('T')[0],
      startDateIso: start.toISOString().split('T')[0],
    };
  }, [durationDays]);

  const handlePresetSelect = (days) => {
    setIsCustom(false);
    const target = new Date();
    target.setDate(target.getDate() + days);

    onChange({
      duration_days: days,
      target_date: target.toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleCustomChange = (e) => {
    const val = Math.max(1, Math.min(365, parseInt(e.target.value, 10) || 1));
    const target = new Date();
    target.setDate(target.getDate() + val);

    onChange({
      duration_days: val,
      target_date: target.toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.target_date) {
      onChange({ target_date: targetDateIso });
    }
    onNext();
  };

  return (
    <div className="flex flex-col text-left">
      {/* 1. Header (H1) */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Set your timeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b]">
          How long do you want to work on this goal?
        </p>
      </div>

      {/* 2. Timeline Options */}
      <div className="flex flex-col gap-2.5 mb-3 sm:mb-4" role="radiogroup" aria-label="Timeline Duration">
        {PRESET_DURATIONS.map((preset) => {
          const isSelected = !isCustom && durationDays === preset.days;

          return (
            <label
              key={preset.days}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-emerald-500 dark:border-[#5af0b3] bg-emerald-500/10 dark:bg-[#5af0b3]/10 ring-1 ring-emerald-500/30 shadow-2xs'
                  : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#111417] hover:border-slate-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <input
                type="radio"
                name="goal-duration-option"
                value={preset.days}
                checked={isSelected}
                onChange={() => handlePresetSelect(preset.days)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-emerald-500 dark:border-[#5af0b3]'
                      : 'border-slate-300 dark:border-white/20'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#5af0b3]" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {preset.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#85948b]">
                    {preset.subtitle}
                  </span>
                </div>
              </div>
            </label>
          );
        })}

        {/* Custom Duration Option */}
        <label
          className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none ${
            isCustom
              ? 'border-emerald-500 dark:border-[#5af0b3] bg-emerald-500/10 dark:bg-[#5af0b3]/10 ring-1 ring-emerald-500/30 shadow-2xs'
              : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#111417] hover:border-slate-300 dark:hover:border-white/[0.12]'
          }`}
        >
          <input
            type="radio"
            name="goal-duration-option"
            value="custom"
            checked={isCustom}
            onChange={() => setIsCustom(true)}
            className="sr-only"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isCustom
                    ? 'border-emerald-500 dark:border-[#5af0b3]'
                    : 'border-slate-300 dark:border-white/20'
                }`}
                aria-hidden="true"
              >
                {isCustom && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#5af0b3]" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Custom
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#85948b]">
                  Set your own duration
                </span>
              </div>
            </div>

            {isCustom && (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={handleCustomChange}
                  className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-[#0d1013] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-bold text-xs text-center focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
                <span className="text-xs font-semibold text-slate-500 dark:text-[#85948b]">
                  days
                </span>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* 3. Goal Period Display Card (Compact) */}
      <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-3 mb-2">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 dark:bg-[#5af0b3]/15 text-emerald-500 dark:text-[#5af0b3] flex items-center justify-center">
          <Calendar className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 dark:text-[#85948b] uppercase tracking-wider">
            Goal period
          </span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
            {startDateFormatted} — {targetDateFormatted}
            <span className="ml-1 text-emerald-600 dark:text-[#5af0b3] font-bold">
              ({durationDays} days)
            </span>
          </span>
        </div>
      </div>

      {/* Subtitle helper */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-[#85948b] mb-4 px-1">
        <Clock className="w-3 h-3" />
        <span>You can always adjust this later.</span>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161a1f] text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:border-slate-300 dark:hover:border-white/[0.2] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#5af0b3] dark:hover:bg-[#4de1a5] text-slate-950 dark:text-[#003825] font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
