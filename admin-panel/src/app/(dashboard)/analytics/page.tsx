'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Target,
  Clock, CheckCircle2, AlertTriangle, Star, Award, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

// ===== Mock Data =====
const monthlyData = [
  { month: 'Yan', visits: 420, tasks: 380, photos: 890, routes: 95 },
  { month: 'Fev', visits: 480, tasks: 440, photos: 980, routes: 110 },
  { month: 'Mar', visits: 550, tasks: 510, photos: 1120, routes: 128 },
  { month: 'Apr', visits: 490, tasks: 460, photos: 1050, routes: 115 },
  { month: 'May', visits: 580, tasks: 540, photos: 1200, routes: 135 },
  { month: 'İyn', visits: 620, tasks: 580, photos: 1350, routes: 148 },
  { month: 'İyl', visits: 590, tasks: 560, photos: 1280, routes: 140 },
  { month: 'Avq', visits: 640, tasks: 600, photos: 1400, routes: 155 },
  { month: 'Sen', visits: 680, tasks: 640, photos: 1500, routes: 165 },
  { month: 'Okt', visits: 720, tasks: 680, photos: 1600, routes: 178 },
  { month: 'Noy', visits: 760, tasks: 720, photos: 1700, routes: 185 },
  { month: 'Dek', visits: 800, tasks: 760, photos: 1800, routes: 195 },
];

const weeklyComparison = [
  { day: 'Baz.e', thisWeek: 45, lastWeek: 38 },
  { day: 'Ç.axş', thisWeek: 52, lastWeek: 42 },
  { day: 'Çər', thisWeek: 61, lastWeek: 55 },
  { day: 'C.axş', thisWeek: 48, lastWeek: 50 },
  { day: 'Cümə', thisWeek: 65, lastWeek: 58 },
  { day: 'Şən', thisWeek: 55, lastWeek: 45 },
  { day: 'Bazar', thisWeek: 30, lastWeek: 28 },
];

const agentRankingData = [
  { name: 'Leyla Q.', visits: 98, tasks: 52, photos: 145, score: 96, trend: 'up' as const },
  { name: 'Əhməd M.', visits: 92, tasks: 48, photos: 130, score: 94, trend: 'up' as const },
  { name: 'Sərxan Y.', visits: 87, tasks: 45, photos: 120, score: 90, trend: 'up' as const },
  { name: 'Günel Ə.', visits: 82, tasks: 42, photos: 110, score: 87, trend: 'down' as const },
  { name: 'Farid H.', visits: 78, tasks: 40, photos: 105, score: 85, trend: 'up' as const },
  { name: 'Kamran İ.', visits: 72, tasks: 37, photos: 95, score: 82, trend: 'down' as const },
  { name: 'Rəfail Ə.', visits: 65, tasks: 32, photos: 85, score: 78, trend: 'down' as const },
  { name: 'Nigar H.', visits: 58, tasks: 28, photos: 72, score: 72, trend: 'up' as const },
];

const radarData = [
  { metric: 'Ziyarət', value: 88, fullMark: 100 },
  { metric: 'Tapşırıq', value: 92, fullMark: 100 },
  { metric: 'Vaxtında', value: 85, fullMark: 100 },
  { metric: 'Foto', value: 78, fullMark: 100 },
  { metric: 'Müştəri', value: 90, fullMark: 100 },
  { metric: 'Marşrut', value: 82, fullMark: 100 },
];

const categoryDistribution = [
  { name: 'Supermarket', value: 35, color: '#6C63FF' },
  { name: 'Mağaza', value: 25, color: '#00BFA6' },
  { name: 'Restoran', value: 18, color: '#FFC107' },
  { name: 'Ofis', value: 12, color: '#3498DB' },
  { name: 'Digər', value: 10, color: '#E74C3C' },
];

const regionPerformance = [
  { region: 'Nəsimi', visits: 120, completion: 94 },
  { region: 'Yasamal', visits: 105, completion: 88 },
  { region: 'Nizami', visits: 98, completion: 91 },
  { region: 'Xətai', visits: 85, completion: 82 },
  { region: 'Binəqədi', visits: 78, completion: 87 },
  { region: 'Suraxanı', visits: 65, completion: 79 },
  { region: 'Sabunçu', visits: 58, completion: 75 },
  { region: 'Nərimanov', visits: 92, completion: 90 },
];

// ===== Components =====
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { t } = useTranslation();
  const periodLabels = { weekly: t('analytics.weekly'), monthly: t('analytics.monthly'), yearly: t('analytics.yearly') };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('analytics.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('analytics.subtitle')}</p>
        </div>
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
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('analytics.totalVisits')}
          value="7,840"
          change={12.5}
          icon={<MapPin size={20} style={{ color: '#6C63FF' }} />}
          color="#6C63FF"
        />
        <MetricCard
          title={t('analytics.completedTasks')}
          value="6,720"
          change={8.3}
          icon={<CheckCircle2 size={20} style={{ color: '#00BFA6' }} />}
          color="#00BFA6"
        />
        <MetricCard
          title={t('analytics.uploadedPhotos')}
          value="15,230"
          change={15.7}
          icon={<Camera size={20} style={{ color: '#3498DB' }} />}
          color="#3498DB"
        />
        <MetricCard
          title={t('analytics.avgCompletion')}
          value="87.4%"
          change={-2.1}
          icon={<Target size={20} style={{ color: '#FFC107' }} />}
          color="#FFC107"
        />
      </div>

      {/* Charts Row 1: Monthly Trend + Weekly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
              {t('analytics.yearlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00BFA6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="visits" stroke="#6C63FF" fill="url(#gVisits)" name={t('analytics.visit')} strokeWidth={2} />
                <Area type="monotone" dataKey="tasks" stroke="#00BFA6" fill="url(#gTasks)" name={t('analytics.task')} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.weeklyComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyComparison} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="thisWeek" fill="#6C63FF" name={t('analytics.thisWeek')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastWeek" fill="#E0E0E0" name={t('analytics.lastWeek')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Radar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.teamPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#666' }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name={t('analytics.performance')} dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.customerCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {categoryDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Region Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.regionPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-auto">
              {regionPerformance
                .sort((a, b) => b.completion - a.completion)
                .map((region) => (
                <div key={region.region} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 truncate">{region.region}</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${region.completion}%`,
                        backgroundColor: region.completion > 90 ? '#10B981' : region.completion > 80 ? '#6C63FF' : '#FFC107',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white w-10 text-right">{region.completion}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={18} style={{ color: '#FFC107' }} />
            {t('analytics.agentRanking')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">Agent</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('analytics.visit')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('analytics.task')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('nav.photos')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('analytics.score')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('analytics.trend')}</th>
                </tr>
              </thead>
              <tbody>
                {agentRankingData.map((agent, i) => (
                  <tr key={agent.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      {i < 3 ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {i + 1}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 pl-1.5">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: '#6C63FF' }}
                        >
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{agent.visits}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{agent.tasks}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{agent.photos}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-bold ${agent.score >= 90 ? 'text-green-600' : agent.score >= 80 ? 'text-blue-600' : 'text-yellow-600'}`}>
                        {agent.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {agent.trend === 'up' ? (
                        <TrendingUp size={16} className="text-green-500 inline" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
