// Background GPS tracking — sends location to server via WebSocket
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { api } from './api';

const SEND_INTERVAL_MS = 10_000;

class LocationTracker {
  private watchId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastLat = 0;
  private lastLng = 0;
  private lastSpeed = 0;
  private lastHeading = 0;
  private started = false;

  async start() {
    if (this.started) return;
    this.started = true;
    console.log('[LocationTracker] Starting...');

    // Request permission on Android
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'GPS İcazəsi',
            message: 'Mövqeyinizi izləmək üçün GPS icazəsi lazımdır',
            buttonPositive: 'İcazə ver',
            buttonNegative: 'Ləğv et',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[LocationTracker] Permission denied');
          this.started = false;
          return;
        }
      } catch {
        this.started = false;
        return;
      }
    }

    // Get initial position first, THEN connect WS and send
    Geolocation.getCurrentPosition(
      pos => {
        this.lastLat = pos.coords.latitude;
        this.lastLng = pos.coords.longitude;
        this.lastSpeed = pos.coords.speed
          ? Math.round(pos.coords.speed * 3.6)
          : 0;
        this.lastHeading = pos.coords.heading || 0;
        console.log(
          `[LocationTracker] Got GPS: ${this.lastLat.toFixed(
            4,
          )}, ${this.lastLng.toFixed(4)}`,
        );

        this.startSending();
      },
      err => {
        console.log('[LocationTracker] GPS error:', err.message);
        this.startSending();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );

    // Watch position continuously
    this.watchId = Geolocation.watchPosition(
      pos => {
        this.lastLat = pos.coords.latitude;
        this.lastLng = pos.coords.longitude;
        this.lastSpeed = pos.coords.speed
          ? Math.round(pos.coords.speed * 3.6)
          : 0;
        this.lastHeading = pos.coords.heading || 0;
      },
      () => {},
      { enableHighAccuracy: true, distanceFilter: 5 },
    );
  }

  private startSending() {
    void this.sendNow();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.sendNow();
    }, SEND_INTERVAL_MS);
  }

  private async sendNow() {
    if (this.lastLat !== 0 && this.lastLng !== 0) {
      await api
        .sendLocation({
          latitude: this.lastLat,
          longitude: this.lastLng,
          speed: this.lastSpeed,
          heading: this.lastHeading,
          battery: 100,
        })
        .catch(() => {});
    }
  }

  stop() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.started = false;
  }
}

export const locationTracker = new LocationTracker();
