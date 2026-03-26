'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Phone, Mail, Building2, Calendar,
  Clock, Camera, CheckCircle2, AlertTriangle, Star,
  TrendingUp, TrendingDown, Package, User,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

// Mock customer data
const mockCustomers: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Bravo Supermarket',
    contact: 'Elçin Əliyev',
    phone: '+994501112233',
    email: 'info@bravo.az',
    address: '28 May küç. 15, Bakı',
    category: 'retail',
    status: 'active',
    createdAt: '2025-01-15',
    totalVisits: 156,
    avgVisitDuration: 28,
    lastVisit: '2026-03-17',
    satisfaction: 4.7,
    monthlyOrders: 42,
    totalRevenue: '₼125,400',
    assignedAgent: 'Leyla Qasımova',
    notes: 'Premium müştəri. Hər həftə minimum 3 ziyarət tələb olunur.',
  },
  '2': {
    id: '2',
    name: 'Araz Supermarket',
    contact: 'Vüsal Hüseynov',
    phone: '+994502223344',
    email: 'vusal@araz.az',
    address: 'Nərimanov r., Atatürk pr. 42',
    category: 'retail',
    status: 'active',
    createdAt: '2025-03-20',
    totalVisits: 98,
    avgVisitDuration: 22,
    lastVisit: '2026-03-16',
    satisfaction: 4.3,
    monthlyOrders: 28,
    totalRevenue: '₼78,200',
    assignedAgent: 'Əhməd Məmmədov',
    notes: 'Yeni filiallar açılır, əlavə agent lazım ola bilər.',
  },
  '3': {
    id: '3',
    name: 'Neptun Mağazalar',
    contact: 'Nigar Abbasova',
    phone: '+994503334455',
    email: 'nigar@neptun.az',
    address: 'Xətai r., Babək pr. 78',
    category: 'wholesale',
    status: 'active',
    createdAt: '2025-02-10',
    totalVisits: 134,
    avgVisitDuration: 35,
    lastVisit: '2026-03-17',
    satisfaction: 4.8,
    monthlyOrders: 56,
    totalRevenue: '₼215,600',
    assignedAgent: 'Farid Hüseynov',
    notes: 'Ən böyük topdan müştərilərdən biri.',
  },
};

// Visit history for customer
const visitHistory = [
  { id: 1, date: '2026-03-17', time: '10:15 - 10:45', agent: 'Leyla Qasımova', status: 'completed', photos: 4, notes: 'Rəf yenidən düzüldü, yeni məhsul yerləşdirildi' },
  { id: 2, date: '2026-03-15', time: '11:00 - 11:25', agent: 'Leyla Qasımova', status: 'completed', photos: 3, notes: 'Stok sayımı aparıldı' },
  { id: 3, date: '2026-03-13', time: '09:30 - 10:00', agent: 'Əhməd Məmmədov', status: 'completed', photos: 2, notes: 'Müntəzəm ziyarət' },
  { id: 4, date: '2026-03-11', time: '14:00 - 14:40', agent: 'Leyla Qasımova', status: 'completed', photos: 5, notes: 'Promosyon materialları yerləşdirildi' },
  { id: 5, date: '2026-03-09', time: '10:00 - 10:20', agent: 'Leyla Qasımova', status: 'completed', photos: 1, notes: 'Qısa ziyarət' },
  { id: 6, date: '2026-03-07', time: '11:30 - 12:10', agent: 'Farid Hüseynov', status: 'completed', photos: 3, notes: 'Yeni sifariş alındı' },
  { id: 7, date: '2026-03-05', time: '09:00 - 09:35', agent: 'Leyla Qasımova', status: 'missed', photos: 0, notes: 'Mağaza bağlı idi' },
  { id: 8, date: '2026-03-03', time: '13:00 - 13:30', agent: 'Leyla Qasımova', status: 'completed', photos: 4, notes: 'Rəf fotolarını çəkdi' },
];

// Monthly visit trend
const monthlyTrend = [
  { month: 'Okt', visits: 12, orders: 8 },
  { month: 'Noy', visits: 14, orders: 10 },
  { month: 'Dek', visits: 11, orders: 7 },
  { month: 'Yan', visits: 15, orders: 12 },
  { month: 'Fev', visits: 13, orders: 9 },
  { month: 'Mar', visits: 16, orders: 14 },
];

const categoryLabels: Record<string, string> = {
  retail: 'Pərakəndə',
  wholesale: 'Topdan',
  distributor: 'Distribütor',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">{rating}</span>
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const customerId = params.id as string;

  const customer = mockCustomers[customerId] || mockCustomers['1'];

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

      {/* Customer Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00BFA6, #3498DB)' }}
            >
              <Building2 size={36} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
                <Badge variant={customer.status === 'active' ? 'success' : 'secondary'}>
                  {customer.status === 'active' ? t('customers.active') : t('customers.inactive')}
                </Badge>
                <Badge variant="outline">
                  {t(`customers.${customer.category}`)}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                {t('customers.contact')}: {customer.contact}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {customer.address}</span>
              </div>
            </div>

            {/* Satisfaction */}
            <div className="text-right space-y-2">
              <StarRating rating={customer.satisfaction} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('customers.lastVisit')}: <span className="text-green-600 font-medium">{customer.lastVisit}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('customers.totalVisits'), value: customer.totalVisits, icon: <MapPin size={18} className="text-indigo-500" /> },
          { label: t('analytics.avgCompletion'), value: `${customer.avgVisitDuration} dəq`, icon: <Clock size={18} className="text-blue-500" /> },
          { label: 'Aylıq Sifariş', value: customer.monthlyOrders, icon: <Package size={18} className="text-green-500" /> },
          { label: 'Ümumi Gəlir', value: customer.totalRevenue, icon: <TrendingUp size={18} className="text-amber-500" /> },
          { label: 'Təyin olunmuş', value: customer.assignedAgent.split(' ')[0], icon: <User size={18} className="text-teal-500" /> },
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

      {/* Charts + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Visit Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aylıq Ziyarət Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="gVisitsC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="visits" stroke="#6C63FF" fill="url(#gVisitsC)" name={t('analytics.visit')} strokeWidth={2} />
                <Area type="monotone" dataKey="orders" stroke="#00BFA6" fill="transparent" name="Sifariş" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Qeydlər</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">{customer.notes}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Yaradılma Tarixi</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Təyin olunmuş Agent</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.assignedAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('customers.category')}</span>
                  <Badge variant="outline">{t(`customers.${customer.category}`)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            Ziyarət Tarixçəsi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('common.date')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('common.time')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('nav.photos')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">Qeyd</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {visitHistory.map((visit) => (
                  <tr key={visit.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{visit.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.time}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: '#6C63FF' }}
                        >
                          {visit.agent.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{visit.agent}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Camera size={14} /> {visit.photos}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-48 truncate">{visit.notes}</td>
                    <td className="py-3 px-4">
                      <Badge variant={visit.status === 'completed' ? 'success' : 'destructive'}>
                        {visit.status === 'completed' ? 'Tamamlandı' : 'Buraxıldı'}
                      </Badge>
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
