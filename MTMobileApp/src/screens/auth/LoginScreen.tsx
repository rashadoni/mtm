import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../store/auth';
import { FIELD_APP_CONFIG } from '../../config/app';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Xəta', 'E-poçt və şifrəni daxil edin');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Giriş xətası', err.message || 'Yanlış e-poçt və ya şifrə');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/leaddrive-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>LeadDrive Field</Text>
          <Text style={styles.subtitle}>Marşrut və sahə işi</Text>
          <Text style={styles.organization}>
            {FIELD_APP_CONFIG.organizationName}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-poçt</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ad@şirkət.az"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Şifrə</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'
              }
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Daxil ol</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.demo}>
            Giriş məlumatlarını menecerinizdən alın
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 18,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  organization: {
    color: '#0B3157',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  form: { gap: 4 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  passwordInput: { flex: 1, marginBottom: 0, paddingRight: 52 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  eyeText: { fontSize: 20 },
  loginBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demo: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 16 },
});
