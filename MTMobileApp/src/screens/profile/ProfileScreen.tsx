import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { useAuthStore } from '../../store/auth';

const THEME_KEY = 'mtm-theme';
const LANG_KEY = 'mtm-language';
const APP_VERSION = DeviceInfo.getVersion();

type Language = 'az' | 'ru' | 'en';

const LABELS: Record<Language, Record<string, string>> = {
  az: {
    profile: 'Profil',
    personalInfo: 'Şəxsi məlumatlar',
    notifications: 'Bildirişlər',
    gpsSettings: 'GPS Parametrləri',
    darkMode: 'Qaranlıq rejim',
    language: 'Dil',
    help: 'Kömək',
    logout: 'Çıxış',
    logoutConfirm: 'Hesabdan çıxmaq istəyirsiniz?',
    cancel: 'Ləğv et',
    save: 'Yadda saxla',
    saved: 'Uğurlu',
    visits: 'Ziyarət',
    execution: 'İcra',
    rating: 'Reytinq',
    name: 'Ad',
    phone: 'Telefon',
    region: 'Region',
    notifPush: 'Push bildirişlər',
    notifSound: 'Səsli bildiriş',
    notifVibrate: 'Vibrasiya',
    gpsHighAccuracy: 'Yüksək dəqiqlik',
    gpsInterval: 'GPS intervalı (san)',
    gpsBackground: 'Arxa fonda izləmə',
    helpTitle: 'Kömək & Dəstək',
    helpText: 'Problem və ya sualınız varsa bizimlə əlaqə saxlayın',
    contactEmail: 'E-poçt: support@mtm.az',
    contactPhone: 'Telefon: +994 50 123 45 67',
    version: `LeadDrive Field v${APP_VERSION}`,
    company: 'Guven Technology MMC',
    selectLanguage: 'Dil seçin',
    close: 'Bağla',
  },
  ru: {
    profile: 'Профиль',
    personalInfo: 'Личные данные',
    notifications: 'Уведомления',
    gpsSettings: 'Настройки GPS',
    darkMode: 'Тёмная тема',
    language: 'Язык',
    help: 'Помощь',
    logout: 'Выход',
    logoutConfirm: 'Вы хотите выйти из аккаунта?',
    cancel: 'Отмена',
    save: 'Сохранить',
    saved: 'Успешно',
    visits: 'Визиты',
    execution: 'Выполнение',
    rating: 'Рейтинг',
    name: 'Имя',
    phone: 'Телефон',
    region: 'Регион',
    notifPush: 'Push уведомления',
    notifSound: 'Звук',
    notifVibrate: 'Вибрация',
    gpsHighAccuracy: 'Высокая точность',
    gpsInterval: 'Интервал GPS (сек)',
    gpsBackground: 'Фоновое отслеживание',
    helpTitle: 'Помощь и поддержка',
    helpText: 'Если у вас есть вопросы, свяжитесь с нами',
    contactEmail: 'Email: support@mtm.az',
    contactPhone: 'Телефон: +994 50 123 45 67',
    version: `LeadDrive Field v${APP_VERSION}`,
    company: 'Guven Technology MMC',
    selectLanguage: 'Выберите язык',
    close: 'Закрыть',
  },
  en: {
    profile: 'Profile',
    personalInfo: 'Personal Info',
    notifications: 'Notifications',
    gpsSettings: 'GPS Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    help: 'Help',
    logout: 'Logout',
    logoutConfirm: 'Do you want to logout?',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Success',
    visits: 'Visits',
    execution: 'Execution',
    rating: 'Rating',
    name: 'Name',
    phone: 'Phone',
    region: 'Region',
    notifPush: 'Push notifications',
    notifSound: 'Sound',
    notifVibrate: 'Vibration',
    gpsHighAccuracy: 'High accuracy',
    gpsInterval: 'GPS interval (sec)',
    gpsBackground: 'Background tracking',
    helpTitle: 'Help & Support',
    helpText: 'Contact us if you have questions',
    contactEmail: 'Email: support@mtm.az',
    contactPhone: 'Phone: +994 50 123 45 67',
    version: `LeadDrive Field v${APP_VERSION}`,
    company: 'Guven Technology MMC',
    selectLanguage: 'Select language',
    close: 'Close',
  },
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [lang, setLang] = useState<Language>('az');
  const [darkMode, setDarkMode] = useState(false);

  // Modals
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGPS, setShowGPS] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Personal info state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editRegion, setEditRegion] = useState(user?.region || '');

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  // GPS settings
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);
  const [gpsInterval, setGpsInterval] = useState('30');
  const [gpsBackground, setGpsBackground] = useState(true);

  const t = LABELS[lang];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANG_KEY);
      if (savedLang) setLang(savedLang as Language);
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark') setDarkMode(true);
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.logout, style: 'destructive', onPress: logout },
    ]);
  };

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light');
  };

  const handleChangeLanguage = async (newLang: Language) => {
    setLang(newLang);
    await AsyncStorage.setItem(LANG_KEY, newLang);
    setShowLanguage(false);
  };

  const handleSavePersonalInfo = async () => {
    try {
      // Save locally
      await AsyncStorage.setItem('mtm-user-name', editName);
      await AsyncStorage.setItem('mtm-user-phone', editPhone);
      await AsyncStorage.setItem('mtm-user-region', editRegion);
      Alert.alert(t.saved, '', [
        { text: 'OK', onPress: () => setShowPersonalInfo(false) },
      ]);
    } catch {
      Alert.alert('Xəta', 'Məlumatlar saxlanıla bilmədi');
    }
  };

  const handleSaveNotifications = async () => {
    await AsyncStorage.setItem('mtm-notif-push', JSON.stringify(pushEnabled));
    await AsyncStorage.setItem('mtm-notif-sound', JSON.stringify(soundEnabled));
    await AsyncStorage.setItem(
      'mtm-notif-vibrate',
      JSON.stringify(vibrateEnabled),
    );
    Alert.alert(t.saved, '', [
      { text: 'OK', onPress: () => setShowNotifications(false) },
    ]);
  };

  const handleSaveGPS = async () => {
    await AsyncStorage.setItem(
      'mtm-gps-accuracy',
      JSON.stringify(gpsHighAccuracy),
    );
    await AsyncStorage.setItem('mtm-gps-interval', gpsInterval);
    await AsyncStorage.setItem(
      'mtm-gps-background',
      JSON.stringify(gpsBackground),
    );
    Alert.alert(t.saved, '', [
      { text: 'OK', onPress: () => setShowGPS(false) },
    ]);
  };

  const bg = darkMode ? '#1a1a2e' : '#F4F5F9';
  const cardBg = darkMode ? '#2d2d44' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const subColor = darkMode ? '#9ca3af' : '#6b7280';

  const menuItems = [
    {
      icon: '👤',
      label: t.personalInfo,
      onPress: () => setShowPersonalInfo(true),
    },
    {
      icon: '🔔',
      label: t.notifications,
      onPress: () => setShowNotifications(true),
    },
    { icon: '📍', label: t.gpsSettings, onPress: () => setShowGPS(true) },
    {
      icon: '🌙',
      label: t.darkMode,
      onPress: () => handleToggleDarkMode(!darkMode),
      toggle: true,
      value: darkMode,
    },
    {
      icon: '🌐',
      label: t.language,
      onPress: () => setShowLanguage(true),
      info: lang.toUpperCase(),
    },
    { icon: '❓', label: t.help, onPress: () => setShowHelp(true) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('') || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: textColor }]}>
            {user?.name || 'Agent'}
          </Text>
          <Text style={[styles.email, { color: subColor }]}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'AGENT'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: cardBg }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>145</Text>
            <Text style={[styles.statLabel, { color: subColor }]}>
              {t.visits}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>92%</Text>
            <Text style={[styles.statLabel, { color: subColor }]}>
              {t.execution}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: subColor }]}>
              {t.rating}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menu, { backgroundColor: cardBg }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: textColor }]}>
                {item.label}
              </Text>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onPress}
                  trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
                  thumbColor="#fff"
                />
              ) : item.info ? (
                <Text style={styles.menuInfo}>{item.info}</Text>
              ) : (
                <Text style={styles.menuArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 {t.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t.version}</Text>
        <Text style={styles.company}>{t.company}</Text>
      </ScrollView>

      {/* Personal Info Modal */}
      <Modal visible={showPersonalInfo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              👤 {t.personalInfo}
            </Text>
            <Text style={[styles.inputLabel, { color: subColor }]}>
              {t.name}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: textColor,
                  borderColor: darkMode ? '#444' : '#e5e7eb',
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor="#9ca3af"
            />
            <Text style={[styles.inputLabel, { color: subColor }]}>
              {t.phone}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: textColor,
                  borderColor: darkMode ? '#444' : '#e5e7eb',
                },
              ]}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={[styles.inputLabel, { color: subColor }]}>
              {t.region}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: textColor,
                  borderColor: darkMode ? '#444' : '#e5e7eb',
                },
              ]}
              value={editRegion}
              onChangeText={setEditRegion}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPersonalInfo(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePersonalInfo}
              >
                <Text style={styles.modalSaveText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              🔔 {t.notifications}
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t.notifPush}
              </Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t.notifSound}
              </Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t.notifVibrate}
              </Text>
              <Switch
                value={vibrateEnabled}
                onValueChange={setVibrateEnabled}
                trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNotifications(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveNotifications}
              >
                <Text style={styles.modalSaveText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* GPS Settings Modal */}
      <Modal visible={showGPS} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              📍 {t.gpsSettings}
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t.gpsHighAccuracy}
              </Text>
              <Switch
                value={gpsHighAccuracy}
                onValueChange={setGpsHighAccuracy}
                trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
              />
            </View>
            <Text style={[styles.inputLabel, { color: subColor }]}>
              {t.gpsInterval}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: textColor,
                  borderColor: darkMode ? '#444' : '#e5e7eb',
                },
              ]}
              value={gpsInterval}
              onChangeText={setGpsInterval}
              keyboardType="numeric"
            />
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t.gpsBackground}
              </Text>
              <Switch
                value={gpsBackground}
                onValueChange={setGpsBackground}
                trackColor={{ false: '#d1d5db', true: '#6C63FF' }}
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowGPS(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveGPS}
              >
                <Text style={styles.modalSaveText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguage} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              🌐 {t.selectLanguage}
            </Text>
            {[
              {
                code: 'az' as Language,
                label: '🇦🇿 Azərbaycan dili',
                sub: 'Azerbaijani',
              },
              { code: 'ru' as Language, label: '🇷🇺 Русский', sub: 'Russian' },
              { code: 'en' as Language, label: '🇬🇧 English', sub: 'English' },
            ].map(l => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.langOption,
                  lang === l.code && styles.langOptionActive,
                ]}
                onPress={() => handleChangeLanguage(l.code)}
              >
                <Text style={[styles.langLabel, { color: textColor }]}>
                  {l.label}
                </Text>
                {lang === l.code && <Text style={styles.langCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowLanguage(false)}
            >
              <Text style={styles.modalCancelText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelp} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              ❓ {t.helpTitle}
            </Text>
            <Text style={[styles.helpText, { color: subColor }]}>
              {t.helpText}
            </Text>
            <View style={styles.helpContact}>
              <Text style={[styles.helpContactText, { color: textColor }]}>
                {t.contactEmail}
              </Text>
              <Text style={[styles.helpContactText, { color: textColor }]}>
                {t.contactPhone}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={() => setShowHelp(false)}
            >
              <Text style={styles.modalSaveText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 2 },
  roleBadge: {
    backgroundColor: '#6C63FF20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleText: { color: '#6C63FF', fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },
  menu: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f620',
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15 },
  menuArrow: { fontSize: 20, color: '#d1d5db' },
  menuInfo: { fontSize: 13, color: '#6C63FF', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#E74C3C10',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', color: '#9ca3af', fontSize: 12 },
  company: {
    textAlign: 'center',
    color: '#d1d5db',
    fontSize: 11,
    marginTop: 2,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: { fontSize: 15 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  langOptionActive: {
    backgroundColor: '#6C63FF10',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  langLabel: { fontSize: 16 },
  langCheck: { fontSize: 18, color: '#6C63FF', fontWeight: '700' },
  helpText: { fontSize: 15, marginBottom: 16, lineHeight: 22 },
  helpContact: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  helpContactText: { fontSize: 14 },
});
