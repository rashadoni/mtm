'use client';

import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--primary)' }}>MTM</span>
          <span>v1.0.0</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Mobile Team Management</span>
        </div>
        <div className="flex items-center gap-1">
          <span>&copy; {currentYear}</span>
          <a
            href="https://guven.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            Guven Technology MMC
          </a>
        </div>
      </div>
    </footer>
  );
}
