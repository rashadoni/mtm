'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, ChevronRight, ChevronLeft,
  LayoutDashboard, Map, Route, FileText,
  Users, Settings, PieChart, Trophy, Shield,
  Sparkles, Keyboard, Rocket,
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  action?: string;    // Navigation path
}

const TOUR_STORAGE_KEY = 'mtm_tour_completed';

const tourSteps: TourStep[] = [
  {
    title: 'MTM Admin Panelə Xoş Gəlmisiniz!',
    description: 'Bu interaktiv tur sizə panelin əsas funksiyalarını tanıdacaq. Hər addımda yeni bir bölmə haqqında məlumat alacaqsınız.',
    icon: <Rocket size={32} style={{ color: '#6C63FF' }} />,
  },
  {
    title: 'İdarə Paneli',
    description: 'Ana səhifədə KPI göstəriciləri, agent statusları, qrafiklər və canlı statistika görə bilərsiniz. Bütün əsas məlumatlar bir baxışda.',
    icon: <LayoutDashboard size={28} style={{ color: '#6C63FF' }} />,
    action: '/dashboard',
  },
  {
    title: 'Canlı Xəritə',
    description: 'Agentlərin real-vaxt mövqeyini xəritədə izləyin. GPS koordinatları, sürət, batareya səviyyəsi və status məlumatlarını görün.',
    icon: <Map size={28} style={{ color: '#10B981' }} />,
    action: '/map',
  },
  {
    title: 'Marşrutlar',
    description: 'Agentlər üçün marşrut planlaşdırın, optimallaşdırın və icra vəziyyətini izləyin. Drag-and-drop ilə nöqtələri dəyişdirin.',
    icon: <Route size={28} style={{ color: '#3498DB' }} />,
    action: '/routes',
  },
  {
    title: 'Hesabatlar',
    description: 'Gündəlik, həftəlik və aylıq hesabatları baxın. Excel, PDF və CSV formatlarında ixrac edin.',
    icon: <FileText size={28} style={{ color: '#F59E0B' }} />,
    action: '/reports',
  },
  {
    title: 'Analitika və Liderlik',
    description: 'Dərin performans analizi, agent reytinqləri, XP sistemi və nailiyyətlər. Komandanın motivasiyasını artırın.',
    icon: <PieChart size={28} style={{ color: '#8B5CF6' }} />,
    action: '/analytics',
  },
  {
    title: 'Audit Jurnalı',
    description: 'Bütün sistem əməliyyatlarını izləyin — kim, nə vaxt, nə etdi. Tam şəffaflıq və hesabatlılıq.',
    icon: <Shield size={28} style={{ color: '#EF4444' }} />,
    action: '/audit',
  },
  {
    title: 'Parametrlər',
    description: 'Geofence, GPS izləmə, foto ayarları, Telegram bot inteqrasiyası və digər sistem tənzimləmələri.',
    icon: <Settings size={28} style={{ color: '#00BFA6' }} />,
    action: '/settings',
  },
  {
    title: 'Sürətli Əmrlər',
    description: 'İstənilən yerdə ⌘K (və ya Ctrl+K) basaraq axtarış və naviqasiya panelini açın. Sürətli keçid üçün ideal.',
    icon: <Keyboard size={28} style={{ color: '#6C63FF' }} />,
  },
  {
    title: 'Hazırsınız!',
    description: 'MTM Admin Panel tam sizin ixtiyarınızdadır. İstənilən vaxt "?" ikonasına basaraq bu turu yenidən başlada bilərsiniz.',
    icon: <Sparkles size={32} style={{ color: '#F59E0B' }} />,
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  // Check if tour was already completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!completed) {
        // Auto-open on first visit with delay
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      const nextStep = tourSteps[step + 1];
      if (nextStep.action) {
        router.push(nextStep.action);
      }
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = tourSteps[step - 1];
      if (prevStep.action) {
        router.push(prevStep.action);
      }
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    setStep(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Public method to restart the tour
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener('mtm:restart-tour', handler);
    return () => window.removeEventListener('mtm:restart-tour', handler);
  }, []);

  if (!isOpen) return null;

  const currentStep = tourSteps[step];
  const progress = ((step + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" onClick={handleSkip} />

      {/* Tour Card */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-slate-700">
            <div
              className="h-full transition-all duration-500 ease-out rounded-r"
              style={{ width: `${progress}%`, backgroundColor: '#6C63FF' }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {currentStep.icon}
              </div>
            </div>

            {/* Step indicator */}
            <p className="text-xs text-gray-400 mb-2">
              {step + 1} / {tourSteps.length}
            </p>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {currentStep.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Step Dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-6'
                    : i < step
                    ? 'bg-gray-300 dark:bg-slate-600'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
                style={i === step ? { backgroundColor: '#6C63FF' } : i < step ? {} : undefined}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Keç
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} />
                  Geri
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#6C63FF' }}
              >
                {step === tourSteps.length - 1 ? 'Başla!' : 'Davam et'}
                {step < tourSteps.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Small help button to restart the tour.
 * Place this in the header or any visible location.
 */
export function TourHelpButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event('mtm:restart-tour'));
  };

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      title="Tur başlat"
    >
      <span className="text-sm font-bold">?</span>
    </button>
  );
}
