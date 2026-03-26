'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Download,
  MapPin,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface DailyReport {
  id: number;
  agent: string;
  date: string;
  customer: string;
  status: 'Tamamlandı' | 'Gözləyir' | 'Ləğv edildi';
  startTime: string;
  endTime: string;
  duration: string;
  notes: string;
}

const mockData: DailyReport[] = [
  {
    id: 1,
    agent: 'Elvin Məmmədov',
    date: '2024-03-15',
    customer: 'Akbank AŞ',
    status: 'Tamamlandı',
    startTime: '09:00',
    endTime: '09:45',
    duration: '45 dəq',
    notes: 'Müqavilə yeniləmə',
  },
  {
    id: 2,
    agent: 'Nigar Həsənova',
    date: '2024-03-15',
    customer: 'Unibank',
    status: 'Tamamlandı',
    startTime: '10:15',
    endTime: '11:00',
    duration: '45 dəq',
    notes: 'Yeni ürün tanıtımı',
  },
  {
    id: 3,
    agent: 'Rəşid Quliyev',
    date: '2024-03-15',
    customer: 'Kapital Bank',
    status: 'Gözləyir',
    startTime: '11:30',
    endTime: '-',
    duration: '- ',
    notes: 'Dəyişdirilmiş görüş',
  },
  {
    id: 4,
    agent: 'Leyla Əbdullayeva',
    date: '2024-03-15',
    customer: 'Pasha Bank',
    status: 'Tamamlandı',
    startTime: '14:00',
    endTime: '14:30',
    duration: '30 dəq',
    notes: 'Tamamlayan görüş',
  },
  {
    id: 5,
    agent: 'Fərid Ağayev',
    date: '2024-03-15',
    customer: 'PYCB',
    status: 'Ləğv edildi',
    startTime: '15:00',
    endTime: '-',
    duration: '-',
    notes: 'Müştəri təlqi',
  },
  {
    id: 6,
    agent: 'Aynur İsmayılova',
    date: '2024-03-15',
    customer: 'Caspian Bank',
    status: 'Tamamlandı',
    startTime: '16:00',
    endTime: '16:45',
    duration: '45 dəq',
    notes: 'Müqavilə imzası',
  },
  {
    id: 7,
    agent: 'Elvin Məmmədov',
    date: '2024-03-15',
    customer: 'MBank',
    status: 'Tamamlandı',
    startTime: '17:00',
    endTime: '17:30',
    duration: '30 dəq',
    notes: 'Məlumat dəyişikliyi',
  },
  {
    id: 8,
    agent: 'Nigar Həsənova',
    date: '2024-03-15',
    customer: 'İqtisad Bank',
    status: 'Gözləyir',
    startTime: '18:00',
    endTime: '-',
    duration: '-',
    notes: 'Müştəri danışıqlı',
  },
  {
    id: 9,
    agent: 'Rəşid Quliyev',
    date: '2024-03-15',
    customer: 'Halal Bank',
    status: 'Tamamlandı',
    startTime: '08:30',
    endTime: '09:15',
    duration: '45 dəq',
    notes: 'Sertifikat təqdim',
  },
  {
    id: 10,
    agent: 'Leyla Əbdullayeva',
    date: '2024-03-15',
    customer: 'Azər Bank',
    status: 'Tamamlandı',
    startTime: '12:00',
    endTime: '12:45',
    duration: '45 dəq',
    notes: 'Planinə əlavə',
  },
  {
    id: 11,
    agent: 'Fərid Ağayev',
    date: '2024-03-15',
    customer: 'AtaBank',
    status: 'Gözləyir',
    startTime: '13:30',
    endTime: '-',
    duration: '-',
    notes: 'Gözləmə halında',
  },
  {
    id: 12,
    agent: 'Aynur İsmayılova',
    date: '2024-03-15',
    customer: 'Xəzər Bank',
    status: 'Tamamlandı',
    startTime: '10:30',
    endTime: '11:15',
    duration: '45 dəq',
    notes: 'Müqavilə tərəflər',
  },
  {
    id: 13,
    agent: 'Elvin Məmmədov',
    date: '2024-03-15',
    customer: 'Turan Bank',
    status: 'Tamamlandı',
    startTime: '15:30',
    endTime: '16:15',
    duration: '45 dəq',
    notes: 'Seksiya bağlama',
  },
  {
    id: 14,
    agent: 'Nigar Həsənova',
    date: '2024-03-15',
    customer: 'Texnoproqress',
    status: 'Ləğv edildi',
    startTime: '17:30',
    endTime: '-',
    duration: '-',
    notes: 'Ləğv edildi',
  },
  {
    id: 15,
    agent: 'Rəşid Quliyev',
    date: '2024-03-15',
    customer: 'Aşk ASC',
    status: 'Tamamlandı',
    startTime: '09:30',
    endTime: '10:15',
    duration: '45 dəq',
    notes: 'Tamamlandı',
  },
];

// Full route plan per agent — shows which points were visited, missed, or pending
interface RouteStop {
  customer: string;
  address: string;
  plannedTime: string;
  status: 'visited' | 'missed' | 'pending';
  actualTime?: string;
  duration?: string;
}

const agentRoutes: Record<string, RouteStop[]> = {
  'Elvin Məmmədov': [
    { customer: 'Akbank AŞ', address: 'Nizami küç. 12', plannedTime: '09:00', status: 'visited', actualTime: '09:00', duration: '45 dəq' },
    { customer: 'Turan Bank', address: 'Nərimanov pr. 34', plannedTime: '10:30', status: 'visited', actualTime: '15:30', duration: '45 dəq' },
    { customer: 'Bank Respublika', address: 'R.Rza küç. 8', plannedTime: '12:00', status: 'missed' },
    { customer: 'MBank', address: '28 May küç. 56', plannedTime: '14:00', status: 'visited', actualTime: '17:00', duration: '30 dəq' },
    { customer: 'Azərbaycan Beynəlxalq Bank', address: 'Ü.Hacıbəyov 45', plannedTime: '16:00', status: 'missed' },
  ],
  'Nigar Həsənova': [
    { customer: 'Unibank', address: 'Tbilisi pr. 22', plannedTime: '10:00', status: 'visited', actualTime: '10:15', duration: '45 dəq' },
    { customer: 'Rabitəbank', address: 'Yasamal küç. 18', plannedTime: '11:30', status: 'missed' },
    { customer: 'İqtisad Bank', address: 'H.Əliyev pr. 90', plannedTime: '13:00', status: 'pending' },
    { customer: 'Texnoproqress', address: 'Bakıxanov küç. 5', plannedTime: '15:00', status: 'missed' },
    { customer: 'AccessBank', address: 'Nəsimi küç. 33', plannedTime: '16:30', status: 'missed' },
  ],
  'Rəşid Quliyev': [
    { customer: 'Halal Bank', address: 'M.Füzuli küç. 14', plannedTime: '08:30', status: 'visited', actualTime: '08:30', duration: '45 dəq' },
    { customer: 'Aşk ASC', address: 'Atatürk pr. 77', plannedTime: '10:00', status: 'visited', actualTime: '09:30', duration: '45 dəq' },
    { customer: 'Kapital Bank', address: 'Xətai pr. 60', plannedTime: '11:30', status: 'pending' },
    { customer: 'Yelo Bank', address: 'S.Vurğun küç. 41', plannedTime: '13:30', status: 'missed' },
  ],
  'Leyla Əbdullayeva': [
    { customer: 'Azər Bank', address: 'Təbriz küç. 29', plannedTime: '12:00', status: 'visited', actualTime: '12:00', duration: '45 dəq' },
    { customer: 'Pasha Bank', address: 'Bülbül pr. 15', plannedTime: '14:00', status: 'visited', actualTime: '14:00', duration: '30 dəq' },
    { customer: 'Bank of Baku', address: 'N.Nərimanov küç. 52', plannedTime: '15:30', status: 'missed' },
  ],
  'Fərid Ağayev': [
    { customer: 'PYCB', address: 'Mərdəkan pr. 8', plannedTime: '15:00', status: 'missed' },
    { customer: 'AtaBank', address: 'Bakıxanov küç. 21', plannedTime: '13:30', status: 'pending' },
    { customer: 'Premium Bank', address: 'Z.Əliyeva küç. 66', plannedTime: '10:00', status: 'missed' },
  ],
  'Aynur İsmayılova': [
    { customer: 'Xəzər Bank', address: 'Nizami küç. 88', plannedTime: '10:30', status: 'visited', actualTime: '10:30', duration: '45 dəq' },
    { customer: 'Caspian Bank', address: 'Nəsimi küç. 44', plannedTime: '16:00', status: 'visited', actualTime: '16:00', duration: '45 dəq' },
    { customer: 'VTB Bank', address: 'Yasamal küç. 37', plannedTime: '12:00', status: 'missed' },
    { customer: 'Ziraat Bank', address: 'H.Əliyev pr. 12', plannedTime: '14:00', status: 'missed' },
  ],
};

function DailyReportColumns(t: (key: string) => string): ColumnConfig<DailyReport>[] {
  return [
    {
      id: 'agent',
      header: t('reports.daily.agent'),
      sortable: true,
      searchable: true,
    },
    {
      id: 'date',
      header: t('common.date'),
      sortable: true,
    },
    {
      id: 'customer',
      header: t('reports.daily.customer'),
      sortable: true,
      searchable: true,
    },
    {
      id: 'status',
      header: t('reports.daily.status'),
      sortable: true,
      cell: (value) => {
        let variant: 'success' | 'warning' | 'destructive' = 'success';
        if (value === 'Gözləyir') variant = 'warning';
        if (value === 'Ləğv edildi') variant = 'destructive';

        const colors = {
          'Tamamlandı': '#10B981',
          'Gözləyir': '#F59E0B',
          'Ləğv edildi': '#EF4444',
        };

        return (
          <Badge
            variant={variant === 'warning' ? 'warning' : variant === 'destructive' ? 'destructive' : 'success'}
            className="text-xs"
          >
            {value}
          </Badge>
        );
      },
    },
    {
      id: 'startTime',
      header: t('reports.daily.startTime'),
      sortable: true,
    },
    {
      id: 'endTime',
      header: t('reports.daily.endTime'),
      sortable: true,
    },
    {
      id: 'duration',
      header: t('reports.daily.duration'),
      sortable: true,
    },
    {
      id: 'notes',
      header: t('reports.daily.notes'),
      searchable: true,
    },
  ];
}

export default function DailyReportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filteredData, setFilteredData] = useState(mockData);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const agents = Array.from(new Set(mockData.map((d) => d.agent)));
  const statuses = Array.from(new Set(mockData.map((d) => d.status)));

  const handleFilterChange = () => {
    let filtered = mockData;

    if (selectedAgent) {
      filtered = filtered.filter((d) => d.agent === selectedAgent);
    }

    if (selectedStatus) {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    setFilteredData(filtered);
  };

  const totalVisits = filteredData.length;
  const completed = filteredData.filter((d) => d.status === 'Tamamlandı').length;
  const pending = filteredData.filter((d) => d.status === 'Gözləyir').length;
  const successRate = totalVisits > 0 ? ((completed / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.daily.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.daily.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.daily.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BarChart3 size={24} />}
          title={t('reports.daily.totalVisits')}
          value={totalVisits}
          color="#6C63FF"
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          title={t('reports.daily.completed')}
          value={completed}
          change={12}
          color="#10B981"
        />
        <StatCard
          icon={<Clock size={24} />}
          title={t('reports.daily.pending')}
          value={pending}
          change={-5}
          color="#F59E0B"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title={t('reports.daily.successRate')}
          value={`${successRate}%`}
          change={8}
          color="#3B82F6"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.daily.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.daily.agent')}
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

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.daily.status')}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">{t('common.all')}</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleFilterChange}
              className="whitespace-nowrap"
            >
              {t('reports.daily.apply')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filteredData, 'gundelik-hesabat', [
            { key: 'agent', label: 'Agent' },
            { key: 'date', label: 'Tarix' },
            { key: 'customer', label: 'Müştəri' },
            { key: 'status', label: 'Status' },
            { key: 'startTime', label: 'Başlama' },
            { key: 'endTime', label: 'Bitmə' },
            { key: 'duration', label: 'Müddət' },
            { key: 'notes', label: 'Qeyd' },
          ])}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToExcel(filteredData, 'gundelik-hesabat', {
            title: 'Gündəlik Hesabat',
            sheetName: 'Ziyarətlər',
            columns: [
              { key: 'agent', label: 'Agent', width: 150 },
              { key: 'date', label: 'Tarix', width: 100 },
              { key: 'customer', label: 'Müştəri', width: 150 },
              { key: 'status', label: 'Status', width: 100 },
              { key: 'startTime', label: 'Başlama', width: 80 },
              { key: 'endTime', label: 'Bitmə', width: 80 },
              { key: 'duration', label: 'Müddət', width: 80 },
              { key: 'notes', label: 'Qeyd', width: 180 },
            ],
          })}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet size={16} />
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToPDF(filteredData, 'gundelik-hesabat', {
            title: 'Gündəlik Hesabat',
            subtitle: 'MTM - Mobile Team Management',
            columns: [
              { key: 'agent', label: 'Agent' },
              { key: 'date', label: 'Tarix' },
              { key: 'customer', label: 'Müştəri' },
              { key: 'status', label: 'Status' },
              { key: 'startTime', label: 'Başlama' },
              { key: 'endTime', label: 'Bitmə' },
              { key: 'duration', label: 'Müddət' },
              { key: 'notes', label: 'Qeyd' },
            ],
          })}
          className="flex items-center gap-2"
        >
          <FileText size={16} />
          PDF
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.daily.tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={DailyReportColumns(t)} data={filteredData} />
        </CardContent>
      </Card>

      {/* Agent Route Detail — click to see visited/missed/pending */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin size={20} />
            {t('reports.daily.routeDetail')}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t('reports.daily.routeDetailHint')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agents.map((agent) => {
              const route = agentRoutes[agent] || [];
              const visited = route.filter((r) => r.status === 'visited').length;
              const missed = route.filter((r) => r.status === 'missed').length;
              const pendingStops = route.filter((r) => r.status === 'pending').length;
              const isExpanded = expandedAgent === agent;

              return (
                <div key={agent} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {/* Agent Header — clickable */}
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--primary)' }}>
                        {agent.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{agent}</p>
                        <p className="text-xs text-gray-500">{route.length} {t('reports.daily.pointsPlanned')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Mini stats */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="flex items-center gap-0.5 text-green-600"><CheckCircle size={12} /> {visited}</span>
                        <span className="flex items-center gap-0.5 text-red-500"><XCircle size={12} /> {missed}</span>
                        {pendingStops > 0 && <span className="flex items-center gap-0.5 text-yellow-500"><Clock size={12} /> {pendingStops}</span>}
                      </div>
                      {/* Progress bar */}
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${route.length > 0 ? (visited / route.length) * 100 : 0}%`, backgroundColor: '#00BFA6' }} />
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded Route Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/30 px-4 py-3">
                      <div className="space-y-2">
                        {route.map((stop, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-700">
                            {/* Status icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              stop.status === 'visited' ? 'bg-green-500' :
                              stop.status === 'missed' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}>
                              {stop.status === 'visited' ? <CheckCircle size={16} /> :
                               stop.status === 'missed' ? <XCircle size={16} /> :
                               <Clock size={16} />}
                            </div>

                            {/* Stop info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{stop.customer}</p>
                              <p className="text-xs text-gray-500">{stop.address}</p>
                            </div>

                            {/* Planned time */}
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{t('reports.daily.plan')} {stop.plannedTime}</p>
                              {stop.actualTime && (
                                <p className="text-xs text-green-600">{t('reports.daily.actual')} {stop.actualTime}</p>
                              )}
                              {stop.duration && (
                                <p className="text-xs text-gray-500">{stop.duration}</p>
                              )}
                            </div>

                            {/* Status badge */}
                            <Badge
                              variant={stop.status === 'visited' ? 'success' : stop.status === 'missed' ? 'destructive' : 'warning'}
                              className="text-[10px] flex-shrink-0"
                            >
                              {stop.status === 'visited' ? t('reports.daily.visitedLabel') :
                               stop.status === 'missed' ? t('reports.daily.missedLabel') :
                               t('reports.daily.pendingLabel')}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> {t('reports.daily.visitedCount')} {visited}/{route.length}</span>
                        <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> {t('reports.daily.missedCount')} {missed}</span>
                        {pendingStops > 0 && <span className="flex items-center gap-1"><Clock size={12} className="text-yellow-500" /> {t('reports.daily.pendingCount')} {pendingStops}</span>}
                        <span className="ml-auto font-medium" style={{ color: visited / route.length >= 0.8 ? '#00BFA6' : visited / route.length >= 0.5 ? '#FFC107' : '#E74C3C' }}>
                          {Math.round((visited / route.length) * 100)}% {t('reports.daily.execution')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
