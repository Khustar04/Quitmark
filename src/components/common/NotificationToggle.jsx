import { useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '../../utils/notifications/notificationService';

export default function NotificationToggle() {
  const [supported] = useState(isNotificationSupported());
  const [permission, setPermission] = useState(getNotificationPermission());
  const [showMessage, setShowMessage] = useState(false);

  if (!supported || permission === 'unsupported') {
    return null; // Fail gracefully: do not show broken controls
  }

  const handleToggle = async () => {
    if (permission === 'default') {
      const result = await requestNotificationPermission();
      setPermission(result);
    } else {
      // Temporarily show the message tooltip for granted/denied states
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  let Icon = Bell;
  let baseTitle = 'Enable Notifications';
  let clickMessage = '';
  let styles =
    'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900';

  if (permission === 'granted') {
    Icon = BellRing;
    baseTitle = 'Notifications Enabled';
    clickMessage = 'Notifications are already enabled.';
    styles =
      'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  } else if (permission === 'denied') {
    Icon = BellOff;
    baseTitle = 'Notifications Blocked';
    clickMessage = 'Browser notifications are blocked. Please enable them in your browser settings.';
    styles =
      'text-red-500 dark:text-red-400 border-red-500/40 bg-red-500/10 opacity-70 hover:opacity-100';
  }

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${styles}`}
        title={baseTitle}
        aria-label={baseTitle}
      >
        <Icon className="w-4 h-4" />
      </button>

      {/* Calm temporary message popup for denied/granted clicks */}
      {showMessage && clickMessage && (
        <div className="absolute top-full mt-2 right-0 w-48 p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs shadow-lg text-center font-medium animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          {clickMessage}
        </div>
      )}
    </div>
  );
}
