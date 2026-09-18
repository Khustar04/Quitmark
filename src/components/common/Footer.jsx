import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Footer() {
  const user = useSelector((state) => state.auth.user);

  return (
    <footer className="relative z-10 border-t border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-md py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <Link
            to={user ? '/dashboard' : '/'}
            className="inline-flex items-center justify-center md:justify-start gap-2.5 font-bold text-zinc-900 dark:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md text-base hover:opacity-90 transition-opacity"
            aria-label={user ? 'Quitmark Dashboard' : 'Quitmark Home'}
          >
            <img src="/logo.png" alt="Quitmark Logo" className="w-5 h-5 object-contain group-hover:scale-105 transition-transform" />
            <span>Quitmark</span>
          </Link>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-sm leading-relaxed">
            Simple, clean habit tracking to quit unwanted habits by building daily streaks.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium">
          <a
            href="https://khustarportfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            Khustar Portfolio
          </a>
          <Link
            to="/faq"
            className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            FAQ
          </Link>
          <Link
            to="/report-bug"
            className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            Report a Bug
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-zinc-200/60 dark:border-white/5 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        &copy; {new Date().getFullYear()} Quitmark. Built by Khustar.
      </div>
    </footer>
  );
}
