import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { ApiError, api } from '../../services/api';
import { createOperationId, offlineService } from '../../services/offline';
import { useAuthStore } from '../../store/auth';

const labels: Record<string, string> = {
  PHOTO: 'Foto sübut',
  PRESENTATION: 'Təqdimat',
  STOCK_CHECK: 'Stok yoxlaması',
  VISIT_NOTE: 'Ziyarət qeydi',
  CHECKLIST: 'Yoxlama siyahısı',
  FEEDBACK: 'Rəy',
  NEXT_ACTION: 'Növbəti addım',
};
function currentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    ),
  );
}

export default function VisitScreen({ route, navigation }: any) {
  const { point, routeId } = route.params;
  const user = useAuthStore(state => state.user);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setError('');
      let id = visitId;
      if (!id) {
        const active = await api.getActiveVisits();
        id =
          active.find(
            item =>
              item.routePointId === point.id ||
              (item.customerId === point.customer?.id &&
                item.routeId === routeId),
          )?.id || null;
        if (id) setVisitId(id);
      }
      if (id) setWorkspace(await api.getVisitWorkspace(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ziyarət yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [point.id, point.customer?.id, routeId, visitId]);
  useEffect(() => {
    void offlineService.init();
    void load();
    const unsub = navigation.addListener('focus', () => void load());
    return unsub;
  }, [load, navigation]);
  const requirements =
    workspace?.visit?.requirementSnapshot?.requirements || [];
  const completed = useMemo(() => {
    const results = workspace?.visit?.actionResults || [];
    return new Set(
      results
        .filter(
          (item: any) =>
            item.status === 'COMPLETED' || item.status === 'WAIVED',
        )
        .map((item: any) => item.actionKey),
    );
  }, [workspace]);
  const missing = requirements.filter(
    (item: any) =>
      item.mode === 'REQUIRED' &&
      !completed.has(item.actionKey) &&
      !(
        item.actionKey === 'PHOTO' &&
        workspace?.visit?.photos?.length >= item.minCount
      ),
  );
  const checkIn = async () => {
    if (!user?.id) return;
    setWorking(true);
    try {
      const gps = await currentPosition();
      if (!offlineService.isConnected()) {
        const id = createOperationId();
        await offlineService.enqueue('visits', 'create', {
          id,
          agentId: user.id,
          customerId: point.customer?.id,
          routeId,
          routePointId: point.id,
          ...gps,
        });
        setVisitId(id);
        Alert.alert(
          'Offline',
          'Check-in outbox-a yazıldı. Ziyarət avtomatik bağlanmayacaq.',
        );
      } else {
        const visit = await api.checkIn({
          agentId: user.id,
          customerId: point.customer?.id,
          routeId,
          routePointId: point.id,
          ...gps,
        });
        setVisitId(visit.id);
        setWorkspace(await api.getVisitWorkspace(visit.id));
      }
    } catch (err) {
      Alert.alert(
        'Check-in alınmadı',
        err instanceof Error ? err.message : 'GPS və serveri yoxlayın',
      );
    } finally {
      setWorking(false);
    }
  };
  const quickComplete = (actionKey: string) =>
    Alert.alert(
      labels[actionKey],
      'Bu hərəkətin tamamlandığını təsdiqləyirsiniz?',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: async () => {
            if (!visitId) return;
            setWorking(true);
            const id = createOperationId();
            try {
              if (offlineService.isConnected())
                await api.completeVisitAction(visitId, {
                  id,
                  actionKey,
                  status: 'COMPLETED',
                  evidence: { confirmedAt: new Date().toISOString() },
                });
              else
                await offlineService.enqueue('visitActions', 'create', {
                  id,
                  visitId,
                  actionKey,
                  status: 'COMPLETED',
                  evidence: { confirmedAt: new Date().toISOString() },
                });
              await load();
            } catch (err) {
              Alert.alert(
                'Xəta',
                err instanceof Error ? err.message : 'Hərəkət saxlanmadı',
              );
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    );
  const openAction = (actionKey: string) => {
    if (!visitId) return;
    if (actionKey === 'PHOTO')
      navigation.navigate('Camera', { visitId, agentId: user?.id });
    else if (actionKey === 'STOCK_CHECK')
      navigation.navigate('Stock', { visitId });
    else if (actionKey === 'VISIT_NOTE' || actionKey === 'FEEDBACK')
      navigation.navigate('Notes', {
        visitId,
        customerId: point.customer?.id,
        customerName: point.customer?.name,
        actionKey,
      });
    else if (actionKey === 'NEXT_ACTION')
      navigation.navigate('VisitResult', { visitId });
    else quickComplete(actionKey);
  };
  const checkOut = () => {
    if (!visitId) return;
    if (missing.length)
      return Alert.alert(
        'Ziyarət açıq qalır',
        `Məcburi hərəkətlər tamamlanmayıb: ${missing
          .map((item: any) => labels[item.actionKey])
          .join(', ')}`,
      );
    Alert.alert(
      'Ziyarəti bağla',
      'Check-out yalnız bu təsdiqdən sonra edilir.',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Check-out',
          onPress: async () => {
            setWorking(true);
            try {
              const gps = await currentPosition();
              if (offlineService.isConnected())
                await api.checkOut(visitId, gps.latitude, gps.longitude);
              else
                await offlineService.enqueue('visits', 'update', {
                  id: visitId,
                  status: 'CHECKED_OUT',
                  ...gps,
                });
              Alert.alert(
                offlineService.isConnected() ? 'Tamamlandı' : 'Offline',
                offlineService.isConnected()
                  ? 'Ziyarət əl ilə bağlandı.'
                  : 'Check-out outbox-a yazıldı.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch (err) {
              const apiError = err as ApiError;
              const list = Array.isArray(apiError.details?.missing)
                ? `\n${(apiError.details.missing as any[])
                    .map(item => labels[item.actionKey] || item.actionKey)
                    .join(', ')}`
                : '';
              Alert.alert('Ziyarət bağlanmadı', `${apiError.message}${list}`);
              await load();
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    );
  };
  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#2563EB" />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.customer}>
          <Text style={styles.customerName}>{point.customer?.name}</Text>
          <Text style={styles.address}>{point.customer?.address || ''}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        {!visitId ? (
          <TouchableOpacity
            style={styles.checkIn}
            onPress={checkIn}
            disabled={working}
          >
            {working ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.checkInText}>Check-in</Text>
                <Text style={styles.checkInSub}>Real GPS ilə ziyarəti aç</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.active}>
              <View style={styles.dot} />
              <View>
                <Text style={styles.activeTitle}>Ziyarət açıqdır</Text>
                <Text style={styles.activeText}>
                  Hərəkətlər ziyarəti avtomatik bağlamır
                </Text>
              </View>
            </View>
            <Text style={styles.section}>Sahə hərəkətləri</Text>
            {requirements
              .filter((item: any) => item.mode !== 'HIDDEN')
              .map((item: any) => {
                const done =
                  completed.has(item.actionKey) ||
                  (item.actionKey === 'PHOTO' &&
                    workspace?.visit?.photos?.length >= item.minCount);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.action, done && styles.done]}
                    onPress={() => openAction(item.actionKey)}
                  >
                    <View style={[styles.mark, done && styles.markDone]}>
                      <Text style={styles.markText}>{done ? '✓' : ''}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionName}>
                        {labels[item.actionKey] || item.actionKey}
                      </Text>
                      <Text style={styles.mode}>
                        {item.mode === 'REQUIRED' ? 'Məcburi' : 'İstəyə bağlı'}
                        {item.minCount > 1 ? ` · minimum ${item.minCount}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.open}>›</Text>
                  </TouchableOpacity>
                );
              })}
            {!requirements.length ? (
              <Text style={styles.noActions}>
                Bu qrup üçün hərəkət siyasəti təyin edilməyib.
              </Text>
            ) : null}
            <TouchableOpacity
              style={[styles.checkout, missing.length > 0 && styles.blocked]}
              onPress={checkOut}
              disabled={working}
            >
              {working ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.checkoutText}>
                  {missing.length
                    ? `${missing.length} məcburi hərəkət qalıb`
                    : 'Əl ilə check-out et'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 50 },
  customer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customerName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  address: { fontSize: 14, color: '#6B7280' },
  error: { fontSize: 12, color: '#B91C1C', marginTop: 7 },
  checkIn: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 6,
    alignItems: 'center',
  },
  checkInText: { fontSize: 18, color: '#FFF', fontWeight: '700' },
  checkInSub: { fontSize: 12, color: '#DBEAFE' },
  active: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#059669' },
  activeTitle: { color: '#065F46', fontWeight: '700' },
  activeText: { fontSize: 12, color: '#047857' },
  section: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 22,
    marginBottom: 9,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  done: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  mark: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  markText: { color: '#FFF', fontWeight: '700' },
  actionName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  mode: { fontSize: 12, color: '#6B7280' },
  open: { fontSize: 24, color: '#9CA3AF' },
  noActions: { fontSize: 13, color: '#6B7280' },
  checkout: {
    marginTop: 24,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  blocked: { backgroundColor: '#9CA3AF' },
  checkoutText: { color: '#FFF', fontWeight: '700' },
});
