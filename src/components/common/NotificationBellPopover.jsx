import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Flame, Clock, Sparkles, Trash2, X, ChevronRight } from 'lucide-react';
import {
  getInAppNotifications,
  removeInAppNotification,
  clearAllInAppNotifications,
  markAllInAppNotificationsAsRead,
  subscribeToInAppNotifications,
  formatTimeAgo,
} from '../../utils/notifications/inAppNotificationStore';

/**
 * Sanitizes URL to prevent XSS (javascript:, data:, vbscript:).
 */
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
};

export default function NotificationBellPopover({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
  triggerClassName = '',
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || null;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(() => getInAppNotifications(userId));
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Sync notifications whenever active user changes during render
  const [prevUserId, setPrevUserId] = useState(userId);
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setNotifications(getInAppNotifications(userId));
  }

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((updatedList) => {
      setNotifications(updatedList);
    }, userId);

    return unsubscribe;
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  const toggleOpen = useCallback(() => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  }, [isControlled, controlledOnToggle]);

  // Mark all as read when opened
  useEffect(() => {
    if (isOpen) {
      markAllInAppNotificationsAsRead(userId);
    }
  }, [isOpen, userId]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleClearAll = () => {
    clearAllInAppNotifications(userId);
  };

  const handleRemoveOne = (id, e) => {
    e.stopPropagation();
    removeInAppNotification(id, userId);
  };

  const handleItemClick = (item) => {
    if (!item.url) return;
    const safeUrl = sanitizeUrl(item.url);
    if (!safeUrl) return;

    handleClose();
    if (safeUrl.startsWith('/')) {
      navigate(safeUrl);
    } else {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'streak':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
        );
      case 'achievement':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'reminder':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Bell Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          triggerClassName
            ? `${triggerClassName} relative`
            : `relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                isOpen
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : unreadCount > 0
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`
        }
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm animate-in zoom-in-50 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel - Responsive Viewport-Aware Positioning */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="region"
          aria-label="Notification center"
          className="fixed inset-x-3 sm:absolute sm:inset-x-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-96 max-w-md sm:max-w-none mx-auto sm:mx-0 z-50 bg-white/95 dark:bg-[#0E1117]/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Notifications
              </h2>
              {notifications.length > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear all</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body / List */}
          <div className="max-h-[min(65vh,380px)] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No notifications yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px] mx-auto">
                  Habit reminders and streak warnings will show up here.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isClickable = Boolean(item.url);

                return (
                  <div
                    key={item.id}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors ${
                      isClickable
                        ? 'cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    {renderIcon(item.type)}

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate break-words">
                          {item.title}
                        </p>
                        {isClickable && (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </div>
                      {item.body && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed break-words">
                          {item.body}
                        </p>
                      )}
                      <span className="inline-block text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-1.5">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    {/* Individual Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveOne(item.id, e)}
                      className="absolute top-3 right-3 p-1 rounded-md text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                      aria-label={`Remove notification: ${item.title}`}
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
