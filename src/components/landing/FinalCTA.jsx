import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="final-cta-section max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="final-cta-card rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm dark:shadow-none p-8 sm:p-12 transition-colors">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          Ready to break the cycle?
        </h2>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Start with today.
        </p>

        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base shadow-sm shadow-emerald-600/25 transition-all hover:gap-3 active:scale-[0.99]"
        >
          <span>Start Your Streak</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
