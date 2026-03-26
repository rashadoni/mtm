'use client';

import { useState, useMemo } from 'react';
import {
  Heart, X as XIcon, Clock, ChevronDown, MapPin,
  ArrowLeft, ArrowRight, CheckSquare, Square,
  ThumbsUp, ThumbsDown, Columns, Grid, Image,
  Filter, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface Photo {
  id: string;
  agentName: string;
  customerName: string;
  date: string;
  time: string;
  status: 'approved' | 'rejected' | 'pending';
  color: string;
  gps?: { lat: number; lng: number };
  visitId?: string;
}

const mockPhotos: Photo[] = [
  { id: '1', agentName: 'Əhməd Məmmədov', customerName: 'ABC Əczaxanası', date: '2026-03-17', time: '10:30', status: 'approved', color: 'from-blue-400 to-blue-600', gps: { lat: 40.3769, lng: 49.8671 }, visitId: 'v1' },
  { id: '2', agentName: 'Leyla Qasımova', customerName: 'XYZ Mağazası', date: '2026-03-17', time: '11:15', status: 'approved', color: 'from-purple-400 to-purple-600', gps: { lat: 40.3859, lng: 49.8751 }, visitId: 'v2' },
  { id: '3', agentName: 'Farid Hüseynov', customerName: 'DEF Əczaxanası', date: '2026-03-17', time: '09:45', status: 'pending', color: 'from-green-400 to-green-600', gps: { lat: 40.3649, lng: 49.8591 }, visitId: 'v3' },
  { id: '4', agentName: 'Rəfail Əliyev', customerName: 'GHI Şirkəti', date: '2026-03-17', time: '14:20', status: 'rejected', color: 'from-red-400 to-red-600', gps: { lat: 40.3549, lng: 49.8471 }, visitId: 'v4' },
  { id: '5', agentName: 'Sərxan Yusifov', customerName: 'JKL Mağazası', date: '2026-03-16', time: '13:10', status: 'approved', color: 'from-pink-400 to-pink-600', gps: { lat: 40.3709, lng: 49.8651 }, visitId: 'v5' },
  { id: '6', agentName: 'Nigar Hüseyinova', customerName: 'MNO Şirkəti', date: '2026-03-16', time: '10:50', status: 'pending', color: 'from-yellow-400 to-orange-600', gps: { lat: 40.3889, lng: 49.8821 }, visitId: 'v6' },
  { id: '7', agentName: 'Tural İsmayılov', customerName: 'PQR Əczaxanası', date: '2026-03-16', time: '15:30', status: 'approved', color: 'from-teal-400 to-teal-600', gps: { lat: 40.4093, lng: 49.8820 }, visitId: 'v7' },
  { id: '8', agentName: 'Gülnarə Əliyeva', customerName: 'STU Mağazası', date: '2026-03-16', time: '12:25', status: 'pending', color: 'from-indigo-400 to-indigo-600', gps: { lat: 40.4150, lng: 49.8550 }, visitId: 'v8' },
  { id: '9', agentName: 'Kamran Nəsirov', customerName: 'VWX Şirkəti', date: '2026-03-15', time: '09:00', status: 'approved', color: 'from-cyan-400 to-cyan-600', gps: { lat: 40.3950, lng: 49.8400 }, visitId: 'v9' },
  { id: '10', agentName: 'Aytən Babayeva', customerName: 'YZA Mağazası', date: '2026-03-15', time: '16:15', status: 'pending', color: 'from-orange-400 to-orange-600', gps: { lat: 40.4020, lng: 49.8700 }, visitId: 'v10' },
  // Previous visit photos for comparison
  { id: '11', agentName: 'Əhməd Məmmədov', customerName: 'ABC Əczaxanası', date: '2026-03-10', time: '10:15', status: 'approved', color: 'from-blue-300 to-blue-500', gps: { lat: 40.3769, lng: 49.8671 }, visitId: 'v1-prev' },
  { id: '12', agentName: 'Leyla Qasımova', customerName: 'XYZ Mağazası', date: '2026-03-10', time: '11:00', status: 'approved', color: 'from-purple-300 to-purple-500', gps: { lat: 40.3859, lng: 49.8751 }, visitId: 'v2-prev' },
];

// Labels resolved via t() in components
const statusColorsBase = {
  approved: { color: '#00BFA6', labelKey: 'photos.approvedStatus' },
  rejected: { color: '#E74C3C', labelKey: 'photos.rejectedStatus' },
  pending: { color: '#FFC107', labelKey: 'photos.pendingStatus' },
};

type ViewMode = 'grid' | 'compare';

// ===== Lightbox =====
function PhotoLightbox({
  photo, photos, onClose, onNavigate,
}: {
  photo: Photo; photos: Photo[]; onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  const { t } = useTranslation();
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><XIcon size={32} /></button>
      <button onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }} disabled={currentIndex === 0} className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-50 z-10"><ArrowLeft size={32} /></button>
      <button onClick={(e) => { e.stopPropagation(); onNavigate('next'); }} disabled={currentIndex === photos.length - 1} className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-50 z-10"><ArrowRight size={32} /></button>
      <div className="max-w-2xl w-full space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className={`w-full h-96 bg-gradient-to-br ${photo.color} rounded-lg flex items-center justify-center relative`}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
            <div className="text-white font-bold text-6xl opacity-15">MTM FOTO</div>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <MapPin size={14} />{photo.gps?.lat.toFixed(4)}, {photo.gps?.lng.toFixed(4)}
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Clock size={14} />{photo.time}
          </div>
        </div>
        <div className="bg-slate-800 text-white p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-400 mb-1">{t('photos.agentLabel')}</p><p className="font-semibold">{photo.agentName}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">{t('photos.customerLabel')}</p><p className="font-semibold">{photo.customerName}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">{t('photos.dateLabel')}</p><p className="font-semibold">{photo.date}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">{t('photos.status')}</p><Badge style={{ backgroundColor: statusColorsBase[photo.status].color + '40', color: statusColorsBase[photo.status].color }} className="font-semibold text-xs">{t(statusColorsBase[photo.status].labelKey)}</Badge></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function PhotosPage() {
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const agents = useMemo(() => Array.from(new Set(mockPhotos.map((p) => p.agentName))).sort(), []);

  const filteredPhotos = useMemo(() => {
    let result = mockPhotos;
    if (dateFilter) result = result.filter((p) => p.date === dateFilter);
    if (agentFilter) result = result.filter((p) => p.agentName === agentFilter);
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (customerSearch) result = result.filter((p) => p.customerName.toLowerCase().includes(customerSearch.toLowerCase()));
    return result;
  }, [dateFilter, agentFilter, statusFilter, customerSearch]);

  const stats = {
    total: mockPhotos.length,
    approved: mockPhotos.filter((p) => p.status === 'approved').length,
    rejected: mockPhotos.filter((p) => p.status === 'rejected').length,
    pending: mockPhotos.filter((p) => p.status === 'pending').length,
  };

  // Comparison: group by customerName, show current vs previous
  const comparisonPairs = useMemo(() => {
    const grouped = new Map<string, Photo[]>();
    mockPhotos.forEach((p) => {
      const existing = grouped.get(p.customerName) || [];
      existing.push(p);
      grouped.set(p.customerName, existing);
    });
    return Array.from(grouped.entries())
      .filter(([, photos]) => photos.length >= 2)
      .map(([customer, photos]) => {
        const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date));
        return { customer, current: sorted[0], previous: sorted[1] };
      });
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAllPending = () => {
    const pendingIds = filteredPhotos.filter((p) => p.status === 'pending').map((p) => p.id);
    setSelectedIds(new Set(pendingIds));
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    // Mock: would call API
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    const idx = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
    if (direction === 'prev' && idx > 0) setSelectedPhoto(filteredPhotos[idx - 1]);
    else if (direction === 'next' && idx < filteredPhotos.length - 1) setSelectedPhoto(filteredPhotos[idx + 1]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('photos.gallery')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500')}
            ><Grid size={16} /> {t('photos.gallery')}</button>
            <button
              onClick={() => setViewMode('compare')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'compare' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500')}
            ><Columns size={16} /> {t('photos.comparison')}</button>
          </div>

          {/* Bulk Mode Toggle */}
          <Button
            variant={bulkMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            className="flex items-center gap-1.5"
            style={bulkMode ? { backgroundColor: '#6C63FF' } : undefined}
          >
            <CheckSquare size={16} /> {t('photos.bulkMode')}
          </Button>

          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download size={16} /> {t('photos.export')} ({stats.total})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Image size={20} />} title={t('photos.totalPhotos')} value={stats.total} color="#6C63FF" />
        <StatCard icon={<Heart size={20} />} title={t('photos.approved')} value={stats.approved} color="#00BFA6" />
        <StatCard icon={<XIcon size={20} />} title={t('photos.rejected')} value={stats.rejected} color="#E74C3C" />
        <StatCard icon={<Clock size={20} />} title={t('photos.pendingLabel')} value={stats.pending} color="#FFC107" />
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && (
        <div className="flex items-center gap-3 p-3 rounded-xl border-2 bg-purple-50 dark:bg-purple-900/20" style={{ borderColor: '#6C63FF' }}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedIds.size} {t('photos.selectedPhotos')}
          </span>
          <button onClick={selectAllPending} className="text-xs font-medium px-2 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors" style={{ color: '#6C63FF' }}>
            {t('photos.selectAllPending')}
          </button>
          <div className="flex-1" />
          <Button size="sm" onClick={() => handleBulkAction('approve')} disabled={selectedIds.size === 0} className="flex items-center gap-1" style={{ backgroundColor: '#00BFA6' }}>
            <ThumbsUp size={14} /> {t('photos.approveBulk')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')} disabled={selectedIds.size === 0} className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50">
            <ThumbsDown size={14} /> {t('photos.rejectBulk')}
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('photos.date')}</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('photos.agent')}</label>
              <div className="relative">
                <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}
                  className="appearance-none w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 pr-10">
                  <option value="">{t('photos.all')}</option>
                  {agents.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('photos.status')}</label>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 pr-10">
                  <option value="all">{t('photos.all')}</option>
                  <option value="approved">{t('photos.approvedStatus')}</option>
                  <option value="rejected">{t('photos.rejectedStatus')}</option>
                  <option value="pending">{t('photos.pendingStatus')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('photos.customerSearch')}</label>
              <input type="text" placeholder={t('photos.customerName')} value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Grid View ===== */}
      {viewMode === 'grid' && (
        filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
                onClick={() => !bulkMode && setSelectedPhoto(photo)}>
                <CardContent className="p-0">
                  {/* Selection checkbox */}
                  {bulkMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(photo.id); }}
                      className="absolute top-3 left-3 z-10 w-6 h-6 rounded flex items-center justify-center bg-white/90 dark:bg-slate-900/90 shadow-sm"
                    >
                      {selectedIds.has(photo.id)
                        ? <CheckSquare size={18} style={{ color: '#6C63FF' }} />
                        : <Square size={18} className="text-gray-400" />}
                    </button>
                  )}

                  <div className={`w-full h-44 bg-gradient-to-br ${photo.color} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
                      <div className="text-white font-bold text-2xl opacity-15">MTM FOTO</div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <MapPin size={10} />{photo.gps?.lat.toFixed(2)}, {photo.gps?.lng.toFixed(2)}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <Clock size={10} />{photo.time}
                    </div>
                    {/* Status badge overlay */}
                    <div className="absolute top-2 right-2">
                      <Badge className="text-[10px] font-bold" style={{ backgroundColor: statusColorsBase[photo.status].color, color: 'white' }}>
                        {t(statusColorsBase[photo.status].labelKey)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{photo.customerName}</p>
                    <p className="text-xs text-gray-500 truncate">{photo.agentName} · {photo.date}</p>
                    {photo.status === 'pending' && !bulkMode && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
                          <ThumbsUp size={12} /> {t('photos.approve')}
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors">
                          <ThumbsDown size={12} /> {t('photos.reject')}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="pt-6"><div className="text-center py-12"><p className="text-gray-500">{t('photos.notFound')}</p></div></CardContent></Card>
        )
      )}

      {/* ===== Comparison View ===== */}
      {viewMode === 'compare' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{t('photos.comparisonInfo')}</p>
          {comparisonPairs.length > 0 ? (
            comparisonPairs.map(({ customer, current, previous }) => (
              <Card key={customer}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Columns size={16} /> {customer}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Current */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-[10px]" style={{ backgroundColor: '#6C63FF20', color: '#6C63FF' }}>{t('photos.lastVisit')}</Badge>
                        <span className="text-xs text-gray-500">{current.date} · {current.time}</span>
                      </div>
                      <div className={`w-full h-48 bg-gradient-to-br ${current.color} rounded-lg relative cursor-pointer hover:ring-2 ring-[var(--primary)] transition-all`}
                        onClick={() => setSelectedPhoto(current)}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
                          <div className="text-white font-bold text-xl opacity-15">MTM FOTO</div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-[10px]">
                          {current.agentName}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="text-[10px] font-bold" style={{ backgroundColor: statusColorsBase[current.status].color, color: 'white' }}>
                            {t(statusColorsBase[current.status].labelKey)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Previous */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-[10px]" style={{ backgroundColor: '#95A5A620', color: '#95A5A6' }}>{t('photos.previousVisit')}</Badge>
                        <span className="text-xs text-gray-500">{previous.date} · {previous.time}</span>
                      </div>
                      <div className={`w-full h-48 bg-gradient-to-br ${previous.color} rounded-lg relative cursor-pointer hover:ring-2 ring-gray-400 transition-all opacity-90`}
                        onClick={() => setSelectedPhoto(previous)}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
                          <div className="text-white font-bold text-xl opacity-15">MTM FOTO</div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-[10px]">
                          {previous.agentName}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="text-[10px] font-bold" style={{ backgroundColor: statusColorsBase[previous.status].color, color: 'white' }}>
                            {t(statusColorsBase[previous.status].labelKey)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="pt-6"><div className="text-center py-12"><p className="text-gray-500">{t('photos.notEnoughData')}</p></div></CardContent></Card>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
