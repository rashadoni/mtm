// WebSocket service for realtime GPS tracking
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const WS_URL = 'ws://178.156.249.177:4000/ws';

class WSService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connecting = false;

  async connect() {
    if (this.connecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;
    this.connecting = true;

    try {
      const token = await AsyncStorage.getItem('mtm-token');
      if (!token) {
        console.log('[WS] No token, skipping connect');
        this.connecting = false;
        return;
      }

      console.log('[WS] Connecting to', WS_URL);

      // Close any existing connection
      if (this.ws) {
        try { this.ws.close(); } catch {}
        this.ws = null;
      }

      this.ws = new WebSocket(`${WS_URL}?token=${token}`);

      this.ws.onopen = () => {
        console.log('[WS] ✅ Connected successfully');
        this.connecting = false;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event: any) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('[WS] Message:', msg.type);
          this.emit(msg.type, msg.payload || msg);
        } catch {}
      };

      this.ws.onclose = (e: any) => {
        console.log('[WS] Disconnected, code:', e?.code);
        this.connecting = false;
        this.emit('disconnected', {});
        // Auto-reconnect after 5s
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (err: any) => {
        console.log('[WS] ❌ Error:', err?.message || 'unknown');
        this.connecting = false;
      };
    } catch (err: any) {
      console.log('[WS] ❌ Connect failed:', err?.message);
      this.connecting = false;
      // Retry
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connecting = false;
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
      return true;
    }
    console.log('[WS] Cannot send, not connected. readyState:', this.ws?.readyState);
    return false;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Send GPS location
  sendLocation(lat: number, lng: number, speed: number, heading: number, battery: number) {
    this.send('location_update', { lat, lng, speed, heading, battery, accuracy: 10 });
  }

  // Check-in via WebSocket
  sendCheckIn(customerId: string, lat: number, lng: number) {
    this.send('check_in', { customerId, lat, lng });
  }

  sendCheckOut(visitId: string, lat: number, lng: number) {
    this.send('check_out', { visitId, lat, lng });
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const cbs = this.listeners.get(event);
    if (cbs) this.listeners.set(event, cbs.filter(cb => cb !== callback));
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const wsService = new WSService();
