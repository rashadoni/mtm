'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF, #00BFA6)' }}>
              <span className="text-white text-xl font-bold">MTM</span>
            </div>
          </div>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
