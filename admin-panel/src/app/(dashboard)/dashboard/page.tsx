'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus, Download, MapPin, TrendingUp, TrendingDown, Clock, Users as UsersIcon,
  CheckCircle2, AlertTriangle, Camera, Route as RouteIcon, Target, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from '@/lib/i18n';

// Mock data
const mockStats = {
  routePlanned: 24,
  routeCompleted: 18,
  offRoute: 2,
  pendingTasks: 5,
  totalRouteTime: 480,
  avgRouteTime: 26,
  totalCustomerTime: 360,
  avgCustomerTime: 20,
  totalPhotos: 145,
  likedPhotos: 120,
  dislikedPhotos: 8,
  pendingReviewPhotos: 17,
  activeAgents: 8,
  totalAgents: 12,
};

const weeklyTrendData = [
  { day: 'Baz.e', completed: 12, planned: 15, visits: 28 },
  { day: 'Ç.axş', completed: 14, planned: 15, visits: 31 },
  { day: 'Çər', completed: 18, planned: 20, visits: 42 },
  { day: 'C.axş', completed: 16, planned: 18, visits: 37 },
  { day: 'Cümə', completed: 19, planned: 20, visits: 45 },
  { day: 'Şən', completed: 17, planned: 18, visits: 39 },
  { day: 'Bazar', completed: 15, planned: 16, visits: 33 },
];

const agentPerformanceData = [
  { agent: 'Əhməd M.', tasks: 45, photos: 32, visits: 18, completion: 92 },
  { agent: 'Farid H.', tasks: 38, photos: 28, visits: 15, completion: 85 },
  { agent: 'Leyla Q.', tasks: 52, photos: 41, visits: 21, completion: 96 },
  { agent: 'Rəfail Ə.', tasks: 35, photos: 25, visits: 14, completion: 78 },
  { agent: 'Sərxan Y.', tasks: 48, photos: 36, visits: 19, completion: 90 },
];

const hourlyVisitsData = [
  { hour: '08', visits: 3 },
  { hour: '09', visits: 8 },
  { hour: '10', visits: 15 },
  { hour: '11', visits: 22 },
  { hour: '12', visits: 18 },
  { hour: '13', visits: 10 },
  { hour: '14', visits: 20 },
  { hour: '15', visits: 25 },
  { hour: '16', visits: 19 },
  { hour: '17', visits: 12 },
  { hour: '18', visits: 5 },
];

const photoDistribution = [
  { name: 'Bəyənilən', value: 120, color: '#10B981' },
  { name: 'Bəyənilməyən', value: 8, color: '#EF4444' },
  { name: 'Gözləyən', value: 17, color: '#F59E0B' },
];

const liveAgents = [
  { id: 1, name: 'Əhməd Məmmədov', status: 'active', battery: 85, lastSeen: '1 dəq əvvəl', location: 'Nizami r.' },
  { id: 2, name: 'Farid Hüseynov', status: 'active', battery: 62, lastSeen: '3 dəq əvvəl', location: 'Yasamal r.' },
  { id: 3, name: 'Leyla Qasımova', status: 'active', battery: 91, lastSeen: 'İndicə', location: 'Nəsimi r.' },
  { id: 4, name: 'Rəfail Əliəv', status: 'warning', battery: 15, lastSeen: '8 dəq əvvəl', location: 'Xətai r.' },
  { id: 5, name: 'Sərxan Yusifov', status: 'active', battery: 73, lastSeen: '2 dəq əvvəl', location: 'Binəqədi r.' },
  { id: 6, name: 'Nigar Hüseynova', status: 'offline', battery: 0, lastSeen: '45 dəq əvvəl', location: 'Sabunçu r.' },
  { id: 7, name: 'Kamran İsmayılov', status: 'active', battery: 54, lastSeen: '5 dəq əvvəl', location: 'Suraxanı r.' },
  { id: 8, name: 'Günel Əhmədova', status: 'active', battery: 78, lastSeen: 'İndicə', location: 'Nərimanov r.' },
];

// ===== Animated Counter =====
function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <>{count}</>;
}

// ===== Circular Progress Ring =====
function ProgressRing({ value, size = 100, strokeWidth = 8, color = '#6C63FF' }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-slate-700"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(animatedValue)}%</span>
      </div>
    </div>
  );
}

// ===== KPI Card =====
interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: { direction: 'up' | 'down'; value: number };
  icon: React.ReactNode;
  iconBg: string;
}

function KPICard({ title, value, subtitle, trend, icon, iconBg }: KPICardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter target={value} />
              </span>
              {trend && (
                <span className={`flex items-center text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="ml-1">{trend.value}%</span>
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Clock Display =====
function ClockDisplay() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('az-AZ', {
        timeZone: 'Asia/Baku',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateFormatter = new Intl.DateTimeFormat('az-AZ', {
        timeZone: 'Asia/Baku',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setTime(timeFormatter.format(now));
      setDate(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right">
      <p className="text-sm text-gray-500 dark:text-gray-400">{date || '...'}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-wider">{time || '--:--:--'}</p>
    </div>
  );
}

// ===== Battery Indicator =====
function BatteryIndicator({ level }: { level: number }) {
  const color = level > 50 ? 'bg-green-500' : level > 20 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-3.5 rounded-sm border border-gray-300 dark:border-gray-600 p-0.5 relative">
        <div className={`h-full rounded-[1px] ${color}`} style={{ width: `${level}%` }} />
        <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-r-sm" />
      </div>
      <span className={`text-xs font-medium ${level > 50 ? 'text-green-600' : level > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
        {level}%
      </span>
    </div>
  );
}

// ===== Main Dashboard =====
export default function DashboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const completionRate = useMemo(
    () => Math.round((mockStats.routeCompleted / mockStats.routePlanned) * 100),
    []
  );

  const periodLabels = { daily: t('common.today'), weekly: t('common.thisWeek'), monthly: t('common.thisMonth') };

  return (
    <div className="space-y-6">
      {/* Greeting and Clock */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Xoş gəldiniz, {user?.name?.split(' ')[0] || 'Admin'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Bugünkü iş günü üçün xülasə
          </p>
        </div>
        <ClockDisplay />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/users">
          <Button className="w-full flex items-center justify-center gap-2 h-12 text-white" style={{ backgroundColor: 'var(--primary)' }}>
            <Plus size={18} />
            {t('dashboard.addAgent')}
          </Button>
        </Link>
        <Link href="/reports">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12">
            <Download size={18} />
            {t('dashboard.downloadReport')}
          </Button>
        </Link>
        <Link href="/map">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12">
            <MapPin size={18} />
            {t('dashboard.liveMap')}
          </Button>
        </Link>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((key) => (
          <Button
            key={key}
            variant={period === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(key)}
            style={period === key ? { backgroundColor: 'var(--primary)' } : undefined}
          >
            {periodLabels[key]}
          </Button>
        ))}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dashboard.plannedRoutes')}
          value={mockStats.routePlanned}
          subtitle={t('dashboard.thisWeek')}
          trend={{ direction: 'up', value: 12 }}
          icon={<RouteIcon size={22} className="text-indigo-600" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
        />
        <KPICard
          title={t('dashboard.completed')}
          value={mockStats.routeCompleted}
          subtitle={`${completionRate}% ${t('dashboard.completionLabel')}`}
          trend={{ direction: 'up', value: 8 }}
          icon={<CheckCircle2 size={22} className="text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <KPICard
          title={t('dashboard.offRoute')}
          value={mockStats.offRoute}
          subtitle={t('dashboard.needsAttention')}
          trend={{ direction: 'down', value: 15 }}
          icon={<AlertTriangle size={22} className="text-red-600" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
        />
        <KPICard
          title={t('dashboard.pendingTasks')}
          value={mockStats.pendingTasks}
          subtitle={t('dashboard.urgent2')}
          trend={{ direction: 'up', value: 3 }}
          icon={<Target size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Second Row: Completion Ring + Time Stats + Active Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Ring */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completionRate')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6 pt-2">
            <ProgressRing value={completionRate} size={110} />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6C63FF' }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.completedLabel')} {mockStats.routeCompleted}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.remaining')} {mockStats.routePlanned - mockStats.routeCompleted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.timeIndicators')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.avgRouteTime')}</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{mockStats.avgRouteTime} dəq</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-teal-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.avgCustomerTime')}</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{mockStats.avgCustomerTime} dəq</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.totalWorkTime')}</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(mockStats.totalRouteTime / 60)} saat</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%`, backgroundColor: 'var(--primary)' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{t('dashboard.activeAgents')}</span>
              <Badge variant="success">{mockStats.activeAgents}/{mockStats.totalAgents}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-center mb-3">
              <div className="flex -space-x-2">
                {liveAgents.filter(a => a.status !== 'offline').slice(0, 5).map((agent) => (
                  <div
                    key={agent.id}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#6C63FF' }}
                    title={agent.name}
                  >
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {mockStats.activeAgents > 5 && (
                  <div className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    +{mockStats.activeAgents - 5}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 max-h-32 overflow-auto">
              {liveAgents.filter(a => a.status !== 'offline').slice(0, 4).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{agent.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{agent.location}</span>
                </div>
              ))}
            </div>
            <Link href="/map" className="block text-center mt-3">
              <Button variant="outline" size="sm" className="w-full text-xs">
                {t('dashboard.showOnMap')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} style={{ color: 'var(--primary)' }} />
              {t('dashboard.weeklyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00BFA6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="planned" stroke="#6C63FF" fill="url(#gradPlanned)" name={t('dashboard.planned')} strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#00BFA6" fill="url(#gradCompleted)" name={t('dashboard.completedChart')} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon size={18} style={{ color: 'var(--primary)' }} />
              {t('dashboard.agentPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agentPerformanceData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="agent" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="tasks" fill="#6C63FF" name={t('dashboard.tasks')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="photos" fill="#00BFA6" name={t('dashboard.photos')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" fill="#FFC107" name={t('dashboard.visits')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Photo Donut + Hourly Activity + Live Agents Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={18} style={{ color: 'var(--primary)' }} />
              {t('dashboard.photoStats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={photoDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {photoDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {photoDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Visit Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.hourlyVisits')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyVisitsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="visits" name={t('dashboard.visits')} radius={[4, 4, 0, 0]}>
                  {hourlyVisitsData.map((entry, index) => (
                    <Cell key={index} fill={entry.visits > 20 ? '#6C63FF' : entry.visits > 10 ? '#00BFA6' : '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Live Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.liveAgents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[260px] overflow-auto">
              {liveAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: agent.status === 'offline' ? '#94A3B8' : '#6C63FF' }}
                      >
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        agent.status === 'active' ? 'bg-green-500' : agent.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{agent.lastSeen}</p>
                    </div>
                  </div>
                  <BatteryIndicator level={agent.battery} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
