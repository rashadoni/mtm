'use client';

import { useTranslation } from '@/lib/i18n';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface RouteExecution {
  id: number;
  agent: string;
  routeName: string;
  plannedPoints: number;
  visitedPoints: number;
  skippedPoints: number;
  deviation: number;
  status: 'Tam icra' | 'Qismən' | 'İcra edilməyib';
}

const mockData: RouteExecution[] = [
  {
    id: 1,
    agent: 'Elvin Məmmədov',
    routeName: 'Marşrut-A1',
    plannedPoints: 8,
    visitedPoints: 8,
    skippedPoints: 0,
    deviation: 0.5,
    status: 'Tam icra',
  },
  {
    id: 2,
    agent: 'Nigar Həsənova',
    routeName: 'Marşrut-B2',
    plannedPoints: 7,
    visitedPoints: 6,
    skippedPoints: 1,
    deviation: 2.3,
    status: 'Qismən',
  },
  {
    id: 3,
    agent: 'Rəşid Quliyev',
    routeName: 'Marşrut-C3',
    plannedPoints: 10,
    visitedPoints: 10,
    skippedPoints: 0,
    deviation: 1.2,
    status: 'Tam icra',
  },
  {
    id: 4,
    agent: 'Leyla Əbdullayeva',
    routeName: 'Marşrut-D4',
    plannedPoints: 6,
    visitedPoints: 6,
    skippedPoints: 0,
    deviation: 0.8,
    status: 'Tam icra',
  },
  {
    id: 5,
    agent: 'Fərid Ağayev',
    routeName: 'Marşrut-E5',
    plannedPoints: 9,
    visitedPoints: 7,
    skippedPoints: 2,
    deviation: 3.1,
    status: 'Qismən',
  },
  {
    id: 6,
    agent: 'Aynur İsmayılova',
    routeName: 'Marşrut-A2',
    plannedPoints: 8,
    visitedPoints: 8,
    skippedPoints: 0,
    deviation: 1.0,
    status: 'Tam icra',
  },
  {
    id: 7,
    agent: 'Mehri Yusifova',
    routeName: 'Marşrut-F6',
    plannedPoints: 7,
    visitedPoints: 7,
    skippedPoints: 0,
    deviation: 0.3,
    status: 'Tam icra',
  },
  {
    id: 8,
    agent: 'Cavid Həsəanov',
    routeName: 'Marşrut-G7',
    plannedPoints: 5,
    visitedPoints: 3,
    skippedPoints: 2,
    deviation: 5.6,
    status: 'Qismən',
  },
  {
    id: 9,
    agent: 'Səbinə Qasımova',
    routeName: 'Marşrut-H8',
    plannedPoints: 9,
    visitedPoints: 0,
    skippedPoints: 9,
    deviation: 0.0,
    status: 'İcra edilməyib',
  },
  {
    id: 10,
    agent: 'Tural Hasanzadə',
    routeName: 'Marşrut-I9',
    plannedPoints: 8,
    visitedPoints: 8,
    skippedPoints: 0,
    deviation: 0.7,
    status: 'Tam icra',
  },
  {
    id: 11,
    agent: 'Elvin Məmmədov',
    routeName: 'Marşrut-J10',
    plannedPoints: 6,
    visitedPoints: 5,
    skippedPoints: 1,
    deviation: 1.9,
    status: 'Qismən',
  },
  {
    id: 12,
    agent: 'Nigar Həsənova',
    routeName: 'Marşrut-K11',
    plannedPoints: 10,
    visitedPoints: 10,
    skippedPoints: 0,
    deviation: 0.4,
    status: 'Tam icra',
  },
];

const getColumns = (t: (key: string) => string): ColumnConfig<RouteExecution>[] => [
  {
    id: 'agent',
    header: t('common.name'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'routeName',
    header: t('reports.route.routeName'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'plannedPoints',
    header: t('reports.route.planned'),
    sortable: true,
  },
  {
    id: 'visitedPoints',
    header: t('reports.route.visited'),
    sortable: true,
  },
  {
    id: 'skippedPoints',
    header: t('reports.route.skippedPoints'),
    sortable: true,
  },
  {
    id: 'deviation',
    header: t('reports.route.deviation'),
    sortable: true,
    cell: (value) => `${value} km`,
  },
  {
    id: 'status',
    header: t('common.status'),
    sortable: true,
    cell: (value) => {
      let variant: 'success' | 'warning' | 'destructive' = 'success';
      let label = value;
      if (value === 'Qismən') {
        variant = 'warning';
        label = t('reports.route.partial');
      }
      if (value === 'İcra edilməyib') {
        variant = 'destructive';
        label = t('reports.route.notExecuted');
      }
      if (value === 'Tam icra') {
        label = t('reports.route.executed');
      }

      return (
        <Badge variant={variant} className="text-xs">
          {label}
        </Badge>
      );
    },
  },
];

export default function RouteExecutionPage() {
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

  const totalRoutes = filteredData.length;
  const executionRate = (
    (filteredData.filter((d) => d.status === 'Tam icra').length / totalRoutes) *
    100
  ).toFixed(1);
  const avgDeviation = (
    filteredData.reduce((sum, d) => sum + d.deviation, 0) / totalRoutes
  ).toFixed(2);
  const skippedCount = filteredData.reduce((sum, d) => sum + d.skippedPoints, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.route.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.route.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.route.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<MapPin size={24} />}
          title={t('reports.route.routes')}
          value={totalRoutes}
          color="#6C63FF"
        />
        <StatCard
          icon={<Navigation size={24} />}
          title={t('reports.route.executionRate')}
          value={`${executionRate}%`}
          change={7}
          color="#10B981"
        />
        <StatCard
          icon={<Zap size={24} />}
          title={t('reports.route.avgDeviation')}
          value={`${avgDeviation} km`}
          color="#FFC107"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          title={t('reports.route.skipped')}
          value={skippedCount}
          change={-3}
          color="#E74C3C"
        />
      </div>

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
          <CardTitle className="text-lg">{t('reports.route.data')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
