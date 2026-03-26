'use client';

import { useState } from 'react';
import {
  Shield, User, Settings, Trash2, Edit, Plus, LogIn, LogOut,
  Download, Eye, Filter, Calendar, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'view' | 'settings';
  resource: string;
  details: string;
  ip: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: '1', timestamp: '2026-03-17 15:30:22', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'update', resource: 'Parametrlər', details: 'Telegram bot aktivləşdirildi', ip: '192.168.1.45' },
  { id: '2', timestamp: '2026-03-17 15:25:10', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'create', resource: 'İstifadəçilər', details: 'Yeni agent: Günel Əhmədova əlavə edildi', ip: '192.168.1.45' },
  { id: '3', timestamp: '2026-03-17 15:10:05', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'login', resource: 'Sistem', details: 'Uğurlu giriş', ip: '192.168.1.45' },
  { id: '4', timestamp: '2026-03-17 14:55:33', user: 'Farid Hüseynov', userRole: 'admin', action: 'export', resource: 'Hesabatlar', details: 'Gündəlik hesabat Excel formatında yükləndi', ip: '192.168.1.50' },
  { id: '5', timestamp: '2026-03-17 14:40:18', user: 'Leyla Qasımova', userRole: 'manager', action: 'update', resource: 'Marşrutlar', details: 'Marşrut #24 yeniləndi: 3 nöqtə əlavə edildi', ip: '192.168.1.52' },
  { id: '6', timestamp: '2026-03-17 14:20:44', user: 'Farid Hüseynov', userRole: 'admin', action: 'delete', resource: 'Müştərilər', details: 'Müştəri "Test Company" silindi', ip: '192.168.1.50' },
  { id: '7', timestamp: '2026-03-17 13:55:12', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'settings', resource: 'Geofence', details: 'Geofence radiusu 100m → 150m dəyişdirildi', ip: '192.168.1.45' },
  { id: '8', timestamp: '2026-03-17 13:30:29', user: 'Leyla Qasımova', userRole: 'manager', action: 'create', resource: 'Tapşırıqlar', details: 'Yeni tapşırıq: "Bravo ziyarəti" yaradıldı', ip: '192.168.1.52' },
  { id: '9', timestamp: '2026-03-17 12:15:41', user: 'Farid Hüseynov', userRole: 'admin', action: 'view', resource: 'GPS İzləmə', details: 'Agent Rəfail Əliəv GPS tarixçəsi baxıldı', ip: '192.168.1.50' },
  { id: '10', timestamp: '2026-03-17 11:50:08', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'update', resource: 'İstifadəçilər', details: 'Kamran İsmayılov rolu agent → manager dəyişdirildi', ip: '192.168.1.45' },
  { id: '11', timestamp: '2026-03-17 11:20:55', user: 'Leyla Qasımova', userRole: 'manager', action: 'export', resource: 'Hesabatlar', details: 'Performans hesabatı PDF formatında yükləndi', ip: '192.168.1.52' },
  { id: '12', timestamp: '2026-03-17 10:45:33', user: 'Farid Hüseynov', userRole: 'admin', action: 'logout', resource: 'Sistem', details: 'Çıxış edildi', ip: '192.168.1.50' },
  { id: '13', timestamp: '2026-03-17 09:30:17', user: 'Farid Hüseynov', userRole: 'admin', action: 'login', resource: 'Sistem', details: 'Uğurlu giriş', ip: '192.168.1.50' },
  { id: '14', timestamp: '2026-03-16 18:00:00', user: 'Sistem', userRole: 'system', action: 'export', resource: 'Hesabatlar', details: 'Avtomatik gündəlik hesabat yaradıldı', ip: 'localhost' },
  { id: '15', timestamp: '2026-03-16 17:30:22', user: 'Əhməd Məmmədov', userRole: 'super_admin', action: 'settings', resource: 'Foto', details: 'Vatermark aktivləşdirildi', ip: '192.168.1.45' },
];

const actionConfigBase: Record<AuditEntry['action'], { icon: React.ReactNode; color: string; labelKey: string }> = {
  create: { icon: <Plus size={14} />, color: '#10B981', labelKey: 'audit.created' },
  update: { icon: <Edit size={14} />, color: '#3498DB', labelKey: 'audit.updated' },
  delete: { icon: <Trash2 size={14} />, color: '#EF4444', labelKey: 'audit.deleted' },
  login: { icon: <LogIn size={14} />, color: '#6C63FF', labelKey: 'audit.login' },
  logout: { icon: <LogOut size={14} />, color: '#94A3B8', labelKey: 'audit.logout' },
  export: { icon: <Download size={14} />, color: '#F59E0B', labelKey: 'audit.downloaded' },
  view: { icon: <Eye size={14} />, color: '#8B5CF6', labelKey: 'audit.viewed' },
  settings: { icon: <Settings size={14} />, color: '#00BFA6', labelKey: 'audit.setting' },
};

export default function AuditPage() {
  const { t } = useTranslation();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const users = Array.from(new Set(mockAuditLog.map(e => e.user)));

  const filtered = mockAuditLog.filter(entry => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterUser !== 'all' && entry.user !== filterUser) return false;
    if (searchQuery && !entry.details.toLowerCase().includes(searchQuery.toLowerCase()) && !entry.resource.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const actionCounts = Object.entries(actionConfigBase).map(([key, config]) => ({
    action: key,
    count: mockAuditLog.filter(e => e.action === key).length,
    label: t(config.labelKey),
    icon: config.icon,
    color: config.color,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield size={28} style={{ color: 'var(--primary)' }} />
          {t('audit.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('audit.subtitle')}</p>
      </div>

      {/* Action Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {actionCounts.map((ac) => (
          <button
            key={ac.action}
            onClick={() => setFilterAction(filterAction === ac.action ? 'all' : ac.action)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterAction === ac.action
                ? 'border-2 shadow-md'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
            style={filterAction === ac.action ? { borderColor: ac.color } : undefined}
          >
            <div className="flex justify-center mb-1" style={{ color: ac.color }}>{ac.icon}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{ac.count}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{ac.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${t('common.search')}...`}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
        >
          <option value="all">{t('audit.allUsers')}</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setFilterAction('all'); setFilterUser('all'); setSearchQuery(''); }}
        >
          {t('audit.reset')}
        </Button>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{t('audit.results')} ({filtered.length})</span>
            <Badge variant="secondary">{mockAuditLog.length} {t('audit.totalRecords')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((entry) => {
              const base = actionConfigBase[entry.action];
              const config = { ...base, label: t(base.labelKey) };
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-l-3"
                  style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
                >
                  {/* Action Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.user}</span>
                      <Badge variant="secondary" className="text-[10px] py-0">
                        {entry.userRole === 'super_admin' ? t('audit.headAdmin') : entry.userRole === 'admin' ? t('audit.admin') : entry.userRole === 'manager' ? t('audit.manager') : entry.userRole}
                      </Badge>
                      <span className="text-xs text-gray-500">→</span>
                      <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{entry.resource}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">{entry.details}</p>
                  </div>

                  {/* Timestamp & IP */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.timestamp.split(' ')[1]}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{entry.ip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
