// MTM Mobile API Service
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://178.156.249.177:4000/api'; // Change to your server IP for real device

class ApiService {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem('mtm-token');
    return this.token;
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) await AsyncStorage.setItem('mtm-token', token);
    else await AsyncStorage.removeItem('mtm-token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      await this.setToken(null);
      throw new Error('SESSION_EXPIRED');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Request failed');
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await this.setToken(data.token);
    return data;
  }

  async getMe() { return this.request<any>('/auth/me'); }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    await this.setToken(null);
  }

  // Routes — agent's today route
  async getMyRoutes(date?: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.request<{ routes: any[]; total: number }>(`/routes?startDate=${d}&endDate=${d}`);
  }

  async getRoute(id: string) { return this.request<any>(`/routes/${id}`); }

  // Visits
  async checkIn(customerId: string, lat: number, lng: number) {
    return this.request<any>('/visits/check-in', {
      method: 'POST', body: JSON.stringify({ customerId, lat, lng }),
    });
  }

  async checkOut(visitId: string, lat: number, lng: number) {
    return this.request<any>(`/visits/${visitId}/check-out`, {
      method: 'PUT', body: JSON.stringify({ lat, lng }),
    });
  }

  // Tasks
  async getMyTasks() {
    return this.request<{ tasks: any[]; total: number }>('/tasks');
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request<any>(`/tasks/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status }),
    });
  }

  // Photos
  async uploadPhotoMeta(visitId: string, url: string, lat: number, lng: number) {
    return this.request<any>('/photos', {
      method: 'POST', body: JSON.stringify({ visitId, url, lat, lng }),
    });
  }

  // Location
  async sendLocation(lat: number, lng: number, speed: number, battery: number) {
    return this.request<any>('/visits/stats', { method: 'GET' }); // placeholder
  }
}

export const api = new ApiService();
