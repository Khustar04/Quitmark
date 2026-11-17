import { useState, useEffect } from 'react';
import { Clock, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function ClockSkewBanner() {
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [skewDetails, setSkewDetails] = useState(null);

  useEffect(() => {
    const handleClockSkew = (event) => {
      // Only show the banner when genuine measured drift data is present
      const drift = event?.detail?.driftMs;
      if (typeof drift === 'number' && drift > 5000) {
        setVisible(true);
        setSkewDetails(event.detail);
      }
    };

    // Auto-dismiss when the session recovers (token refresh succeeds)
    const handleSessionRecovered = () => {
      setVisible(false);
      setSkewDetails(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('quitmark:clock-skew', handleClockSkew);
      window.addEventListener('quitmark:session-recovered', handleSessionRecovered);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('quitmark:clock-skew', handleClockSkew);
        window.removeEventListener('quitmark:session-recovered', handleSessionRecovered);
      }
    };
  }, []);

  const handleCleanReload = () => {
    // Evict any stale/future auth tokens from localStorage so reload starts clean
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Fall through
      }
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Clock synchronization warning"
      role="alert"
      className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-3 text-sm transition-all relative z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-amber-950 dark:text-amber-100">
              System Clock Out of Sync
              {skewDetails?.driftSeconds ? ` (Ahead by ~${skewDetails.driftSeconds}s)` : ''}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
              Your device clock is ahead of global server time (401: JWT issued at future). Please synchronize your system clock to automatic to ensure uninterrupted habit tracking and authentication.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={() => setShowInstructions((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 transition-colors cursor-pointer"
          >
            <span>{showInstructions ? 'Hide Steps' : 'How to Fix'}</span>
            {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleCleanReload}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
            title="Clear stale session token and reload page"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset &amp; Reload</span>
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 rounded transition-colors"
            aria-label="Dismiss clock skew notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-amber-500/5 dark:bg-black/20 p-2.5 rounded border border-amber-500/20">
            <span className="font-semibold block mb-1">🪟 Windows</span>
            <p className="text-amber-800 dark:text-amber-300">
              Settings &rarr; <strong>Time &amp; language</strong> &rarr; <strong>Date &amp; time</strong> &rarr; click <strong>Sync now</strong>. (If already automatic, toggle it off and back on).
            </p>
          </div>
          <div className="bg-amber-500/5 dark:bg-black/20 p-2.5 rounded border border-amber-500/20">
            <span className="font-semibold block mb-1">🍎 macOS</span>
            <p className="text-amber-800 dark:text-amber-300">
              System Settings &rarr; <strong>General</strong> &rarr; <strong>Date &amp; Time</strong> &rarr; turn on <strong>Set date and time automatically</strong>.
            </p>
          </div>
          <div className="bg-amber-500/5 dark:bg-black/20 p-2.5 rounded border border-amber-500/20">
            <span className="font-semibold block mb-1">📱 Android / iOS</span>
            <p className="text-amber-800 dark:text-amber-300">
              Settings &rarr; <strong>Date &amp; Time</strong> &rarr; turn on <strong>Set Automatically / Automatic date and time</strong>.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
