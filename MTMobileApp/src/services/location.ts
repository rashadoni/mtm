// GPS Location Service for MTM Mobile
// Uses @react-native-community/geolocation for real GPS
// Uses react-native-device-info for real battery level

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';
import { wsService } from './websocket';

interface Location {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  accuracy: number;
}

class LocationService {
  private watchId: number | null = null;
  private lastLocation: Location | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private batteryLevel: number = 100;

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'GPS İcazəsi',
            message: 'MTM Mobile agentin yerini izləmək üçün GPS icazəsi tələb edir',
            buttonPositive: 'İcazə ver',
            buttonNegative: 'Ləğv et',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  }

  async startTracking(intervalMs: number = 10000) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('[Location] Permission denied');
      return;
    }

    console.log(`[Location] Tracking started (interval: ${intervalMs}ms)`);

    // Watch real GPS position
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.lastLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy || 10,
        };
      },
      (error) => console.error('[Location] Watch error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 5000,
        fastestInterval: 2000,
      }
    );

    // Also get initial position immediately
    Geolocation.getCurrentPosition(
      (position) => {
        this.lastLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy || 10,
        };
      },
      (error) => console.error('[Location] Initial position error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Send location + real battery to server periodically
    this.trackingInterval = setInterval(async () => {
      if (!this.lastLocation) return;

      // Get real battery level
      try {
        this.batteryLevel = Math.round((await DeviceInfo.getBatteryLevel()) * 100);
      } catch {
        // Keep last known battery level
      }

      // Send to server via WebSocket
      wsService.sendLocation(
        this.lastLocation.lat,
        this.lastLocation.lng,
        this.lastLocation.speed,
        this.lastLocation.heading,
        this.batteryLevel
      );
    }, intervalMs);
  }

  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    console.log('[Location] Tracking stopped');
  }

  getLastLocation(): Location | null {
    return this.lastLocation;
  }

  getBatteryLevel(): number {
    return Math.round(this.batteryLevel);
  }

  // Calculate distance between two points (Haversine)
  static distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Check if agent is within geofence radius (in meters)
  static isWithinGeofence(agentLat: number, agentLng: number, centerLat: number, centerLng: number, radiusMeters: number): boolean {
    const distanceKm = LocationService.distance(agentLat, agentLng, centerLat, centerLng);
    return distanceKm * 1000 <= radiusMeters;
  }
}

export const locationService = new LocationService();
