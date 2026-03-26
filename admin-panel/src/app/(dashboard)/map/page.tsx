'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  MapPin, Clock, Battery, RefreshCw, Eye, EyeOff,
  Radio, User, Navigation, ExternalLink, Play, Pause,
  SkipBack, SkipForward, Layers, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LiveFeed } from '@/components/layout/live-feed';
import { useRealtimeStore } from '@/store/realtime';
import { cn } from '@/lib/utils';

const LeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

interface Agent {
  id: string;
  name: string;
  status: 'checkin' | 'onroute' | 'delayed' | 'offline';
  lastSeen: string;
  battery: number;
  latitude: number;
  longitude: number;
  speed?: number;
}

// Note: statusConfig labels are dynamically set in the component using translations

const geofenceCircles = [
  { center: [40.3850, 49.8300] as [number, number], radius: 2000, color: '#6C63FF' },
  { center: [40.4100, 49.8150] as [number, number], radius: 1500, color: '#00BFA6' },
  { center: [40.3700, 49.8400] as [number, number], radius: 1800, color: '#FFC107' },
];

// Mock route replay data — agent's path over the day
// Note: events use translation keys that will be resolved dynamically in the component
const mockReplayData: { lat: number; lng: number; time: string; event?: string; eventKey?: string }[] = [
  { lat: 40.3793, lng: 49.8310, time: '09:00', eventKey: 'map.dayStarted' },
  { lat: 40.3810, lng: 49.8290, time: '09:15' },
  { lat: 40.3830, lng: 49.8240, time: '09:32', event: 'Check-in: XYZ Mağazası' },
  { lat: 40.3850, lng: 49.8220, time: '09:55' },
  { lat: 40.3880, lng: 49.8200, time: '10:10' },
  { lat: 40.3920, lng: 49.8170, time: '10:30', event: 'Check-in: MediPlus' },
  { lat: 40.3950, lng: 49.8150, time: '11:00' },
  { lat: 40.3970, lng: 49.8130, time: '11:20' },
  { lat: 40.3980, lng: 49.8100, time: '11:45', event: 'Check-in: GreenFarm' },
  { lat: 40.4010, lng: 49.8120, time: '12:15' },
  { lat: 40.4040, lng: 49.8160, time: '12:40' },
  { lat: 40.4070, lng: 49.8200, time: '13:05', event: 'Check-in: SağlamOl' },
  { lat: 40.4100, lng: 49.8180, time: '13:30' },
  { lat: 40.4120, lng: 49.8150, time: '13:50' },
  { lat: 40.4140, lng: 49.8080, time: '14:15', event: 'Check-in: MedService' },
  { lat: 40.4130, lng: 49.8100, time: '14:45' },
  { lat: 40.4110, lng: 49.8130, time: '15:00', eventKey: 'map.endedDay' },
];

function MapLoadingSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">{t('map.loading')}</div>
    </div>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const color = level > 50 ? 'text-green-500' : level > 20 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className="flex items-center gap-1">
      <Battery size={12} className={color} />
      <span className={`text-xs font-medium ${color}`}>{Math.round(level)}%</span>
    </div>
  );
}

function getEventDisplay(event?: string, eventKey?: string, t?: (key: string) => string): string {
  if (eventKey && t) {
    return t(eventKey);
  }
  return event || '';
}

// Generate mock heatmap data
function generateHeatmapData(agents: Agent[]): [number, number, number][] {
  const heatmapData: [number, number, number][] = [];

  // Add agent positions with base intensity
  agents.forEach((agent) => {
    heatmapData.push([agent.latitude, agent.longitude, 0.7]);
  });

  // Add ~30 random visit density points across Baku
  // Baku bounds: lat 40.37-40.43, lng 49.80-49.88
  for (let i = 0; i < 30; i++) {
    const lat = 40.37 + Math.random() * (40.43 - 40.37);
    const lng = 49.80 + Math.random() * (49.88 - 49.80);
    const intensity = 0.3 + Math.random() * (1.0 - 0.3); // 0.3-1.0
    heatmapData.push([lat, lng, intensity]);
  }

  return heatmapData;
}

export default function MapPage() {
  const { t } = useTranslation();

  const statusConfig: Record<string, { label: string; color: string }> = {
    checkin: { label: t('map.checkin'), color: '#00BFA6' },
    onroute: { label: t('map.onRoute'), color: '#3498DB' },
    delayed: { label: t('map.delayed'), color: '#E74C3C' },
    offline: { label: t('map.offline'), color: '#95A5A6' },
  };

  const { agents: liveAgents, isSimulating, startSimulation, lastUpdate } = useRealtimeStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkin' | 'onroute' | 'delayed' | 'offline'>('all');
  const [showGeofences, setShowGeofences] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(true);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const flyCounterRef = useRef(0);

  // Route Replay State
  const [replayMode, setReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start realtime simulation
  useEffect(() => {
    if (!isSimulating) startSimulation();
  }, [isSimulating, startSimulation]);

  // Replay timer
  useEffect(() => {
    if (isPlaying && replayMode) {
      replayIntervalRef.current = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= mockReplayData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, [isPlaying, replayMode, replaySpeed]);

  // Map live agents to Agent interface
  const mockAgents: Agent[] = liveAgents.map((la) => ({
    id: la.id,
    name: la.name,
    status: la.status === 'offline' ? 'offline' : la.status === 'idle' ? 'delayed' : la.speed > 10 ? 'onroute' : 'checkin',
    lastSeen: la.status === 'offline' ? `45 ${t('map.minutesAgo')}` : la.speed > 0 ? `${la.speed} km/s` : t('map.now'),
    battery: la.battery,
    latitude: la.lat,
    longitude: la.lng,
    speed: la.speed,
  }));

  const filteredAgents = filterStatus === 'all'
    ? mockAgents
    : mockAgents.filter((a) => a.status === filterStatus);

  const statusCounts = {
    all: mockAgents.length,
    checkin: mockAgents.filter((a) => a.status === 'checkin').length,
    onroute: mockAgents.filter((a) => a.status === 'onroute').length,
    delayed: mockAgents.filter((a) => a.status === 'delayed').length,
    offline: mockAgents.filter((a) => a.status === 'offline').length,
  };

  // Replay route points up to current index
  const replayRoutePoints = replayMode
    ? mockReplayData.slice(0, replayIndex + 1).map((p) => [p.lat, p.lng] as [number, number])
    : [];

  const replayMarker = replayMode && mockReplayData[replayIndex]
    ? [{
        id: 'replay-agent',
        lat: mockReplayData[replayIndex].lat,
        lng: mockReplayData[replayIndex].lng,
        name: t('map.replayAgent'),
        status: 'onroute' as const,
        battery: 85,
        lastSeen: mockReplayData[replayIndex].time,
      }]
    : [];

  const mapMarkers = replayMode
    ? replayMarker
    : filteredAgents.map((agent) => ({
        id: agent.id,
        lat: agent.latitude,
        lng: agent.longitude,
        name: agent.name,
        status: agent.status,
        battery: agent.battery,
        lastSeen: agent.lastSeen,
      }));

  const heatmapData = generateHeatmapData(mockAgents);

  const lastUpdateStr = lastUpdate
    ? lastUpdate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  const handleToggleReplay = () => {
    if (replayMode) {
      setReplayMode(false);
      setIsPlaying(false);
      setReplayIndex(0);
    } else {
      setReplayMode(true);
      setReplayIndex(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('map.title')}</h1>
          <div className="flex items-center gap-2 mt-1">
            {replayMode ? (
              <>
                <Activity size={12} className="text-orange-500" />
                <p className="text-sm text-orange-500 font-medium">
                  {t('map.replayMode')} · {mockReplayData[replayIndex]?.time || '--:--'}
                </p>
              </>
            ) : (
              <>
                <Radio size={12} className="text-green-500 animate-pulse" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('map.liveTracking')} · {t('map.lastUpdate')}: {lastUpdateStr}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={replayMode ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleReplay}
            className="flex items-center gap-1"
            style={replayMode ? { backgroundColor: '#F59E0B' } : undefined}
          >
            <Activity size={14} />
            {replayMode ? t('map.backToLive') : t('map.replay')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLiveFeed(!showLiveFeed)}
            className="flex items-center gap-1"
          >
            <Radio size={14} />
            {showLiveFeed ? t('map.hideFeed') : t('map.showFeed')}
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      {/* Replay Controls */}
      {replayMode && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setReplayIndex(0); setIsPlaying(false); }}
              className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors"
              title={t('map.restart')}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#F59E0B' }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={() => setReplayIndex(Math.min(replayIndex + 1, mockReplayData.length - 1))}
              className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors"
              title={t('map.forward')}
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={mockReplayData.length - 1}
              value={replayIndex}
              onChange={(e) => { setReplayIndex(parseInt(e.target.value)); setIsPlaying(false); }}
              className="w-full h-2 bg-orange-200 dark:bg-orange-800 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#F59E0B' }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-orange-600">{mockReplayData[0]?.time}</span>
              <span className="text-[10px] text-orange-600 font-bold">
                {mockReplayData[replayIndex]?.time}
                {(mockReplayData[replayIndex]?.event || mockReplayData[replayIndex]?.eventKey) && ` — ${getEventDisplay(mockReplayData[replayIndex]?.event, mockReplayData[replayIndex]?.eventKey, t)}`}
              </span>
              <span className="text-[10px] text-orange-600">{mockReplayData[mockReplayData.length - 1]?.time}</span>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-orange-600">{t('map.speed')}:</span>
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setReplaySpeed(speed)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded font-medium transition-colors',
                  replaySpeed === speed
                    ? 'bg-orange-500 text-white'
                    : 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-800/30'
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Buttons (hide during replay) */}
      {!replayMode && (
        <div className="flex gap-2 flex-wrap">
          {(['all', 'checkin', 'onroute', 'delayed', 'offline'] as const).map((status) => {
            const labels = {
              all: `${t('common.all')} (${statusCounts.all})`,
              checkin: `${t('map.checkin')} (${statusCounts.checkin})`,
              onroute: `${t('map.onRoute')} (${statusCounts.onroute})`,
              delayed: `${t('map.delayed')} (${statusCounts.delayed})`,
              offline: `${t('map.offline')} (${statusCounts.offline})`,
            };

            return (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setFilterStatus(status); setSelectedAgent(null); setFlyToId(null); }}
                style={filterStatus === status ? { backgroundColor: status === 'all' ? 'var(--primary)' : ((statusConfig as any)[status]?.color || 'var(--primary)') } : undefined}
                className={cn(filterStatus === status && 'text-white border-transparent')}
              >
                {labels[status]}
              </Button>
            );
          })}

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGeofences(!showGeofences)}
              className="flex items-center gap-1"
            >
              {showGeofences ? <Eye size={14} /> : <EyeOff size={14} />}
              {t('map.geofence')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="flex items-center gap-1"
            >
              <Layers size={14} />
              {t('map.heatmap')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Area */}
        <div className={showLiveFeed && !replayMode ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Map */}
            <div className={replayMode ? 'lg:col-span-4' : 'lg:col-span-3'}>
              <Card className="overflow-hidden">
                <CardContent className="pt-0 p-0">
                  <LeafletMap
                    markers={mapMarkers}
                    center={
                      replayMode && mockReplayData[replayIndex]
                        ? [mockReplayData[replayIndex].lat, mockReplayData[replayIndex].lng]
                        : [40.3950, 49.8250]
                    }
                    zoom={replayMode ? 14 : 13}
                    onMarkerClick={(marker) => {
                      if (!replayMode) {
                        const agent = mockAgents.find((a) => a.id === marker.id);
                        if (agent) {
                          setSelectedAgent(agent);
                          flyCounterRef.current++;
                          setFlyToId(agent.id + '-' + flyCounterRef.current);
                        }
                      }
                    }}
                    selectedMarkerId={selectedAgent?.id}
                    flyToId={flyToId}
                    height={replayMode ? '500px' : '550px'}
                    geofenceCircles={showGeofences ? geofenceCircles : []}
                    showRoute={replayMode}
                    routePoints={replayRoutePoints}
                    heatmapData={heatmapData}
                    showHeatmap={showHeatmap}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Agent List Sidebar (hidden during replay) */}
            {!replayMode && (
              <div className="lg:col-span-1 space-y-4">
                {/* Status Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-gray-500">{t('common.status')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{config.label}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {statusCounts[status as keyof typeof statusCounts]}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Agents List */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('map.agents')} ({filteredAgents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 max-h-[360px] overflow-y-auto pt-0">
                    {filteredAgents.map((agent) => {
                      const config = statusConfig[agent.status];
                      return (
                        <div
                          key={agent.id}
                          onClick={() => {
                            setSelectedAgent(agent);
                            flyCounterRef.current++;
                            setFlyToId(agent.id + '-' + flyCounterRef.current);
                          }}
                          className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedAgent?.id === agent.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-300 dark:ring-indigo-700'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                style={{ backgroundColor: config.color }}
                              >
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {agent.speed && agent.speed > 0 && (
                                <Navigation size={8} className="absolute -bottom-0.5 -right-0.5 text-blue-500" style={{ transform: `rotate(${Math.random() * 360}deg)` }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{agent.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <BatteryIcon level={agent.battery} />
                                {agent.speed !== undefined && agent.speed > 0 && (
                                  <span className="text-[10px] text-blue-500">{agent.speed} km/s</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Live Feed Sidebar */}
        {showLiveFeed && !replayMode && (
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-gray-500">{t('map.liveFeed')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <LiveFeed maxItems={12} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Replay Event Timeline */}
      {replayMode && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={16} style={{ color: '#F59E0B' }} />
              {t('map.dayEvents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mockReplayData
                .map((point, idx) => ({ ...point, idx }))
                .filter((p) => p.event)
                .map((point) => (
                  <button
                    key={point.idx}
                    onClick={() => { setReplayIndex(point.idx); setIsPlaying(false); }}
                    className={cn(
                      'flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all',
                      replayIndex >= point.idx
                        ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-700'
                    )}
                  >
                    <p className="text-[10px] font-bold text-orange-600">{point.time}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{getEventDisplay(point.event, point.eventKey, t)}</p>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Agent Details */}
      {selectedAgent && !replayMode && (
        <Card className="border-l-4" style={{ borderLeftColor: statusConfig[selectedAgent.status].color }}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: statusConfig[selectedAgent.status].color }}
                >
                  {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedAgent.name}</h3>
                  <Badge
                    style={{
                      backgroundColor: statusConfig[selectedAgent.status].color + '20',
                      color: statusConfig[selectedAgent.status].color,
                    }}
                  >
                    {statusConfig[selectedAgent.status].label}
                  </Badge>
                </div>
              </div>
              <Link href={`/agents/agent-001`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ExternalLink size={14} />
                  {t('map.profile')}
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('map.battery')}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedAgent.battery > 50 ? 'bg-green-500' : selectedAgent.battery > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedAgent.battery}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{Math.round(selectedAgent.battery)}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('map.speed')}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedAgent.speed || 0} km/s</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('map.coordinates')}</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {selectedAgent.latitude.toFixed(4)}, {selectedAgent.longitude.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('map.lastActivity')}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedAgent.lastSeen}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
