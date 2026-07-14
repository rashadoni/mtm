import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { createOperationId, offlineService } from '../../services/offline';

const NOTES_STORAGE_KEY = 'mtm-visit-notes';

interface SavedNote {
  id: string;
  visitId?: string;
  customerId?: string;
  note: string;
  tags: string[];
  createdAt: string;
}

export default function NotesScreen({ route, navigation }: any) {
  const visitId = route?.params?.visitId;
  const customerId = route?.params?.customerId;
  const customerName = route?.params?.customerName || '';
  const actionKey = route?.params?.actionKey || 'VISIT_NOTE';

  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  const availableTags = [
    'Müsbət',
    'Mənfi',
    'Təcili',
    'Stok problemi',
    'Qiymət',
    'Rəqabət',
    'Yeni məhsul',
    'Müştəri şikayəti',
  ];

  useEffect(() => {
    loadSavedNotes();
    // The storage key and visit/customer identifiers are fixed for this screen instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
        const all: SavedNote[] = JSON.parse(stored);
        // Show notes for this visit/customer
        const filtered = all.filter(
          n =>
            (visitId && n.visitId === visitId) ||
            (customerId && n.customerId === customerId),
        );
        setSavedNotes(filtered);
      }
    } catch {}
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter(t => t !== tag));
    else setTags([...tags, tag]);
  };

  const saveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Xəta', 'Qeyd daxil edin');
      return;
    }

    setSaving(true);
    try {
      const newNote: SavedNote = {
        id: `note-${Date.now()}`,
        visitId,
        customerId,
        note: note.trim(),
        tags,
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const all: SavedNote[] = stored ? JSON.parse(stored) : [];
      all.push(newNote);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(all));
      if (visitId) {
        const id = createOperationId();
        const payload = {
          id,
          actionKey,
          status: 'COMPLETED',
          evidence: { note: note.trim(), tags },
        };
        if (offlineService.isConnected())
          await api.completeVisitAction(visitId, payload);
        else
          await offlineService.enqueue('visitActions', 'create', {
            visitId,
            ...payload,
          });
      }

      Alert.alert('Uğurlu', 'Qeyd yadda saxlanıldı', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Xəta', err.message || 'Qeyd saxlanıla bilmədi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>📝 Ziyarət Qeydi</Text>
        <Text style={styles.subtitle}>
          {customerName
            ? `${customerName} üçün qeyd`
            : 'Bu ziyarət haqqında qeyd əlavə edin'}
        </Text>

        {/* Tags */}
        <Text style={styles.label}>Etiketlər</Text>
        <View style={styles.tagGrid}>
          {availableTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, tags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  tags.includes(tag) && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note Input */}
        <Text style={styles.label}>Qeyd</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Ziyarət haqqında qeyd yazın..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          placeholderTextColor="#9ca3af"
          autoCorrect={false}
          autoCapitalize="sentences"
          keyboardType="default"
          returnKeyType="default"
        />

        {/* Quick Templates */}
        <Text style={styles.label}>Hazır şablonlar</Text>
        {[
          'Müştəri yeni məhsul sifarişi ilə maraqlanır',
          'Stok vəziyyəti yaxşıdır, əlavə sifariş lazım deyil',
          'Rəqib məhsulları endirimlə satılır',
          'Müştəri ödəniş gecikdirir, xəbərdarlıq edildi',
        ].map((template, i) => (
          <TouchableOpacity
            key={i}
            style={styles.template}
            onPress={() => setNote(note ? note + '\n' + template : template)}
          >
            <Text style={styles.templateText}>📋 {template}</Text>
          </TouchableOpacity>
        ))}

        {/* Previous notes */}
        {savedNotes.length > 0 && (
          <>
            <Text style={styles.label}>
              Əvvəlki qeydlər ({savedNotes.length})
            </Text>
            {savedNotes.map(n => (
              <View key={n.id} style={styles.savedNote}>
                <Text style={styles.savedNoteText}>{n.note}</Text>
                <View style={styles.savedNoteMeta}>
                  {n.tags.map(t => (
                    <Text key={t} style={styles.savedNoteTag}>
                      {t}
                    </Text>
                  ))}
                  <Text style={styles.savedNoteDate}>
                    {new Date(n.createdAt).toLocaleString('az-AZ', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveNote}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>💾 Yadda saxla</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  tagText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1a1a2e',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  template: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  templateText: { fontSize: 13, color: '#374151' },
  savedNote: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  savedNoteText: { fontSize: 14, color: '#1a1a2e', marginBottom: 8 },
  savedNoteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  savedNoteTag: {
    fontSize: 11,
    color: '#6C63FF',
    backgroundColor: '#6C63FF15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savedNoteDate: { fontSize: 11, color: '#9ca3af' },
  saveBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
