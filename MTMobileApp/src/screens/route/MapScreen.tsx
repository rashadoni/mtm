import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Linking, Platform, PermissionsAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

interface RoutePoint {
  id: string;
  customer: string;
  address: string;
  lat: number;
  lng: number;
  status: 'completed' | 'current' | 'pending';
  time: string;
}

const mockPoints: RoutePoint[] = [
  { id: '1', customer: 'ABC Əczaxanası', address: 'Nizami küç. 45', lat: 40.3793, lng: 49.8310, status: 'completed', time: '09:00' },
  { id: '2', customer: 'XYZ Mağazası', address: '28 May küç. 12', lat: 40.3830, lng: 49.8240, status: 'completed', time: '10:00' },
  { id: '3', customer: 'MediPlus', address: 'Təbriz küç. 78', lat: 40.3920, lng: 49.8170, status: 'current', time: '11:30' },
  { id: '4', customer: 'GreenFarm', address: 'Yasamal küç. 34', lat: 40.3980, lng: 49.8100, status: 'pending', time: '13:00' },
  { id: '5', customer: 'SağlamOl', address: 'Nərimanov pr. 56', lat: 40.4070, lng: 49.8200, status: 'pending', time: '14:30' },
];

const STATUS_COLORS = {
  completed: '#00BFA6',
  current: '#6C63FF',
  pending: '#FFC107',
};

function buildMapHtml(points: RoutePoint[], userLat?: number, userLng?: number) {
  const markers = points.map(p => {
    const color = STATUS_COLORS[p.status];
    return `L.circleMarker([${p.lat}, ${p.lng}], {
      radius: 10, fillColor: '${color}', color: '#fff', weight: 2, fillOpacity: 1
    }).addTo(map).bindPopup('<b>${p.customer}</b><br>${p.address}<br>${p.time}');`;
  }).join('\n');

  const routeCoords = points.map(p => `[${p.lat}, ${p.lng}]`).join(',');
  const center = points.length > 0
    ? `[${points.reduce((s, p) => s + p.lat, 0) / points.length}, ${points.reduce((s, p) => s + p.lng, 0) / points.length}]`
    : '[40.4093, 49.8671]';

  const userMarker = userLat && userLng
    ? `L.marker([${userLat}, ${userLng}], {
        icon: L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.3)"></div>' })
      }).addTo(map).bindPopup('Siz buradasınız');`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView(${center}, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.polyline([${routeCoords}], { color: '#6C63FF', weight: 3, dashArray: '10 5' }).addTo(map);
    ${markers}
    ${userMarker}
    map.fitBounds([${routeCoords}], { padding: [30, 30] });
  </script>
</body>
</html>`;
}

export default function MapScreen({ navigation }: any) {
  const [points] = useState(mockPoints);
  const [distance, setDistance] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    calculateDistance();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'GPS İcazəsi',
            message: 'Xəritədə yerinizi göstərmək üçün GPS icazəsi lazımdır',
            buttonPositive: 'İcazə ver',
            buttonNegative: 'Ləğv et',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      } catch { return; }
    }

    Geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const calculateDistance = () => {
    const pending = points.filter(p => p.status !== 'completed');
    let d = 0;
    for (let i = 0; i < pending.length - 1; i++) {
      d += haversine(pending[i].lat, pending[i].lng, pending[i + 1].lat, pending[i + 1].lng);
    }
    setDistance(d);
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}&dirflg=d`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  };

  const navigateToNext = () => {
    const next = points.find(p => p.status === 'current') || points.find(p => p.status === 'pending');
    if (next) openInMaps(next.lat, next.lng, next.customer);
  };

  const completed = points.filter(p => p.status === 'completed').length;
  const total = points.length;

  const mapHtml = buildMapHtml(points, userLocation?.lat, userLocation?.lng);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map via WebView + Leaflet */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity style={styles.navButton} onPress={navigateToNext}>
          <Text style={styles.navButtonText}>🧭 Növbəti nöqtəyə get</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completed}/{total}</Text>
          <Text style={styles.statLabel}>Tamamlandı</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
          <Text style={styles.statLabel}>Qalan məsafə</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{total - completed}</Text>
          <Text style={styles.statLabel}>Qalan nöqtə</Text>
        </View>
      </View>

      {/* Point List */}
      <ScrollView style={styles.list}>
        {points.map((point, idx) => (
          <TouchableOpacity key={point.id} style={styles.pointCard} onPress={() => openInMaps(point.lat, point.lng, point.customer)}>
            <View style={[styles.pointDot, { backgroundColor: STATUS_COLORS[point.status] }]}>
              <Text style={styles.pointDotText}>
                {point.status === 'completed' ? '✓' : idx + 1}
              </Text>
            </View>
            <View style={styles.pointInfo}>
              <Text style={[styles.pointName, point.status === 'completed' && styles.pointDone]}>{point.customer}</Text>
              <Text style={styles.pointAddress}>{point.address}</Text>
              <Text style={styles.pointTime}>⏰ {point.time}</Text>
            </View>
            <View style={styles.pointAction}>
              {point.status === 'current' && <Text style={styles.currentBadge}>📍 İndiki</Text>}
              {point.status === 'pending' && <Text style={styles.openMaps}>🗺️</Text>}
              {point.status === 'completed' && <Text style={styles.completedIcon}>✅</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  mapContainer: { height: 280, position: 'relative' },
  map: { flex: 1 },
  navButton: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: '#6C63FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  navButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, paddingHorizontal: 16 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  list: { flex: 1, paddingHorizontal: 16 },
  pointCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  pointDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pointDotText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pointInfo: { flex: 1 },
  pointName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  pointDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  pointAddress: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  pointTime: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  pointAction: { marginLeft: 8 },
  currentBadge: { fontSize: 12, fontWeight: '600', color: '#6C63FF' },
  openMaps: { fontSize: 20 },
  completedIcon: { fontSize: 18 },
});
