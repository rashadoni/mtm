'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle, X,
  CheckCheck, Settings, Bell, BellOff, Zap,
  MapPin, Battery, Navigation, Clock, Wifi,
  TrendingUp, BarChart3, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useRealtimeStore } from '@/store/realtime';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

// ===== Types =====
interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'gps' | 'battery' | 'geofence' | 'speed' | 'route' | 'system' | 'visit';
  title: string;
  description: string;
  agentName?: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
}

interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  threshold?: string;
  icon: React.ReactNode;
}

// ===== Mock Data =====
const mockAlerts: Alert[] = [
  { id: '1', type: 'critical', category: 'gps', title: 'GPS Siqnalı Qopdu', description: 'Əhməd Məmmədov üçün GPS siqnalı 15 dəqiqə əvvəl qopdu', agentName: 'Əhməd Məmmədov', timestamp: '2026-03-17 14:32', isRead: false, isResolved: false },
  { id: '2', type: 'warning', category: 'battery', title: 'Zəif Batareya', description: 'Leyla Qasımova cihazının batareyası 15% səviyyəsindədir', agentName: 'Leyla Qasımova', timestamp: '2026-03-17 14:15', isRead: false, isResolved: false },
  { id: '3', type: 'critical', category: 'geofence', title: 'Geofen Xəbərdarlığı', description: 'Farid Hüseynov təyin edilmiş zonadan çıxdı', agentName: 'Farid Hüseynov', timestamp: '2026-03-17 14:00', isRead: true, isResolved: true },
  { id: '4', type: 'warning', category: 'route', title: 'Marşrutdan Sapma', description: 'Rəfail Əliyev planlaşdırılan marşrutdan sapıb', agentName: 'Rəfail Əliyev', timestamp: '2026-03-17 13:45', isRead: false, isResolved: false },
  { id: '5', type: 'info', category: 'system', title: 'Sistem Yeniləməsi', description: 'Sistem güncelləmesi tamamlandı — versiya 2.1.5', timestamp: '2026-03-17 13:30', isRead: true, isResolved: true },
  { id: '6', type: 'success', category: 'visit', title: 'Ziyarət Tamamlandı', description: 'Sərxan Yusifov 6/6 ziyarəti uğurla tamamladı', agentName: 'Sərxan Yusifov', timestamp: '2026-03-17 13:20', isRead: true, isResolved: true },
  { id: '7', type: 'warning', category: 'speed', title: 'Yüksək Sürət', description: 'Nigar Hüseyinova 90 km/s sürətlə hərəkət edir', agentName: 'Nigar Hüseyinova', timestamp: '2026-03-17 13:00', isRead: false, isResolved: false },
  { id: '8', type: 'critical', category: 'gps', title: 'GPS Mock Detected', description: 'Tural İsmayılov cihazında saxta GPS aşkarlandı', agentName: 'Tural İsmayılov', timestamp: '2026-03-17 12:45', isRead: true, isResolved: false },
  { id: '9', type: 'info', category: 'visit', title: 'Foto Yükləndi', description: 'Gülnarə Əliyeva 5 yeni foto yüklədi', agentName: 'Gülnarə Əliyeva', timestamp: '2026-03-17 12:30', isRead: true, isResolved: true },
  { id: '10', type: 'warning', category: 'battery', title: 'Zəif Batareya', description: 'Kamran Nəsirov batareyası 10% səviyyəsindədir', agentName: 'Kamran Nəsirov', timestamp: '2026-03-17 12:15', isRead: false, isResolved: false },
  { id: '11', type: 'critical', category: 'gps', title: 'Cihaz Offline', description: 'Aytən Babayeva cihazı 2 saatdan çoxdur offline', agentName: 'Aytən Babayeva', timestamp: '2026-03-16 18:30', isRead: true, isResolved: true },
  { id: '12', type: 'warning', category: 'route', title: 'Gecikmiş Ziyarət', description: 'Farid Hüseynov ziyarətdən 30 dəqiqə geri qaldı', agentName: 'Farid Hüseynov', timestamp: '2026-03-16 16:20', isRead: true, isResolved: true },
  { id: '13', type: 'info', category: 'system', title: 'Yeni Agent Əlavə Edildi', description: 'Rəhim Əsgərov sistemə əlavə olundu', timestamp: '2026-03-16 14:30', isRead: true, isResolved: true },
  { id: '14', type: 'success', category: 'visit', title: 'Marşrut Tamamlandı', description: 'Əhməd Məmmədov günlük marşrutu 100% tamamladı', agentName: 'Əhməd Məmmədov', timestamp: '2026-03-16 18:45', isRead: true, isResolved: true },
];

const anomalyRules: AnomalyRule[] = [
  { id: 'r1', name: 'GPS Siqnal İtkisi', description: 'GPS siqnalı 10+ dəqiqə kəsiləndə', category: 'gps', enabled: true, threshold: '10 dəq', icon: <MapPin size={16} /> },
  { id: 'r2', name: 'Saxta GPS (Mock)', description: 'GPS spoofing aşkar ediləndə', category: 'gps', enabled: true, icon: <Shield size={16} /> },
  { id: 'r3', name: 'Zəif Batareya', description: 'Batareya göstərilən %-dən aşağı olduqda', category: 'battery', enabled: true, threshold: '20%', icon: <Battery size={16} /> },
  { id: 'r4', name: 'Geofence Pozuntusu', description: 'Agent təyin edilmiş zonadan çıxdıqda', category: 'geofence', enabled: true, icon: <MapPin size={16} /> },
  { id: 'r5', name: 'Yüksək Sürət', description: 'Sürət limitini keçdikdə', category: 'speed', enabled: true, threshold: '80 km/s', icon: <Navigation size={16} /> },
  { id: 'r6', name: 'Marşrutdan Sapma', description: 'Agent planlaşdırılan yoldan 500m+ uzaqlaşdıqda', category: 'route', enabled: true, threshold: '500m', icon: <Navigation size={16} /> },
  { id: 'r7', name: 'Gecikmiş Ziyarət', description: 'Planlaşdırılan vaxtdan 15+ dəq geri qalanda', category: 'route', enabled: true, threshold: '15 dəq', icon: <Clock size={16} /> },
  { id: 'r8', name: 'Uzun Dayanma', description: 'Agent eyni yerdə 45+ dəq qaldıqda', category: 'route', enabled: false, threshold: '45 dəq', icon: <Clock size={16} /> },
  { id: 'r9', name: 'Zəif İnternet', description: 'İnternet keyfiyyəti aşağı olduqda', category: 'system', enabled: false, icon: <Wifi size={16} /> },
];

// typeConfig labels resolved in component via t()
const typeConfigBase = {
  critical: { icon: <AlertTriangle size={18} />, color: '#E74C3C', labelKey: 'alerts.critical' },
  warning: { icon: <AlertCircle size={18} />, color: '#FFC107', labelKey: 'alerts.warning' },
  info: { icon: <Info size={18} />, color: '#3498DB', labelKey: 'alerts.info' },
  success: { icon: <CheckCircle size={18} />, color: '#00BFA6', labelKey: 'alerts.success' },
};

const categoryIcons: Record<string, React.ReactNode> = {
  gps: <MapPin size={14} />,
  battery: <Battery size={14} />,
  geofence: <MapPin size={14} />,
  speed: <Navigation size={14} />,
  route: <Navigation size={14} />,
  system: <Settings size={14} />,
  visit: <CheckCircle size={14} />,
};

type TabMode = 'alerts' | 'config';

export default function AlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'critical' | 'warning' | 'info' | 'resolved'>('all');
  const [tabMode, setTabMode] = useState<TabMode>('alerts');
  const [rules, setRules] = useState(anomalyRules);
  const { notifications } = useRealtimeStore();

  // Inject live notifications as alerts
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      const exists = alerts.find((a) => a.id === `live-${latest.id}`);
      if (!exists) {
        const newAlert: Alert = {
          id: `live-${latest.id}`,
          type: latest.type === 'off_route' ? 'warning' : latest.type === 'check_out' ? 'info' : 'success',
          category: latest.type === 'off_route' ? 'route' : 'visit',
          title: latest.type === 'check_in' ? 'Check-in' : latest.type === 'check_out' ? 'Check-out' : latest.type === 'photo' ? 'Foto Yükləndi' : latest.type === 'task_complete' ? 'Tapşırıq Tamamlandı' : 'Marşrutdan Sapma',
          description: latest.message,
          agentName: latest.agentName,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          isRead: false,
          isResolved: false,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      }
    }
  }, [notifications]);

  const filteredAlerts = (() => {
    switch (selectedFilter) {
      case 'unread': return alerts.filter((a) => !a.isRead);
      case 'critical': return alerts.filter((a) => a.type === 'critical');
      case 'warning': return alerts.filter((a) => a.type === 'warning');
      case 'info': return alerts.filter((a) => a.type === 'info');
      case 'resolved': return alerts.filter((a) => a.isResolved);
      default: return alerts;
    }
  })();

  const handleMarkAsRead = (id: string) => setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  const handleResolve = (id: string) => setAlerts(alerts.map((a) => (a.id === id ? { ...a, isResolved: true, isRead: true } : a)));
  const handleDismiss = (id: string) => setAlerts(alerts.filter((a) => a.id !== id));
  const handleMarkAllRead = () => setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  const toggleRule = (id: string) => setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => !a.isRead).length,
    critical: alerts.filter((a) => a.type === 'critical' && !a.isResolved).length,
    resolved: alerts.filter((a) => a.isResolved).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('alerts.title')}</h1>
        <div className="flex items-center gap-2">
          {/* Tab Toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setTabMode('alerts')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                tabMode === 'alerts' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500')}
            ><Bell size={16} /> {t('alerts.title')}</button>
            <button
              onClick={() => setTabMode('config')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                tabMode === 'config' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500')}
            ><Settings size={16} /> {t('alerts.configuration')}</button>
          </div>

          {tabMode === 'alerts' && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="flex items-center gap-1.5">
              <CheckCheck size={16} /> {t('alerts.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      {/* ===== Alerts Tab ===== */}
      {tabMode === 'alerts' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Bell size={20} />} title={t('alerts.all')} value={stats.total} color="#6C63FF" />
            <StatCard icon={<AlertCircle size={20} />} title={t('alerts.unread')} value={stats.unread} color="#3498DB" />
            <StatCard icon={<AlertTriangle size={20} />} title={t('alerts.activeAlerts')} value={stats.critical} color="#E74C3C" />
            <StatCard icon={<CheckCircle size={20} />} title={t('alerts.resolved')} value={stats.resolved} color="#00BFA6" />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: `${t('alerts.all')} (${stats.total})`, color: '#6C63FF' },
              { key: 'unread', label: `${t('alerts.unread')} (${stats.unread})`, color: '#3498DB' },
              { key: 'critical', label: `${t('alerts.critical')} (${stats.critical})`, color: '#E74C3C' },
              { key: 'warning', label: t('alerts.warning'), color: '#FFC107' },
              { key: 'info', label: t('alerts.info'), color: '#3498DB' },
              { key: 'resolved', label: `${t('alerts.resolved')} (${stats.resolved})`, color: '#00BFA6' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key as typeof selectedFilter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedFilter === f.key ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                )}
                style={selectedFilter === f.key ? { backgroundColor: f.color } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="space-y-2">
            {filteredAlerts.map((alert) => {
              const config = { ...typeConfigBase[alert.type], label: t(typeConfigBase[alert.type].labelKey) };
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border transition-all',
                    !alert.isRead
                      ? 'bg-white dark:bg-slate-900 border-l-4 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700',
                    alert.isResolved && 'opacity-60'
                  )}
                  style={!alert.isRead ? { borderLeftColor: config.color } : undefined}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.color + '15', color: config.color }}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                          {!alert.isRead && (
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{alert.description}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Category badge */}
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500">
                          {categoryIcons[alert.category]}
                          {alert.category}
                        </span>
                        <Badge className="text-[10px] font-bold" style={{ backgroundColor: config.color + '20', color: config.color }}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400">{alert.timestamp}</span>
                      {alert.agentName && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: config.color }}>
                            {alert.agentName.charAt(0)}
                          </span>
                          {alert.agentName}
                        </span>
                      )}
                      {alert.isResolved && (
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                          <CheckCircle size={10} /> {t('alerts.resolved')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {!alert.isResolved && (
                      <div className="flex items-center gap-2 mt-2">
                        {!alert.isRead && (
                          <button onClick={() => handleMarkAsRead(alert.id)} className="text-[11px] font-medium hover:underline" style={{ color: '#6C63FF' }}>
                            {t('alerts.markRead')}
                          </button>
                        )}
                        <button onClick={() => handleResolve(alert.id)} className="text-[11px] font-medium text-green-600 hover:underline">
                          {t('alerts.resolve')}
                        </button>
                        <button onClick={() => handleDismiss(alert.id)} className="text-[11px] font-medium text-red-500 hover:underline">
                          {t('alerts.dismiss')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-16">
                <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 font-medium">{t('alerts.noAlerts')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== Config Tab ===== */}
      {tabMode === 'config' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap size={24} className="mx-auto mb-2" style={{ color: '#6C63FF' }} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rules.filter((r) => r.enabled).length}</p>
                <p className="text-xs text-gray-500">{t('alerts.activeRules')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BellOff size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rules.filter((r) => !r.enabled).length}</p>
                <p className="text-xs text-gray-500">{t('alerts.inactiveRules')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 size={24} className="mx-auto mb-2" style={{ color: '#00BFA6' }} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                <p className="text-xs text-gray-500">{t('alerts.monitoring')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap size={16} style={{ color: '#6C63FF' }} />
                {t('alerts.anomalyRules')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all',
                    rule.enabled
                      ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-60'
                  )}>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: rule.enabled ? '#6C63FF15' : '#95A5A615', color: rule.enabled ? '#6C63FF' : '#95A5A6' }}>
                      {rule.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                      <p className="text-xs text-gray-500">{rule.description}</p>
                    </div>

                    {/* Threshold */}
                    {rule.threshold && (
                      <div className="flex-shrink-0">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
                          {rule.threshold}
                        </span>
                      </div>
                    )}

                    {/* Toggle */}
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                        rule.enabled ? '' : 'bg-gray-300 dark:bg-slate-600'
                      )}
                      style={rule.enabled ? { backgroundColor: '#6C63FF' } : undefined}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                        rule.enabled ? 'translate-x-5.5 left-[22px]' : 'left-0.5'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell size={16} style={{ color: '#00BFA6' }} />
                {t('alerts.channels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: t('alerts.pushNotification'), desc: t('alerts.browserNotification'), enabled: true, icon: '🔔' },
                  { name: t('alerts.telegramBot'), desc: t('alerts.telegramSend'), enabled: true, icon: '📱' },
                  { name: t('alerts.email'), desc: t('alerts.emailWarning'), enabled: false, icon: '📧' },
                ].map((channel) => (
                  <div key={channel.name} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                    <span className="text-2xl">{channel.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</p>
                      <p className="text-xs text-gray-500">{channel.desc}</p>
                    </div>
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      channel.enabled ? 'bg-green-500' : 'bg-gray-300'
                    )} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
