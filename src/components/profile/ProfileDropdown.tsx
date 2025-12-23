'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserProfile, getUserInitials, getDisplayName, type UserProfile } from '@/lib/storage/profileStorage';
import { getConnectionCount, getPendingRequestCount } from '@/lib/storage/chatStorage';
import { getUserTribes } from '@/lib/storage/tribeStorage';
import { signOut as legacySignOut } from '@/hooks/useAuth';
import { signOut as supabaseSignOut } from '@/lib/supabase/auth';
import type { Tribe } from '@/types/tribes';

interface ProfileDropdownProps {
  className?: string;
}

export function ProfileDropdown({ className = '' }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [userTribes, setUserTribes] = useState<Tribe[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsOpen(false);
    // Use legacy signOut to clear cookies and localStorage user session
    legacySignOut();
    // Also sign out of Supabase (this will redirect to /login)
    await supabaseSignOut();
  };

  // Load profile on mount
  useEffect(() => {
    setProfile(getUserProfile());
    setConnectionCount(getConnectionCount());
    setPendingCount(getPendingRequestCount());
    setUserTribes(getUserTribes());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    // Use 'click' instead of 'mousedown' to allow button onClick to fire first
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const initials = getUserInitials();
  const displayName = getDisplayName();
  const hasProfile = profile?.firstName && profile?.lastName;

  return (
    <div className={`relative ${className}`}>
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 p-1 rounded-full transition-all duration-200 hover:ring-2 hover:ring-tribe-sage-500/30 focus:outline-none focus:ring-2 focus:ring-tribe-sage-500/50"
        aria-label="Profile menu"
      >
        {/* Avatar */}
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white dark:border-slate-700">
            {initials}
          </div>
        )}

        {/* Online indicator */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-tribe-sage-500 border-2 border-white dark:border-slate-900 rounded-full" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 left-2 sm:left-auto mt-0 sm:mt-2 w-auto sm:w-72 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[110]"
        >
          {/* Profile Header */}
          <div className="relative">
            {/* Gradient Banner */}
            <div className="h-16 bg-gradient-to-r from-tribe-sage-500 via-cyan-500 to-indigo-500" />

            {/* Avatar overlapping banner */}
            <div className="absolute -bottom-8 left-4">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="w-16 h-16 rounded-xl object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-10 pb-4 px-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {hasProfile ? displayName : 'Welcome!'}
            </h3>
            {profile?.currentYear && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile.currentYear} {profile.school ? `at ${profile.school}` : ''}
              </p>
            )}
            {!hasProfile && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set up your profile to get started
              </p>
            )}

            {/* Profile & Settings Buttons - side by side */}
            <div className="flex gap-2 mt-3">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-tribe-sage-600 dark:text-tribe-sage-400 bg-tribe-sage-50 dark:bg-tribe-sage-900/30 hover:bg-tribe-sage-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <Link
                href="/profile/settings"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </div>

            {/* Tribes Section - show if user has tribes */}
            {userTribes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {userTribes.length} Tribe{userTribes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Total tribe members indicator */}
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-tribe-sage-50 dark:bg-tribe-sage-900/30 rounded-full">
                    <span className="text-xs font-bold text-tribe-sage-600 dark:text-tribe-sage-400">
                      {userTribes.reduce((acc, t) => acc + (t.memberCount || 0), 0)}
                    </span>
                    <span className="text-xs text-tribe-sage-500 dark:text-tribe-sage-500">members</span>
                  </div>
                </div>
                <Link
                  href="/tribes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/50 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${userTribes[0]?.color || 'from-orange-400 to-amber-500'} flex items-center justify-center text-white text-sm`}>
                    {userTribes[0]?.icon || '🔥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {userTribes[0]?.name || 'Your Tribe'}
                    </p>
                    {userTribes.length > 1 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        +{userTribes.length - 1} more
                      </p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Tribe Progress - Points & Impact */}
                <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-tribe-sage-100 dark:bg-tribe-sage-900/50 flex items-center justify-center">
                        <span className="text-xs">✨</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Tribe Impact</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Your wellness points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-tribe-sage-600 dark:text-tribe-sage-400">
                        {userTribes.reduce((acc, t) => acc + (t.weeklyPoints || 0), 0)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">this week</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {hasProfile && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="text-center relative">
                  <div className="text-lg font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{connectionCount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Connections</div>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">0</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Study Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">0</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Day Streak</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Access - Dashboard only (other items accessible via main nav) */}
          <div className="border-t border-slate-100 dark:border-slate-700">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent dark:hover:from-teal-900/20 dark:hover:to-transparent transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium">Dashboard</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Your daily command center</span>
              </div>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-100 dark:border-slate-700 p-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSignOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
