import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, Alert,
} from 'react-native';

interface StockItem {
  id: string;
  name: string;
  code: string;
  expected: number;
  actual: number | null;
  unit: string;
}

const mockStockItems: StockItem[] = [
  { id: '1', name: 'Amoxicillin 500mg', code: 'MED-001', expected: 50, actual: null, unit: 'ədəd' },
  { id: '2', name: 'Ibuprofen 400mg', code: 'MED-002', expected: 30, actual: null, unit: 'ədəd' },
  { id: '3', name: 'Paracetamol 500mg', code: 'MED-003', expected: 80, actual: null, unit: 'ədəd' },
  { id: '4', name: 'Omeprazol 20mg', code: 'MED-004', expected: 25, actual: null, unit: 'ədəd' },
  { id: '5', name: 'Vitamin C 1000mg', code: 'VIT-001', expected: 100, actual: null, unit: 'ədəd' },
  { id: '6', name: 'Bandaj 10cm', code: 'ACC-001', expected: 40, actual: null, unit: 'ədəd' },
];

export default function StockScreen({ navigation }: any) {
  const [items, setItems] = useState(mockStockItems);

  const updateActual = (id: string, value: string) => {
    const num = value === '' ? null : parseInt(value) || 0;
    setItems(items.map(i => i.id === id ? { ...i, actual: num } : i));
  };

  const checked = items.filter(i => i.actual !== null).length;
  const total = items.length;
  const mismatches = items.filter(i => i.actual !== null && i.actual !== i.expected).length;

  const submitStock = () => {
    const unchecked = items.filter(i => i.actual === null);
    if (unchecked.length > 0) {
      Alert.alert('Xəbərdarlıq', `${unchecked.length} məhsul hələ yoxlanılmayıb. Davam etmək istəyirsiniz?`, [
        { text: 'Geri qayıt' },
        { text: 'Davam et', onPress: doSubmit },
      ]);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    Alert.alert('Uğurlu', `Stok yoxlaması tamamlandı\n${checked}/${total} yoxlanıldı\n${mismatches} uyğunsuzluq`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{checked}/{total}</Text>
          <Text style={styles.statLabel}>Yoxlanıldı</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: mismatches > 0 ? '#FEF3C7' : '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: mismatches > 0 ? '#D97706' : '#059669' }]}>{mismatches}</Text>
          <Text style={styles.statLabel}>Uyğunsuzluq</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round((checked / total) * 100)}%</Text>
          <Text style={styles.statLabel}>İrəliləmə</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(checked / total) * 100}%` }]} />
        </View>
      </View>

      {/* Stock Items */}
      <ScrollView style={styles.list}>
        {items.map((item, idx) => {
          const isDone = item.actual !== null;
          const mismatch = isDone && item.actual !== item.expected;
          return (
            <View key={item.id} style={[styles.itemCard, isDone && styles.itemDone, mismatch && styles.itemMismatch]}>
              <View style={styles.itemLeft}>
                <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                  <Text style={styles.checkText}>{isDone ? '✓' : idx + 1}</Text>
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCode}>{item.code} · Gözlənilən: {item.expected} {item.unit}</Text>
              </View>
              <View style={styles.itemRight}>
                <TextInput
                  style={[styles.qtyInput, mismatch && styles.qtyInputMismatch]}
                  value={item.actual !== null ? String(item.actual) : ''}
                  onChangeText={(v) => updateActual(item.id, v)}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor="#d1d5db"
                  maxLength={5}
                />
                {mismatch && (
                  <Text style={styles.mismatchText}>
                    {(item.actual || 0) > item.expected ? `+${(item.actual || 0) - item.expected}` : `${(item.actual || 0) - item.expected}`}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={submitStock}>
          <Text style={styles.submitBtnText}>📋 Stok yoxlamasını tamamla ({checked}/{total})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  progressContainer: { paddingHorizontal: 16, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 2 },
  list: { flex: 1, paddingHorizontal: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  itemDone: { borderLeftWidth: 3, borderLeftColor: '#00BFA6' },
  itemMismatch: { borderLeftColor: '#FFC107' },
  itemLeft: { marginRight: 12 },
  checkCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  checkCircleDone: { backgroundColor: '#00BFA6' },
  checkText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  itemCode: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemRight: { alignItems: 'center', width: 70 },
  qtyInput: { width: 60, height: 40, borderRadius: 10, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  qtyInputMismatch: { borderColor: '#FFC107', backgroundColor: '#FFFBEB' },
  mismatchText: { fontSize: 11, fontWeight: '600', color: '#D97706', marginTop: 2 },
  bottomBar: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  submitBtn: { backgroundColor: '#6C63FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
