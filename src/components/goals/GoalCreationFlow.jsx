import { useState } from 'react';
import { X } from 'lucide-react';
import GoalCreationStepper from './GoalCreationStepper';
import GoalBasicInfoStep from './GoalBasicInfoStep';
import GoalTimelineStep from './GoalTimelineStep';
import GoalHabitSelectorStep from './GoalHabitSelectorStep';
import GoalReviewStep from './GoalReviewStep';
import GoalSuccessStep from './GoalSuccessStep';
import { saveGoal } from '../../services/goalService';

export default function GoalCreationFlow({
  habits = [],
  userId,
  onClose,
  onGoalCreated,
  onViewGoal,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGoal, setCreatedGoal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Target',
    category: 'Personal',
    duration_days: 60,
    start_date: new Date().toISOString().split('T')[0],
    target_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    })(),
    habit_ids: [],
    description: '',
  });

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleCreateSubmit = async () => {
    const rawIds = formData.habit_ids;
    const habitIds = Array.isArray(rawIds)
      ? rawIds
      : Array.isArray(rawIds?.habit_ids)
      ? rawIds.habit_ids
      : [];

    if (habitIds.length === 0) {
      setStep(3); // Navigate back to habit selector
      return;
    }

    try {
      setIsSubmitting(true);
      const saved = saveGoal({ ...formData, habit_ids: habitIds }, userId);
      setCreatedGoal(saved);
      if (onGoalCreated) {
        onGoalCreated(saved);
      }
      setStep(5); // Success step
    } catch (err) {
      console.error('Failed to create goal:', err);
      alert(err.message || 'Failed to create goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setFormData({
      name: '',
      icon: 'Target',
      category: 'Personal',
      duration_days: 60,
      start_date: new Date().toISOString().split('T')[0],
      target_date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 60);
        return d.toISOString().split('T')[0];
      })(),
      habit_ids: [],
      description: '',
    });
    setCreatedGoal(null);
    setStep(1);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col animate-in fade-in duration-200 text-left">
      <div className="w-full flex flex-col">
        {/* Top Header: Compact Cancel Action */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.06] mb-4 w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Cancel goal creation and return to goals"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
            <span>Cancel</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-[#5af0b3]">
            Create Goal
          </span>
        </div>

        {/* Stepper only visible during steps 1 to 4 */}
        {step <= 4 && (
          <GoalCreationStepper
            currentStep={step}
            onStepClick={(targetStep) => setStep(targetStep)}
          />
        )}

        {/* Step Content Card Container: Compact padding to ensure no vertical scrolling is needed */}
        <div className="rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/90 dark:border-white/[0.06] p-4 sm:p-6 shadow-sm">
          {step === 1 && (
            <GoalBasicInfoStep
              formData={formData}
              onChange={updateFormData}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <GoalTimelineStep
              formData={formData}
              onChange={updateFormData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <GoalHabitSelectorStep
              habits={habits}
              formData={formData}
              selectedHabitIds={
                Array.isArray(formData.habit_ids)
                  ? formData.habit_ids
                  : Array.isArray(formData.habit_ids?.habit_ids)
                  ? formData.habit_ids.habit_ids
                  : []
              }
              onChange={(patchOrIds) => {
                const habitIds = Array.isArray(patchOrIds)
                  ? patchOrIds
                  : Array.isArray(patchOrIds?.habit_ids)
                  ? patchOrIds.habit_ids
                  : [];
                updateFormData({ habit_ids: habitIds });
              }}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <GoalReviewStep
              formData={formData}
              habits={habits}
              onEdit={() => setStep(1)}
              onBack={() => setStep(3)}
              onSubmit={handleCreateSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 5 && (
            <GoalSuccessStep
              goal={createdGoal || formData}
              onViewGoal={() => onViewGoal(createdGoal || formData)}
              onCreateAnother={handleResetForAnother}
            />
          )}
        </div>
      </div>
    </div>
  );
}
