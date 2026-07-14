import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { api } from '../../services/api';
import { createOperationId, offlineService } from '../../services/offline';
export default function StockScreen({ route, navigation }: any) {
  const [status, setStatus] = useState('AVAILABLE');
  const [count, setCount] = useState('0');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    const visitId = route?.params?.visitId;
    if (!visitId) return Alert.alert('Xəta', 'Visit is missing');
    setSaving(true);
    try {
      const payload = {
        id: createOperationId(),
        visitId,
        actionKey: 'STOCK_CHECK',
        status: 'COMPLETED',
        evidence: {
          availability: status,
          outOfStockCount: Number(count) || 0,
          note: note.trim() || null,
        },
      };
      if (offlineService.isConnected())
        await api.completeVisitAction(visitId, payload);
      else await offlineService.enqueue('visitActions', 'create', payload);
      Alert.alert(
        'Saxlanıldı',
        'Stok yoxlaması tamamlandı. Ziyarət açıq qalır.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert('Xəta', err instanceof Error ? err.message : 'Saxlanılmadı');
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.help}>
          Məhsul kataloqu və sifarişlər LeadShelf/1C inteqrasiyasına aiddir.
          Burada ziyarətin stok sübutu saxlanılır.
        </Text>
        <Text style={styles.label}>Ümumi vəziyyət</Text>
        {['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.option, status === item && styles.active]}
            onPress={() => setStatus(item)}
          >
            <Text
              style={status === item ? styles.activeText : styles.optionText}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.label}>Stokda olmayan mövqelərin sayı</Text>
        <TextInput
          style={styles.input}
          value={count}
          onChangeText={setCount}
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Qeyd</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <TouchableOpacity style={styles.submit} onPress={submit}>
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Stok yoxlamasını tamamla</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { padding: 18 },
  help: {
    fontSize: 13,
    color: '#4B5563',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 6,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 18,
    marginBottom: 7,
  },
  option: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 13,
    marginBottom: 7,
  },
  active: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  optionText: { color: '#4B5563' },
  activeText: { color: '#1D4ED8', fontWeight: '700' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    color: '#111827',
  },
  multiline: { minHeight: 100 },
  submit: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#FFF', fontWeight: '700' },
});
