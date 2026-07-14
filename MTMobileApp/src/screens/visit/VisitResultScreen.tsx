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

export default function VisitResultScreen({ route, navigation }: any) {
  const [outcome, setOutcome] = useState('SUCCESSFUL');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if ((title && !dueDate) || (!title && dueDate))
      return Alert.alert(
        'Məlumat çatışmır',
        'Növbəti addım üçün həm başlıq, həm tarix lazımdır.',
      );
    setSaving(true);
    try {
      await api.saveVisitResult(route.params.visitId, {
        outcome,
        potential: 'UNKNOWN',
        discussedTopics: [],
        finalNote: note.trim() || null,
        nextAction: title
          ? {
              title: title.trim(),
              dueDate: new Date(dueDate).toISOString(),
              priority: 'MEDIUM',
            }
          : null,
      });
      Alert.alert(
        'Saxlanıldı',
        title
          ? 'Növbəti addım və reminder task yaradıldı.'
          : 'Ziyarət nəticəsi saxlanıldı. Ziyarət açıq qalır.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Nəticə saxlanmadı',
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nəticə</Text>
        <ScrollView horizontal style={styles.options}>
          {['SUCCESSFUL', 'PARTIAL', 'NO_CONTACT', 'RESCHEDULE'].map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.option, outcome === item && styles.optionActive]}
              onPress={() => setOutcome(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  outcome === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Yekun qeyd</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Görüşün nəticəsi"
        />
        <Text style={styles.heading}>Növbəti addım və reminder</Text>
        <Text style={styles.help}>
          Həkimlə görüş zamanı verilən vəd və ya follow-up burada task kimi
          yaradılır.
        </Text>
        <Text style={styles.label}>Başlıq</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Məsələn: təqdimatı göndər"
        />
        <Text style={styles.label}>Tarix</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-07-20"
        />
        <TouchableOpacity
          style={styles.submit}
          onPress={submit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Nəticəni saxla</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { padding: 18 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
  },
  options: { maxHeight: 42 },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 7,
  },
  optionActive: { backgroundColor: '#2563EB' },
  optionText: { fontSize: 11, color: '#4B5563' },
  optionTextActive: { color: '#FFF', fontWeight: '700' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    color: '#111827',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  heading: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 26 },
  help: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginTop: 5 },
  submit: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: '700' },
});
