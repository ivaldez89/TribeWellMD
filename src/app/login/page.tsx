'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { setCurrentUserId, clearLegacyProfileData } from '@/lib/storage/profileStorage';
import { PublicPageLayout } from '@/components/layout/PublicPageLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else if (data.user && data.session) {
      // Set the current user ID for profile storage
      setCurrentUserId(data.user.id);
      // Clear any legacy profile data from before user-aware storage
      clearLegacyProfileData();

      // Wait for Supabase to fully set the session cookies
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a full page reload to ensure middleware picks up new cookies
      window.location.replace('/');
    } else if (data.user && !data.session) {
      // User exists but no session - likely email not confirmed
      setError('Please check your email and confirm your account before signing in.');
      setIsLoading(false);
    }
  };

  return (
    <PublicPageLayout>
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-96px)]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D4C4B0]/40 to-[#C4A77D]/40 dark:from-[#C4A77D]/10 dark:to-[#A89070]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#C4A77D]/40 to-[#D4C4B0]/40 dark:from-[#A89070]/10 dark:to-[#C4A77D]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#E8E0D5]/30 to-[#D4C4B0]/30 dark:from-[#C4A77D]/5 dark:to-[#A89070]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-xl shadow-[#C4A77D]/25 overflow-hidden">
            <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-slate-900 dark:text-white">Tribe</span>
            <span className="text-[#8B7355] dark:text-[#C4A77D]">Well</span>
            <span className="text-[#5B7B6D] dark:text-[#7FA08F]">MD</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                placeholder="you@school.edu"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#8B7355] hover:text-[#6B5945] dark:text-[#C4A77D] dark:hover:text-[#D4B88D]"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#B89B78] hover:to-[#9A8565] text-white font-bold rounded-xl shadow-lg shadow-[#C4A77D]/25 hover:shadow-[#C4A77D]/40 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">
              Don't have an account?
            </p>
            <Link
              href="/register"
              className="block w-full py-3 text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Study Smart. Find Your Tribe. Stay Well.
        </p>
      </div>
      </div>
    </PublicPageLayout>
  );
}
