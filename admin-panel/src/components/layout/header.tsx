'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { useSidebarStore } from '@/store/sidebar';
import { useI18nStore, useTranslation, localeLabels, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/layout/notification-center';
import { TourHelpButton } from '@/components/layout/onboarding-tour';
import { Globe } from 'lucide-react';

interface HeaderProps {
  title?: string;
  notificationCount?: number;
}

export function Header({ title = 'Dashboard', notificationCount = 0 }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { toggle } = useSidebarStore();
  const { locale, setLocale } = useI18nStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Close language menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [langMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-4">
          {/* Hamburger Button - Mobile Only */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Home size={16} />
            </Link>
            {pathname !== '/dashboard' && (
              <>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </>
            )}
            {pathname === '/dashboard' && (
              <>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </>
            )}
          </div>
        </div>

        {/* Right: Search, Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
          {/* Search / Command Palette Trigger - Desktop */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
            }}
            className="hidden md:flex items-center gap-3 bg-gray-100 dark:bg-slate-800 rounded-lg px-4 py-2 min-w-64 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400 flex-1 text-left">{t('common.search')}...</span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200 dark:bg-slate-700 rounded">⌘K</kbd>
          </button>

          {/* Search - Mobile Icon */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
            }}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t('common.search')}
          >
            <Search size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Dil dəyişdir"
            >
              <Globe size={16} />
              <span className="text-xs">{localeLabels[locale]}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                {(['az', 'ru', 'en'] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setLangMenuOpen(false); }}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                      locale === l
                        ? 'bg-purple-50 dark:bg-purple-900/20 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    )}
                    style={locale === l ? { color: '#6C63FF' } : undefined}
                  >
                    {localeLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Qaranlıq rejim' : theme === 'dark' ? 'Sistem rejimi' : 'İşıqlı rejim'}
          >
            {theme === 'light' ? (
              <Moon size={20} />
            ) : theme === 'dark' ? (
              <Monitor size={20} />
            ) : (
              <Sun size={20} />
            )}
          </Button>

          {/* Help Tour */}
          <TourHelpButton />

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu - Custom Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-auto px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: '#6C63FF' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={16} />
                  {t('profile.personalInfo')}
                </Link>

                {/* Settings Link */}
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings size={16} />
                  {t('nav.settings')}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
