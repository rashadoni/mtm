'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="flex flex-col items-center justify-center text-center">
        {/* 404 Text with Gradient */}
        <div className="text-8xl md:text-9xl font-black mb-8">
          <span
            style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00BFA6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
        </div>

        {/* Subtitle */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Səhifə tapılmadı
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-lg">
          Axtardığınız səhifə mövcud deyil və ya silinmişdir.
        </p>

        {/* Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#6C63FF' }}
        >
          Ana Səhifəyə Qayıt
        </Link>
      </div>
    </div>
  );
}
