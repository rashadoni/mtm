'use client';

import { useTranslation } from '@/lib/i18n';

import { useRouter } from 'next/navigation';
import { Star, Users, Clock, TrendingUp, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface PerformanceData {
  id: number;
  agent: string;
  planned: number;
  completed: number;
  percentage: number;
  avgDuration: string;
  rating: number;
}

const mockData: PerformanceData[] = [
  {
    id: 1,
    agent: 'Elvin Məmmədov',
    planned: 15,
    completed: 14,
    percentage: 93,
    avgDuration: '42 dəq',
    rating: 4.8,
  },
  {
    id: 2,
    agent: 'Nigar Həsənova',
    planned: 12,
    completed: 11,
    percentage: 92,
    avgDuration: '38 dəq',
    rating: 4.7,
  },
  {
    id: 3,
    agent: 'Rəşid Quliyev',
    planned: 18,
    completed: 16,
    percentage: 89,
    avgDuration: '45 dəq',
    rating: 4.5,
  },
  {
    id: 4,
    agent: 'Leyla Əbdullayeva',
    planned: 14,
    completed: 13,
    percentage: 93,
    avgDuration: '40 dəq',
    rating: 4.9,
  },
  {
    id: 5,
    agent: 'Fərid Ağayev',
    planned: 16,
    completed: 14,
    percentage: 88,
    avgDuration: '43 dəq',
    rating: 4.4,
  },
  {
    id: 6,
    agent: 'Aynur İsmayılova',
    planned: 13,
    completed: 12,
    percentage: 92,
    avgDuration: '39 dəq',
    rating: 4.6,
  },
  {
    id: 7,
    agent: 'Mehri Yusifova',
    planned: 17,
    completed: 16,
    percentage: 94,
    avgDuration: '41 dəq',
    rating: 4.8,
  },
  {
    id: 8,
    agent: 'Cavid Həsəanov',
    planned: 15,
    completed: 13,
    percentage: 87,
    avgDuration: '44 dəq',
    rating: 4.3,
  },
  {
    id: 9,
    agent: 'Səbinə Qasımova',
    planned: 14,
    completed: 13,
    percentage: 93,
    avgDuration: '37 dəq',
    rating: 4.7,
  },
  {
    id: 10,
    agent: 'Tural Hasanzadə',
    planned: 16,
    completed: 15,
    percentage: 94,
    avgDuration: '42 dəq',
    rating: 4.9,
  },
];

const chartData = mockData.map((agent) => ({
  name: agent.agent.split(' ')[0],
  Planlanan: agent.planned,
  Tamamlanan: agent.completed,
}));

const columns: ColumnConfig<PerformanceData>[] = [
  {
    id: 'agent',
    header: 'Agent',
    sortable: true,
    searchable: true,
  },
  {
    id: 'planned',
    header: 'Planlanan',
    sortable: true,
  },
  {
    id: 'completed',
    header: 'Tamamlanan',
    sortable: true,
  },
  {
    id: 'percentage',
    header: 'Faiz',
    sortable: true,
    cell: (value) => `${value}%`,
  },
  {
    id: 'avgDuration',
    header: 'Orta Müddət',
    sortable: true,
  },
  {
    id: 'rating',
    header: 'Qiymətləndirmə',
    sortable: true,
    cell: (value) => {
      const ratingValue = typeof value === 'number' ? value : parseFloat(String(value));
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < Math.floor(ratingValue)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }
            />
          ))}
        </div>
      );
    },
  },
];

export default function PerformancePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const topAgent = mockData.reduce((prev, current) =>
    prev.rating > current.rating ? prev : current
  );
  const avgVisits = (
    mockData.reduce((sum, d) => sum + d.completed, 0) / mockData.length
  ).toFixed(1);
  const avgDuration =
    mockData.reduce((sum, d) => {
      const minutes = parseInt(d.avgDuration.split(' ')[0]);
      return sum + minutes;
    }, 0) / mockData.length;
  const avgPercentage = (
    mockData.reduce((sum, d) => sum + d.percentage, 0) / mockData.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.performance.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports.performance.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.performance.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={24} />}
          title={t('reports.performance.bestAgent')}
          value={topAgent.agent}
          color="#6C63FF"
        />
        <StatCard
          icon={<Activity size={24} />}
          title={t('reports.performance.avgVisits')}
          value={avgVisits}
          change={5}
          color="#00BFA6"
        />
        <StatCard
          icon={<Clock size={24} />}
          title={t('reports.performance.avgDuration')}
          value={`${Math.round(avgDuration)} ${t('routes.minutes')}`}
          color="#FFC107"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title={t('reports.performance.completionRate')}
          value={`${avgPercentage}%`}
          change={3}
          color="#10B981"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.performance.chart')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey={t('reports.performance.planned')} fill="#6C63FF" radius={[8, 8, 0, 0]} />
              <Bar dataKey={t('reports.performance.completed')} fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('routes.agents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockData} />
        </CardContent>
      </Card>
    </div>
  );
}
