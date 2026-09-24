import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GOAL_ICONS, GOAL_CATEGORIES } from '../../utils/goalIcons';

export default function GoalBasicInfoStep({ formData, onChange, onNext }) {
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    const val = e.target.value;
    onChange({ name: val });
    if (val.trim()) {
      setError('');
    }
  };

  const handleIconSelect = (iconId) => {
    onChange({ icon: iconId });
  };

  const handleCategorySelect = (category) => {
    onChange({ category });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Please give your goal a name.');
      return;
    }
    onNext();
  };

  const isValid = Boolean(formData.name?.trim());

  return (
    <form onSubmit={handleSubmit} className="flex flex-col text-left">
      {/* 1. Primary Page Heading (H1) */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          What&apos;s your goal?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b]">
          Give your goal a clear and meaningful name.
        </p>
      </div>

      {/* 2. Goal Name Input */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="goal-name-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Goal Name <span className="text-emerald-500">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {(formData.name || '').length}/80
          </span>
        </div>
        <input
          id="goal-name-input"
          type="text"
          value={formData.name || ''}
          onChange={handleNameChange}
          placeholder="e.g. Become a Better Developer"
          maxLength={80}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#111417] border ${
            error
              ? 'border-rose-500 ring-2 ring-rose-500/15'
              : 'border-slate-300 dark:border-white/[0.12] hover:border-slate-400 dark:hover:border-white/25'
          } text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85948b] text-sm sm:text-base font-medium focus:border-emerald-500 dark:focus:border-[#5af0b3] focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-xs`}
        />
        {error && (
          <span className="text-xs font-semibold text-rose-500 mt-1 block">
            {error}
          </span>
        )}
      </div>

      {/* 3. Choose an Icon with Visible Text Labels */}
      <fieldset className="mb-3 sm:mb-4 border-0 p-0 m-0">
        <legend className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2">
          Choose an icon
        </legend>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Goal Icon">
          {GOAL_ICONS.map((item) => {
            const IconComponent = item.icon;
            const isSelected = (formData.icon || 'Target').toLowerCase() === item.id.toLowerCase();

            return (
              <label
                key={item.id}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 cursor-pointer select-none text-center ${
                  isSelected
                    ? 'border-emerald-500 dark:border-[#5af0b3] bg-emerald-500/10 dark:bg-[#5af0b3]/15 text-emerald-600 dark:text-[#5af0b3] ring-2 ring-emerald-500/30 shadow-2xs'
                    : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#111417] text-slate-500 dark:text-[#85948b] hover:border-slate-300 dark:hover:border-white/[0.15] hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="goal-icon"
                  value={item.id}
                  checked={isSelected}
                  onChange={() => handleIconSelect(item.id)}
                  className="sr-only"
                />
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" aria-hidden="true" />
                <span className="text-[10px] sm:text-[11px] font-medium mt-1 truncate max-w-full leading-tight">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Pick a Category (Optional) */}
      <fieldset className="mb-4 sm:mb-5 border-0 p-0 m-0">
        <legend className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2">
          Pick a category <span className="text-xs font-normal text-slate-400 dark:text-[#85948b]">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-1.5 sm:gap-2" role="radiogroup" aria-label="Goal Category">
          {GOAL_CATEGORIES.map((cat) => {
            const isSelected = (formData.category || 'Personal').toLowerCase() === cat.toLowerCase();

            return (
              <label
                key={cat}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border select-none ${
                  isSelected
                    ? 'border-emerald-500 dark:border-[#5af0b3] bg-emerald-500/15 dark:bg-[#5af0b3]/15 text-emerald-600 dark:text-[#5af0b3]'
                    : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#111417] text-slate-600 dark:text-[#85948b] hover:border-slate-300 dark:hover:border-white/[0.15]'
                }`}
              >
                <input
                  type="radio"
                  name="goal-category"
                  value={cat}
                  checked={isSelected}
                  onChange={() => handleCategorySelect(cat)}
                  className="sr-only"
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 5. Submit Action */}
      <div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#5af0b3] dark:hover:bg-[#4de1a5] disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 dark:text-[#003825] font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
