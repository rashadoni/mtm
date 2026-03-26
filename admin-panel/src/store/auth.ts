import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthStore {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

// Mock user for when backend is unavailable
const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@mtm.az',
  name: 'Əhməd Məmmədov',
  role: 'super_admin',
  phone: '+994501234567',
  companyId: 'mtm-001',
  status: 'active',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2026-03-17'),
};

const AUTH_STORAGE_KEY = 'mtm_auth';

function saveToStorage(user: User | null) {
  try {
    if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch { /* SSR */ }
}

function loadFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
      if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
      return parsed;
    }
  } catch { /* SSR */ }
  return null;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => {
    saveToStorage(user);
    set({ user, isAuthenticated: user !== null });
  },

  setLoading: (loading) => set({ loading }),

  hydrate: () => {
    const user = loadFromStorage();
    set({ user, isAuthenticated: user !== null, loading: false });
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      // Try real backend first
      const backendUp = await api.isBackendAvailable();

      if (backendUp) {
        const { user } = await api.login(email, password);
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.toLowerCase().replace('_', '_') || 'agent',
          phone: user.phone,
          companyId: 'mtm-001',
          status: user.status?.toLowerCase() || 'active',
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
        saveToStorage(mappedUser);
        set({ user: mappedUser, isAuthenticated: true });
      } else {
        // Fallback to mock login
        await new Promise((r) => setTimeout(r, 500));
        if (email === 'admin@mtm.az' && password === 'R@shad123') {
          saveToStorage(mockAdminUser);
          set({ user: mockAdminUser, isAuthenticated: true });
        } else {
          throw new Error('Yanlış e-poçt və ya şifrə');
        }
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.logout().catch(() => {});
      saveToStorage(null);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
}));
