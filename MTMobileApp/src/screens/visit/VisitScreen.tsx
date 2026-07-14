import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../../services/api';
import { wsService } from '../../services/websocket';

export default function VisitScreen({ route, navigation }: any) {
  const { point } = route.params;
  const [isCheckedIn, setIsCheckedIn] = useState(point.status === 'IN_PROGRESS');
  const [visitId, setVisitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [checkInTime, setCheckInTime] = useState<Date | null>(
    isCheckedIn ? new Date() : null
  );

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - checkInTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // TODO: Get real GPS from device
      const lat = 40.3793 + Math.random() * 0.01;
      const lng = 49.8310 + Math.random() * 0.01;

      const result = await api.checkIn(point.customer?.id || point.id, lat, lng).catch(() => {
        // Mock for demo
        return { id: `visit-${Date.now()}` };
      });

      setVisitId(result.id);
      setIsCheckedIn(true);
      setCheckInTime(new Date());

      // Notify via WebSocket
      wsService.sendCheckIn(point.customer?.id || point.id, lat, lng);
    } catch (err: any) {
      Alert.alert('Xəta', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    Alert.alert(
      'Check-out',
      `${point.customer?.name || point.customerName} müştərisindən çıxmaq istəyirsiniz?`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Check-out', style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const lat = 40.3793 + Math.random() * 0.01;
              const lng = 49.8310 + Math.random() * 0.01;

              if (visitId) {
                await api.checkOut(visitId, lat, lng).catch(() => {});
                wsService.sendCheckOut(visitId, lat, lng);
              }

              Alert.alert('Uğurlu', `Ziyarət tamamlandı — ${formatTimer(timer)}`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerIcon}>
            <Text style={styles.customerIconText}>
              {(point.customer?.name || point.customerName || '?').charAt(0)}
            </Text>
          </View>
          <Text style={styles.customerName}>{point.customer?.name || point.customerName}</Text>
          <Text style={styles.customerAddress}>{point.customer?.address || point.address}</Text>
          <Text style={styles.plannedTime}>⏰ Plan: {point.plannedTime}</Text>
        </View>

        {/* Timer */}
        {isCheckedIn && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Ziyarət müddəti</Text>
            <Text style={styles.timerValue}>{formatTimer(timer)}</Text>
            <View style={styles.timerDot} />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!isCheckedIn ? (
            <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.btnIcon}>📍</Text>
                  <Text style={styles.btnText}>Check-in</Text>
                  <Text style={styles.btnSubtext}>GPS ilə qeydiyyat</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {/* Action buttons while checked in */}
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('Camera', { visitId })}>
                  <Text style={styles.gridIcon}>📸</Text>
                  <Text style={styles.gridLabel}>Foto çək</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('Order')}>
                  <Text style={styles.gridIcon}>📋</Text>
                  <Text style={styles.gridLabel}>Sifariş</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('Notes', { visitId })}>
                  <Text style={styles.gridIcon}>📝</Text>
                  <Text style={styles.gridLabel}>Qeyd</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('Stock')}>
                  <Text style={styles.gridIcon}>📦</Text>
                  <Text style={styles.gridLabel}>Stok</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.checkOutBtn} onPress={handleCheckOut} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.btnIcon}>🏁</Text>
                    <Text style={[styles.btnText, { color: '#fff' }]}>Check-out</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  content: { padding: 20 },
  customerCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  customerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  customerIconText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  customerName: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  customerAddress: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  plannedTime: { fontSize: 13, color: '#9ca3af' },
  timerCard: { backgroundColor: '#6C63FF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  timerLabel: { color: '#fff', fontSize: 14, opacity: 0.8, marginBottom: 4 },
  timerValue: { color: '#fff', fontSize: 48, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00BFA6', marginTop: 8 },
  actions: { gap: 16 },
  checkInBtn: { backgroundColor: '#6C63FF', borderRadius: 20, padding: 24, alignItems: 'center' },
  checkOutBtn: { backgroundColor: '#E74C3C', borderRadius: 20, padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnIcon: { fontSize: 32, marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  btnSubtext: { color: '#fff', fontSize: 13, opacity: 0.7, marginTop: 4 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', width: '47%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  gridIcon: { fontSize: 28, marginBottom: 8 },
  gridLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
});
