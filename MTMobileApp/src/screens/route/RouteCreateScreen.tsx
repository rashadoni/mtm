import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth';

export default function RouteCreateScreen({ navigation }: any) {
  const user = useAuthStore(state => state.user);
  const [name, setName] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getCustomers()
      .then(setCustomers)
      .catch(err => Alert.alert('Xəta', err.message))
      .finally(() => setLoading(false));
  }, []);
  const toggle = (id: string) =>
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id],
    );
  const create = async () => {
    if (!user?.id || !selected.length)
      return Alert.alert('Məlumat çatışmır', 'Ən azı bir müştəri seçin.');
    setSaving(true);
    try {
      await api.createRoute({
        agentId: user.id,
        assignments: [{ agentId: user.id, role: 'PRIMARY' }],
        date: new Date().toISOString(),
        name: name.trim() || undefined,
        status: 'DRAFT',
        points: selected.map(customerId => ({ customerId })),
      });
      Alert.alert(
        'Marşrut yaradıldı',
        'Dublikat və vaxt konfliktləri serverdə yoxlanıldı.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        'Marşrut yaradılmadı',
        err instanceof Error ? err.message : 'Xəta',
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Marşrutun adı (istəyə bağlı)"
        />
        <Text style={styles.counter}>{selected.length} seçilib</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563EB" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {customers.map(customer => (
            <TouchableOpacity
              key={customer.id}
              style={[
                styles.row,
                selected.includes(customer.id) && styles.rowSelected,
              ]}
              onPress={() => toggle(customer.id)}
            >
              <View
                style={[
                  styles.check,
                  selected.includes(customer.id) && styles.checkSelected,
                ]}
              >
                <Text style={styles.checkText}>
                  {selected.includes(customer.id) ? '✓' : ''}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{customer.name}</Text>
                <Text style={styles.address}>
                  {customer.address || customer.city || 'Ünvan yoxdur'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.submit}
          onPress={create}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Qaralama marşrut yarat</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  top: {
    padding: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    color: '#111827',
  },
  counter: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  list: { padding: 14, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 13,
    marginBottom: 8,
  },
  rowSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkText: { color: '#FFF', fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  address: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  bottom: {
    padding: 14,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submit: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: '700' },
});
