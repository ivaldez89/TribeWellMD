'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard redirect page
 * Redirects to /calendar to preserve existing links
 */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/calendar');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#5B7B6D] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Redirecting to Calendar...</p>
      </div>
    </div>
  );
}
