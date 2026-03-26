'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Save, Send, Bot, MessageSquare, Bell as BellIcon, Shield, Smartphone,
  Clock, FileSpreadsheet, FileText, Mail, Plus, Trash2, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type TabType = 'general' | 'geofence' | 'gps' | 'photo' | 'integration' | 'telegram' | 'reports';

interface TabConfig {
  id: TabType;
  label: string;
}

const tabs: TabConfig[] = [
  { id: 'general', label: 'Ümumi' },
  { id: 'geofence', label: 'Geofence' },
  { id: 'gps', label: 'GPS' },
  { id: 'photo', label: 'Foto' },
  { id: 'integration', label: 'İnteqrasiya' },
  { id: 'telegram', label: 'Telegram Bot' },
  { id: 'reports', label: 'Hesabatlar' },
];

interface ScheduledReport {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'excel' | 'pdf';
  recipients: string[];
  enabled: boolean;
  nextRun: string;
  includes: string[];
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Gündəlik Agent Hesabatı',
    type: 'daily',
    format: 'excel',
    recipients: ['admin@mtm.az', 'manager@mtm.az'],
    enabled: true,
    nextRun: '2026-03-18 18:00',
    includes: ['Ziyarətlər', 'Marşrut tamamlanma', 'GPS məlumatları'],
  },
  {
    id: '2',
    name: 'Həftəlik Performans Xülasəsi',
    type: 'weekly',
    format: 'pdf',
    recipients: ['director@mtm.az'],
    enabled: true,
    nextRun: '2026-03-22 09:00',
    includes: ['Agent sıralaması', 'KPI göstəriciləri', 'Trend analizi'],
  },
  {
    id: '3',
    name: 'Aylıq Müştəri Statistikası',
    type: 'monthly',
    format: 'csv',
    recipients: ['analytics@mtm.az'],
    enabled: false,
    nextRun: '2026-04-01 08:00',
    includes: ['Müştəri ziyarətləri', 'Foto statistikası', 'Rayon analizi'],
  },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState({
    companyName: 'MTM Şirkəti',
    primaryColor: '#6C63FF',
    geofenceRadius: 100,
    autoCheckIn: true,
    gpsInterval: 30,
    batteryThreshold: 20,
    photoQuality: 80,
    watermarkEnabled: false,
    watermarkPosition: 'bottom-right',
    oneC_Status: 'connected',
    telegramToken: '',
    smsGateway: '',
    // Telegram Bot settings
    tgBotToken: '',
    tgChatId: '',
    tgEnabled: false,
    tgNotifyOffRoute: true,
    tgNotifyLowBattery: true,
    tgNotifyTaskComplete: false,
    tgNotifyDailyReport: true,
    tgNotifyCheckIn: false,
    tgNotifyPhoto: false,
  });
  const [tgTestStatus, setTgTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(mockScheduledReports);

  const handleSave = () => {
    alert(t('settings.saved'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-b-2 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
            style={
              activeTab === tab.id
                ? { borderBottomColor: 'var(--primary)', color: 'var(--primary)' }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.companyName')}
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.uploadLogo')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload size={18} />
                    {t('common.select')}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.primaryColor')}
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.primaryColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Geofence Tab */}
          {activeTab === 'geofence' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('settings.geofenceRadius')}: {settings.geofenceRadius}m
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={settings.geofenceRadius}
                  onChange={(e) => setSettings({ ...settings, geofenceRadius: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>50m</span>
                  <span>500m</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.autoCheckIn')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoCheckIn}
                  onChange={(e) => setSettings({ ...settings, autoCheckIn: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* GPS Tab */}
          {activeTab === 'gps' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('settings.gpsInterval')}: {settings.gpsInterval} {t('common.seconds')}
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={settings.gpsInterval}
                  onChange={(e) => setSettings({ ...settings, gpsInterval: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>10s</span>
                  <span>60s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('settings.batteryThreshold')}: {settings.batteryThreshold}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={settings.batteryThreshold}
                  onChange={(e) => setSettings({ ...settings, batteryThreshold: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          )}

          {/* Photo Tab */}
          {activeTab === 'photo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('settings.photoQuality')}: {settings.photoQuality}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="10"
                  value={settings.photoQuality}
                  onChange={(e) => setSettings({ ...settings, photoQuality: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>30%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.enableWatermark')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.watermarkEnabled}
                  onChange={(e) => setSettings({ ...settings, watermarkEnabled: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {settings.watermarkEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.watermarkPosition')}
                  </label>
                  <div className="relative">
                    <select
                      value={settings.watermarkPosition}
                      onChange={(e) => setSettings({ ...settings, watermarkPosition: e.target.value })}
                      className="appearance-none w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none pr-10"
                    >
                      <option value="top-left">{t('settings.topLeft')}</option>
                      <option value="top-center">{t('settings.topCenter')}</option>
                      <option value="top-right">{t('settings.topRight')}</option>
                      <option value="bottom-left">{t('settings.bottomLeft')}</option>
                      <option value="bottom-center">{t('settings.bottomCenter')}</option>
                      <option value="bottom-right">{t('settings.bottomRight')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integration Tab */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('settings.oneC')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('settings.oneCDesc')}
                    </p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: '#00BFA620',
                      color: '#00BFA6',
                    }}
                  >
                    {t('settings.connected')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.telegramToken')}
                </label>
                <input
                  type="password"
                  value={settings.telegramToken}
                  onChange={(e) => setSettings({ ...settings, telegramToken: e.target.value })}
                  placeholder="Bot token daxil edin"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.smsGateway')}
                </label>
                <input
                  type="text"
                  value={settings.smsGateway}
                  onChange={(e) => setSettings({ ...settings, smsGateway: e.target.value })}
                  placeholder="SMS şüşəsi adı"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>
            </div>
          )}
          {/* Telegram Bot Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              {/* Bot Info Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.telegramBotIntegration')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {t('settings.telegramBotDesc')}
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant={settings.tgEnabled ? 'success' : 'secondary'}>
                    {settings.tgEnabled ? t('settings.active') : t('settings.inactive')}
                  </Badge>
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-blue-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.enableBot')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.enableBotDesc')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.tgEnabled}
                  onChange={(e) => setSettings({ ...settings, tgEnabled: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                />
              </div>

              {/* Bot Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.botToken')}
                </label>
                <input
                  type="password"
                  value={settings.tgBotToken}
                  onChange={(e) => setSettings({ ...settings, tgBotToken: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('settings.botTokenHint')}
                </p>
              </div>

              {/* Chat ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.chatId')}
                </label>
                <input
                  type="text"
                  value={settings.tgChatId}
                  onChange={(e) => setSettings({ ...settings, tgChatId: e.target.value })}
                  placeholder="-1001234567890"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('settings.chatIdHint')}
                </p>
              </div>

              {/* Test Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setTgTestStatus('sending');
                  setTimeout(() => {
                    if (settings.tgBotToken && settings.tgChatId) {
                      setTgTestStatus('success');
                    } else {
                      setTgTestStatus('error');
                    }
                    setTimeout(() => setTgTestStatus('idle'), 3000);
                  }, 1500);
                }}
                disabled={tgTestStatus === 'sending'}
                className="flex items-center gap-2"
              >
                <Send size={16} />
                {tgTestStatus === 'sending' ? t('settings.sending') :
                 tgTestStatus === 'success' ? '✓ ' + t('settings.sent') :
                 tgTestStatus === 'error' ? '✗ ' + t('settings.tokenRequired') :
                 t('settings.sendTestMessage')}
              </Button>

              {/* Notification Types */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BellIcon size={16} />
                  {t('settings.notificationTypes')}
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'tgNotifyOffRoute', label: 'Marşrutdan sapma', desc: 'Agent marşrutdan kənara çıxdıqda', icon: '🚨' },
                    { key: 'tgNotifyLowBattery', label: 'Aşağı batareya', desc: 'Batareya həddən aşağı düşdükdə', icon: '🔋' },
                    { key: 'tgNotifyTaskComplete', label: 'Tapşırıq tamamlama', desc: 'Agent tapşırığı tamamladıqda', icon: '✅' },
                    { key: 'tgNotifyDailyReport', label: 'Gündəlik hesabat', desc: 'Hər gün saat 18:00-da avtomatik', icon: '📊' },
                    { key: 'tgNotifyCheckIn', label: 'Check-in/out', desc: 'Agent müştəriyə check-in etdikdə', icon: '📍' },
                    { key: 'tgNotifyPhoto', label: 'Foto yüklənmə', desc: 'Yeni foto yükləndikdə', icon: '📸' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={(settings as any)[item.key]}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Template Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  {t('settings.messageTemplate')}
                </h4>
                <div className="p-4 bg-gray-900 dark:bg-slate-950 rounded-lg text-sm font-mono text-green-400 whitespace-pre-line">
                  {`⚠️ MTM Xəbərdarlıq

👤 Agent: Rəfail Əliəv
📋 Tip: Marşrutdan sapma
📍 Yer: 40.4195, 49.8315
🕐 Vaxt: ${new Date().toLocaleTimeString('az-AZ')}
📏 Məsafə: 250m kənar

🔗 Ətraflı: mtm.az/agents/agent-004`}
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#6C63FF' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.scheduledReports')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.scheduledReportsDesc')}</p>
                  </div>
                </div>
                <Button
                  className="flex items-center gap-2 text-white"
                  style={{ backgroundColor: '#6C63FF' }}
                  onClick={() => {
                    const newReport: ScheduledReport = {
                      id: String(Date.now()),
                      name: t('settings.newReport'),
                      type: 'weekly',
                      format: 'excel',
                      recipients: [],
                      enabled: false,
                      nextRun: '—',
                      includes: [],
                    };
                    setScheduledReports([...scheduledReports, newReport]);
                  }}
                >
                  <Plus size={16} />
                  {t('settings.newReport')}
                </Button>
              </div>

              {/* Report Cards */}
              <div className="space-y-4">
                {scheduledReports.map((report) => {
                  const typeLabels = { daily: 'Gündəlik', weekly: 'Həftəlik', monthly: 'Aylıq' };
                  const typeColors = { daily: '#00BFA6', weekly: '#6C63FF', monthly: '#FFC107' };
                  const formatIcons: Record<string, React.ReactNode> = {
                    csv: <FileText size={16} className="text-green-600" />,
                    excel: <FileSpreadsheet size={16} className="text-emerald-600" />,
                    pdf: <FileText size={16} className="text-red-500" />,
                  };

                  return (
                    <div
                      key={report.id}
                      className={cn(
                        'p-4 border rounded-xl transition-all',
                        report.enabled
                          ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-gray-200 dark:border-gray-700 opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: typeColors[report.type] }}
                          >
                            {typeLabels[report.type]}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{report.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={report.enabled}
                            onChange={(e) => {
                              setScheduledReports(
                                scheduledReports.map((r) =>
                                  r.id === report.id ? { ...r, enabled: e.target.checked } : r
                                )
                              );
                            }}
                            className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                          />
                          <button
                            onClick={() => setScheduledReports(scheduledReports.filter((r) => r.id !== report.id))}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Format</p>
                          <div className="flex items-center gap-1.5">
                            {formatIcons[report.format]}
                            <span className="font-medium text-gray-700 dark:text-gray-300 uppercase">{report.format}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Növbəti göndərmə</p>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{report.nextRun}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alıcılar</p>
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{report.recipients.length} nəfər</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daxildir</p>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{report.includes.length} bölmə</span>
                        </div>
                      </div>

                      {report.includes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {report.includes.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {report.recipients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {report.recipients.map((email) => (
                            <span
                              key={email}
                              className="px-2 py-0.5 text-[11px] font-medium rounded-full text-white"
                              style={{ backgroundColor: '#6C63FF80' }}
                            >
                              {email}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {scheduledReports.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Mail size={40} className="mx-auto mb-3 opacity-50" />
                  <p>{t('settings.noScheduledReports')}</p>
                  <p className="text-sm mt-1">{t('settings.addNewReport')}</p>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Save size={20} />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
