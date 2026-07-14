import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { api } from '../../services/api';

const mockTasks = [
  { id: '1', title: 'Neptun mağazasına yeni məhsul təqdimatı', description: 'Yeni məhsul xətti təqdimatı', status: 'TODO', priority: 'HIGH', dueDate: '2026-03-19' },
  { id: '2', title: 'Bravo ilə müqavilə yeniləməsi', description: 'Satış müqaviləsini yenilə', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-03-20' },
  { id: '3', title: 'Gilan distribütor hesabatı hazırla', description: 'Aylıq satış hesabatı', status: 'TODO', priority: 'LOW', dueDate: '2026-03-22' },
  { id: '4', title: 'Araz Market stok yoxlaması', description: 'Stok vəziyyəti yoxla', status: 'DONE', priority: 'MEDIUM', dueDate: '2026-03-17' },
];

const priorityConfig: Record<string, { color: string; label: string }> = {
  URGENT: { color: '#E74C3C', label: 'Təcili' },
  HIGH: { color: '#FFC107', label: 'Yüksək' },
  MEDIUM: { color: '#3498DB', label: 'Orta' },
  LOW: { color: '#00BFA6', label: 'Aşağı' },
};

const statusConfig: Record<string, { color: string; label: string; next: string }> = {
  TODO: { color: '#FFC107', label: 'Ediləcək', next: 'IN_PROGRESS' },
  IN_PROGRESS: { color: '#3498DB', label: 'Davam edir', next: 'DONE' },
  DONE: { color: '#00BFA6', label: 'Tamamlandı', next: '' },
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState(mockTasks);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('all');

  const loadTasks = async () => {
    try {
      const { tasks: serverTasks } = await api.getMyTasks();
      if (serverTasks.length > 0) setTasks(serverTasks);
    } catch { /* use mock */ }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleStatusChange = async (task: typeof mockTasks[0]) => {
    const nextStatus = statusConfig[task.status]?.next;
    if (!nextStatus) return;

    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    try {
      await api.updateTaskStatus(task.id, nextStatus);
    } catch { /* keep local change */ }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tapşırıqlar</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tasks.filter(t => t.status !== 'DONE').length}</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {[
          { key: 'all', label: 'Hamısı' },
          { key: 'TODO', label: 'Ediləcək' },
          { key: 'IN_PROGRESS', label: 'Davam edir' },
          { key: 'DONE', label: 'Tamamlandı' },
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

      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadTasks(); setRefreshing(false); }} />}>
        {filtered.map(task => {
          const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
          const status = statusConfig[task.status] || statusConfig.TODO;

          return (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleStatusChange(task)} activeOpacity={0.7}>
              <View style={[styles.priorityBar, { backgroundColor: priority.color }]} />
              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskTitle, task.status === 'DONE' && styles.taskDone]}>{task.title}</Text>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                </View>
                <Text style={styles.taskDesc}>{task.description}</Text>
                <View style={styles.taskFooter}>
                  <View style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}>
                    <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                  </View>
                  <Text style={styles.dueDate}>📅 {task.dueDate}</Text>
                  {status.next && (
                    <Text style={[styles.nextAction, { color: status.color }]}>
                      → {statusConfig[status.next]?.label}
                    </Text>
                  )}
                </View>
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
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e' },
  badge: { backgroundColor: '#E74C3C', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filters: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#6C63FF' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 20 },
  taskCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  priorityBar: { width: 4 },
  taskContent: { flex: 1, padding: 16 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  taskDesc: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  taskFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  dueDate: { fontSize: 12, color: '#9ca3af' },
  nextAction: { fontSize: 12, fontWeight: '600', marginLeft: 'auto' },
});
