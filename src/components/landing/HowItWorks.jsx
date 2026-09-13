import { PlusCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create a Habit',
      description: 'Choose the habit you want to quit.',
      icon: PlusCircle,
    },
    {
      number: '02',
      title: 'Track Your Days',
      description: 'Mark your progress honestly each day.',
      icon: CheckCircle2,
    },
    {
      number: '03',
      title: 'Build Your Streak',
      description: 'Keep going and watch your streak grow.',
      icon: TrendingUp,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="how-it-works-section max-w-5xl mx-auto px-4 py-16 sm:py-24 border-t border-zinc-200/60 dark:border-zinc-800/60"
    >
      <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold mb-2 block">
          Simple Process
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          How It Works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          A disciplined three-step structure to regain momentum and stay accountable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="how-it-works-card rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-6 sm:p-7 relative transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {step.number}
                </span>
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
