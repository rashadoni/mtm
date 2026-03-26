import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  hydrate: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      resolvedTheme: 'light',
      toggleTheme: () =>
        set((state) => {
          const order: Theme[] = ['light', 'dark', 'system'];
          const idx = order.indexOf(state.theme);
          const next = order[(idx + 1) % order.length];
          return {
            theme: next,
            resolvedTheme: resolveTheme(next),
          };
        }),
      setTheme: (theme) => set({ theme, resolvedTheme: resolveTheme(theme) }),
      hydrate: () => {
        const { theme } = get();
        set({ resolvedTheme: resolveTheme(theme) });

        // Listen to system theme changes
        if (typeof window !== 'undefined') {
          const mql = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = () => {
            const current = get();
            if (current.theme === 'system') {
              set({ resolvedTheme: getSystemTheme() });
            }
          };
          mql.addEventListener('change', handler);
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
