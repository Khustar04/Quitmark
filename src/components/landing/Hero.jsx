import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const handleScrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section text-center max-w-3xl mx-auto pt-10 pb-8 sm:pt-16 sm:pb-12 px-4">
      {/* Subtle pill badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        One day at a time
      </div>

      {/* Main Headline */}
      <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-6">
        Break the cycle.
        <br />
        <span className="text-emerald-600 dark:text-emerald-400">Build your streak.</span>
      </h1>

      {/* Supporting copy */}
      <p className="hero-subtext text-base sm:text-lg md:text-xl text-zinc-700 dark:text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
        Track the habits you want to quit, stay accountable, and build your streak one day at a time.
      </p>

      {/* CTAs */}
      <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Link
          to="/signup"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm sm:text-base shadow-sm shadow-emerald-600/25 transition-all hover:gap-3 active:scale-[0.99]"
        >
          <span>Start Your Streak</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="#how-it-works"
          onClick={handleScrollToHowItWorks}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 font-medium text-sm sm:text-base shadow-sm dark:shadow-none transition-colors"
        >
          <span>How It Works</span>
        </a>
      </div>
    </section>
  );
}
