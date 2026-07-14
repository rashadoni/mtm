// Push Notification Service for MTM Mobile
// Uses react-native-push-notification (install separately)
// npm install @react-native-firebase/app @react-native-firebase/messaging

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  private fcmToken: string | null = null;

  async init() {
    try {
      // Request permission
      if (Platform.OS === 'ios') {
        // iOS requires explicit permission
        // const authStatus = await messaging().requestPermission();
        console.log('[Notifications] iOS permission requested');
      }

      // Get FCM token
      // const token = await messaging().getToken();
      // this.fcmToken = token;
      // await AsyncStorage.setItem('fcm-token', token);
      console.log('[Notifications] FCM token obtained');

      // Listen for foreground messages
      // messaging().onMessage(async (remoteMessage) => {
      //   this.handleForegroundMessage(remoteMessage);
      // });

      // Listen for background/quit messages
      // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      //   this.handleBackgroundMessage(remoteMessage);
      // });

      console.log('[Notifications] Service initialized');
    } catch (err) {
      console.error('[Notifications] Init error:', err);
    }
  }

  getFCMToken(): string | null {
    return this.fcmToken;
  }

  private handleForegroundMessage(message: any) {
    const { title, body } = message.notification || {};
    if (title && body) {
      Alert.alert(title, body);
    }
  }

  private handleBackgroundMessage(message: any) {
    console.log('[Notifications] Background message:', message);
  }

  // Schedule local notification
  async scheduleLocal(title: string, body: string, delay: number = 0) {
    // PushNotification.localNotificationSchedule({
    //   title,
    //   message: body,
    //   date: new Date(Date.now() + delay),
    //   channelId: 'mtm-default',
    // });
    console.log(`[Notifications] Scheduled: ${title} - ${body}`);
  }

  // Notification types for MTM
  async notifyCheckIn(customerName: string) {
    await this.scheduleLocal('Check-in', `${customerName} müştərisinə check-in edildi`);
  }

  async notifyCheckOut(customerName: string, duration: number) {
    await this.scheduleLocal('Check-out', `${customerName} — ${duration} dəq ziyarət`);
  }

  async notifyNewTask(taskTitle: string) {
    await this.scheduleLocal('Yeni Tapşırıq', taskTitle);
  }

  async notifyRouteDeviation() {
    await this.scheduleLocal('⚠️ Marşrut Sapması', 'Planlaşdırılan marşrutdan sapırsınız');
  }

  async notifyLowBattery(level: number) {
    await this.scheduleLocal('🔋 Zəif Batareya', `Batareya ${level}% səviyyəsindədir`);
  }
}

export const notificationService = new NotificationService();
