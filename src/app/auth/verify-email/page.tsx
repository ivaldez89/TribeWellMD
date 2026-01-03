'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resendVerificationEmail } from '@/lib/supabase/auth';
import { PublicPageLayout } from '@/components/layout/PublicPageLayout';

// Icons
const MailIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

// Loading skeleton
function LoadingSkeleton() {
  return (
    <PublicPageLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-48 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-64 mx-auto bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const error = searchParams.get('error');
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    const result = await resendVerificationEmail(email);

    if (result.error) {
      setResendError(result.error);
    } else {
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
    }

    setIsResending(false);
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'link_expired':
        return 'Your verification link has expired. Please request a new one.';
      case 'verification_failed':
        return 'We couldn\'t verify your email. Please try again or request a new link.';
      default:
        return decodeURIComponent(errorCode);
    }
  };

  // SUCCESS STATE - Email verified
  if (verified) {
    return (
      <PublicPageLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                <CheckCircleIcon />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Email Verified!
              </h1>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your email has been successfully verified. You can now access all features of TribeWellMD.
              </p>

              <Link
                href="/calendar"
                className="inline-block w-full py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#B89B78] hover:to-[#9A8565] text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Go to Calendar
              </Link>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Welcome to your tribe!
              </p>
            </div>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  // ERROR STATE - Verification failed
  if (error) {
    return (
      <PublicPageLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
                <ExclamationIcon />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Verification Failed
              </h1>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {getErrorMessage(error)}
              </p>

              {/* Resend form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-left">
                    Enter your email to resend verification
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.edu"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent transition-all"
                  />
                </div>

                {resendError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{resendError}</p>
                )}

                {resendSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Verification email sent! Check your inbox.
                  </p>
                )}

                <button
                  onClick={handleResend}
                  disabled={isResending || countdown > 0 || !email}
                  className="w-full py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#B89B78] hover:to-[#9A8565] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href="/login"
                  className="text-[#8B7355] hover:text-[#C4A77D] dark:text-[#C4A77D] dark:hover:text-[#B89B78] font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  // DEFAULT STATE - Waiting for verification
  return (
    <PublicPageLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-4">
        <div className="w-full max-w-md">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#C4A77D]/40 to-[#A89070]/40 dark:from-[#C4A77D]/20 dark:to-[#A89070]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#D4C4B0]/40 to-[#C4A77D]/40 dark:from-[#C4A77D]/20 dark:to-[#A89070]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#C4A77D]/20 dark:bg-[#C4A77D]/30 text-[#8B7355] dark:text-[#C4A77D] mb-6">
              <MailIcon />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Check Your Email
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-2">
              We&apos;ve sent a verification link to:
            </p>

            {email ? (
              <p className="font-semibold text-slate-900 dark:text-white mb-6">
                {email}
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 mb-6 italic">
                your registered email address
              </p>
            )}

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                Next Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Open your email inbox</li>
                <li>Look for an email from TribeWellMD</li>
                <li>Click the verification link in the email</li>
                <li>You&apos;ll be redirected back here</li>
              </ol>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              <p className="mb-2">Didn&apos;t receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>

            {/* Resend section */}
            <div className="space-y-4">
              {!email && (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to resend"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent transition-all"
                  />
                </div>
              )}

              {resendError && (
                <p className="text-sm text-red-600 dark:text-red-400">{resendError}</p>
              )}

              {resendSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Verification email sent! Check your inbox.
                </p>
              )}

              <button
                onClick={handleResend}
                disabled={isResending || countdown > 0 || !email}
                className="w-full py-3 border-2 border-[#C4A77D] text-[#8B7355] dark:text-[#C4A77D] font-semibold rounded-xl hover:bg-[#C4A77D]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
              <Link
                href="/login"
                className="text-[#8B7355] hover:text-[#C4A77D] dark:text-[#C4A77D] dark:hover:text-[#B89B78] font-medium"
              >
                Back to Sign In
              </Link>
              <Link
                href="/support"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
