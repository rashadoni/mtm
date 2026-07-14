import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_BASE = 'https://app.leaddrivecrm.org/api/v1/mtm';
const TOKEN_KEY = 'mtm-token';
const BASE_URL_KEY = 'mtm-api-base';
const TENANT_KEY = 'mtm-tenant-slug';

export class ApiError extends Error {
  status: number;
  code?: string;
  details: Record<string, unknown>;
  constructor(status: number, body: Record<string, unknown>) {
    super(String(body.error || `HTTP ${status}`));
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof body.code === 'string' ? body.code : undefined;
    this.details = body;
  }
}

export function normalizeBaseUrl(value: string) {
  const clean = value.trim().replace(/\/+$/, '');
  if (!clean) return DEFAULT_API_BASE;
  return clean.endsWith('/api/v1/mtm') ? clean : `${clean}/api/v1/mtm`;
}

class ApiService {
  private token: string | null = null;
  private baseUrl: string | null = null;
  async getToken() {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
    return this.token;
  }
  async setToken(token: string | null) {
    this.token = token;
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  }
  async getBaseUrl() {
    if (this.baseUrl) return this.baseUrl;
    this.baseUrl = normalizeBaseUrl(
      (await AsyncStorage.getItem(BASE_URL_KEY)) || DEFAULT_API_BASE,
    );
    return this.baseUrl;
  }
  async setBaseUrl(value: string) {
    this.baseUrl = normalizeBaseUrl(value);
    await AsyncStorage.setItem(BASE_URL_KEY, this.baseUrl);
  }
  async getTenantSlug() {
    return (await AsyncStorage.getItem(TENANT_KEY)) || '';
  }
  async setTenantSlug(value: string) {
    await AsyncStorage.setItem(TENANT_KEY, value.trim().toLowerCase());
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const [token, baseUrl] = await Promise.all([
      this.getToken(),
      this.getBaseUrl(),
    ]);
    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    } catch {
      throw new ApiError(0, {
        error: 'Network unavailable',
        code: 'NETWORK_UNAVAILABLE',
      });
    }
    const body = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (response.status === 401) {
      await this.setToken(null);
      throw new ApiError(401, { ...body, code: 'SESSION_EXPIRED' });
    }
    if (!response.ok) throw new ApiError(response.status, body);
    return body as T;
  }

  async login(
    email: string,
    password: string,
    organizationSlug: string,
    serverUrl: string,
  ) {
    await Promise.all([
      this.setBaseUrl(serverUrl),
      this.setTenantSlug(organizationSlug),
    ]);
    const response = await this.request<{
      data: { token: string; agent: any };
    }>('/mobile/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password, organizationSlug }),
    });
    await this.setToken(response.data.token);
    return response.data.agent;
  }
  async getProfile() {
    return (await this.request<{ data: any }>('/mobile/profile')).data;
  }
  async logout() {
    await this.setToken(null);
  }
  async getMyRoutes(date = new Date().toISOString().slice(0, 10)) {
    return (await this.request<{ data: any }>(`/routes?date=${date}&limit=100`))
      .data;
  }
  async getRoute(id: string) {
    return (await this.request<{ data: any }>(`/routes/${id}`)).data;
  }
  async createRoute(payload: Record<string, unknown>) {
    return (
      await this.request<{ data: any }>('/routes', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).data;
  }
  async getCustomers(search = '') {
    return (
      await this.request<{ data: { customers: any[] } }>(
        `/customers?limit=100&search=${encodeURIComponent(search)}`,
      )
    ).data.customers;
  }
  async getActiveVisits() {
    return (await this.request<{ data: { visits: any[] } }>('/visits/active'))
      .data.visits;
  }
  async checkIn(payload: Record<string, unknown>) {
    return (
      await this.request<{ data: any }>('/visits', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).data;
  }
  async checkOut(visitId: string, latitude?: number, longitude?: number) {
    return this.request(`/visits/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CHECKED_OUT', latitude, longitude }),
    });
  }
  async getVisitWorkspace(visitId: string) {
    return (await this.request<{ data: any }>(`/visits/${visitId}/workspace`))
      .data;
  }
  async completeVisitAction(visitId: string, payload: Record<string, unknown>) {
    return (
      await this.request<{ data: any }>(`/visits/${visitId}/actions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).data;
  }
  async saveVisitResult(visitId: string, payload: Record<string, unknown>) {
    return (
      await this.request<{ data: any }>(`/visits/${visitId}/result`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    ).data;
  }
  async requestStopRemoval(
    routeId: string,
    routePointId: string,
    reason: string,
  ) {
    return (
      await this.request<{ data: any }>(`/routes/${routeId}/change-requests`, {
        method: 'POST',
        body: JSON.stringify({
          changeType: 'REMOVE_STOP',
          routePointId,
          reason,
        }),
      })
    ).data;
  }
  async requestCustomer(payload: Record<string, unknown>) {
    return (
      await this.request<{ data: any }>('/customer-create-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).data;
  }
  async getMyTasks() {
    return (await this.request<{ data: { tasks: any[] } }>('/tasks?limit=100'))
      .data.tasks;
  }
  async updateTask(id: string, status: string, result?: string) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, result }),
    });
  }
  async uploadPhoto(payload: {
    visitId: string;
    agentId: string;
    uri: string;
    latitude?: number;
    longitude?: number;
  }) {
    const form = new FormData();
    const filename = payload.uri.split('/').pop() || `visit-${Date.now()}.jpg`;
    form.append('file', {
      uri: payload.uri,
      name: filename,
      type: 'image/jpeg',
    } as any);
    form.append('visitId', payload.visitId);
    form.append('agentId', payload.agentId);
    form.append('category', 'VISIT');
    if (payload.latitude != null)
      form.append('latitude', String(payload.latitude));
    if (payload.longitude != null)
      form.append('longitude', String(payload.longitude));
    return this.request('/photos', { method: 'POST', body: form });
  }
  async pushSync(clientId: string, operations: any[]) {
    return this.request<{ results: any[] }>('/mobile/sync/push', {
      method: 'POST',
      body: JSON.stringify({ clientId, operations }),
    });
  }
  async sendLocation(payload: Record<string, unknown>) {
    return this.request('/mobile/location', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
export const api = new ApiService();
