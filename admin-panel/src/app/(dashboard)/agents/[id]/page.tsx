'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, Mail, Clock, CheckCircle2,
  AlertTriangle, Battery, Camera, Route as RouteIcon,
  Calendar, TrendingUp, Target, Smartphone,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

// Mock agent data
const mockAgents: Record<string, any> = {
  'agent-001': {
    id: 'agent-001',
    name: 'Əhməd Məmmədov',
    email: 'ahmed@mtm.az',
    phone: '+994501234567',
    role: 'agent',
    status: 'active',
    region: 'Nizami, Nəsimi r.',
    joinDate: '2025-06-15',
    totalVisits: 342,
    completedRoutes: 156,
    avgVisitDuration: 22,
    completionRate: 94,
    totalPhotos: 890,
    batteryLevel: 85,
    lastSeen: '1 dəq əvvəl',
    device: 'Samsung Galaxy A54',
    osVersion: 'Android 14',
  },
  'agent-002': {
    id: 'agent-002',
    name: 'Farid Hüseynov',
    email: 'farid@mtm.az',
    phone: '+994502345678',
    role: 'agent',
    status: 'active',
    region: 'Yasamal, Binəqədi r.',
    joinDate: '2025-08-01',
    totalVisits: 287,
    completedRoutes: 128,
    avgVisitDuration: 18,
    completionRate: 87,
    totalPhotos: 620,
    batteryLevel: 62,
    lastSeen: '3 dəq əvvəl',
    device: 'iPhone 15',
    osVersion: 'iOS 18.1',
  },
  'agent-003': {
    id: 'agent-003',
    name: 'Leyla Qasımova',
    email: 'leyla@mtm.az',
    phone: '+994503456789',
    role: 'agent',
    status: 'active',
    region: 'Nəsimi, Xətai r.',
    joinDate: '2025-04-20',
    totalVisits: 415,
    completedRoutes: 198,
    avgVisitDuration: 25,
    completionRate: 96,
    totalPhotos: 1120,
    batteryLevel: 91,
    lastSeen: 'İndicə',
    device: 'Samsung Galaxy S24',
    osVersion: 'Android 14',
  },
};

// GPS tracking history (last 24 hours)
const gpsHistory = [
  { time: '08:00', lat: 40.3916, lng: 49.8674, speed: 0, event: 'Giriş' },
  { time: '08:30', lat: 40.3950, lng: 49.8600, speed: 35, event: 'Marşruta başladı' },
  { time: '09:00', lat: 40.4020, lng: 49.8520, speed: 0, event: 'Müştəri #1 check-in' },
  { time: '09:25', lat: 40.4020, lng: 49.8520, speed: 0, event: 'Müştəri #1 check-out' },
  { time: '09:45', lat: 40.4080, lng: 49.8430, speed: 28, event: 'Hərəkətdə' },
  { time: '10:00', lat: 40.4120, lng: 49.8380, speed: 0, event: 'Müştəri #2 check-in' },
  { time: '10:30', lat: 40.4120, lng: 49.8380, speed: 0, event: 'Müştəri #2 check-out' },
  { time: '11:00', lat: 40.4060, lng: 49.8450, speed: 42, event: 'Hərəkətdə' },
  { time: '11:20', lat: 40.3980, lng: 49.8550, speed: 0, event: 'Müştəri #3 check-in' },
  { time: '11:50', lat: 40.3980, lng: 49.8550, speed: 0, event: 'Müştəri #3 check-out' },
  { time: '12:00', lat: 40.3960, lng: 49.8580, speed: 0, event: 'Nahar fasilə' },
  { time: '13:00', lat: 40.3960, lng: 49.8580, speed: 15, event: 'Davam' },
  { time: '13:30', lat: 40.3890, lng: 49.8650, speed: 0, event: 'Müştəri #4 check-in' },
  { time: '14:00', lat: 40.3890, lng: 49.8650, speed: 0, event: 'Müştəri #4 check-out' },
  { time: '14:30', lat: 40.3840, lng: 49.8700, speed: 30, event: 'Hərəkətdə' },
  { time: '15:00', lat: 40.3800, lng: 49.8750, speed: 0, event: 'Müştəri #5 check-in' },
];

// Weekly performance data
const weeklyPerformance = [
  { day: 'Baz.e', visits: 6, tasks: 8, photos: 12 },
  { day: 'Ç.axş', visits: 7, tasks: 10, photos: 15 },
  { day: 'Çər', visits: 8, tasks: 12, photos: 18 },
  { day: 'C.axş', visits: 5, tasks: 7, photos: 11 },
  { day: 'Cümə', visits: 9, tasks: 13, photos: 20 },
  { day: 'Şən', visits: 7, tasks: 9, photos: 14 },
  { day: 'Bazar', visits: 4, tasks: 5, photos: 8 },
];

// Recent visits
const recentVisits = [
  { id: 1, customer: 'Azərsu ASC', time: '09:00 - 09:25', status: 'completed', duration: '25 dəq', photos: 3 },
  { id: 2, customer: 'SOCAR Trading', time: '10:00 - 10:30', status: 'completed', duration: '30 dəq', photos: 4 },
  { id: 3, customer: 'Baku Electronics', time: '11:20 - 11:50', status: 'completed', duration: '30 dəq', photos: 2 },
  { id: 4, customer: 'Bravo Supermarket', time: '13:30 - 14:00', status: 'completed', duration: '30 dəq', photos: 5 },
  { id: 5, customer: 'Araz Supermarket', time: '15:00 - ...', status: 'in_progress', duration: '-', photos: 1 },
];

function BatteryIndicator({ level }: { level: number }) {
  const color = level > 50 ? 'text-green-600' : level > 20 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = level > 50 ? 'bg-green-500' : level > 20 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <Battery size={20} className={color} />
      <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bgColor}`} style={{ width: `${level}%` }} />
      </div>
      <span className={`text-sm font-semibold ${color}`}>{level}%</span>
    </div>
  );
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const agentId = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'gps' | 'visits'>('overview');

  // Get agent data (fallback to first mock agent)
  const agent = mockAgents[agentId] || mockAgents['agent-001'];

  const tabs = [
    { id: 'overview' as const, label: 'İcmal' },
    { id: 'gps' as const, label: 'GPS Tarixçəsi' },
    { id: 'visits' as const, label: 'Ziyarətlər' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">{t('common.back')}</span>
      </button>

      {/* Agent Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00BFA6)' }}
            >
              {agent.name.split(' ').map((n: string) => n[0]).join('')}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
                <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                  {agent.status === 'active' ? t('users.active') : t('users.inactive')}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-3">{agent.region}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Mail size={14} /> {agent.email}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {agent.phone}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Qoşulub: {agent.joinDate}</span>
                <span className="flex items-center gap-1"><Smartphone size={14} /> {agent.device}</span>
              </div>
            </div>

            {/* Battery & Last Seen */}
            <div className="text-right space-y-2">
              <BatteryIndicator level={agent.batteryLevel} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Son görülmə: <span className="text-green-600 font-medium">{agent.lastSeen}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Ümumi Ziyarət', value: agent.totalVisits, icon: <MapPin size={18} className="text-indigo-500" /> },
          { label: 'Tamamlanan Rut', value: agent.completedRoutes, icon: <RouteIcon size={18} className="text-green-500" /> },
          { label: 'Ort. Ziyarət Vaxtı', value: `${agent.avgVisitDuration} dəq`, icon: <Clock size={18} className="text-blue-500" /> },
          { label: 'Tamamlanma %', value: `${agent.completionRate}%`, icon: <Target size={18} className="text-amber-500" /> },
          { label: 'Ümumi Foto', value: agent.totalPhotos, icon: <Camera size={18} className="text-teal-500" /> },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Həftəlik Performans</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyPerformance}>
                  <defs>
                    <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="visits" stroke="#6C63FF" fill="url(#gradVisits)" name="Ziyarət" strokeWidth={2} />
                  <Line type="monotone" dataKey="tasks" stroke="#00BFA6" name="Tapşırıq" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Speed/Movement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hərəkət Sürəti (Bu gün)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={gpsHistory}>
                  <defs>
                    <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00BFA6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" km/s" />
                  <Tooltip />
                  <Area type="monotone" dataKey="speed" stroke="#00BFA6" fill="url(#gradSpeed)" name="Sürət (km/s)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'gps' && (
        <Card>
          <CardHeader>
            <CardTitle>GPS Tarixçəsi - Bu gün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
              <div className="space-y-4 pl-10">
                {gpsHistory.map((point, i) => {
                  const isCheckIn = point.event.includes('check-in');
                  const isCheckOut = point.event.includes('check-out');
                  const isMoving = point.speed > 0;
                  const isPause = point.event.includes('Nahar') || point.event.includes('fasilə');

                  let dotColor = 'bg-gray-400';
                  if (isCheckIn) dotColor = 'bg-green-500';
                  else if (isCheckOut) dotColor = 'bg-blue-500';
                  else if (isPause) dotColor = 'bg-yellow-500';
                  else if (isMoving) dotColor = 'bg-indigo-500';
                  else if (point.event === 'Giriş') dotColor = 'bg-purple-500';

                  return (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={`absolute -left-10 top-1.5 w-3 h-3 rounded-full ${dotColor} ring-2 ring-white dark:ring-slate-900`} />
                      <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{point.event}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{point.time}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>📍 {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</span>
                          {point.speed > 0 && <span>🚗 {point.speed} km/s</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'visits' && (
        <Card>
          <CardHeader>
            <CardTitle>Bugünkü Ziyarətlər</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Müştəri</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Vaxt</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Müddət</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Foto</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{visit.customer}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.time}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.duration}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Camera size={14} /> {visit.photos}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={visit.status === 'completed' ? 'success' : 'warning'}>
                          {visit.status === 'completed' ? 'Tamamlandı' : 'Davam edir'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
