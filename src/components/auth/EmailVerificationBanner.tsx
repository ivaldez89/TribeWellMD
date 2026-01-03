'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { resendVerificationEmail } from '@/lib/supabase/auth';

export function EmailVerificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && !user.email_confirmed_at) {
        setIsVisible(true);
        setEmail(user.email || null);
      } else {
        setIsVisible(false);
      }
    };

    checkVerification();

    // Check on auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !session.user.email_confirmed_at) {
        setIsVisible(true);
        setEmail(session.user.email || null);
      } else {
        setIsVisible(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setMessage(null);

    const result = await resendVerificationEmail(email);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Verification email sent!' });
    }

    setIsResending(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in session storage so it reappears on page refresh
    sessionStorage.setItem('email_verification_banner_dismissed', 'true');
  };

  // Check if previously dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('email_verification_banner_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mail icon */}
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">
              Please verify your email address to access all features.
              {email && <span className="hidden sm:inline"> Check <strong>{email}</strong> for a verification link.</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {message && (
              <span className={`text-sm ${message.type === 'success' ? 'text-green-100' : 'text-red-100'}`}>
                {message.text}
              </span>
            )}

            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>

            <Link
              href="/auth/verify-email"
              className="text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              More Info
            </Link>

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
