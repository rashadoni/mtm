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

type LoginStep = 'tenant' | 'credentials';

export default function LoginScreen() {
  const [step, setStep] = useState<LoginStep>('tenant');
  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();

  const normalizedTenantSlug = tenantSlug.trim().toLowerCase();

  const handleTenantContinue = () => {
    if (!normalizedTenantSlug) {
      Alert.alert('Xəta', 'Təşkilat adını daxil edin');
      return;
    }
    setTenantSlug(normalizedTenantSlug);
    setStep('credentials');
  };

  const handleTenantChange = () => {
    setPassword('');
    setShowPassword(false);
    setStep('tenant');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Xəta', 'E-poçt və şifrəni daxil edin');
      return;
    }
    try {
      await login(email.trim(), password, normalizedTenantSlug);
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
        </View>

        <View style={styles.form}>
          {step === 'tenant' ? (
            <>
              <Text style={styles.label}>Təşkilat</Text>
              <TextInput
                testID="tenant-input"
                style={styles.input}
                value={tenantSlug}
                onChangeText={setTenantSlug}
                placeholder="məsələn: zeytun"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={handleTenantContinue}
              />
              <Text style={styles.helperText}>
                Menecerinizin verdiyi təşkilat adını daxil edin
              </Text>
              <TouchableOpacity
                testID="tenant-continue"
                style={styles.loginBtn}
                onPress={handleTenantContinue}
                accessibilityRole="button"
              >
                <Text style={styles.loginBtnText}>Davam et</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.tenantSummary}>
                <View>
                  <Text style={styles.tenantSummaryLabel}>Təşkilat</Text>
                  <Text style={styles.organization}>
                    {normalizedTenantSlug}
                  </Text>
                </View>
                <TouchableOpacity
                  testID="tenant-change"
                  onPress={handleTenantChange}
                  accessibilityRole="button"
                  accessibilityLabel="Təşkilatı dəyiş"
                  style={styles.changeTenantBtn}
                >
                  <Text style={styles.changeTenantText}>Dəyiş</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>E-poçt</Text>
              <TextInput
                testID="email-input"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ad@şirkət.az"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Text style={styles.label}>Şifrə</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  testID="password-input"
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'
                  }
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                testID="login-submit"
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
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
            </>
          )}
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
  helperText: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  tenantSummary: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginBottom: 10,
  },
  tenantSummaryLabel: { color: '#6b7280', fontSize: 12, marginBottom: 2 },
  changeTenantBtn: { minHeight: 44, justifyContent: 'center', paddingLeft: 16 },
  changeTenantText: { color: '#0B3157', fontSize: 14, fontWeight: '700' },
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
