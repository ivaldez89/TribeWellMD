'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/flashcards');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="animate-pulse text-[#5B7B6D] dark:text-slate-400">
        Redirecting to Flashcards...
      </div>
    </div>
  );
}
