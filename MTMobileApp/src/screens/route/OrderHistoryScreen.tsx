import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, RefreshControl, Platform,
} from 'react-native';

interface Order {
  id: string;
  date: string;
  customer: string;
  itemCount: number;
  totalAmount: number;
  status: 'delivered' | 'pending' | 'cancelled';
}

const mockOrders: Order[] = [
  { id: 'ORD-001', date: '2026-03-17', customer: 'ABC Əczaxanası', itemCount: 5, totalAmount: 125.50, status: 'delivered' },
  { id: 'ORD-002', date: '2026-03-17', customer: 'MediPlus', itemCount: 3, totalAmount: 87.20, status: 'pending' },
  { id: 'ORD-003', date: '2026-03-16', customer: 'XYZ Mağazası', itemCount: 8, totalAmount: 234.00, status: 'delivered' },
  { id: 'ORD-004', date: '2026-03-16', customer: 'GreenFarm', itemCount: 2, totalAmount: 45.80, status: 'cancelled' },
  { id: 'ORD-005', date: '2026-03-15', customer: 'SağlamOl', itemCount: 6, totalAmount: 178.90, status: 'delivered' },
  { id: 'ORD-006', date: '2026-03-15', customer: 'PharmaZone', itemCount: 4, totalAmount: 156.00, status: 'delivered' },
  { id: 'ORD-007', date: '2026-03-14', customer: 'NovaMed', itemCount: 7, totalAmount: 312.50, status: 'pending' },
  { id: 'ORD-008', date: '2026-03-14', customer: 'Dərman Evi', itemCount: 3, totalAmount: 67.30, status: 'delivered' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  delivered: { color: '#00BFA6', bg: '#00BFA610', label: 'Çatdırıldı' },
  pending: { color: '#FFC107', bg: '#FFC10710', label: 'Gözləyir' },
  cancelled: { color: '#E74C3C', bg: '#E74C3C10', label: 'Ləğv edildi' },
};

export default function OrderHistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'delivered' | 'pending' | 'cancelled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === 'all' ? mockOrders : mockOrders.filter(o => o.status === filter);
  const totalRevenue = mockOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sifariş Tarixçəsi</Text>
        <View style={styles.revenueBadge}>
          <Text style={styles.revenueText}>₼{totalRevenue.toFixed(0)}</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {[
          { key: 'all', label: `Hamısı (${mockOrders.length})` },
          { key: 'delivered', label: `Çatdırıldı (${mockOrders.filter(o => o.status === 'delivered').length})` },
          { key: 'pending', label: `Gözləyir (${mockOrders.filter(o => o.status === 'pending').length})` },
          { key: 'cancelled', label: `Ləğv (${mockOrders.filter(o => o.status === 'cancelled').length})` },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key as any)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }} />}
      >
        {filtered.map(order => {
          const config = statusConfig[order.status];
          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
              <Text style={styles.customerName}>{order.customer}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderMeta}>📅 {order.date} · 📦 {order.itemCount} məhsul</Text>
                <Text style={styles.orderAmount}>₼{order.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  revenueBadge: { backgroundColor: '#00BFA6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  revenueText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filters: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#6C63FF' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#6C63FF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  customerName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMeta: { fontSize: 12, color: '#6b7280' },
  orderAmount: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
});
