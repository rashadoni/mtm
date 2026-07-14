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
import { offlineService } from '../../services/offline';
const labels: Record<string, string> = {
  PENDING: 'Gözləyir',
  IN_PROGRESS: 'Davam edir',
  COMPLETED: 'Tamamlandı',
  OVERDUE: 'Gecikib',
  CANCELLED: 'Ləğv edilib',
};
export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setError('');
      setTasks(await api.getMyTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tapşırıqlar yüklənmədi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void offlineService.init();
    void load();
  }, [load]);
  const advance = async (task: any) => {
    const next =
      task.status === 'PENDING' || task.status === 'OVERDUE'
        ? 'IN_PROGRESS'
        : task.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : null;
    if (!next) return;
    try {
      if (offlineService.isConnected())
        await api.updateTask(
          task.id,
          next,
          next === 'COMPLETED' ? 'Completed in field app' : undefined,
        );
      else
        await offlineService.enqueue('tasks', 'update', {
          id: task.id,
          status: next,
          result: next === 'COMPLETED' ? 'Completed in field app' : undefined,
        });
      setTasks(current =>
        current.map(item =>
          item.id === task.id ? { ...item, status: next } : item,
        ),
      );
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Status dəyişmədi',
      );
    }
  };
  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#2563EB" />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tapşırıqlar</Text>
        <Text style={styles.count}>
          {tasks.filter(item => item.status !== 'COMPLETED').length} aktiv
        </Text>
      </View>
      {error ? (
        <TouchableOpacity style={styles.error} onPress={load}>
          <Text style={styles.errorText}>{error}. Yenidən yoxla</Text>
        </TouchableOpacity>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.list}
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
        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.row}
            onPress={() => advance(task)}
          >
            <View
              style={[
                styles.priority,
                {
                  backgroundColor:
                    task.priority === 'URGENT'
                      ? '#DC2626'
                      : task.priority === 'HIGH'
                      ? '#D97706'
                      : '#2563EB',
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.taskTitle,
                  task.status === 'COMPLETED' && styles.done,
                ]}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null}
              <View style={styles.meta}>
                <Text style={styles.status}>
                  {labels[task.status] || task.status}
                </Text>
                <Text style={styles.due}>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : ''}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {!tasks.length ? (
          <Text style={styles.empty}>Tapşırıq yoxdur</Text>
        ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  count: { fontSize: 13, color: '#6B7280' },
  error: { margin: 12, padding: 12, backgroundColor: '#FEF2F2' },
  errorText: { color: '#B91C1C' },
  list: { padding: 14, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 9,
    overflow: 'hidden',
  },
  priority: { width: 4 },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 13,
    paddingTop: 12,
  },
  done: { color: '#6B7280', textDecorationLine: 'line-through' },
  description: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 13,
    marginTop: 3,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between', padding: 13 },
  status: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  due: { fontSize: 12, color: '#6B7280' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 60 },
});
