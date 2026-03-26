'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: 'checkin' | 'onroute' | 'delayed' | 'offline';
  battery: number;
  lastSeen: string;
  popupContent?: string;
}

export interface LeafletMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string;
  showRoute?: boolean;
  routePoints?: [number, number][];
  height?: string;
  geofenceCircles?: { center: [number, number]; radius: number; color: string }[];
  heatmapData?: [number, number, number][];
  showHeatmap?: boolean;
  flyToId?: string | null;
}

const statusColors: Record<string, string> = {
  checkin: '#00BFA6',
  onroute: '#3498DB',
  delayed: '#E74C3C',
  offline: '#95A5A6',
};

export default function LeafletMap({
  markers,
  center = [40.4093, 49.8671],
  zoom = 13,
  onMarkerClick,
  selectedMarkerId,
  showRoute = false,
  routePoints = [],
  height = '600px',
  geofenceCircles = [],
  heatmapData = [],
  showHeatmap = false,
  flyToId = null,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const lRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const geofencesRef = useRef<any[]>([]);
  const heatRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const lastFlyIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  // Update markers — only redraw icons, don't move map
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    markers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId;
      const color = statusColors[marker.status] || '#95A5A6';
      const size = isSelected ? 44 : 30;

      const initials = marker.name.split(' ').map(n => n[0]).join('').substring(0, 2);

      const icon = L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 10px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:${isSelected ? 14 : 11}px;font-weight:700;
          ${isSelected ? 'animation:pulse 1.5s infinite;box-shadow:0 0 0 6px ' + color + '40;' : ''}
        ">${initials}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: '',
      });

      const m = L.marker([marker.lat, marker.lng], { icon }).addTo(map);
      m.bindPopup(`
        <div style="font-size:13px;min-width:160px;line-height:1.6">
          <strong style="font-size:14px">${marker.name}</strong><br/>
          <span style="color:${color};font-weight:600">${marker.status}</span><br/>
          🔋 ${Math.round(marker.battery)}%<br/>
          📍 ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}<br/>
          🕐 ${marker.lastSeen}
        </div>
      `);
      m.on('click', () => { onMarkerClick?.(marker); m.openPopup(); });
      markersRef.current.push(m);
    });
  }, [markers, selectedMarkerId, onMarkerClick]);

  // Update route polyline
  const updateRoute = useCallback(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L) return;

    if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null; }

    if (showRoute && routePoints.length > 1) {
      const coords = routePoints.map((p) => `${p[1]},${p[0]}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
        .then((r) => r.json())
        .then((data) => {
          if (!mapRef.current || !data.routes?.[0]) return;
          const roadCoords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          const pl = L.polyline(roadCoords, { color: '#6C63FF', weight: 4, opacity: 0.85 }).addTo(map);
          polylineRef.current = pl;
          map.fitBounds(pl.getBounds(), { padding: [50, 50] });
        })
        .catch(() => {
          if (!mapRef.current) return;
          const pl = L.polyline(routePoints, { color: '#6C63FF', weight: 3, opacity: 0.8, dashArray: '5, 5' }).addTo(map);
          polylineRef.current = pl;
          map.fitBounds(L.latLngBounds(routePoints), { padding: [50, 50] });
        });
    }
  }, [showRoute, routePoints]);

  // Update geofences
  const updateGeofences = useCallback(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L) return;

    geofencesRef.current.forEach((c) => map.removeLayer(c));
    geofencesRef.current = [];

    geofenceCircles.forEach((gf) => {
      const circle = L.circle(gf.center, { color: gf.color, fillColor: gf.color, fillOpacity: 0.1, weight: 2, radius: gf.radius }).addTo(map);
      geofencesRef.current.push(circle);
    });
  }, [geofenceCircles]);

  // Update heatmap
  const updateHeatmap = useCallback(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L) return;

    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }

    if (showHeatmap && heatmapData?.length > 0) {
      const hl = (L as any).heatLayer(heatmapData, { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.0: '#0000FF', 0.33: '#00FF00', 0.66: '#FFFF00', 1.0: '#FF0000' } }).addTo(map);
      heatRef.current = hl;
    }
  }, [showHeatmap, heatmapData]);

  // ===== INIT MAP ONCE =====
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let cancelled = false;

    import('leaflet').then(async (L) => {
      try { await import('leaflet.heat'); } catch { /* heatmap optional */ }

      if (cancelled || !mapContainer.current || mapRef.current) return;

      lRef.current = L;

      const map = L.map(mapContainer.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      const isDark = document.documentElement.classList.contains('dark');
      tileRef.current = L.tileLayer(
        isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
      ).addTo(map);

      // Dark mode observer
      const obs = new MutationObserver(() => {
        if (!mapRef.current || !lRef.current) return;
        const dark = document.documentElement.classList.contains('dark');
        if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
        tileRef.current = lRef.current.tileLayer(
          dark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
        ).addTo(mapRef.current);
      });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      // Pulse animation
      if (!document.getElementById('pulse-animation')) {
        const s = document.createElement('style');
        s.id = 'pulse-animation';
        s.textContent = '@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.8}}';
        document.head.appendChild(s);
      }

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);

      setReady(true);
    }).catch((err) => {
      console.error('Leaflet init error:', err);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        lRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when data changes (no map movement)
  useEffect(() => {
    if (!ready) return;
    updateMarkers();
  }, [ready, updateMarkers]);

  useEffect(() => {
    if (!ready) return;
    updateRoute();
  }, [ready, updateRoute]);

  useEffect(() => {
    if (!ready) return;
    updateGeofences();
  }, [ready, updateGeofences]);

  useEffect(() => {
    if (!ready) return;
    updateHeatmap();
  }, [ready, updateHeatmap]);

  // Fly to agent when flyToId changes
  // flyToId format: "agentId" or "agentId-timestamp" for re-triggering same agent
  useEffect(() => {
    if (!ready || !mapRef.current || !flyToId) return;
    if (flyToId === lastFlyIdRef.current) return;
    lastFlyIdRef.current = flyToId;

    const agentId = flyToId.split('-')[0];
    const marker = markers.find(m => m.id === agentId);
    if (marker) {
      mapRef.current.flyTo([marker.lat, marker.lng], 16, { duration: 1.2 });
    }
  }, [ready, flyToId, markers]);

  return (
    <div
      ref={mapContainer}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
    />
  );
}
