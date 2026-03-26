'use client';

import { useTranslation } from '@/lib/i18n';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Check, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface PhotoAudit {
  id: number;
  agent: string;
  date: string;
  customer: string;
  photoCount: number;
  watermarked: boolean;
  gpsTagged: boolean;
  status: 'Qəbul' | 'Gözləmə' | 'Rədd';
}

const mockData: PhotoAudit[] = [
  {
    id: 1,
    agent: 'Elvin Məmmədov',
    date: '2024-03-15',
    customer: 'Akbank AŞ',
    photoCount: 8,
    watermarked: true,
    gpsTagged: true,
    status: 'Qəbul',
  },
  {
    id: 2,
    agent: 'Nigar Həsənova',
    date: '2024-03-15',
    customer: 'Unibank',
    photoCount: 6,
    watermarked: true,
    gpsTagged: false,
    status: 'Gözləmə',
  },
  {
    id: 3,
    agent: 'Rəşid Quliyev',
    date: '2024-03-15',
    customer: 'Kapital Bank',
    photoCount: 12,
    watermarked: true,
    gpsTagged: true,
    status: 'Qəbul',
  },
  {
    id: 4,
    agent: 'Leyla Əbdullayeva',
    date: '2024-03-15',
    customer: 'Pasha Bank',
    photoCount: 5,
    watermarked: true,
    gpsTagged: true,
    status: 'Qəbul',
  },
  {
    id: 5,
    agent: 'Fərid Ağayev',
    date: '2024-03-15',
    customer: 'PYCB',
    photoCount: 0,
    watermarked: false,
    gpsTagged: false,
    status: 'Rədd',
  },
  {
    id: 6,
    agent: 'Aynur İsmayılova',
    date: '2024-03-15',
    customer: 'Caspian Bank',
    photoCount: 7,
    watermarked: false,
    gpsTagged: true,
    status: 'Gözləmə',
  },
  {
    id: 7,
    agent: 'Mehri Yusifova',
    date: '2024-03-15',
    customer: 'MBank',
    photoCount: 9,
    watermarked: true,
    gpsTagged: true,
    status: 'Qəbul',
  },
  {
    id: 8,
    agent: 'Cavid Həsəanov',
    date: '2024-03-15',
    customer: 'İqtisad Bank',
    photoCount: 3,
    watermarked: false,
    gpsTagged: false,
    status: 'Rədd',
  },
  {
    id: 9,
    agent: 'Səbinə Qasımova',
    date: '2024-03-15',
    customer: 'Halal Bank',
    photoCount: 10,
    watermarked: true,
    gpsTagged: true,
    status: 'Qəbul',
  },
  {
    id: 10,
    agent: 'Tural Hasanzadə',
    date: '2024-03-15',
    customer: 'Azər Bank',
    photoCount: 4,
    watermarked: true,
    gpsTagged: false,
    status: 'Gözləmə',
  },
];

const photoCards = [
  {
    agent: 'Elvin Məmmədov',
    customer: 'Akbank',
    date: '2024-03-15',
    watermark: true,
    gps: true,
  },
  {
    agent: 'Nigar Həsənova',
    customer: 'Unibank',
    date: '2024-03-15',
    watermark: true,
    gps: false,
  },
  {
    agent: 'Rəşid Quliyev',
    customer: 'Kapital',
    date: '2024-03-15',
    watermark: true,
    gps: true,
  },
  {
    agent: 'Leyla Əbdullayeva',
    customer: 'Pasha Bank',
    date: '2024-03-15',
    watermark: true,
    gps: true,
  },
  {
    agent: 'Fərid Ağayev',
    customer: 'PYCB',
    date: '2024-03-15',
    watermark: false,
    gps: false,
  },
  {
    agent: 'Aynur İsmayılova',
    customer: 'Caspian',
    date: '2024-03-15',
    watermark: false,
    gps: true,
  },
  {
    agent: 'Mehri Yusifova',
    customer: 'MBank',
    date: '2024-03-15',
    watermark: true,
    gps: true,
  },
  {
    agent: 'Cavid Həsəanov',
    customer: 'İqtisad',
    date: '2024-03-15',
    watermark: false,
    gps: false,
  },
];

const getColumns = (t: (key: string) => string): ColumnConfig<PhotoAudit>[] => [
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
    id: 'customer',
    header: t('reports.customer.tableCustomer'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'photoCount',
    header: t('reports.photo.photoCount'),
    sortable: true,
  },
  {
    id: 'watermarked',
    header: t('reports.photo.watermarked'),
    sortable: true,
    cell: (value) => (
      <div className="flex justify-center">
        {value ? (
          <Check size={18} className="text-green-600" />
        ) : (
          <XCircle size={18} className="text-red-600" />
        )}
      </div>
    ),
  },
  {
    id: 'gpsTagged',
    header: t('reports.photo.gpsTagged'),
    sortable: true,
    cell: (value) => (
      <div className="flex justify-center">
        {value ? (
          <Check size={18} className="text-green-600" />
        ) : (
          <XCircle size={18} className="text-red-600" />
        )}
      </div>
    ),
  },
  {
    id: 'status',
    header: t('common.status'),
    sortable: true,
    cell: (value) => {
      let variant: 'success' | 'warning' | 'destructive' = 'success';
      let label = value;
      if (value === 'Gözləmə') {
        variant = 'warning';
        label = t('reports.photo.pending');
      }
      if (value === 'Rədd') {
        variant = 'destructive';
        label = t('reports.photo.rejected');
      }
      if (value === 'Qəbul') {
        label = t('reports.photo.approved');
      }

      return (
        <Badge variant={variant} className="text-xs">
          {label}
        </Badge>
      );
    },
  },
];

export default function PhotoAuditPage() {
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

  const totalPhotos = filteredData.reduce((sum, d) => sum + d.photoCount, 0);
  const watermarkedPhotos = filteredData.filter((d) => d.watermarked).length;
  const gpsTaggedPhotos = filteredData.filter((d) => d.gpsTagged).length;
  const rejectedPhotos = filteredData.filter((d) => d.status === 'Rədd').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.photo.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.photo.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.photo.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ImageIcon size={24} />}
          title={t('reports.photo.total')}
          value={totalPhotos}
          change={12}
          color="#6C63FF"
        />
        <StatCard
          icon={<Check size={24} />}
          title={t('reports.photo.watermarked')}
          value={watermarkedPhotos}
          color="#10B981"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          title={t('reports.photo.gpsTagged')}
          value={gpsTaggedPhotos}
          color="#3B82F6"
        />
        <StatCard
          icon={<XCircle size={24} />}
          title={t('reports.photo.rejected')}
          value={rejectedPhotos}
          change={-5}
          color="#E74C3C"
        />
      </div>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.photo.samples')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {photoCards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 hover:shadow-lg transition-shadow"
              >
                {/* Placeholder image */}
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-500" />
                </div>

                {/* Metadata */}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {card.agent.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {card.customer}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {card.date}
                  </p>

                  {/* Icons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    {card.watermark ? (
                      <Badge variant="success" className="text-xs">
                        ✓ {t('reports.photo.watermarked')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        ✗ {t('reports.photo.watermarked')}
                      </Badge>
                    )}
                    {card.gps ? (
                      <Badge variant="success" className="text-xs">
                        ✓ {t('reports.photo.gpsTagged')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        ✗ {t('reports.photo.gpsTagged')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <CardTitle className="text-lg">{t('reports.photo.audit')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
