import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children, heading, supportingText, onBackAction, hideNavigation = true }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 transition-colors">
      {/* Center Auth Card */}
      <main className="w-full flex items-center justify-center py-6">
        <div className="auth-card w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl dark:shadow-black/40 p-6 sm:p-8 transition-colors">
          {/* Brand Mark */}
          <div className="text-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white mb-4 hover:opacity-90 transition-opacity"
            >
              <img src="/logo.png" alt="Quitmark Logo" className="w-8 h-8 object-contain" />
              <span>Quitmark</span>
            </Link>

            {heading && (
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {heading}
              </h1>
            )}

            {supportingText && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {supportingText}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
