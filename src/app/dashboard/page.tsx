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
      <div className="min-h-screen bg-[#F5F0E8] dark:bg-slate-900">
        <Header />
        <main className="h-[calc(100vh-64px)]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B7B6D]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 h-[calc(100vh-64px)]">
        <UnifiedCalendarHub />
      </main>
    </div>
  );
}
