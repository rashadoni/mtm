/**
 * MTM API Client
 * Connects frontend to backend REST API
 * Falls back to mock data when backend is unavailable
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private token: string | null = null;
  private backendAvailable: boolean | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('mtm-token', token);
      else localStorage.removeItem('mtm-token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('mtm-token');
    }
    return this.token;
  }

  /**
   * Check if backend is reachable
   */
  async isBackendAvailable(): Promise<boolean> {
    if (this.backendAvailable !== null) return this.backendAvailable;
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      this.backendAvailable = res.ok;
    } catch {
      this.backendAvailable = false;
    }
    return this.backendAvailable;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(error.error || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  // ===== AUTH =====
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async getMe() { return this.request<any>('/auth/me'); }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    this.setToken(null);
  }

  // ===== USERS =====
  async getUsers(params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.role) q.set('role', params.role);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return this.request<{ users: any[]; total: number; page: number; pages: number }>(`/users?${q}`);
  }
  async getUser(id: string) { return this.request<any>(`/users/${id}`); }
  async createUser(data: any) { return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id: string, data: any) { return this.request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id: string) { return this.request<any>(`/users/${id}`, { method: 'DELETE' }); }

  // ===== CUSTOMERS =====
  async getCustomers(params?: { page?: number; limit?: number; category?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return this.request<{ customers: any[]; total: number }>(`/customers?${q}`);
  }
  async getCustomer(id: string) { return this.request<any>(`/customers/${id}`); }
  async createCustomer(data: any) { return this.request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }); }
  async updateCustomer(id: string, data: any) { return this.request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteCustomer(id: string) { return this.request<any>(`/customers/${id}`, { method: 'DELETE' }); }

  // ===== ROUTES =====
  async getRoutes(params?: { agentId?: string; startDate?: string; endDate?: string }) {
    const q = new URLSearchParams();
    if (params?.agentId) q.set('agentId', params.agentId);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    return this.request<{ routes: any[]; total: number }>(`/routes?${q}`);
  }
  async getRoute(id: string) { return this.request<any>(`/routes/${id}`); }
  async createRoute(data: any) { return this.request<any>('/routes', { method: 'POST', body: JSON.stringify(data) }); }
  async updateRoute(id: string, data: any) { return this.request<any>(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteRoute(id: string) { return this.request<any>(`/routes/${id}`, { method: 'DELETE' }); }

  // ===== VISITS =====
  async getVisits(params?: { agentId?: string; customerId?: string; startDate?: string; endDate?: string }) {
    const q = new URLSearchParams();
    if (params?.agentId) q.set('agentId', params.agentId);
    if (params?.customerId) q.set('customerId', params.customerId);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    return this.request<{ visits: any[]; total: number }>(`/visits?${q}`);
  }
  async checkIn(data: { customerId: string; lat: number; lng: number }) {
    return this.request<any>('/visits/check-in', { method: 'POST', body: JSON.stringify(data) });
  }
  async checkOut(visitId: string, data: { lat: number; lng: number }) {
    return this.request<any>(`/visits/${visitId}/check-out`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async getVisitStats() { return this.request<any>('/visits/stats'); }

  // ===== TASKS =====
  async getTasks(params?: { status?: string; priority?: string; assigneeId?: string }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.assigneeId) q.set('assigneeId', params.assigneeId);
    return this.request<{ tasks: any[]; total: number }>(`/tasks?${q}`);
  }
  async createTask(data: any) { return this.request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }); }
  async updateTask(id: string, data: any) { return this.request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async updateTaskStatus(id: string, status: string) {
    return this.request<any>(`/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  async deleteTask(id: string) { return this.request<any>(`/tasks/${id}`, { method: 'DELETE' }); }

  // ===== PHOTOS =====
  async getPhotos(params?: { status?: string; agentId?: string }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.agentId) q.set('agentId', params.agentId);
    return this.request<{ photos: any[]; total: number }>(`/photos?${q}`);
  }
  async approvePhoto(id: string) { return this.request<any>(`/photos/${id}/approve`, { method: 'PUT' }); }
  async rejectPhoto(id: string) { return this.request<any>(`/photos/${id}/reject`, { method: 'PUT' }); }

  // ===== ALERTS =====
  async getAlerts(params?: { type?: string; isRead?: boolean }) {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.isRead !== undefined) q.set('isRead', String(params.isRead));
    return this.request<{ alerts: any[]; total: number }>(`/alerts?${q}`);
  }
  async markAlertRead(id: string) { return this.request<any>(`/alerts/${id}/read`, { method: 'PUT' }); }
  async resolveAlert(id: string) { return this.request<any>(`/alerts/${id}/resolve`, { method: 'PUT' }); }
  async markAllAlertsRead() { return this.request<any>('/alerts/mark-all-read', { method: 'PUT' }); }

  // ===== REPORTS =====
  async getDailyReport(params?: { startDate?: string; endDate?: string }) {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    return this.request<any>(`/reports/daily?${q}`);
  }
  async getPerformanceReport() { return this.request<any>('/reports/performance'); }
  async getRouteExecutionReport() { return this.request<any>('/reports/route-execution'); }
  async getGpsTrackingReport() { return this.request<any>('/reports/gps-tracking'); }

  // ===== INVENTORY (1C) =====
  async getInventoryBalances() { return this.request<any>('/inventory/balances'); }
  async getInventoryStatus() { return this.request<any>('/inventory/status'); }
}

export const api = new ApiClient();
