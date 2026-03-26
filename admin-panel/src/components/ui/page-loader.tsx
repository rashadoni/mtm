'use client';

import { useState, useEffect, ReactNode } from 'react';

interface PageLoaderProps {
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}

/**
 * Shows a skeleton loading state for a brief moment, then reveals actual content.
 * Provides a professional loading experience while data/components initialize.
 */
export function PageLoader({ skeleton, children, delay = 400 }: PageLoaderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (loading) {
    return <>{skeleton}</>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}
