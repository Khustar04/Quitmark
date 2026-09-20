import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Flame, CheckCircle2, ShieldCheck, X, Sparkles, Loader2 } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../utils/notifications/notificationService';
import { saveNotificationPreferences } from '../../utils/notifications/notificationPreferences';
import { subscribeToPush, isPushSupported } from '../../utils/notifications/pushSubscription';
import {
  isNativeApp,
  checkNativeNotificationPermission,
  requestNativeNotificationPermission,
  ensureNotificationChannel,
} from '../../utils/notifications/nativeReminderService';
import { addInAppNotification } from '../../utils/notifications/inAppNotificationStore';

const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown if dismissed

export default function NotificationPermissionModal({ onPermissionResolved }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.auth.user?.id);
  const storageKey = userId
    ? `quitmark_perm_prompt_dismissed_at_${userId}`
    : 'quitmark_perm_prompt_dismissed_at';

  const modalRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    // Only run if notifications are supported
    if (!isNotificationSupported()) return;

    let isMounted = true;

    const checkAndPrompt = async () => {
      // 1. Android / Native flow
      if (isNativeApp()) {
        const isGranted = await checkNativeNotificationPermission();
        if (isGranted) {
          // Already granted on OS level: do not prompt!
          return;
        }

        const dismissedAt = localStorage.getItem(storageKey);
        if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS) {
          return;
        }

        if (isMounted) {
          setTimeout(() => {
            if (isMounted) setIsOpen(true);
          }, 800);
        }
        return;
      }

      // 2. Web / PWA flow
      const permission = getNotificationPermission();
      if (permission !== 'default') return;

      const dismissedAt = localStorage.getItem(storageKey);
      if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS) {
        return;
      }

      if (isMounted) {
        setTimeout(() => {
          if (isMounted) setIsOpen(true);
        }, 800);
      }
    };

    void checkAndPrompt();

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // ignore
    }
    setIsOpen(false);
  }, [storageKey]);

  // Focus management and accessibility trap
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    // Set initial focus to primary button
    primaryButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previous element when modal unmounts
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleDismiss]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      if (isNativeApp()) {
        await ensureNotificationChannel();
        const granted = await requestNativeNotificationPermission();

        if (granted) {
          saveNotificationPreferences({ enabled: true, streakReminders: true }, userId);
          addInAppNotification({
            title: '🎉 Notifications Enabled!',
            body: 'Reminders and streak alerts are now active on your device.',
            type: 'achievement',
            userId,
          });
          if (onPermissionResolved) onPermissionResolved('granted');
        } else {
          // User clicked "Don't allow" in Android dialog
          try {
            localStorage.setItem(storageKey, String(Date.now()));
          } catch {
            // ignore
          }
          if (onPermissionResolved) onPermissionResolved('denied');
        }

        setIsOpen(false);
        return;
      }

      // Web flow
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        saveNotificationPreferences({ enabled: true, streakReminders: true }, userId);

        addInAppNotification({
          title: '🎉 Notifications Enabled!',
          body: 'We will send you streak-freeze alerts and habit reminders.',
          type: 'achievement',
          userId,
        });

        // Close modal immediately so the user experiences instantaneous response
        if (onPermissionResolved) onPermissionResolved('granted');
        setIsOpen(false);

        // Run push subscription in the background asynchronously without blocking UI
        if (isPushSupported()) {
          void subscribeToPush().catch((pushErr) => {
            console.warn('[Quitmark] Push subscription failed after prompt:', pushErr);
          });
        }
        return;
      } else {
        try {
          localStorage.setItem(storageKey, String(Date.now()));
        } catch {
          // ignore
        }
        if (onPermissionResolved) onPermissionResolved(permission);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('[Quitmark] Failed to enable notifications from modal:', err);
      handleDismiss();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="perm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-[#0D0F17] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close notification prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Stay on Track
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3
          id="perm-modal-title"
          className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2"
        >
          Never Break Your Streak!
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
          Enable notifications so Quitmark can nudge you before your habit streak expires today.
        </p>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-white">Streak-freeze alerts</strong> before midnight
            </p>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-white">Daily reminders</strong> at your scheduled time
            </p>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-white">No spam</strong>, change or mute anytime in settings
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <span>Turn On Notifications</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            disabled={loading}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
