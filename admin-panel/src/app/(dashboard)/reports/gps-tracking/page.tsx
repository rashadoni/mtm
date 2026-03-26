'use client';

import { useTranslation } from '@/lib/i18n';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Radio, Battery, Watch } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface GPSTracking {
  id: number;
  agent: string;
  date: string;
  gpsStatus: 'Aktiv' | 'Zəif' | 'Deaktiv';
  accuracy: number;
  batteryPercent: number;
  lastUpdate: string;
  device: string;
}

const mockData: GPSTracking[] = [
  {
    id: 1,
    agent: 'Elvin Məmmədov',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 5,
    batteryPercent: 85,
    lastUpdate: '09:45',
    device: 'iPhone 12',
  },
  {
    id: 2,
    agent: 'Nigar Həsənova',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 8,
    batteryPercent: 72,
    lastUpdate: '09:42',
    device: 'Samsung A50',
  },
  {
    id: 3,
    agent: 'Rəşid Quliyev',
    date: '2024-03-15',
    gpsStatus: 'Zəif',
    accuracy: 15,
    batteryPercent: 45,
    lastUpdate: '09:40',
    device: 'Xiaomi 11',
  },
  {
    id: 4,
    agent: 'Leyla Əbdullayeva',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 6,
    batteryPercent: 92,
    lastUpdate: '09:38',
    device: 'iPhone 13',
  },
  {
    id: 5,
    agent: 'Fərid Ağayev',
    date: '2024-03-15',
    gpsStatus: 'Deaktiv',
    accuracy: 0,
    batteryPercent: 15,
    lastUpdate: '08:30',
    device: 'OnePlus 9',
  },
  {
    id: 6,
    agent: 'Aynur İsmayılova',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 7,
    batteryPercent: 88,
    lastUpdate: '09:35',
    device: 'iPhone 12 Pro',
  },
  {
    id: 7,
    agent: 'Mehri Yusifova',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 9,
    batteryPercent: 78,
    lastUpdate: '09:32',
    device: 'Samsung S21',
  },
  {
    id: 8,
    agent: 'Cavid Həsəanov',
    date: '2024-03-15',
    gpsStatus: 'Zəif',
    accuracy: 22,
    batteryPercent: 32,
    lastUpdate: '09:25',
    device: 'Moto G10',
  },
  {
    id: 9,
    agent: 'Səbinə Qasımova',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 4,
    batteryPercent: 95,
    lastUpdate: '09:50',
    device: 'iPhone 14',
  },
  {
    id: 10,
    agent: 'Tural Hasanzadə',
    date: '2024-03-15',
    gpsStatus: 'Aktiv',
    accuracy: 10,
    batteryPercent: 68,
    lastUpdate: '09:28',
    device: 'Samsung A51',
  },
];

const chartData = [
  { time: '06:00', accuracy: 12, active: 2 },
  { time: '08:00', accuracy: 9, active: 5 },
  { time: '10:00', accuracy: 6, active: 8 },
  { time: '12:00', accuracy: 8, active: 7 },
  { time: '14:00', accuracy: 7, active: 8 },
  { time: '16:00', accuracy: 5, active: 9 },
  { time: '18:00', accuracy: 10, active: 6 },
  { time: '20:00', accuracy: 15, active: 4 },
];

const getColumns = (t: (key: string) => string): ColumnConfig<GPSTracking>[] => [
  {
    id: 'agent',
    header: t('common.name'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'date',
    header: t('common.date'),
    sortable: true,
  },
  {
    id: 'gpsStatus',
    header: t('reports.gps.title'),
    sortable: true,
    cell: (value) => {
      let variant: 'success' | 'warning' | 'destructive' = 'success';
      let label = value;
      if (value === 'Zəif') {
        variant = 'warning';
        label = t('reports.gps.weak');
      }
      if (value === 'Deaktiv') {
        variant = 'destructive';
        label = t('reports.gps.inactive');
      }
      if (value === 'Aktiv') {
        label = t('reports.gps.active');
      }

      return (
        <Badge variant={variant} className="text-xs">
          {label}
        </Badge>
      );
    },
  },
  {
    id: 'accuracy',
    header: t('reports.gps.accuracy_m'),
    sortable: true,
    cell: (value) => `±${value}m`,
  },
  {
    id: 'batteryPercent',
    header: t('reports.gps.battery'),
    sortable: true,
    cell: (value) => {
      const batteryValue = typeof value === 'number' ? value : parseInt(String(value));
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                batteryValue > 50 ? 'bg-green-500' : batteryValue > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${batteryValue}%` }}
            />
          </div>
          <span className="text-xs">{batteryValue}%</span>
        </div>
      );
    },
  },
  {
    id: 'lastUpdate',
    header: t('reports.gps.lastUpdate'),
    sortable: true,
  },
  {
    id: 'device',
    header: t('reports.gps.device'),
    sortable: true,
  },
];

export default function GPSTrackingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filteredData, setFilteredData] = useState(mockData);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const columns = getColumns(t);

  const agents = Array.from(new Set(mockData.map((d) => d.agent)));

  const handleFilterChange = () => {
    let filtered = mockData;

    if (selectedAgent) {
      filtered = filtered.filter((d) => d.agent === selectedAgent);
    }

    setFilteredData(filtered);
  };

  const activeGPS = filteredData.filter((d) => d.gpsStatus === 'Aktiv').length;
  const inactiveGPS = filteredData.length - activeGPS;
  const avgAccuracy = (
    filteredData.reduce((sum, d) => sum + d.accuracy, 0) / filteredData.length
  ).toFixed(1);
  const lowBattery = filteredData.filter((d) => d.batteryPercent < 30).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.gps.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.gps.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.gps.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Radio size={24} />}
          title={t('reports.gps.active')}
          value={activeGPS}
          change={5}
          color="#10B981"
        />
        <StatCard
          icon={<Activity size={24} />}
          title={t('reports.gps.inactive')}
          value={inactiveGPS}
          change={-2}
          color="#E74C3C"
        />
        <StatCard
          icon={<Watch size={24} />}
          title={t('reports.gps.accuracy')}
          value={`±${avgAccuracy}m`}
          color="#6C63FF"
        />
        <StatCard
          icon={<Battery size={24} />}
          title={t('reports.gps.lowBattery')}
          value={lowBattery}
          change={1}
          color="#FFC107"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.gps.chart')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#E74C3C"
                strokeWidth={2}
                dot={false}
                name={t('reports.gps.accuracy_m')}
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name={t('reports.gps.activeDevices')}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.photo.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('common.name')}
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">{t('common.all')}</option>
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleFilterChange}
              className="whitespace-nowrap"
            >
              {t('routes.apply')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.gps.data')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
