'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  Calendar,
  Flag,
  User,
  LayoutGrid,
  List,
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

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToAvatar: string;
  customer: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'new' | 'inProgress' | 'completed';
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Neptun mağazasına yeni məhsul təqdimatı',
    description: 'Yeni məhsul xətti təqdimatı yapılmalıdır',
    assignedTo: 'Əhməd Məmmədov',
    assignedToAvatar: 'AM',
    customer: 'Neptun Mağazalar Şəbəkəsi',
    priority: 'high',
    dueDate: '2026-03-18',
    status: 'new',
  },
  {
    id: '2',
    title: 'Bravo ilə müqavilə yeniləməsi',
    description: 'Satış müqavilələri yenilənməlidir',
    assignedTo: 'Leyla Qasımova',
    assignedToAvatar: 'LQ',
    customer: 'Bravo Supermarket',
    priority: 'medium',
    dueDate: '2026-03-20',
    status: 'inProgress',
  },
  {
    id: '3',
    title: 'Gilan distribütor hesabatı',
    description: 'Aylık satış hesabatı hazırlanmalıdır',
    assignedTo: 'Farid Hüseynov',
    assignedToAvatar: 'FH',
    customer: 'Gilan Holdinq',
    priority: 'low',
    dueDate: '2026-03-22',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Bakı Supermarket inventar yoxlaması',
    description: 'Sakit saatlarında inventar yoxlanmalıdır',
    assignedTo: 'Rəfail Əliəv',
    assignedToAvatar: 'RA',
    customer: 'Bakı Supermarket MMC',
    priority: 'high',
    dueDate: '2026-03-19',
    status: 'inProgress',
  },
  {
    id: '5',
    title: 'Azərsun ilə qiymət danışığı',
    description: 'Topdan qiymətlər üzrə danışıqlar',
    assignedTo: 'Sərxan Yusifov',
    assignedToAvatar: 'SY',
    customer: 'Azərsun Holdinq',
    priority: 'medium',
    dueDate: '2026-03-21',
    status: 'new',
  },
  {
    id: '6',
    title: 'Şərq Bazarı yeni nöqtə açılışı',
    description: 'Yeni mağaza nöqtəsinin açılışı hazırlanmalıdır',
    assignedTo: 'Nigar Hüseyinova',
    assignedToAvatar: 'NH',
    customer: 'Şərq Bazarı MMC',
    priority: 'high',
    dueDate: '2026-03-17',
    status: 'new',
  },
  {
    id: '7',
    title: 'Araz Supermarket rəf düzülüşü',
    description: 'Məhsullar düzgün şəkildə rəflənməlidir',
    assignedTo: 'Tural Əhədov',
    assignedToAvatar: 'TE',
    customer: 'Araz Supermarket',
    priority: 'medium',
    dueDate: '2026-03-19',
    status: 'inProgress',
  },
  {
    id: '8',
    title: 'Günay Market promosiya kampaniyası',
    description: 'Mövsüm promosiyası kampaniyası',
    assignedTo: 'Gülnarə Kərimova',
    assignedToAvatar: 'GK',
    customer: 'Günay Market',
    priority: 'low',
    dueDate: '2026-03-25',
    status: 'completed',
  },
  {
    id: '9',
    title: 'Premium Market müştəri rəyi',
    description: 'Müştəri məmnuniyyəti araştırması',
    assignedTo: 'Kamran Əbilzadə',
    assignedToAvatar: 'KA',
    customer: 'Premium Market',
    priority: 'medium',
    dueDate: '2026-03-23',
    status: 'new',
  },
  {
    id: '10',
    title: 'Atlas Group MMC anbar yoxlaması',
    description: 'Distribütor anbarı yoxlanmalıdır',
    assignedTo: 'Aytən Məmmədova',
    assignedToAvatar: 'AM',
    customer: 'Atlas Group MMC',
    priority: 'high',
    dueDate: '2026-03-20',
    status: 'inProgress',
  },
  {
    id: '11',
    title: 'Sədərək reklam materialları',
    description: 'Reklam materialları yenilənməlidir',
    assignedTo: 'Əhməd Məmmədov',
    assignedToAvatar: 'AM',
    customer: 'Sədərək Ticarət Mərkəzi',
    priority: 'low',
    dueDate: '2026-03-24',
    status: 'completed',
  },
  {
    id: '12',
    title: 'Mega Store açılış planlaması',
    description: 'Yeni mağaza açılış tədbiri planlanmalıdır',
    assignedTo: 'Leyla Qasımova',
    assignedToAvatar: 'LQ',
    customer: 'Mega Store',
    priority: 'high',
    dueDate: '2026-03-18',
    status: 'new',
  },
];

const agents = [
  { value: 'ahmad', label: 'Əhməd Məmmədov' },
  { value: 'leyla', label: 'Leyla Qasımova' },
  { value: 'farid', label: 'Farid Hüseynov' },
  { value: 'refail', label: 'Rəfail Əliəv' },
  { value: 'serxan', label: 'Sərxan Yusifov' },
  { value: 'nigar', label: 'Nigar Hüseyinova' },
  { value: 'tural', label: 'Tural Əhədov' },
  { value: 'gulnare', label: 'Gülnarə Kərimova' },
];

const customers = [
  { value: 'bakı', label: 'Bakı Supermarket MMC' },
  { value: 'azersun', label: 'Azərsun Holdinq' },
  { value: 'bravo', label: 'Bravo Supermarket' },
  { value: 'neptun', label: 'Neptun Mağazalar Şəbəkəsi' },
  { value: 'gilan', label: 'Gilan Holdinq' },
  { value: 'sercbazar', label: 'Şərq Bazarı MMC' },
  { value: 'araz', label: 'Araz Supermarket' },
  { value: 'gunay', label: 'Günay Market' },
  { value: 'premium', label: 'Premium Market' },
  { value: 'atlas', label: 'Atlas Group MMC' },
];

const priorityLabels: Record<Task['priority'], string> = {
  high: 'Yüksək',
  medium: 'Orta',
  low: 'Aşağı',
};

const priorityColors: Record<Task['priority'], string> = {
  high: '#E74C3C',
  medium: '#FFC107',
  low: '#27AE60',
};

const statusLabels: Record<Task['status'], string> = {
  new: 'Yeni',
  inProgress: 'Davam edir',
  completed: 'Tamamlandı',
};

const statusColors: Record<Task['status'], string> = {
  new: '#3498DB',
  inProgress: '#FFC107',
  completed: '#27AE60',
};

const priorityOptions = [
  { value: 'high', label: 'Yüksək' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Aşağı' },
];

const statusOptions = [
  { value: 'new', label: 'Yeni' },
  { value: 'inProgress', label: 'Davam edir' },
  { value: 'completed', label: 'Tamamlandı' },
];

interface FormData {
  title: string;
  description: string;
  assignedTo: string;
  customer: string;
  priority: Task['priority'];
  dueDate: string;
  status: Task['status'];
}

interface FormErrors {
  title?: string;
  description?: string;
  assignedTo?: string;
  customer?: string;
  dueDate?: string;
}

export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [agentFilter, setAgentFilter] = useState<'all' | string>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks);
  const [successMessage, setSuccessMessage] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    assignedTo: '',
    customer: '',
    priority: 'medium',
    dueDate: '',
    status: 'new',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    filterAndSort();
  }, [searchTerm, statusFilter, priorityFilter, agentFilter, tasks]);

  const filterAndSort = () => {
    let result = tasks;

    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (agentFilter !== 'all') {
      result = result.filter((task) => task.assignedTo.toLowerCase().includes(agentFilter.toLowerCase()));
    }

    setFilteredTasks(result);
  };

  const validateForm = (data: FormData): boolean => {
    const errors: FormErrors = {};

    if (!data.title.trim()) {
      errors.title = t('tasks.titleRequired');
    }

    if (!data.description.trim()) {
      errors.description = t('tasks.descriptionRequired');
    }

    if (!data.assignedTo) {
      errors.assignedTo = t('tasks.agentRequired');
    }

    if (!data.customer) {
      errors.customer = t('tasks.customerRequired');
    }

    if (!data.dueDate) {
      errors.dueDate = t('tasks.dueDateRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTask = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      customer: '',
      priority: 'medium',
      dueDate: '',
      status: 'new',
    });
    setFormErrors({});
    setSelectedTask(null);
    setIsAddModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      customer: task.customer,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    });
    setFormErrors({});
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const submitAddTask = () => {
    if (!validateForm(formData)) return;

    const newTask: Task = {
      id: String(Math.max(...tasks.map((t) => parseInt(t.id))) + 1),
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedToAvatar: formData.assignedTo
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      customer: formData.customer,
      priority: formData.priority,
      dueDate: formData.dueDate,
      status: formData.status,
    };

    setTasks([...tasks, newTask]);
    setIsAddModalOpen(false);
    setSuccessMessage(t('tasks.addSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const submitEditTask = () => {
    if (!validateForm(formData)) return;

    setTasks(
      tasks.map((t) =>
        t.id === selectedTask?.id
          ? {
            ...t,
            title: formData.title,
            description: formData.description,
            assignedTo: formData.assignedTo,
            assignedToAvatar: formData.assignedTo
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
            customer: formData.customer,
            priority: formData.priority,
            dueDate: formData.dueDate,
            status: formData.status,
          }
          : t
      )
    );
    setIsEditModalOpen(false);
    setSuccessMessage(t('tasks.editSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const confirmDeleteTask = () => {
    if (!selectedTask) return;
    setTasks(tasks.filter((t) => t.id !== selectedTask.id));
    setIsDeleteModalOpen(false);
    setSuccessMessage(t('tasks.deleteSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Kanban drag-and-drop
  const dragTaskRef = useRef<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  const handleKanbanDragStart = (taskId: string) => {
    dragTaskRef.current = taskId;
  };

  const handleKanbanDragOver = (e: React.DragEvent, column: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleKanbanDrop = (column: Task['status']) => {
    if (dragTaskRef.current) {
      setTasks(tasks.map((t) => t.id === dragTaskRef.current ? { ...t, status: column } : t));
      dragTaskRef.current = null;
      setDragOverColumn(null);
    }
  };

  const handleKanbanDragEnd = () => {
    dragTaskRef.current = null;
    setDragOverColumn(null);
  };

  const newTasks = tasks.filter((t) => t.status === 'new');
  const inProgressTasks = tasks.filter((t) => t.status === 'inProgress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const totalCount = tasks.length;
  const newCount = newTasks.length;
  const inProgressCount = inProgressTasks.length;
  const completedCount = completedTasks.length;

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      draggable
      onDragStart={() => handleKanbanDragStart(task.id)}
      onDragEnd={handleKanbanDragEnd}
      className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h3>
        <Badge
          style={{
            backgroundColor: priorityColors[task.priority] + '20',
            color: priorityColors[task.priority],
          }}
          className="font-semibold text-xs flex-shrink-0 ml-2"
        >
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="space-y-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <User size={14} />
          <span className="line-clamp-1">{task.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{task.dueDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {task.assignedToAvatar}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 line-clamp-1">
          {task.customer}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleEditTask(task)}
          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
        >
          <Edit2 size={14} className="text-blue-600 dark:text-blue-400" />
        </button>
        <button
          onClick={() => handleDeleteTask(task)}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        >
          <Trash2 size={14} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tasks.title')}</h1>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-700 text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <List size={18} />
            </button>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddTask}
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={20} />
            {t('tasks.newTask')}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flag size={24} />}
          title={t('tasks.total')}
          value={totalCount}
          color="#6C63FF"
        />
        <StatCard
          icon={<Flag size={24} />}
          title={t('tasks.new')}
          value={newCount}
          color="#3498DB"
        />
        <StatCard
          icon={<Flag size={24} />}
          title={t('tasks.inProgress')}
          value={inProgressCount}
          color="#FFC107"
        />
        <StatCard
          icon={<Flag size={24} />}
          title={t('tasks.done')}
          value={completedCount}
          color="#27AE60"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('tasks.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | Task['status'])}
                className="appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
              >
                <option value="all">{t('tasks.allStatus')}</option>
                <option value="new">{t('tasks.todo')}</option>
                <option value="inProgress">{t('tasks.inProgress')}</option>
                <option value="completed">{t('tasks.done')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as 'all' | Task['priority'])}
                className="appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
              >
                <option value="all">{t('tasks.allPriority')}</option>
                <option value="high">{t('tasks.high')}</option>
                <option value="medium">{t('tasks.medium')}</option>
                <option value="low">{t('tasks.low')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            { status: 'new' as const, label: t('tasks.todo'), color: '#3498DB', tasks: newTasks },
            { status: 'inProgress' as const, label: t('tasks.inProgress'), color: '#FFC107', tasks: inProgressTasks },
            { status: 'completed' as const, label: t('tasks.done'), color: '#27AE60', tasks: completedTasks },
          ]).map((column) => (
            <div
              key={column.status}
              className="space-y-4"
              onDragOver={(e) => handleKanbanDragOver(e, column.status)}
              onDrop={() => handleKanbanDrop(column.status)}
              onDragLeave={() => setDragOverColumn(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                <h2 className="font-semibold text-gray-900 dark:text-white">{column.label}</h2>
                <Badge style={{ backgroundColor: column.color + '20', color: column.color }} className="font-semibold">
                  {column.tasks.length}
                </Badge>
              </div>
              <div className={cn(
                'space-y-3 min-h-[200px] rounded-xl p-2 transition-all',
                dragOverColumn === column.status
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-dashed'
                  : 'border-2 border-transparent'
              )} style={dragOverColumn === column.status ? { borderColor: '#6C63FF' } : undefined}>
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {t('tasks.dragDrop')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.taskTitle')}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.assignedAgent')}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.assignedCustomer')}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.priority')}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.dueDate')}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('tasks.status')}
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr
                      key={task.id}
                      className={cn(
                        'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors',
                        index === filteredTasks.length - 1 && 'border-b-0'
                      )}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: 'var(--primary)' }}
                          >
                            {task.assignedToAvatar}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{task.assignedTo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {task.customer}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: priorityColors[task.priority] + '20',
                            color: priorityColors[task.priority],
                          }}
                        >
                          {priorityLabels[task.priority]}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {task.dueDate}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: statusColors[task.status] + '20',
                            color: statusColors[task.status],
                          }}
                        >
                          {statusLabels[task.status]}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
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

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('tasks.notFound')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('tasks.addTask')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('tasks.taskTitle')}
            placeholder={t('tasks.enterTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tasks.description')}
            </label>
            <textarea
              placeholder={t('tasks.enterDescription')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              rows={3}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>
          <Select
            label={t('tasks.assignedAgent')}
            options={agents}
            value={formData.assignedTo}
            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
            required
          />
          <Select
            label={t('tasks.assignedCustomer')}
            options={customers}
            value={formData.customer}
            onChange={(value) => setFormData({ ...formData, customer: value })}
            required
          />
          <Select
            label={t('tasks.priority')}
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
            required
          />
          <Input
            label={t('tasks.dueDate')}
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            error={formErrors.dueDate}
            required
          />
          <Select
            label={t('tasks.status')}
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              {t('tasks.cancel')}
            </Button>
            <Button
              onClick={submitAddTask}
              className="flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('tasks.add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('tasks.editTask')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('tasks.taskTitle')}
            placeholder={t('tasks.enterTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tasks.description')}
            </label>
            <textarea
              placeholder={t('tasks.enterDescription')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              rows={3}
            />
          </div>
          <Select
            label={t('tasks.assignedAgent')}
            options={agents}
            value={formData.assignedTo}
            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
            required
          />
          <Select
            label={t('tasks.assignedCustomer')}
            options={customers}
            value={formData.customer}
            onChange={(value) => setFormData({ ...formData, customer: value })}
            required
          />
          <Select
            label={t('tasks.priority')}
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
            required
          />
          <Input
            label={t('tasks.dueDate')}
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <Select
            label={t('tasks.status')}
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              {t('tasks.cancel')}
            </Button>
            <Button
              onClick={submitEditTask}
              className="flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('tasks.update')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('tasks.deleteConfirm')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('tasks.deleteConfirm')}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {selectedTask?.title}
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              {t('tasks.cancel')}
            </Button>
            <Button
              onClick={confirmDeleteTask}
              className="flex-1"
              style={{ backgroundColor: '#E74C3C' }}
            >
              {t('tasks.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
