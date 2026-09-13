import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import { toggleTheme } from '../../store/slices/uiSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
