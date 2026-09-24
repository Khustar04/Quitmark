import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Timeline' },
  { id: 3, label: 'Habits' },
  { id: 4, label: 'Review' },
];

export default function GoalCreationStepper({ currentStep, onStepClick }) {
  return (
    <nav aria-label="Goal Creation Steps" className="w-full max-w-md mx-auto mb-5 sm:mb-6">
      <ol className="flex items-center justify-between w-full list-none m-0 p-0">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <div key={step.id} className="flex-1 flex items-start last:flex-none">
              {/* Step Node (Circle + Label) */}
              <li
                aria-current={isCurrent ? 'step' : undefined}
                className="flex flex-col items-center relative select-none shrink-0"
              >
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-xs transition-all duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-[#5af0b3] border border-emerald-500/50 cursor-pointer shadow-xs'
                      : isCurrent
                      ? 'bg-emerald-500 dark:bg-[#5af0b3] text-slate-950 dark:text-[#003825] ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/30 font-extrabold'
                      : 'bg-white dark:bg-[#161a1f] border border-slate-300 dark:border-white/[0.12] text-slate-400 dark:text-[#85948b]'
                  }`}
                  aria-label={`Step ${step.id}: ${step.label} (${isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Upcoming'})`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>

                {/* Step Label: Muted gray for completed & future, Green ONLY for active step */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold mt-1.5 tracking-tight transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'text-emerald-500 dark:text-[#5af0b3] font-bold'
                      : 'text-slate-500 dark:text-[#85948b]'
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {/* Segmented Connector Line strictly BETWEEN step nodes */}
              {idx < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1.5 sm:mx-2 mt-3.5 sm:mt-4 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08]"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.id < currentStep
                        ? 'w-full bg-emerald-500 dark:bg-[#5af0b3]'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </ol>
    </nav>
  );
}
