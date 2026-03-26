'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  X,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  BatteryLow,
} from 'lucide-react';
import { useRealtimeStore, type LiveNotification } from '@/store/realtime';
import { useTranslation } from '@/lib/i18n';

const getNotificationIcon = (type: string) => {
  const iconProps = { size: 18 };
  switch (type) {
    case 'check_in':
      return <MapPin {...iconProps} className="text-green-500" />;
    case 'check_out':
      return <LogOut {...iconProps} className="text-blue-500" />;
    case 'off_route':
      return <AlertTriangle {...iconProps} className="text-red-500" />;
    case 'low_battery':
      return <BatteryLow {...iconProps} className="text-orange-500" />;
    case 'photo':
      return <Camera {...iconProps} className="text-indigo-500" />;
    case 'task_complete':
      return <CheckCircle2 {...iconProps} className="text-teal-500" />;
    default:
      return <Bell {...iconProps} className="text-gray-500" />;
  }
};

const typeBgColors: Record<string, string> = {
  check_in: '#00BFA6',
  check_out: '#3498DB',
  off_route: '#E74C3C',
  low_battery: '#FFC107',
  photo: '#6C63FF',
  task_complete: '#00BFA6',
};

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    // Silently fail if audio context is not available
  }
};

const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch {
      // Silently fail
    }
  }
};

export function NotificationCenter() {
  const { t } = useTranslation();
  const { notifications, clearNotifications } = useRealtimeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevNotificationLength = useRef(0);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Handle new notifications — play sound + desktop notification
  useEffect(() => {
    if (notifications.length > prevNotificationLength.current && prevNotificationLength.current > 0) {
      playNotificationSound();

      // Desktop notification
      const latest = notifications[0];
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        latest
      ) {
        try {
          new Notification('MTM', {
            body: latest.message,
            icon: '/favicon.ico',
          });
        } catch {
          // Silently fail
        }
      }
    }
    prevNotificationLength.current = notifications.length;
  }, [notifications]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = Math.max(0, notifications.length - readCount);

  const handleMarkAllRead = () => {
    setReadCount(notifications.length);
  };

  const handleClearAll = () => {
    clearNotifications();
    setReadCount(0);
  };

  const timeAgo = (timestamp: Date): string => {
    try {
      const now = new Date();
      const diffMs = now.getTime() - new Date(timestamp).getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) return t('notifications.now');
      if (diffMinutes < 60) return `${diffMinutes} ${t('notifications.minutesAgo')}`;
      if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo')}`;
      if (diffDays < 7) return `${diffDays} ${t('notifications.daysAgo')}`;

      return new Date(timestamp).toLocaleDateString();
    } catch {
      return t('notifications.now');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label={t('notifications.title')}
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: '#E74C3C' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 z-50 flex flex-col max-h-[28rem] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={32} className="mb-2 opacity-40" />
                <p className="text-sm">{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification: LiveNotification, index: number) => {
                  const isUnread = index >= readCount;
                  const bgColor = typeBgColors[notification.type] || '#6C63FF';

                  return (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isUnread ? 'bg-blue-50/50 dark:bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: bgColor }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-900 dark:text-white ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                            {notification.agentName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {timeAgo(notification.timestamp)}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {isUnread && (
                          <div
                            className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                            style={{ backgroundColor: 'var(--primary)' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2 px-4 py-2.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={handleMarkAllRead}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
                style={{ color: 'var(--primary)' }}
              >
                {t('notifications.markAllRead')}
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                {t('notifications.clearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
