'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { UnifiedCalendarHub } from '@/components/calendar/UnifiedCalendarHub';
import { useIsAuthenticated } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B7B6D]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="h-[700px] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <UnifiedCalendarHub />
        </div>
      </main>
    </div>
  );
}
