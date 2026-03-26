'use client';

import { useState, useEffect } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: 'retail' | 'wholesale' | 'distributor';
  status: 'active' | 'inactive';
  lastVisit: string;
  visitCount: number;
  lat: number;
  lng: number;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Bakı Supermarket MMC',
    contactPerson: 'Nərimən Əlizadə',
    phone: '+994501234567',
    email: 'info@bakisupermarket.az',
    address: 'Bakı şəhəri, Nəsimi rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 45,
    lat: 40.3732,
    lng: 49.8822,
  },
  {
    id: '2',
    name: 'Azərsun Holdinq',
    contactPerson: 'Tahir Mammadov',
    phone: '+994502234567',
    email: 'sales@azersun.az',
    address: 'Bakı şəhəri, Səbail rayon',
    category: 'wholesale',
    status: 'active',
    lastVisit: '2026-03-16',
    visitCount: 32,
    lat: 40.3891,
    lng: 49.8671,
  },
  {
    id: '3',
    name: 'Bravo Supermarket',
    contactPerson: 'Gülnarə Kərimova',
    phone: '+994503234567',
    email: 'contact@bravo.az',
    address: 'Bakı şəhəri, Cəbriail rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 28,
    lat: 40.3825,
    lng: 49.8564,
  },
  {
    id: '4',
    name: 'Neptun Mağazalar Şəbəkəsi',
    contactPerson: 'Rəfail Hüseyinov',
    phone: '+994504234567',
    email: 'neptun@mail.az',
    address: 'Bakı şəhəri, Xətai rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-15',
    visitCount: 52,
    lat: 40.3656,
    lng: 49.8899,
  },
  {
    id: '5',
    name: 'Gilan Holdinq',
    contactPerson: 'Əhməd Sədətov',
    phone: '+994505234567',
    email: 'sales@gilan.az',
    address: 'Qazax şəhəri',
    category: 'distributor',
    status: 'active',
    lastVisit: '2026-03-14',
    visitCount: 18,
    lat: 40.6431,
    lng: 48.6564,
  },
  {
    id: '6',
    name: 'Şərq Bazarı MMC',
    contactPerson: 'Leyla Mahmudova',
    phone: '+994506234567',
    email: 'info@sercbazar.az',
    address: 'Bakı şəhəri, Yasamal rayon',
    category: 'wholesale',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 38,
    lat: 40.3891,
    lng: 49.8435,
  },
  {
    id: '7',
    name: 'Bazar Store',
    contactPerson: 'Orxan Ismayılov',
    phone: '+994507234567',
    email: 'bazar@store.az',
    address: 'Bakı şəhəri, Nəsimi rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 34,
    lat: 40.3698,
    lng: 49.8821,
  },
  {
    id: '8',
    name: 'Araz Supermarket',
    contactPerson: 'Sərxan Cəfərov',
    phone: '+994508234567',
    email: 'araz@supermarket.az',
    address: 'Bakı şəhəri, Səbail rayon',
    category: 'retail',
    status: 'inactive',
    lastVisit: '2026-03-10',
    visitCount: 15,
    lat: 40.3945,
    lng: 49.8632,
  },
  {
    id: '9',
    name: 'Günay Market',
    contactPerson: 'Nigar Aliyeva',
    phone: '+994509234567',
    email: 'gunay@market.az',
    address: 'Bakı şəhəri, Xətai rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-16',
    visitCount: 41,
    lat: 40.3721,
    lng: 49.8945,
  },
  {
    id: '10',
    name: 'Ideal Market',
    contactPerson: 'Tural Əhədov',
    phone: '+994510234567',
    email: 'ideal@market.az',
    address: 'Bakı şəhəri, Nəsimi rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 36,
    lat: 40.3702,
    lng: 49.8765,
  },
  {
    id: '11',
    name: 'Star Distribütor MMC',
    contactPerson: 'Kamran Əbilzadə',
    phone: '+994511234567',
    email: 'star@distributor.az',
    address: 'Sumqayıt şəhəri',
    category: 'distributor',
    status: 'active',
    lastVisit: '2026-03-13',
    visitCount: 22,
    lat: 40.5932,
    lng: 49.6818,
  },
  {
    id: '12',
    name: 'Mega Store',
    contactPerson: 'Aynur Bayramova',
    phone: '+994512234567',
    email: 'mega@store.az',
    address: 'Bakı şəhəri, Cəbriail rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 47,
    lat: 40.3845,
    lng: 49.8534,
  },
  {
    id: '13',
    name: 'Sədərək Ticarət Mərkəzi',
    contactPerson: 'Fərid Quliyev',
    phone: '+994513234567',
    email: 'saderek@trade.az',
    address: 'Bakı şəhəri, Yasamal rayon',
    category: 'wholesale',
    status: 'active',
    lastVisit: '2026-03-12',
    visitCount: 29,
    lat: 40.3912,
    lng: 49.8456,
  },
  {
    id: '14',
    name: 'Premium Market',
    contactPerson: 'Zeynəb Qasımova',
    phone: '+994514234567',
    email: 'premium@market.az',
    address: 'Bakı şəhəri, Xətai rayon',
    category: 'retail',
    status: 'active',
    lastVisit: '2026-03-17',
    visitCount: 39,
    lat: 40.3678,
    lng: 49.8912,
  },
  {
    id: '15',
    name: 'Atlas Group MMC',
    contactPerson: 'Vəli Əliyev',
    phone: '+994515234567',
    email: 'atlas@group.az',
    address: 'Gəncə şəhəri',
    category: 'distributor',
    status: 'active',
    lastVisit: '2026-03-11',
    visitCount: 25,
    lat: 40.6831,
    lng: 46.3756,
  },
];

const categoryColors: Record<Customer['category'], string> = {
  retail: '#3498DB',
  wholesale: '#FFC107',
  distributor: '#9B59B6',
};

interface FormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: Customer['category'];
  status: Customer['status'];
}

interface FormErrors {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Customer['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'visitCount'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'retail',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    filterAndSort();
  }, [searchTerm, categoryFilter, statusFilter, customers, sortBy]);

  const filterAndSort = () => {
    let result = customers;

    if (searchTerm) {
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((customer) => customer.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((customer) => customer.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastVisit':
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'visitCount':
          return b.visitCount - a.visitCount;
        default:
          return 0;
      }
    });

    setFilteredCustomers(result);
    setCurrentPage(1);
  };

  const validateForm = (data: FormData, isEdit: boolean = false): boolean => {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
      errors.name = t('validation.nameRequired');
    }

    if (!data.contactPerson.trim()) {
      errors.contactPerson = t('validation.contactRequired');
    }

    if (!data.phone.trim()) {
      errors.phone = t('validation.phoneRequired');
    }

    if (!data.email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = t('validation.emailInvalid');
    }

    if (!data.address.trim()) {
      errors.address = t('validation.addressRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      category: 'retail',
      status: 'active',
    });
    setFormErrors({});
    setSelectedCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      contactPerson: customer.contactPerson,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      category: customer.category,
      status: customer.status,
    });
    setFormErrors({});
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const submitAddCustomer = () => {
    if (!validateForm(formData)) return;

    const newCustomer: Customer = {
      id: String(Math.max(...customers.map((c) => parseInt(c.id))) + 1),
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      category: formData.category,
      status: formData.status,
      lastVisit: new Date().toISOString().split('T')[0],
      visitCount: 0,
      lat: 40.3732 + Math.random() * 0.5,
      lng: 49.8822 + Math.random() * 0.5,
    };

    setCustomers([...customers, newCustomer]);
    setIsAddModalOpen(false);
    setSuccessMessage(t('customers.addSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const submitEditCustomer = () => {
    if (!validateForm(formData, true)) return;

    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer?.id
          ? {
            ...c,
            name: formData.name,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            category: formData.category,
            status: formData.status,
          }
          : c
      )
    );
    setIsEditModalOpen(false);
    setSuccessMessage(t('customers.editSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const confirmDeleteCustomer = () => {
    if (!selectedCustomer) return;
    setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
    setIsDeleteModalOpen(false);
    setSuccessMessage(t('customers.deleteSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExport = () => {
    const csv = [
      [t('customers.customerName'), t('customers.contactPerson'), t('common.phone'), t('common.email'), t('common.address'), t('customers.category'), t('common.status'), t('customers.lastVisit'), t('customers.totalVisits')],
      ...customers.map((c) => [
        c.name,
        c.contactPerson,
        c.phone,
        c.email,
        c.address,
        t(`customers.${c.category}`),
        c.status === 'active' ? t('customers.active') : t('customers.inactive'),
        c.lastVisit,
        c.visitCount,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musteriler.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const last7DaysVisits = customers.filter(
    (c) => new Date(c.lastVisit) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const avgVisits = Math.round(customers.reduce((sum, c) => sum + c.visitCount, 0) / customers.length);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 shadow-lg animate-in fade-in slide-in-from-top-2 z-40">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('customers.title')}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            {t('common.export')}
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddCustomer}
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={20} />
            {t('customers.addNew')}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 size={24} />}
          title={`${t('common.total')} ${t('customers.title')}`}
          value={customers.length}
          color="#6C63FF"
        />
        <StatCard
          icon={<Building2 size={24} />}
          title={t('customers.active')}
          value={activeCustomers}
          color="#00BFA6"
        />
        <StatCard
          icon={<MapPin size={24} />}
          title={t('customers.visitedLast7Days')}
          value={last7DaysVisits}
          color="#FFC107"
        />
        <StatCard
          icon={<Phone size={24} />}
          title={t('customers.avgVisits')}
          value={avgVisits}
          color="#3498DB"
        />
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('customers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | Customer['category'])}
                className="appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
              >
                <option value="all">{t('customers.allCategories')}</option>
                <option value="retail">{t('customers.retail')}</option>
                <option value="wholesale">{t('customers.wholesale')}</option>
                <option value="distributor">{t('customers.distributor')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
              >
                <option value="all">{t('customers.allStatuses')}</option>
                <option value="active">{t('customers.active')}</option>
                <option value="inactive">{t('customers.inactive')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('name')}
                  >
                    {t('common.name')} {sortBy === 'name' && '↓'}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                    {t('customers.contact')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                    {t('common.phone')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                    {t('customers.category')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                    {t('common.status')}
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('lastVisit')}
                  >
                    {t('customers.lastVisit')} {sortBy === 'lastVisit' && '↓'}
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('visitCount')}
                  >
                    {t('customers.totalVisits')} {sortBy === 'visitCount' && '↓'}
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={cn(
                      'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors',
                      index === paginatedCustomers.length - 1 && 'border-b-0'
                    )}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="hover:underline"
                        style={{ color: 'var(--primary)' }}
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {customer.contactPerson}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {customer.phone}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        className="font-semibold"
                        style={{
                          backgroundColor: categoryColors[customer.category] + '20',
                          color: categoryColors[customer.category],
                        }}
                      >
                        {t(`customers.${customer.category}`)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={customer.status === 'active' ? 'success' : 'warning'}
                        className="font-semibold"
                      >
                        {customer.status === 'active' ? t('customers.active') : t('customers.inactive')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {customer.lastVisit}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                      {customer.visitCount}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('common.noData')}</p>
            </div>
          )}

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paginatedCustomers.length > 0
                  ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    filteredCustomers.length
                  )} of ${filteredCustomers.length}`
                  : '0'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </Button>
                <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('customers.addCustomer')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('customers.customerName')}
            placeholder={t('customers.enterCompanyName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />
          <Input
            label={t('customers.contactPerson')}
            placeholder={t('customers.enterContactName')}
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            error={formErrors.contactPerson}
            required
          />
          <Input
            label={t('common.phone')}
            type="tel"
            placeholder="+994501234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={formErrors.phone}
            required
          />
          <Input
            label={t('common.email')}
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />
          <Input
            label={t('common.address')}
            placeholder={t('customers.enterAddress')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={formErrors.address}
            required
          />
          <Select
            label={t('customers.category')}
            options={[
              { value: 'retail', label: t('customers.retail') },
              { value: 'wholesale', label: t('customers.wholesale') },
              { value: 'distributor', label: t('customers.distributor') },
            ]}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as Customer['category'] })}
            required
          />
          <Select
            label={t('common.status')}
            options={[
              { value: 'active', label: t('customers.active') },
              { value: 'inactive', label: t('customers.inactive') },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as Customer['status'] })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitAddCustomer}
              className="flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('common.add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('customers.editCustomer')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('customers.customerName')}
            placeholder={t('customers.enterCompanyName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />
          <Input
            label={t('customers.contactPerson')}
            placeholder={t('customers.enterContactName')}
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            error={formErrors.contactPerson}
            required
          />
          <Input
            label={t('common.phone')}
            type="tel"
            placeholder="+994501234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={formErrors.phone}
            required
          />
          <Input
            label={t('common.email')}
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />
          <Input
            label={t('common.address')}
            placeholder={t('customers.enterAddress')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={formErrors.address}
            required
          />
          <Select
            label={t('customers.category')}
            options={[
              { value: 'retail', label: t('customers.retail') },
              { value: 'wholesale', label: t('customers.wholesale') },
              { value: 'distributor', label: t('customers.distributor') },
            ]}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as Customer['category'] })}
            required
          />
          <Select
            label={t('common.status')}
            options={[
              { value: 'active', label: t('customers.active') },
              { value: 'inactive', label: t('customers.inactive') },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as Customer['status'] })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitEditCustomer}
              className="flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('common.update')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('customers.deleteCustomer')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('customers.deleteConfirm')}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {selectedCustomer?.name}
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={confirmDeleteCustomer}
              className="flex-1"
              style={{ backgroundColor: '#E74C3C' }}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
