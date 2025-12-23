'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CalendarHub } from '@/components/calendar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-white dark:from-slate-900 dark:to-[#3D4A44]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3D3832] dark:text-[#F5F0E8]">
            Calendar
          </h1>
          <p className="text-[#8B7355] dark:text-[#A89070] mt-1">
            View and manage your study sessions, tasks, and events
          </p>
        </div>

        {/* Calendar Hub */}
        <div className="h-[calc(100vh-280px)] min-h-[600px]">
          <CalendarHub />
        </div>
      </main>

      <Footer />
    </div>
  );
}
