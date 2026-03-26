'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus, MapPin, Clock, CheckCircle, Circle, AlertCircle,
  GripVertical, Map, Zap, Calendar, List, Save,
  ChevronLeft, ChevronRight, Copy, Trash2, Users,
  Navigation, ArrowUpDown, X, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const LeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />,
});

// ===== Types =====
interface RoutePoint {
  id: string;
  customerName: string;
  address: string;
  time: string;
  duration: number;
  status: 'completed' | 'inprogress' | 'pending';
  lat: number;
  lng: number;
  tasks?: string[];
}

interface AgentRoute {
  id: string;
  name: string;
  avatar: string;
  region: string;
  route: RoutePoint[];
}

interface RouteTemplate {
  id: string;
  name: string;
  pointCount: number;
  region: string;
  usedBy: string;
}

type ViewMode = 'list' | 'calendar';

// ===== Mock Data =====
const mockAgents: AgentRoute[] = [
  {
    id: '1', name: 'Əhməd Məmmədov', avatar: 'ƏM', region: 'Nəsimi',
    route: [
      { id: 'r1-1', customerName: 'ABC Əczaxanası', address: 'Nizami küçəsi, 45', time: '09:00', duration: 25, status: 'completed', lat: 40.3793, lng: 49.8310, tasks: ['Sifariş yığımı', 'Stok yoxlaması'] },
      { id: 'r1-2', customerName: 'XYZ Mağazası', address: '28 May küçəsi, 12', time: '10:00', duration: 20, status: 'completed', lat: 40.3830, lng: 49.8240, tasks: ['Yeni məhsul təqdimatı'] },
      { id: 'r1-3', customerName: 'MediPlus', address: 'Təbriz küçəsi, 78', time: '11:00', duration: 30, status: 'inprogress', lat: 40.3920, lng: 49.8170, tasks: ['Kampaniya bildirişi', 'Sifariş'] },
      { id: 'r1-4', customerName: 'GreenFarm', address: 'Yasamal küçəsi, 34', time: '12:30', duration: 20, status: 'pending', lat: 40.3980, lng: 49.8100, tasks: ['Borc yığımı'] },
      { id: 'r1-5', customerName: 'SağlamOl', address: 'Nərimanov pr., 56', time: '14:00', duration: 25, status: 'pending', lat: 40.4070, lng: 49.8200, tasks: ['Sifariş yığımı'] },
      { id: 'r1-6', customerName: 'MedService', address: 'Həsən Əliyev küç., 90', time: '15:30', duration: 30, status: 'pending', lat: 40.4140, lng: 49.8080, tasks: ['Məhsul qaytarma'] },
    ],
  },
  {
    id: '2', name: 'Leyla Qasımova', avatar: 'LQ', region: 'Xətai',
    route: [
      { id: 'r2-1', customerName: 'PharmaZone', address: 'H.Əliyev pr., 25', time: '08:30', duration: 20, status: 'completed', lat: 40.4210, lng: 49.8050, tasks: ['Stok yoxlaması'] },
      { id: 'r2-2', customerName: 'Dərman Evi', address: 'Azərbaycan pr., 67', time: '09:30', duration: 25, status: 'completed', lat: 40.4120, lng: 49.7950, tasks: ['Sifariş yığımı'] },
      { id: 'r2-3', customerName: 'SağlıqPlus', address: 'Mərdəkan pr., 11', time: '11:00', duration: 30, status: 'inprogress', lat: 40.4050, lng: 49.8350, tasks: ['Yeni məhsul təqdimatı', 'Kampaniya'] },
      { id: 'r2-4', customerName: 'BioFarma', address: 'Z.Əliyeva küç., 44', time: '13:00', duration: 20, status: 'pending', lat: 40.3960, lng: 49.8450 },
      { id: 'r2-5', customerName: 'MedLine', address: 'S.Vurğun küç., 82', time: '14:30', duration: 25, status: 'pending', lat: 40.3880, lng: 49.8380 },
    ],
  },
  {
    id: '3', name: 'Farid Hüseynov', avatar: 'FH', region: 'Binəqədi',
    route: [
      { id: 'r3-1', customerName: 'NovaMed', address: 'Ü.Hacıbəyov küç., 21', time: '09:15', duration: 25, status: 'completed', lat: 40.3720, lng: 49.8430, tasks: ['Sifariş'] },
      { id: 'r3-2', customerName: 'Vita Əczaxanası', address: 'Bülbül pr., 55', time: '10:30', duration: 20, status: 'completed', lat: 40.3670, lng: 49.8350 },
      { id: 'r3-3', customerName: 'HealthCare', address: 'Xətai pr., 88', time: '12:00', duration: 30, status: 'pending', lat: 40.3850, lng: 49.8500 },
      { id: 'r3-4', customerName: 'PharmaTrade', address: 'Binəqədi küç., 33', time: '14:00', duration: 20, status: 'pending', lat: 40.4300, lng: 49.8150 },
    ],
  },
];

const mockTemplates: RouteTemplate[] = [
  { id: 't1', name: 'Nəsimi Standart', pointCount: 8, region: 'Nəsimi', usedBy: 'Əhməd' },
  { id: 't2', name: 'Xətai Həftəlik', pointCount: 6, region: 'Xətai', usedBy: 'Leyla' },
  { id: 't3', name: 'Binəqədi Əsas', pointCount: 5, region: 'Binəqədi', usedBy: 'Farid' },
  { id: 't4', name: 'VIP Müştərilər', pointCount: 4, region: 'Mərkəz', usedBy: 'Hamısı' },
];

// ===== Component =====
export default function RoutesPage() {
  const { t } = useTranslation();
  const [selectedAgent, setSelectedAgent] = useState<AgentRoute>(mockAgents[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [centerPoint, setCenterPoint] = useState<[number, number] | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteAgent, setNewRouteAgent] = useState('1');
  const [newRouteDateStart, setNewRouteDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [newRouteDateEnd, setNewRouteDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [routeFormError, setRouteFormError] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<{ id: string; name: string; address: string; time: string; lat: number; lng: number }[]>([]);

  // Available customers to pick from
  const availableCustomers = [
    { id: 'c1', name: 'ABC Əczaxanası', address: 'Nizami küçəsi, 45', lat: 40.3793, lng: 49.8310 },
    { id: 'c2', name: 'XYZ Mağazası', address: '28 May küçəsi, 12', lat: 40.3830, lng: 49.8240 },
    { id: 'c3', name: 'MediPlus', address: 'Təbriz küçəsi, 78', lat: 40.3920, lng: 49.8170 },
    { id: 'c4', name: 'GreenFarm', address: 'Yasamal küçəsi, 34', lat: 40.3980, lng: 49.8100 },
    { id: 'c5', name: 'SağlamOl', address: 'Nərimanov pr., 56', lat: 40.4070, lng: 49.8200 },
    { id: 'c6', name: 'MedService', address: 'Həsən Əliyev küç., 90', lat: 40.4140, lng: 49.8080 },
    { id: 'c7', name: 'PharmaZone', address: 'H.Əliyev pr., 25', lat: 40.4210, lng: 49.8050 },
    { id: 'c8', name: 'Dərman Evi', address: 'Azərbaycan pr., 67', lat: 40.4120, lng: 49.7950 },
    { id: 'c9', name: 'BioFarma', address: 'Z.Əliyeva küç., 44', lat: 40.3960, lng: 49.8450 },
    { id: 'c10', name: 'NovaMed', address: 'Ü.Hacıbəyov küç., 21', lat: 40.3720, lng: 49.8430 },
    { id: 'c11', name: 'Bravo Supermarket', address: 'Bakı, Səbail', lat: 40.3825, lng: 49.8564 },
    { id: 'c12', name: 'Araz Market', address: 'Bakı, Nəsimi', lat: 40.3945, lng: 49.8632 },
  ];

  const statusConfig = {
    completed: { icon: CheckCircle, color: '#00BFA6', label: t('routes.completed') },
    inprogress: { icon: Circle, color: '#3498DB', label: t('routes.inProgress') },
    pending: { icon: AlertCircle, color: '#FFC107', label: t('routes.pending') },
  };

  const DAYS_OF_WEEK = [
    t('routes.today') === 'Bu gün' ? 'Baz' : t('routes.today') === 'Сегодня' ? 'Вс' : 'Sun',
    t('routes.today') === 'Bu gün' ? 'B.e.' : t('routes.today') === 'Сегодня' ? 'Пн' : 'Mon',
    t('routes.today') === 'Bu gün' ? 'Ç.a.' : t('routes.today') === 'Сегодня' ? 'Вт' : 'Tue',
    t('routes.today') === 'Bu gün' ? 'Çər.' : t('routes.today') === 'Сегодня' ? 'Ср' : 'Wed',
    t('routes.today') === 'Bu gün' ? 'C.a.' : t('routes.today') === 'Сегодня' ? 'Чт' : 'Thu',
    t('routes.today') === 'Bu gün' ? 'Cümə' : t('routes.today') === 'Сегодня' ? 'Пт' : 'Fri',
    t('routes.today') === 'Bu gün' ? 'Şən.' : t('routes.today') === 'Сегодня' ? 'Сб' : 'Sat',
  ];

  // Drag and drop state
  const dragItemRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  const routePoints = selectedAgent.route.map((p) => [p.lat, p.lng] as [number, number]);

  // ===== Drag & Drop Handlers =====
  const handleDragStart = (index: number) => { dragItemRef.current = index; };
  const handleDragEnter = (index: number) => { dragOverRef.current = index; setDragOverIndex(index); };
  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverRef.current !== null && dragItemRef.current !== dragOverRef.current) {
      const newRoute = [...selectedAgent.route];
      const draggedItem = newRoute.splice(dragItemRef.current, 1)[0];
      newRoute.splice(dragOverRef.current, 0, draggedItem);
      setSelectedAgent({ ...selectedAgent, route: newRoute });
    }
    dragItemRef.current = null;
    dragOverRef.current = null;
    setDragOverIndex(null);
  };

  const handleOptimize = () => {
    const sorted = [...selectedAgent.route].sort((a, b) => a.time.localeCompare(b.time));
    setSelectedAgent({ ...selectedAgent, route: sorted });
  };

  const handleDeletePoint = (pointId: string) => {
    setSelectedAgent({ ...selectedAgent, route: selectedAgent.route.filter((p) => p.id !== pointId) });
  };

  const handleAddPoint = (customer: typeof availableCustomers[0]) => {
    if (selectedPoints.find((p) => p.id === customer.id)) return; // already added
    const lastTime = selectedPoints.length > 0 ? selectedPoints[selectedPoints.length - 1].time : '08:30';
    const [h, m] = lastTime.split(':').map(Number);
    const nextH = m >= 30 ? h + 1 : h;
    const nextM = m >= 30 ? '00' : '30';
    const nextTime = `${String(nextH).padStart(2, '0')}:${nextM}`;
    setSelectedPoints([...selectedPoints, { ...customer, time: nextTime }]);
  };

  const handleRemovePoint = (id: string) => {
    setSelectedPoints(selectedPoints.filter((p) => p.id !== id));
  };

  const handlePointTimeChange = (id: string, time: string) => {
    setSelectedPoints(selectedPoints.map((p) => p.id === id ? { ...p, time } : p));
  };

  const handleCreateRoute = () => {
    // Validation with clear messages
    if (!newRouteName.trim()) {
      setRouteFormError('⚠ ' + t('routes.routeName') + ' — ' + t('validation.nameRequired'));
      return;
    }
    if (selectedPoints.length === 0) {
      setRouteFormError('⚠ ' + t('routes.addPoint') + '!');
      return;
    }
    setRouteFormError('');

    // Create new agent route from selected points
    const agentData = mockAgents.find((a) => a.id === newRouteAgent);
    const newAgentRoute: AgentRoute = {
      id: `new-${Date.now()}`,
      name: agentData?.name || 'Agent',
      avatar: agentData?.avatar || '??',
      region: agentData?.region || '',
      route: selectedPoints.map((p, i) => ({
        id: `new-r-${i}`,
        customerName: p.name,
        address: p.address,
        time: p.time,
        duration: 25,
        status: 'pending' as const,
        lat: p.lat,
        lng: p.lng,
      })),
    };

    const days = Math.max(1, Math.ceil((new Date(newRouteDateEnd).getTime() - new Date(newRouteDateStart).getTime()) / (1000 * 60 * 60 * 24)) + 1);

    setSelectedAgent(newAgentRoute);
    setIsNewRouteModalOpen(false);
    setSuccessMsg(`✓ "${newRouteName}" — ${selectedPoints.length} ${t('routes.point')}, ${days} ${t('routes.days')}`);
    setNewRouteName('');
    setSelectedPoints([]);
    setCustomerSearch('');
    setRouteFormError('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ===== Calendar Helpers =====
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1));

  const getDayData = useCallback((day: number) => {
    const seed = day * 7 + calendarDate.getMonth() * 31;
    return { agentCount: (seed % 3) + 1, visitCount: (seed % 8) + 3, completionRate: 50 + (seed % 50) };
  }, [calendarDate]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();

  // ===== Stats =====
  const completedCount = selectedAgent.route.filter((p) => p.status === 'completed').length;
  const totalPoints = selectedAgent.route.length;
  const completionPercent = totalPoints > 0 ? Math.round((completedCount / totalPoints) * 100) : 0;
  const totalDuration = selectedAgent.route.reduce((sum, p) => sum + p.duration, 0);

  const monthNames = calendarDate.toLocaleDateString(
    t('routes.today') === 'Bu gün' ? 'az-AZ' : t('routes.today') === 'Сегодня' ? 'ru-RU' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-4 right-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 shadow-lg z-40">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('routes.title')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <List size={16} /> {t('routes.list')}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Calendar size={16} /> {t('routes.calendar')}
            </button>
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
          />

          <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1.5">
            <Copy size={16} /> {t('routes.templates')}
          </Button>

          <Button className="flex items-center gap-2" style={{ backgroundColor: 'var(--primary)' }} onClick={() => setIsNewRouteModalOpen(true)}>
            <Plus size={18} /> {t('routes.newRoute')}
          </Button>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Copy size={16} /> {t('routes.routeTemplates')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mockTemplates.map((tpl) => (
                <div key={tpl.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-[var(--primary)] cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#6C63FF' }}>
                    {tpl.pointCount}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tpl.name}</p>
                    <p className="text-xs text-gray-500">{tpl.region} · {tpl.usedBy}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium px-2 py-1 rounded" style={{ color: '#6C63FF' }}>
                    {t('routes.apply')}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 capitalize">
                <Calendar size={20} /> {monthNames}
              </CardTitle>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={() => setCalendarDate(new Date())} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">{t('routes.today')}</button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getFirstDayOfMonth(calendarDate) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 rounded-lg" />
              ))}
              {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => {
                const day = i + 1;
                const data = getDayData(day);
                const isWeekend = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).getDay() % 6 === 0;
                return (
                  <div key={day} className={cn(
                    'h-24 p-2 rounded-lg border transition-all cursor-pointer hover:border-[var(--primary)]',
                    isToday(day) ? 'border-2 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-slate-700',
                    isWeekend && 'bg-gray-50 dark:bg-slate-800/30'
                  )} style={isToday(day) ? { borderColor: '#6C63FF' } : undefined}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('text-sm font-medium', isToday(day) ? 'text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700 dark:text-gray-300')} style={isToday(day) ? { backgroundColor: '#6C63FF' } : undefined}>{day}</span>
                    </div>
                    {!isWeekend && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><Users size={10} /> {data.agentCount} {t('routes.agent')}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><MapPin size={10} /> {data.visitCount} {t('routes.point')}</div>
                        <div className="w-full h-1 bg-gray-200 dark:bg-slate-600 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${data.completionRate}%`, backgroundColor: data.completionRate >= 80 ? '#00BFA6' : data.completionRate >= 50 ? '#FFC107' : '#E74C3C' }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Agent List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('routes.agents')} ({mockAgents.length})
            </h3>
            {mockAgents.map((agent) => {
              const agentCompleted = agent.route.filter((p) => p.status === 'completed').length;
              const agentTotal = agent.route.length;
              const agentPct = agentTotal > 0 ? Math.round((agentCompleted / agentTotal) * 100) : 0;
              return (
                <div key={agent.id} onClick={() => { setSelectedAgent(agent); setCenterPoint(null); }} className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                  selectedAgent.id === agent.id ? 'border-2 bg-white dark:bg-slate-900 shadow-md' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                )} style={selectedAgent.id === agent.id ? { borderColor: '#6C63FF' } : undefined}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#6C63FF' }}>{agent.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h4>
                      <p className="text-xs text-gray-500">{agent.region} · {agentTotal} {t('routes.point')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full">
                      <div className="h-full rounded-full transition-all" style={{ width: `${agentPct}%`, backgroundColor: '#00BFA6' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{agentPct}%</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {agent.route.map((point) => (
                      <div key={point.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig[point.status].color }} title={point.customerName} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Route Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00BFA620' }}><CheckCircle size={20} style={{ color: '#00BFA6' }} /></div>
                <div><p className="text-xs text-gray-500">{t('routes.completed')}</p><p className="text-lg font-bold text-gray-900 dark:text-white">{completedCount}/{totalPoints}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6C63FF20' }}><Navigation size={20} style={{ color: '#6C63FF' }} /></div>
                <div><p className="text-xs text-gray-500">{t('routes.executionRate')}</p><p className="text-lg font-bold text-gray-900 dark:text-white">{completionPercent}%</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3498DB20' }}><Clock size={20} style={{ color: '#3498DB' }} /></div>
                <div><p className="text-xs text-gray-500">{t('routes.totalDuration')}</p><p className="text-lg font-bold text-gray-900 dark:text-white">{Math.floor(totalDuration / 60)}h {totalDuration % 60}{t('routes.minutes')}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFC10720' }}><MapPin size={20} style={{ color: '#FFC107' }} /></div>
                <div><p className="text-xs text-gray-500">{t('routes.totalDistance')}</p><p className="text-lg font-bold text-gray-900 dark:text-white">{(totalPoints * 2.6).toFixed(1)} km</p></div>
              </div>
            </div>

            {/* Map */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Map size={18} /> {t('routes.routeMap')} — {selectedAgent.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LeafletMap
                  markers={selectedAgent.route.map((p) => ({
                    id: p.id, lat: p.lat, lng: p.lng, name: p.customerName,
                    status: (p.status === 'completed' ? 'checkin' : p.status === 'inprogress' ? 'onroute' : 'delayed') as 'checkin' | 'onroute' | 'delayed' | 'offline',
                    battery: 80, lastSeen: p.time,
                  }))}
                  center={centerPoint || [selectedAgent.route[0]?.lat || 40.4093, selectedAgent.route[0]?.lng || 49.8671]}
                  zoom={13} showRoute={true} routePoints={routePoints} height="280px"
                />
              </CardContent>
            </Card>

            {/* Draggable Route Points */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><ArrowUpDown size={16} /> {t('routes.routePoints')} ({t('routes.dragToReorder')})</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleOptimize} className="flex items-center gap-1.5"><Zap size={14} /> {t('routes.optimize')}</Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1.5"><Save size={14} /> {t('routes.save')}</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedAgent.route.map((point, index) => (
                    <div key={point.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        'flex gap-3 p-3 rounded-xl border transition-all group',
                        dragOverIndex === index ? 'border-dashed border-2 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-slate-700 hover:shadow-sm bg-white dark:bg-slate-900'
                      )} style={dragOverIndex === index ? { borderColor: '#6C63FF' } : undefined}>
                      <div className="flex-shrink-0 flex items-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
                      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: statusConfig[point.status].color }}>{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{point.customerName}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} /> {point.address}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} /> {point.time} · {point.duration} {t('routes.minutes')}</span>
                            </div>
                            {point.tasks && point.tasks.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {point.tasks.map((task, ti) => (
                                  <span key={ti} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">{task}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge className="text-[10px] font-semibold" style={{ backgroundColor: statusConfig[point.status].color + '20', color: statusConfig[point.status].color }}>{statusConfig[point.status].label}</Badge>
                            <button onClick={() => setCenterPoint([point.lat, point.lng])} className="p-1 rounded text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" title={t('routes.showOnMap')}><Map size={14} /></button>
                            <button onClick={() => handleDeletePoint(point.id)} className="p-1 rounded text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title={t('common.delete')}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Plus size={16} /> {t('routes.addPoint')}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* New Route Modal — Full */}
      <Modal isOpen={isNewRouteModalOpen} onClose={() => setIsNewRouteModalOpen(false)} title={t('routes.newRoute')} size="xl">
        <div className="space-y-5">
          {/* Validation error */}
          {routeFormError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
              {routeFormError}
            </div>
          )}

          {/* Top row: name + agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('routes.routeName')}
              placeholder={t('routes.routeName')}
              value={newRouteName}
              onChange={(e) => { setNewRouteName(e.target.value); setRouteFormError(''); }}
              required
            />
            <Select
              label={t('routes.selectAgent')}
              options={mockAgents.map((a) => ({ value: a.id, label: a.name }))}
              value={newRouteAgent}
              onChange={(value) => setNewRouteAgent(value)}
              required
            />
          </div>

          {/* Date range row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('routes.startDate')}
              type="date"
              value={newRouteDateStart}
              onChange={(e) => {
                setNewRouteDateStart(e.target.value);
                if (e.target.value > newRouteDateEnd) setNewRouteDateEnd(e.target.value);
              }}
              required
            />
            <Input
              label={t('routes.endDate')}
              type="date"
              value={newRouteDateEnd}
              onChange={(e) => setNewRouteDateEnd(e.target.value)}
              required
            />
          </div>

          {/* Two columns: customer list + selected points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Available Customers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('nav.customers')} — {t('routes.addPoint')}
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                {availableCustomers
                  .filter((c) => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.address.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map((customer) => {
                    const isAdded = selectedPoints.some((p) => p.id === customer.id);
                    return (
                      <div
                        key={customer.id}
                        onClick={() => !isAdded && handleAddPoint(customer)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors',
                          isAdded
                            ? 'bg-green-50 dark:bg-green-900/10 opacity-60 cursor-default'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                        )}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: isAdded ? '#00BFA6' : 'var(--primary)' }}>
                          {isAdded ? '✓' : <MapPin size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{customer.address}</p>
                        </div>
                        {!isAdded && (
                          <Plus size={16} className="flex-shrink-0 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right: Selected Route Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('routes.routePoints')} ({selectedPoints.length})
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg min-h-[16rem] max-h-64 overflow-y-auto">
                {selectedPoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <MapPin size={28} className="mb-2 opacity-40" />
                    <p className="text-sm">{t('routes.addPoint')}</p>
                  </div>
                ) : (
                  selectedPoints.map((point, index) => (
                    <div key={point.id} className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      {/* Order number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                        {index + 1}
                      </div>
                      {/* Name + address */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{point.name}</p>
                        <p className="text-xs text-gray-500 truncate">{point.address}</p>
                      </div>
                      {/* Time input */}
                      <input
                        type="time"
                        value={point.time}
                        onChange={(e) => handlePointTimeChange(point.id, e.target.value)}
                        className="w-20 text-xs px-1.5 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none"
                      />
                      {/* Remove */}
                      <button onClick={() => handleRemovePoint(point.id)} className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setIsNewRouteModalOpen(false); setSelectedPoints([]); setCustomerSearch(''); setRouteFormError(''); }} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateRoute}
              className="flex-1 text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {t('routes.createRoute')} {selectedPoints.length > 0 && `(${selectedPoints.length} ${t('routes.point')})`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
