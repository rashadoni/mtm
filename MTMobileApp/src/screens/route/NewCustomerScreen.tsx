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

export default function NewCustomerScreen({ route, navigation }: any) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState(
    'Yeni müştəri sahə ziyarəti zamanı aşkarlandı',
  );
  const [objectType, setObjectType] = useState('STORE');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2 || reason.trim().length < 3) {
      Alert.alert(
        'Məlumat çatışmır',
        'Müştəri adı və sorğu səbəbini doldurun.',
      );
      return;
    }
    setSaving(true);
    try {
      const request = await api.requestCustomer({
        routeId: route.params?.routeId || null,
        objectType,
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        potential: 'UNKNOWN',
        reason: reason.trim(),
      });
      const duplicates = request.duplicateCandidates?.length || 0;
      Alert.alert(
        'Sorğu göndərildi',
        duplicates
          ? `${duplicates} mümkün dublikat tapıldı. Menecer yoxlayacaq.`
          : 'Menecer təsdiq etdikdən sonra müştəri yaradılacaq.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Sorğu göndərilmədi',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Yeni müştəri dərhal bazaya düşmür. Sorğu dublikat yoxlamasından və
          menecer təsdiqindən keçəcək.
        </Text>
        <Text style={styles.label}>Obyekt növü</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.types}
        >
          {['STORE', 'PHARMACY', 'CLINIC', 'DOCTOR', 'OTHER'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.type, objectType === type && styles.typeActive]}
              onPress={() => setObjectType(type)}
            >
              <Text
                style={[
                  styles.typeText,
                  objectType === type && styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Ad *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Müştərinin adı"
        />
        <Text style={styles.label}>Ünvan</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Ünvan"
        />
        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Telefon"
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Səbəb *</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={reason}
          onChangeText={setReason}
          multiline
        />
        <TouchableOpacity
          style={styles.submit}
          onPress={submit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Təsdiqə göndər</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { padding: 18, paddingBottom: 40 },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 18,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#111827',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  types: { maxHeight: 42 },
  type: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 7,
  },
  typeActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  typeText: { fontSize: 12, color: '#4B5563' },
  typeTextActive: { color: '#FFF', fontWeight: '700' },
  submit: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
