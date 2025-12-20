'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple client-side validation matching middleware credentials
    if (username === 'tribewellmd' && password === 'preview2024') {
      // Set auth cookie
      document.cookie = 'tribewellmd-auth=authenticated; path=/; max-age=604800'; // 7 days
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TribeWellMD</h1>
          <p className="text-white/80">Preview Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            This is a private preview. Contact the team for access.
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-white/60">
          Built with care for medical students
        </p>
      </div>
    </div>
  );
}
