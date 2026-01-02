'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect from old /progress/rapid-review to new /study/rapid-review
 * Rapid Review is a study mode, not a progress/analytics page
 */
export default function RapidReviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/study/rapid-review');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-content-muted">Redirecting...</p>
      </div>
    </div>
  );
}
