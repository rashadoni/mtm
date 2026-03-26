'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'agent';
  avatar: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  device?: {
    model: string;
    os: string;
    appVersion: string;
    lastSync: string;
  };
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Əhməd Məmmədov',
    email: 'ahmad@mtm.az',
    phone: '+994501234567',
    role: 'admin',
    avatar: 'AM',
    status: 'active',
    lastLogin: '2026-03-17 14:32',
    device: {
      model: 'Samsung Galaxy A54',
      os: 'Android 14',
      appVersion: 'v2.4.1',
      lastSync: '2026-03-17 14:32',
    },
  },
  {
    id: '2',
    name: 'Leyla Qasımova',
    email: 'leyla@mtm.az',
    phone: '+994502234567',
    role: 'manager',
    avatar: 'LQ',
    status: 'active',
    lastLogin: '2026-03-17 13:15',
    device: {
      model: 'iPhone 15',
      os: 'iOS 17.3',
      appVersion: 'v2.4.1',
      lastSync: '2026-03-17 13:15',
    },
  },
  {
    id: '3',
    name: 'Farid Hüseynov',
    email: 'farid@mtm.az',
    phone: '+994503234567',
    role: 'agent',
    avatar: 'FH',
    status: 'active',
    lastLogin: '2026-03-17 12:45',
    device: {
      model: 'Samsung Galaxy S23',
      os: 'Android 14',
      appVersion: 'v2.3.8',
      lastSync: '2026-03-17 12:45',
    },
  },
  {
    id: '4',
    name: 'Rəfail Əliəv',
    email: 'refail@mtm.az',
    phone: '+994504234567',
    role: 'agent',
    avatar: 'RA',
    status: 'active',
    lastLogin: '2026-03-16 18:20',
    device: {
      model: 'Xiaomi Redmi Note 12',
      os: 'Android 13',
      appVersion: 'v2.4.0',
      lastSync: '2026-03-16 18:20',
    },
  },
  {
    id: '5',
    name: 'Sərxan Yusifov',
    email: 'serxan@mtm.az',
    phone: '+994505234567',
    role: 'agent',
    avatar: 'SY',
    status: 'inactive',
    lastLogin: '2026-03-15 10:05',
    device: {
      model: 'iPhone 13',
      os: 'iOS 17.2',
      appVersion: 'v2.2.0',
      lastSync: '2026-03-15 10:05',
    },
  },
  {
    id: '6',
    name: 'Aynur Bayramova',
    email: 'aynur@mtm.az',
    phone: '+994506234567',
    role: 'manager',
    avatar: 'AB',
    status: 'active',
    lastLogin: '2026-03-17 15:30',
    device: {
      model: 'Samsung Galaxy A34',
      os: 'Android 13',
      appVersion: 'v2.4.1',
      lastSync: '2026-03-17 15:30',
    },
  },
  {
    id: '7',
    name: 'Ramil Cəfərov',
    email: 'ramil@mtm.az',
    phone: '+994507234567',
    role: 'agent',
    avatar: 'RC',
    status: 'active',
    lastLogin: '2026-03-17 11:22',
    device: {
      model: 'iPhone 14 Pro',
      os: 'iOS 17.3',
      appVersion: 'v2.4.1',
      lastSync: '2026-03-17 11:22',
    },
  },
  {
    id: '8',
    name: 'Gülnar Qasımova',
    email: 'gulnar@mtm.az',
    phone: '+994508234567',
    role: 'admin',
    avatar: 'GQ',
    status: 'active',
    lastLogin: '2026-03-17 16:00',
    device: {
      model: 'Samsung Galaxy S24',
      os: 'Android 14',
      appVersion: 'v2.4.1',
      lastSync: '2026-03-17 16:00',
    },
  },
  {
    id: '9',
    name: 'Vəli Məhmudov',
    email: 'vali@mtm.az',
    phone: '+994509234567',
    role: 'agent',
    avatar: 'VM',
    status: 'inactive',
    lastLogin: '2026-03-14 09:30',
    device: {
      model: 'Xiaomi Poco X5',
      os: 'Android 13',
      appVersion: 'v2.1.0',
      lastSync: '2026-03-14 09:30',
    },
  },
  {
    id: '10',
    name: 'Nigar Hüseyinova',
    email: 'nigar@mtm.az',
    phone: '+994510234567',
    role: 'agent',
    avatar: 'NH',
    status: 'active',
    lastLogin: '2026-03-17 14:15',
    device: {
      model: 'iPhone 12',
      os: 'iOS 17.1',
      appVersion: 'v2.3.5',
      lastSync: '2026-03-17 14:15',
    },
  },
];

const roleLabels: Record<User['role'], string> = {
  admin: 'Admin',
  manager: 'Menecer',
  agent: 'Agent',
};

const roleColors: Record<User['role'], string> = {
  admin: '#E74C3C',
  manager: '#3498DB',
  agent: '#00BFA6',
};

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Menecer' },
  { value: 'agent', label: 'Agent' },
];

const statusOptions = [
  { value: 'active', label: 'Aktiv' },
  { value: 'inactive', label: 'Deaktiv' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  status: User['status'];
  password?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'lastLogin'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    status: 'active',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    filterAndSort();
  }, [searchTerm, roleFilter, statusFilter, users, sortBy]);

  const filterAndSort = () => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'lastLogin':
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
        default:
          return 0;
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  };

  const validateForm = (data: FormData, isEdit: boolean = false): boolean => {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
      errors.name = t('validation.nameRequired');
    }

    if (!data.email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = t('validation.emailInvalid');
    } else if (!isEdit && users.some((u) => u.email === data.email)) {
      errors.email = t('users.emailExists');
    }

    if (!isEdit && !data.password) {
      errors.password = t('validation.passwordRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'agent',
      status: 'active',
      password: '',
    });
    setFormErrors({});
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const submitAddUser = () => {
    if (!validateForm(formData)) return;

    const newUser: User = {
      id: String(Math.max(...users.map((u) => parseInt(u.id))) + 1),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      avatar: formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      status: formData.status,
      lastLogin: new Date().toLocaleString('az-AZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\./g, '-'),
    };

    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    setSuccessMessage(t('users.addSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const submitEditUser = () => {
    if (!validateForm(formData, true)) return;

    setUsers(
      users.map((u) =>
        u.id === selectedUser?.id
          ? {
            ...u,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            role: formData.role,
            status: formData.status,
            avatar: formData.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          }
          : u
      )
    );
    setIsEditModalOpen(false);
    setSuccessMessage(t('users.editSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSuccessMessage(t('users.deleteSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExport = () => {
    const csv = [
      [t('common.name'), t('common.email'), t('common.phone'), t('users.role'), t('common.status'), t('users.lastLogin')],
      ...users.map((u) => [u.name, u.email, u.phone || '', roleLabels[u.role], u.status === 'active' ? t('users.active') : t('users.inactive'), u.lastLogin]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'istifadeciler.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('users.title')}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            {t('users.exportAll')}
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddUser}
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={20} />
            {t('users.addNew')}
          </Button>
        </div>
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
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | User['role'])}
                className="appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
              >
                <option value="all">{t('common.all')}</option>
                <option value="admin">Admin</option>
                <option value="manager">Menecer</option>
                <option value="agent">Agent</option>
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
                <option value="all">{t('common.all')}</option>
                <option value="active">{t('users.active')}</option>
                <option value="inactive">{t('users.inactive')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('email')}
                  >
                    {t('common.email')} {sortBy === 'email' && '↓'}
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('role')}
                  >
                    {t('users.role')} {sortBy === 'role' && '↓'}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">{t('common.status')}</th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSortBy('lastLogin')}
                  >
                    {t('users.lastLogin')} {sortBy === 'lastLogin' && '↓'}
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">{t('common.actions')}</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">{t('users.expand')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                  <tr
                    className={cn(
                      'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors',
                      index === paginatedUsers.length - 1 && !expandedUserId && 'border-b-0'
                    )}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          {user.avatar}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-4 px-6">
                      <Badge
                        className="font-semibold"
                        style={{ backgroundColor: roleColors[user.role] + '20', color: roleColors[user.role] }}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={user.status === 'active' ? 'success' : 'warning'}
                        className="font-semibold"
                      >
                        {user.status === 'active' ? t('users.active') : t('users.inactive')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ChevronDown
                            size={18}
                            className="text-gray-600 dark:text-gray-400 transition-transform"
                            style={{
                              transform: expandedUserId === user.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedUserId === user.id && (
                    <tr className="bg-indigo-50 dark:bg-indigo-950/20 border-b border-gray-200 dark:border-gray-700">
                      <td colSpan={7} className="py-6 px-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Smartphone size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Cihaz Məlumatları</h3>
                          </div>
                          {user.device ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('users.device')}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.device.model}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('users.appVersion')}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.device.os}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('users.appVersion')}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.device.appVersion}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('users.lastSync')}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.device.lastSync}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">{t('users.deviceInfo')}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('common.noData')}</p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paginatedUsers.length > 0
                  ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    filteredUsers.length
                  )} of ${filteredUsers.length}`
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('common.total')}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              {users.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('users.admins')}</p>
            <p className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('users.managers')}</p>
            <p className="text-2xl font-bold" style={{ color: '#3498DB' }}>
              {users.filter((u) => u.role === 'manager').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('users.active')}</p>
            <p className="text-2xl font-bold" style={{ color: '#00BFA6' }}>
              {users.filter((u) => u.status === 'active').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('users.addNew')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('common.name')}
            placeholder={t('users.namePlaceholder') || 'Adı daxil edin'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
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
            label={t('common.phone')}
            type="tel"
            placeholder="+994501234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label={t('users.role')}
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
            required
          />
          <Select
            label={t('common.status')}
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as User['status'] })}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder={t('users.passwordPlaceholder') || 'Şifrə daxil edin'}
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
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
              onClick={submitAddUser}
              className="flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('common.add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('users.editUser')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('common.name')}
            placeholder={t('users.namePlaceholder') || 'Adı daxil edin'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
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
            label={t('common.phone')}
            type="tel"
            placeholder="+994501234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label={t('users.role')}
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
            required
          />
          <Select
            label={t('common.status')}
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as User['status'] })}
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
              onClick={submitEditUser}
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
        title={t('users.deleteUser')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('users.deleteConfirm')}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {selectedUser?.name}
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
              onClick={confirmDeleteUser}
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
