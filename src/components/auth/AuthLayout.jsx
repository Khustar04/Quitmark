import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children, heading, supportingText, onBackAction, hideNavigation }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Header Bar */}
      {!hideNavigation && (
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {onBackAction ? (
          <button
            onClick={onBackAction}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        )}
        </div>
      )}

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="auth-card w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl dark:shadow-black/40 p-6 sm:p-8 transition-colors">
          {/* Brand Mark */}
          <div className="text-center mb-6">
            {hideNavigation ? (
              <div className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white mb-4">
                <img src="/logo.png" alt="Quitmark Logo" className="w-8 h-8 object-contain" />
                <span>Quitmark</span>
              </div>
            ) : onBackAction ? (
              <button
                onClick={onBackAction}
                className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white mb-4 focus:outline-none"
              >
                <img src="/logo.png" alt="Quitmark Logo" className="w-8 h-8 object-contain" />
                <span>Quitmark</span>
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white mb-4"
              >
                <img src="/logo.png" alt="Quitmark Logo" className="w-8 h-8 object-contain" />
                <span>Quitmark</span>
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {heading}
            </h1>

            {supportingText && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {supportingText}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} Quitmark. Built for discipline and clarity.
      </footer>
    </div>
  );
}
