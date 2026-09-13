import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Footer() {
  const user = useSelector((state) => state.auth.user);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-1.5">
          <Link
            to={user ? '/dashboard' : '/'}
            className="inline-flex items-center justify-center md:justify-start gap-2 font-semibold text-zinc-900 dark:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            aria-label={user ? 'Quitmark Dashboard' : 'Quitmark Home'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
            Quitmark
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
            Simple, clean habit tracking to quit unwanted habits by building daily streaks.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
          <a
            href="https://khustarportfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            Khustar Portfolio
          </a>
          <Link
            to="/faq"
            className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            FAQ
          </Link>
          <Link
            to="/report-bug"
            className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          >
            Report a Bug
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} Quitmark. Built by Khustar.
      </div>
    </footer>
  );
}
