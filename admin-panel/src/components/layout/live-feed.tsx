'use client';

import { useEffect } from 'react';
import {
  MapPin, LogIn, LogOut, Camera, CheckCircle2,
  AlertTriangle, Battery, Radio,
} from 'lucide-react';
import { useRealtimeStore, LiveNotification } from '@/store/realtime';

const iconMap: Record<LiveNotification['type'], React.ReactNode> = {
  check_in: <LogIn size={14} className="text-green-500" />,
  check_out: <LogOut size={14} className="text-blue-500" />,
  photo: <Camera size={14} className="text-purple-500" />,
  task_complete: <CheckCircle2 size={14} className="text-teal-500" />,
  off_route: <AlertTriangle size={14} className="text-red-500" />,
  low_battery: <Battery size={14} className="text-yellow-500" />,
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LiveFeed({ maxItems = 8 }: { maxItems?: number }) {
  const { notifications, isSimulating, startSimulation } = useRealtimeStore();

  useEffect(() => {
    if (!isSimulating) {
      startSimulation();
    }
  }, [isSimulating, startSimulation]);

  const visibleNotifications = notifications.slice(0, maxItems);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Radio size={14} className="text-green-500 animate-pulse" />
        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
          Canlı
        </span>
      </div>

      {visibleNotifications.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Gözlənilir...</p>
      ) : (
        <div className="space-y-2">
          {visibleNotifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800/30 animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <div className="mt-0.5 flex-shrink-0">
                {iconMap[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatTime(notif.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
