import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { api } from '../../services/api';

interface RoutePoint {
  id: string;
  customer: { name: string; address: string };
  plannedTime: string;
  actualTime?: string;
  status: string;
  orderIndex: number;
}

export default function RouteScreen({ navigation }: any) {
  const [route, setRoute] = useState<any>(null);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRoute = async () => {
    try {
      const { routes } = await api.getMyRoutes();
      if (routes.length > 0) {
        const fullRoute = await api.getRoute(routes[0].id);
        setRoute(fullRoute);
        setPoints(fullRoute.points || []);
      }
    } catch (err: any) {
      if (err.message !== 'SESSION_EXPIRED') {
        // Use mock for demo
        setPoints([
          { id: '1', customer: { name: 'ABC Əczaxanası', address: 'Nizami küç. 45' }, plannedTime: '09:00', status: 'COMPLETED', orderIndex: 1, actualTime: '09:05' },
          { id: '2', customer: { name: 'XYZ Mağazası', address: '28 May küç. 12' }, plannedTime: '10:00', status: 'COMPLETED', orderIndex: 2, actualTime: '10:10' },
          { id: '3', customer: { name: 'MediPlus', address: 'Təbriz küç. 78' }, plannedTime: '11:30', status: 'IN_PROGRESS', orderIndex: 3 },
          { id: '4', customer: { name: 'GreenFarm', address: 'Yasamal küç. 34' }, plannedTime: '13:00', status: 'PENDING', orderIndex: 4 },
          { id: '5', customer: { name: 'SağlamOl', address: 'Nərimanov pr. 56' }, plannedTime: '14:30', status: 'PENDING', orderIndex: 5 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoute(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoute();
    setRefreshing(false);
  };

  const completed = points.filter(p => p.status === 'COMPLETED').length;
  const total = points.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusConfig: Record<string, { color: string; label: string; bg: string }> = {
    COMPLETED: { color: '#00BFA6', label: 'Tamamlandı', bg: '#00BFA610' },
    IN_PROGRESS: { color: '#3498DB', label: 'Davam edir', bg: '#3498DB10' },
    PENDING: { color: '#FFC107', label: 'Gözləyir', bg: '#FFC10710' },
    SKIPPED: { color: '#E74C3C', label: 'Qaçırıldı', bg: '#E74C3C10' },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bugünkü Marşrut</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{completed}/{total}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}%</Text>
      </View>

      {/* Route Points */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        {points.sort((a, b) => a.orderIndex - b.orderIndex).map((point, index) => {
          const config = statusConfig[point.status] || statusConfig.PENDING;
          return (
            <TouchableOpacity
              key={point.id}
              style={styles.pointCard}
              onPress={() => {
                if (point.status === 'PENDING' || point.status === 'IN_PROGRESS') {
                  navigation.navigate('Visit', { point });
                }
              }}
              activeOpacity={0.7}
            >
              {/* Order + Status Line */}
              <View style={styles.pointLeft}>
                <View style={[styles.orderCircle, { backgroundColor: config.color }]}>
                  <Text style={styles.orderText}>{index + 1}</Text>
                </View>
                {index < points.length - 1 && <View style={[styles.line, { backgroundColor: config.color + '40' }]} />}
              </View>

              {/* Content */}
              <View style={styles.pointContent}>
                <View style={styles.pointHeader}>
                  <Text style={styles.customerName}>{point.customer.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
                <Text style={styles.address}>{point.customer.address}</Text>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>⏰ Plan: {point.plannedTime}</Text>
                  {point.actualTime && <Text style={styles.actualTime}>✓ Faktiki: {point.actualTime}</Text>}
                </View>

                {/* Action button for pending/in-progress */}
                {(point.status === 'PENDING' || point.status === 'IN_PROGRESS') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: point.status === 'IN_PROGRESS' ? '#E74C3C' : '#6C63FF' }]}
                    onPress={() => navigation.navigate('Visit', { point })}
                  >
                    <Text style={styles.actionBtnText}>
                      {point.status === 'IN_PROGRESS' ? 'Check-out' : 'Check-in'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a2e' },
  progressBadge: { backgroundColor: '#6C63FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  progressText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: '#00BFA6', borderRadius: 3 },
  progressPct: { fontSize: 14, fontWeight: '600', color: '#6b7280', width: 40, textAlign: 'right' },
  list: { flex: 1, paddingHorizontal: 20 },
  pointCard: { flexDirection: 'row', marginBottom: 4 },
  pointLeft: { alignItems: 'center', width: 40, marginRight: 12 },
  orderCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  orderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  line: { width: 2, flex: 1, marginTop: 4, marginBottom: 4 },
  pointContent: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  pointHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  address: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeLabel: { fontSize: 12, color: '#9ca3af' },
  actualTime: { fontSize: 12, color: '#00BFA6', fontWeight: '500' },
  actionBtn: { marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
