'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useSidebarStore } from '@/store/sidebar';
import { useTranslation } from '@/lib/i18n';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ToastProvider } from '@/components/ui/toast';
import { AuthGuard } from '@/components/auth/auth-guard';
import { CommandPalette } from '@/components/layout/command-palette';
import { OnboardingTour } from '@/components/layout/onboarding-tour';
import { Footer } from '@/components/layout/footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Map routes to i18n keys
const routeTitleKeys: Record<string, string> = {
  '/dashboard': 'dashboard.title',
  '/map': 'map.title',
  '/routes': 'routes.title',
  '/reports': 'nav.reports',
  '/photos': 'photos.title',
  '/customers': 'customers.title',
  '/tasks': 'tasks.title',
  '/alerts': 'alerts.title',
  '/analytics': 'analytics.title',
  '/leaderboard': 'leaderboard.title',
  '/activity': 'activity.title',
  '/audit': 'audit.title',
  '/inventory': 'inventory.title',
  '/users': 'users.title',
  '/settings': 'settings.title',
  '/profile': 'profile.title',
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { resolvedTheme, hydrate } = useThemeStore();
  const { isExpanded } = useSidebarStore();
  const { t, locale } = useTranslation();
  const pathname = usePathname();

  // Get translated page title from route
  const titleKey = routeTitleKeys[pathname] || 'dashboard.title';
  const pageTitle = t(titleKey);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Apply theme to root html element
    const htmlElement = document.documentElement;
    if (resolvedTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Sync locale to html lang attribute
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    // Set CSS variable for sidebar width based on screen size
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const isMobile = window.innerWidth < 1024;
      root.style.setProperty('--sidebar-width', isMobile ? '0px' : (isExpanded ? '16rem' : '5rem'));
    }
  }, [isExpanded]);

  // Handle resize: reset sidebar width on mobile/desktop switch
  useEffect(() => {
    const handleResize = () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const isMobile = window.innerWidth < 1024;
        root.style.setProperty('--sidebar-width', isMobile ? '0px' : (isExpanded ? '16rem' : '5rem'));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  return (
    <AuthGuard>
      <ToastProvider>
        <CommandPalette />
        <OnboardingTour />
        <Sidebar />
        <div className="min-h-screen flex flex-col transition-all duration-300 ml-[var(--sidebar-width,16rem)] bg-gray-50 dark:bg-slate-900">
          <Header title={pageTitle} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
