'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate .edu email
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Please enter your .edu email address');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Integrate with Supabase auth.resetPasswordForEmail
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/40 to-cyan-200/40 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-100/30 to-indigo-100/30 dark:from-cyan-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-xl shadow-teal-500/25 overflow-hidden">
            <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-slate-900 dark:text-white">Tribe</span>
            <span className="text-teal-600 dark:text-teal-400">Well</span>
            <span className="text-indigo-600 dark:text-indigo-400">MD</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Reset your password</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-700/50 p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Check your email</h2>
              <p className="text-slate-600 dark:text-slate-400">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all ${
                    email && !email.toLowerCase().endsWith('.edu')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                  }`}
                  placeholder="you@school.edu"
                  required
                />
                {email && !email.toLowerCase().endsWith('.edu') && (
                  <p className="mt-1 text-xs text-red-500 font-medium">Please enter your .edu email address</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Study Smart. Find Your Tribe. Stay Well.
        </p>
      </div>
    </div>
  );
}
