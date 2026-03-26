'use client';

import { useTranslation } from '@/lib/i18n';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Building2, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable, ColumnConfig } from '@/components/ui/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface CustomerVisit {
  id: number;
  customer: string;
  address: string;
  lastVisit: string;
  visitCount: number;
  avgRating: number;
  agent: string;
}

const mockData: CustomerVisit[] = [
  {
    id: 1,
    customer: 'Akbank AŞ',
    address: 'Bakı, Abşeron r-nu',
    lastVisit: '2024-03-15',
    visitCount: 12,
    avgRating: 4.8,
    agent: 'Elvin Məmmədov',
  },
  {
    id: 2,
    customer: 'Unibank',
    address: 'Bakı, Nərimanov r-nu',
    lastVisit: '2024-03-14',
    visitCount: 8,
    avgRating: 4.5,
    agent: 'Nigar Həsənova',
  },
  {
    id: 3,
    customer: 'Kapital Bank',
    address: 'Bakı, Xətai r-nu',
    lastVisit: '2024-03-13',
    visitCount: 15,
    avgRating: 4.9,
    agent: 'Rəşid Quliyev',
  },
  {
    id: 4,
    customer: 'Pasha Bank',
    address: 'Bakı, Səbail r-nu',
    lastVisit: '2024-03-12',
    visitCount: 10,
    avgRating: 4.6,
    agent: 'Leyla Əbdullayeva',
  },
  {
    id: 5,
    customer: 'PYCB',
    address: 'Bakı, Yasamal r-nu',
    lastVisit: '2024-03-16',
    visitCount: 20,
    avgRating: 5.0,
    agent: 'Fərid Ağayev',
  },
  {
    id: 6,
    customer: 'Caspian Bank',
    address: 'Bakı, Suraxanı r-nu',
    lastVisit: '2024-02-20',
    visitCount: 5,
    avgRating: 3.8,
    agent: 'Aynur İsmayılova',
  },
  {
    id: 7,
    customer: 'MBank',
    address: 'Gəncə, Mərkəz',
    lastVisit: '2024-03-11',
    visitCount: 9,
    avgRating: 4.4,
    agent: 'Mehri Yusifova',
  },
  {
    id: 8,
    customer: 'İqtisad Bank',
    address: 'Bakı, Çəngir',
    lastVisit: '2024-01-15',
    visitCount: 2,
    avgRating: 3.2,
    agent: 'Cavid Həsəanov',
  },
  {
    id: 9,
    customer: 'Halal Bank',
    address: 'Bakı, Ləngəbuiz',
    lastVisit: '2024-03-10',
    visitCount: 7,
    avgRating: 4.3,
    agent: 'Səbinə Qasımova',
  },
  {
    id: 10,
    customer: 'Azər Bank',
    address: 'Bakı, Qaradağ',
    lastVisit: '2024-03-09',
    visitCount: 6,
    avgRating: 4.1,
    agent: 'Tural Hasanzadə',
  },
  {
    id: 11,
    customer: 'AtaBank',
    address: 'Bakı, Garadağ',
    lastVisit: '2024-03-08',
    visitCount: 4,
    avgRating: 3.9,
    agent: 'Elvin Məmmədov',
  },
  {
    id: 12,
    customer: 'Xəzər Bank',
    address: 'Bakı, Binəqədi',
    lastVisit: '2024-03-07',
    visitCount: 11,
    avgRating: 4.7,
    agent: 'Nigar Həsənova',
  },
  {
    id: 13,
    customer: 'Turan Bank',
    address: 'Şirvan, Mərkəz',
    lastVisit: '2024-03-06',
    visitCount: 8,
    avgRating: 4.2,
    agent: 'Rəşid Quliyev',
  },
  {
    id: 14,
    customer: 'Texnoproqress',
    address: 'Bakı, Sabunçu',
    lastVisit: '2024-03-05',
    visitCount: 3,
    avgRating: 3.5,
    agent: 'Leyla Əbdullayeva',
  },
  {
    id: 15,
    customer: 'Aşk ASC',
    address: 'Masallı, Mərkəz',
    lastVisit: '2024-03-04',
    visitCount: 14,
    avgRating: 4.8,
    agent: 'Fərid Ağayev',
  },
];

const getPieData = (t: (key: string) => string) => [
  {
    name: t('reports.customer.visited'),
    value: mockData.filter((c) => {
      const date = new Date(c.lastVisit);
      const today = new Date();
      const daysAgo = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo < 30;
    }).length,
  },
  {
    name: t('reports.customer.notVisited'),
    value: mockData.filter((c) => {
      const date = new Date(c.lastVisit);
      const today = new Date();
      const daysAgo = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo >= 30;
    }).length,
  },
];

const COLORS = ['#10B981', '#EF4444'];

const getColumns = (t: (key: string) => string): ColumnConfig<CustomerVisit>[] => [
  {
    id: 'customer',
    header: t('reports.customer.tableCustomer'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'address',
    header: t('common.address'),
    sortable: true,
    searchable: true,
  },
  {
    id: 'lastVisit',
    header: t('reports.customer.tableLastVisit'),
    sortable: true,
  },
  {
    id: 'visitCount',
    header: t('reports.customer.tableVisitCount'),
    sortable: true,
  },
  {
    id: 'avgRating',
    header: t('reports.customer.tableRating'),
    sortable: true,
    cell: (value) => (
      <div className="flex items-center gap-1">
        <Star size={16} className="fill-yellow-400 text-yellow-400" />
        <span>{value}</span>
      </div>
    ),
  },
  {
    id: 'agent',
    header: t('common.name'),
    sortable: true,
    searchable: true,
  },
];

export default function CustomerVisitsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filteredData, setFilteredData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const columns = getColumns(t);
  const pieData = getPieData(t);

  const handleSearch = () => {
    let filtered = mockData;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const visited = mockData.filter((c) => {
    const date = new Date(c.lastVisit);
    const today = new Date();
    const daysAgo = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo < 30;
  }).length;

  const notVisited = mockData.length - visited;
  const avgFrequency = (
    mockData.reduce((sum, c) => sum + c.visitCount, 0) / mockData.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.reports'), href: '/reports' },
          { label: t('reports.customer.title') },
        ]}
        onBack={() => router.back()}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.customer.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('reports.customer.subtitle')}
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={24} />}
          title={t('reports.customer.total')}
          value={mockData.length}
          color="#6C63FF"
        />
        <StatCard
          icon={<Building2 size={24} />}
          title={t('reports.customer.visited')}
          value={visited}
          change={8}
          color="#10B981"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          title={t('reports.customer.notVisited')}
          value={notVisited}
          change={-5}
          color="#E74C3C"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title={t('reports.customer.frequency')}
          value={`${avgFrequency}/ay`}
          color="#3B82F6"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.customer.status')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common.search')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={t('reports.customer.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
            <Button onClick={handleSearch}>{t('common.search')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.customer.customers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
