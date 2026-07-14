import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../services/api';

export default function RouteScreen({ navigation }: any) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setError('');
      const data = await api.getMyRoutes();
      setRoutes(data.routes);
      setSelectedId(current =>
        current && data.routes.some((item: any) => item.id === current)
          ? current
          : data.routes[0]?.id || null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marşrutlar yüklənmədi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const unsub = navigation.addListener('focus', () => void load());
    return unsub;
  }, [load, navigation]);
  const current = routes.find(item => item.id === selectedId);
  const requestRemoval = (point: any) =>
    Alert.alert(
      'Dayanacağın silinməsi',
      'Dayanacaq yalnız menecer təsdiqindən sonra silinəcək.',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Sorğu göndər',
          onPress: async () => {
            try {
              await api.requestStopRemoval(
                current.id,
                point.id,
                'Agent requested removal from the field route',
              );
              Alert.alert('Göndərildi', 'Menecer sorğunu nəzərdən keçirəcək.');
              await load();
            } catch (err) {
              Alert.alert(
                'Xəta',
                err instanceof Error ? err.message : 'Sorğu göndərilmədi',
              );
            }
          },
        },
      ],
    );
  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#2563EB" />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bugünkü marşrutlar</Text>
          <Text style={styles.subtitle}>Sahə işi və ziyarətlər</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.secondary}
            onPress={() =>
              navigation.navigate('NewCustomer', { routeId: current?.id })
            }
          >
            <Text style={styles.secondaryText}>+ Müştəri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primary}
            onPress={() => navigation.navigate('RouteCreate')}
          >
            <Text style={styles.primaryText}>+ Marşrut</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error ? (
        <TouchableOpacity style={styles.error} onPress={load}>
          <Text style={styles.errorText}>{error}. Yenidən yoxla</Text>
        </TouchableOpacity>
      ) : null}
      {routes.length > 1 ? (
        <ScrollView
          horizontal
          style={styles.tabs}
          contentContainerStyle={styles.tabsContent}
        >
          {routes.map(route => (
            <TouchableOpacity
              key={route.id}
              style={[styles.tab, route.id === selectedId && styles.tabActive]}
              onPress={() => setSelectedId(route.id)}
            >
              <Text
                style={
                  route.id === selectedId
                    ? styles.tabTextActive
                    : styles.tabText
                }
              >
                {route.name || 'Marşrut'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
      >
        {!current ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Bu gün üçün marşrut yoxdur</Text>
            <Text style={styles.emptyText}>
              Yeni marşrut yaradın və müştəriləri seçin.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.meta}>
              <View>
                <Text style={styles.routeName}>
                  {current.name || 'Günün marşrutu'}
                </Text>
                <Text style={styles.routeStatus}>
                  {current.status} · {current.visitedPoints || 0}/
                  {current.totalPoints || current.points?.length || 0}
                </Text>
              </View>
              <Text style={styles.assignment}>
                {(current.assignments || [])
                  .map((item: any) => item.agent?.name)
                  .filter(Boolean)
                  .join(', ') || current.agent?.name}
              </Text>
            </View>
            {(current.points || []).map((point: any, index: number) => (
              <View key={point.id} style={styles.stop}>
                <View style={styles.index}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.stopBody}
                  onPress={() =>
                    navigation.navigate('Visit', { point, routeId: current.id })
                  }
                  onLongPress={() => requestRemoval(point)}
                >
                  <View style={styles.stopTop}>
                    <Text style={styles.customer}>{point.customer?.name}</Text>
                    <Text style={styles.time}>
                      {point.plannedTime
                        ? new Date(point.plannedTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.address}>
                    {point.customer?.address || 'Ünvan göstərilməyib'}
                  </Text>
                  {point.changeRequests?.length ? (
                    <Text style={styles.pending}>
                      Dəyişiklik sorğusu baxışdadır
                    </Text>
                  ) : null}
                  <Text style={styles.hint}>
                    Açmaq üçün toxunun · silinmə üçün basılı saxlayın
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 13,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  buttons: { flexDirection: 'row', gap: 8 },
  primary: { backgroundColor: '#2563EB', borderRadius: 6, padding: 11 },
  primaryText: { color: '#FFF', fontWeight: '700' },
  secondary: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 11,
  },
  secondaryText: { color: '#1F2937', fontWeight: '700' },
  error: { margin: 12, padding: 12, backgroundColor: '#FEF2F2' },
  errorText: { color: '#B91C1C' },
  tabs: { maxHeight: 50, backgroundColor: '#FFF' },
  tabsContent: { padding: 8, gap: 8 },
  tab: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#DBEAFE' },
  tabText: { color: '#4B5563' },
  tabTextActive: { color: '#1D4ED8', fontWeight: '700' },
  content: { padding: 16, paddingBottom: 110 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  routeName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  routeStatus: { fontSize: 12, color: '#6B7280' },
  assignment: { flex: 1, textAlign: 'right', fontSize: 12, color: '#374151' },
  stop: { flexDirection: 'row', marginBottom: 9 },
  index: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 8,
  },
  indexText: { color: '#FFF', fontWeight: '700' },
  stopBody: {
    flex: 1,
    padding: 13,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  stopTop: { flexDirection: 'row', justifyContent: 'space-between' },
  customer: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  time: { fontSize: 12, color: '#2563EB' },
  address: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  pending: { fontSize: 12, color: '#B45309', marginTop: 7 },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },
  empty: { paddingTop: 70, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, color: '#6B7280', marginTop: 7 },
});
