'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  Route,
  FileText,
  Camera,
  Users,
  Settings,
  Menu,
  X,
  Building2,
  ListTodo,
  Bell,
  Activity,
  PieChart,
  Trophy,
  Shield,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';
import { useTranslation } from '@/lib/i18n';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/map', labelKey: 'nav.map', icon: <Map size={20} /> },
  { href: '/routes', labelKey: 'nav.routes', icon: <Route size={20} /> },
  { href: '/reports', labelKey: 'nav.reports', icon: <FileText size={20} /> },
  { href: '/photos', labelKey: 'nav.photos', icon: <Camera size={20} /> },
  { href: '/customers', labelKey: 'nav.customers', icon: <Building2 size={20} /> },
  { href: '/tasks', labelKey: 'nav.tasks', icon: <ListTodo size={20} /> },
  { href: '/alerts', labelKey: 'nav.alerts', icon: <Bell size={20} /> },
  { href: '/analytics', labelKey: 'nav.analytics', icon: <PieChart size={20} /> },
  { href: '/leaderboard', labelKey: 'nav.leaderboard', icon: <Trophy size={20} /> },
  { href: '/activity', labelKey: 'nav.activity', icon: <Activity size={20} /> },
  { href: '/audit', labelKey: 'nav.audit', icon: <Shield size={20} /> },
  { href: '/inventory', labelKey: 'nav.inventory', icon: <Package size={20} /> },
  { href: '/users', labelKey: 'nav.users', icon: <Users size={20} /> },
  { href: '/settings', labelKey: 'nav.settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { isExpanded, toggle, setExpanded } = useSidebarStore();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Collapse sidebar on mobile initially and manage resize
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setExpanded(false);
    }

    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) {
          setExpanded(true);
        } else {
          setExpanded(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setExpanded]);

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && isExpanded) {
      setExpanded(false);
    }
  };

  return (
    <>
      {/* Overlay backdrop for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-opacity duration-300',
          isExpanded ? 'bg-black/50 opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setExpanded(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-40',
          isExpanded ? 'w-64' : 'w-20',
          // On mobile, use translate to slide in/out
          !isExpanded && 'lg:w-20 max-lg:-translate-x-full max-lg:w-64'
        )}
      >
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-800">
          {isExpanded && (
            <h1 className="text-xl font-bold text-white" style={{ color: 'var(--primary)' }}>MTM</h1>
          )}
          <button
            onClick={toggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                )}
                style={isActive ? { backgroundColor: 'var(--primary)' } : undefined}
                title={!isExpanded ? t(item.labelKey) : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isExpanded && <span className="text-sm font-medium">{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
