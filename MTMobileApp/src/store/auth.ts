import { create } from 'zustand';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  region?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    tenantSlug: string,
    serverUrl: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password, tenantSlug, serverUrl) => {
    set({ loading: true });
    try {
      const agent = await api.login(email, password, tenantSlug, serverUrl);
      set({ user: agent, isAuthenticated: true });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await api.getToken();
      if (!token) {
        set({ loading: false });
        return;
      }
      const { agent } = await api.getProfile();
      set({ user: agent, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
}));
