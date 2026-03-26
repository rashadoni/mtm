'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, Map, Route, FileText, Camera,
  Users, Settings, Building2, ListTodo, Bell, Activity,
  PieChart, Trophy, Shield, User, LogOut, Moon, Sun, X,
} from 'lucide-react';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'action' | 'user';
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();

  const navigate = useCallback((path: string) => {
    router.push(path);
    setIsOpen(false);
  }, [router]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'dashboard', label: 'İdarə Paneli', description: 'Ana səhifəyə keç', icon: <LayoutDashboard size={18} />, action: () => navigate('/dashboard'), category: 'navigation', keywords: ['panel', 'home', 'ana'] },
    { id: 'map', label: 'Canlı Xəritə', description: 'Agentləri xəritədə izlə', icon: <Map size={18} />, action: () => navigate('/map'), category: 'navigation', keywords: ['xerite', 'map', 'location', 'gps'] },
    { id: 'routes', label: 'Marşrutlar', description: 'Marşrut planlaşdırması', icon: <Route size={18} />, action: () => navigate('/routes'), category: 'navigation', keywords: ['marsrut', 'route', 'plan'] },
    { id: 'reports', label: 'Hesabatlar', description: 'Hesabat növləri', icon: <FileText size={18} />, action: () => navigate('/reports'), category: 'navigation', keywords: ['hesabat', 'report'] },
    { id: 'photos', label: 'Foto Qalereyası', description: 'Yüklənmiş fotolar', icon: <Camera size={18} />, action: () => navigate('/photos'), category: 'navigation', keywords: ['foto', 'photo', 'sekil'] },
    { id: 'customers', label: 'Müştərilər', description: 'Müştəri bazası', icon: <Building2 size={18} />, action: () => navigate('/customers'), category: 'navigation', keywords: ['musteri', 'customer', 'client'] },
    { id: 'tasks', label: 'Tapşırıqlar', description: 'Kanban lövhəsi', icon: <ListTodo size={18} />, action: () => navigate('/tasks'), category: 'navigation', keywords: ['tapşırıq', 'task', 'todo', 'kanban'] },
    { id: 'alerts', label: 'Xəbərdarlıqlar', description: 'Sistem bildirişləri', icon: <Bell size={18} />, action: () => navigate('/alerts'), category: 'navigation', keywords: ['xeberdarliq', 'alert', 'notification'] },
    { id: 'analytics', label: 'Analitika', description: 'Performans analizi', icon: <PieChart size={18} />, action: () => navigate('/analytics'), category: 'navigation', keywords: ['analitika', 'analytics', 'statistika'] },
    { id: 'leaderboard', label: 'Liderlik Lövhəsi', description: 'Agent reytinqi', icon: <Trophy size={18} />, action: () => navigate('/leaderboard'), category: 'navigation', keywords: ['lider', 'leaderboard', 'reyting', 'score'] },
    { id: 'activity', label: 'Fəaliyyət', description: 'Son hərəkətlər', icon: <Activity size={18} />, action: () => navigate('/activity'), category: 'navigation', keywords: ['fealiyyet', 'activity', 'log'] },
    { id: 'users', label: 'İstifadəçilər', description: 'İstifadəçi idarəsi', icon: <Users size={18} />, action: () => navigate('/users'), category: 'navigation', keywords: ['istifadeci', 'user', 'admin'] },
    { id: 'audit', label: 'Audit Jurnalı', description: 'Sistem əməliyyat tarixçəsi', icon: <Shield size={18} />, action: () => navigate('/audit'), category: 'navigation', keywords: ['audit', 'jurnal', 'log', 'tarixce'] },
    { id: 'settings', label: 'Parametrlər', description: 'Sistem tənzimləmələri', icon: <Settings size={18} />, action: () => navigate('/settings'), category: 'navigation', keywords: ['parametr', 'settings', 'config'] },
    // Reports sub-pages
    { id: 'daily-report', label: 'Gündəlik Hesabat', description: 'Hesabatlar → Gündəlik', icon: <FileText size={18} />, action: () => navigate('/reports/daily'), category: 'navigation', keywords: ['gundelik', 'daily'] },
    { id: 'performance', label: 'Performans Hesabatı', description: 'Hesabatlar → Performans', icon: <FileText size={18} />, action: () => navigate('/reports/performance'), category: 'navigation', keywords: ['performans'] },
    // Actions
    { id: 'toggle-theme', label: theme === 'light' ? 'Qaranlıq Rejim' : theme === 'dark' ? 'Sistem Rejimi' : 'İşıqlı Rejim', description: 'Tema dəyişdir (işıqlı → qaranlıq → sistem)', icon: theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <Sun size={18} /> : <Sun size={18} />, action: () => { toggleTheme(); setIsOpen(false); }, category: 'action', keywords: ['tema', 'theme', 'dark', 'light', 'qaranlig', 'isiqli', 'sistem', 'system'] },
    { id: 'profile', label: 'Profil', description: 'Hesab parametrləri', icon: <User size={18} />, action: () => navigate('/profile'), category: 'user', keywords: ['profil', 'profile', 'hesab'] },
    { id: 'logout', label: 'Çıxış', description: 'Hesabdan çıx', icon: <LogOut size={18} />, action: () => { logout(); router.push('/login'); setIsOpen(false); }, category: 'user', keywords: ['cixis', 'logout', 'exit'] },
  ], [navigate, theme, toggleTheme, logout, router]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query, commands]);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  const grouped = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    action: filteredCommands.filter(c => c.category === 'action'),
    user: filteredCommands.filter(c => c.category === 'user'),
  };

  let globalIndex = -1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-slate-700">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Axtar və ya keç..."
              className="flex-1 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                Nəticə tapılmadı
              </div>
            ) : (
              <>
                {/* Navigation */}
                {grouped.navigation.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Səhifələr</p>
                    {grouped.navigation.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedIndex === idx
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <span className="flex-shrink-0 text-gray-400">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cmd.description}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                {grouped.action.length > 0 && (
                  <div className="mt-2">
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Əməliyyatlar</p>
                    {grouped.action.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedIndex === idx
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <span className="flex-shrink-0 text-gray-400">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cmd.description}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* User */}
                {grouped.user.length > 0 && (
                  <div className="mt-2">
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hesab</p>
                    {grouped.user.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedIndex === idx
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <span className="flex-shrink-0 text-gray-400">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cmd.description}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[9px]">↑↓</kbd> Keç</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[9px]">↵</kbd> Seç</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[9px]">Esc</kbd> Bağla</span>
            </div>
            <span className="text-[10px] text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[9px]">⌘K</kbd>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
