'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useStreak } from '@/hooks/useStreak';
import { useWellness } from '@/hooks/useWellness';
import { useTribes } from '@/hooks/useTribes';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { getTasks } from '@/lib/storage/taskStorage';
import {
  getUserProfile,
  getUserInitials,
  type UserProfile
} from '@/lib/storage/profileStorage';
import {
  getConnectedUsers,
  getPendingRequestCount,
  type DemoUser
} from '@/lib/storage/chatStorage';
import type { Task } from '@/types/tasks';

// Activity feed item types
interface ActivityItem {
  id: string;
  type: 'study' | 'wellness' | 'tribe' | 'achievement' | 'connection';
  title: string;
  description: string;
  timestamp: Date;
  iconType: 'book' | 'heart' | 'target' | 'trophy';
  color: string;
}

// Icon components for activity feed
const ActivityIcon = ({ type, className }: { type: string; className?: string }) => {
  const baseClass = className || "w-5 h-5";
  switch (type) {
    case 'book':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'heart':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case 'target':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case 'trophy':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m3.044-1.35a6.726 6.726 0 01-2.748 1.35m0 0a6.772 6.772 0 01-3.044 0" />
        </svg>
      );
    default:
      return null;
  }
};

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { dueCards, stats } = useFlashcards();
  const { streakData, getDailyProgress, getXPToNextLevel } = useStreak();
  const { profile: wellnessProfile, dailyChallenges } = useWellness();
  const { userTribes, primaryTribe } = useTribes();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<DemoUser[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [greeting, setGreeting] = useState('');
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedProfile = getUserProfile();
      setProfile(loadedProfile);

      setConnections(getConnectedUsers());
      setPendingCount(getPendingRequestCount());

      const allTasks = getTasks();
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = allTasks
        .filter(t => t.status !== 'completed' && t.dueDate === today)
        .slice(0, 3);
      setTasks(todayTasks);

      // Generate mock activity feed
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'study',
          title: 'Study session completed',
          description: 'Reviewed 25 cards in Cardiology',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          iconType: 'book',
          color: 'from-tribe-sage-500 to-cyan-500'
        },
        {
          id: '2',
          type: 'wellness',
          title: 'Daily challenge completed',
          description: '10-minute meditation - earned 50 points',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          iconType: 'heart',
          color: 'from-rose-500 to-pink-500'
        },
        {
          id: '3',
          type: 'tribe',
          title: 'Tribe milestone reached',
          description: 'Cardiology Study Group hit 1,000 collective points',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          iconType: 'target',
          color: 'from-amber-500 to-orange-500'
        },
        {
          id: '4',
          type: 'achievement',
          title: 'New badge earned',
          description: '7-day streak champion!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          iconType: 'trophy',
          color: 'from-yellow-500 to-amber-500'
        },
      ];
      setActivityFeed(activities);

      setIsLoading(false);
    }
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const dailyProgress = getDailyProgress();
  const xpProgress = getXPToNextLevel();
  const completedChallenges = dailyChallenges.filter(c => c.completed).length;
  const initials = getUserInitials();
  const displayName = profile?.firstName || 'there';

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Welcome Section - Personal & Warm */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-indigo-600 p-6 md:p-8 shadow-2xl">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left - User Info */}
              <div className="flex items-center gap-4">
                <Link href="/profile" className="group">
                  <div className="relative">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-3 border-white/30 shadow-lg group-hover:border-white/50 transition-all"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border-3 border-white/30 shadow-lg group-hover:border-white/50 transition-all">
                        {initials}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-tribe-sage-500 border-2 border-white rounded-full" />
                  </div>
                </Link>
                <div>
                  <p className="text-white/70 text-sm font-medium">{greeting}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {displayName}
                  </h1>
                  {profile?.currentYear && (
                    <p className="text-white/60 text-sm mt-0.5">
                      {profile.currentYear} {profile.school ? `at ${profile.school}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Right - Quick Stats */}
              <div className="flex items-center gap-3 md:gap-4">
                {streakData && (
                  <>
                    <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                      <div className="flex items-center justify-center gap-1 text-yellow-300 text-2xl font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                        </svg>
                        {streakData.currentStreak}
                      </div>
                      <p className="text-white/60 text-xs">Streak</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                      <p className="text-white text-2xl font-bold">Lv.{streakData.level}</p>
                      <p className="text-white/60 text-xs">{xpProgress.current}/{xpProgress.needed} XP</p>
                    </div>
                  </>
                )}
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <p className="text-white text-2xl font-bold">{wellnessProfile?.villagePoints?.available || 0}</p>
                  <p className="text-white/60 text-xs">Village Pts</p>
                </div>
              </div>
            </div>

            {/* Today's Focus Bar */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
              {dueCards.length > 0 && (
                <Link
                  href="/study"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-white text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  {dueCards.length} cards due
                </Link>
              )}
              {tasks.length > 0 && (
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-white text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 bg-violet-400 rounded-full" />
                  {tasks.length} tasks today
                </Link>
              )}
              {pendingCount > 0 && (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-white text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                  {pendingCount} connection requests
                </Link>
              )}
              {completedChallenges < dailyChallenges.length && (
                <Link
                  href="/wellness"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-white text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  {dailyChallenges.length - completedChallenges} wellness challenges
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/study"
                className="group relative overflow-hidden p-4 bg-gradient-to-br from-tribe-sage-500 to-cyan-600 rounded-2xl text-white shadow-lg shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40 hover:scale-[1.02] transition-all"
              >
                <div className="relative z-10">
                  <div className="w-8 h-8 mb-2">
                    <Icons.Book />
                  </div>
                  <p className="font-semibold text-sm">Study</p>
                  {dueCards.length > 0 && (
                    <p className="text-white/70 text-xs mt-0.5">{dueCards.length} due</p>
                  )}
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              </Link>

              <Link
                href="/wellness"
                className="group relative overflow-hidden p-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all"
              >
                <div className="relative z-10">
                  <div className="w-8 h-8 mb-2">
                    <Icons.Heart />
                  </div>
                  <p className="font-semibold text-sm">Wellness</p>
                  <p className="text-white/70 text-xs mt-0.5">{completedChallenges}/{dailyChallenges.length} done</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              </Link>

              <Link
                href="/tribes"
                className="group relative overflow-hidden p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
              >
                <div className="relative z-10">
                  <div className="w-8 h-8 mb-2">
                    <Icons.Users />
                  </div>
                  <p className="font-semibold text-sm">My Tribes</p>
                  <p className="text-white/70 text-xs mt-0.5">{userTribes.length} joined</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              </Link>

              <Link
                href="/cases"
                className="group relative overflow-hidden p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
              >
                <div className="relative z-10">
                  <div className="w-8 h-8 mb-2">
                    <Icons.Hospital />
                  </div>
                  <p className="font-semibold text-sm">Cases</p>
                  <p className="text-white/70 text-xs mt-0.5">Clinical</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              </Link>
            </div>

            {/* Activity Feed */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 text-amber-500">
                    <Icons.Lightning />
                  </div>
                  Recent Activity
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">Your journey</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {activityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-sm`}>
                        <ActivityIcon type={activity.iconType} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {activity.title}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50 text-center">
                <Link
                  href="/study/progress"
                  className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline font-medium"
                >
                  View Full Progress
                </Link>
              </div>
            </div>

            {/* Study Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 text-tribe-sage-500">
                    <Icons.Chart />
                  </div>
                  Study Stats
                </h2>
                <Link
                  href="/study/progress"
                  className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline font-medium"
                >
                  Details
                </Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCards}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Cards</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{stats.reviewCards}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mastered</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.learningCards}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Learning</p>
                  </div>
                </div>

                {/* Daily Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Goal</span>
                    <span className="text-sm font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{dailyProgress}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-tribe-sage-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${dailyProgress}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/study"
                    className="flex-1 min-w-[120px] px-4 py-3 bg-gradient-to-r from-tribe-sage-500 to-cyan-500 text-white rounded-xl text-center font-medium shadow-lg shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40 transition-all text-sm"
                  >
                    Start Studying
                  </Link>
                  <Link
                    href="/generate"
                    className="flex-1 min-w-[120px] px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-center font-medium transition-all text-sm"
                  >
                    Generate Cards
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Social & Tribes */}
          <div className="space-y-6">
            {/* My Tribe Card */}
            {primaryTribe ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 text-amber-500">
                      <Icons.Village />
                    </div>
                    My Primary Tribe
                  </h2>
                </div>
                <Link
                  href={`/tribes/${primaryTribe.id}`}
                  className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${primaryTribe.color} flex items-center justify-center shadow-lg`}
                    >
                      <div className="w-7 h-7 text-white">
                        <Icons.Users />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{primaryTribe.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{primaryTribe.memberCount} members</p>
                    </div>
                  </div>
                  {primaryTribe.currentGoal && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{primaryTribe.currentGoal.title}</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {Math.round((primaryTribe.currentGoal.currentPoints / primaryTribe.currentGoal.targetPoints) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.min((primaryTribe.currentGoal.currentPoints / primaryTribe.currentGoal.targetPoints) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                  <Link
                    href="/tribes"
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    View All Tribes
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <div className="w-7 h-7 text-white">
                    <Icons.Users />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Join a Tribe</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Connect with peers, study together, and make an impact
                </p>
                <Link
                  href="/tribes"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl text-sm hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Explore Tribes
                </Link>
              </div>
            )}

            {/* Connections Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 text-cyan-500">
                    <Icons.Handshake />
                  </div>
                  Your Tribe
                </h2>
                <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  {connections.length}
                </span>
              </div>
              <div className="p-4">
                {connections.length > 0 ? (
                  <div className="space-y-3">
                    {connections.slice(0, 4).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tribe-sage-500 border-2 border-white dark:border-slate-800 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.specialty || user.currentYear}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Start building your tribe!</p>
                  </div>
                )}
                <Link
                  href="/profile"
                  className="mt-3 block w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-center text-sm font-medium transition-colors"
                >
                  {pendingCount > 0 ? `${pendingCount} Pending Requests` : 'Find Connections'}
                </Link>
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 text-rose-500">
                    <Icons.Target />
                  </div>
                  Daily Challenges
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {completedChallenges}/{dailyChallenges.length}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {dailyChallenges.slice(0, 3).map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-3 rounded-xl border transition-all ${
                      challenge.completed
                        ? 'bg-tribe-sage-50 dark:bg-tribe-sage-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        challenge.completed
                          ? 'bg-tribe-sage-500 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-500'
                      }`}>
                        {challenge.completed && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          challenge.completed
                            ? 'text-tribe-sage-700 dark:text-tribe-sage-300 line-through'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {challenge.title}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{challenge.villagePointsReward}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                <Link
                  href="/wellness"
                  className="text-sm text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  View All Challenges
                </Link>
              </div>
            </div>

            {/* Weekly Progress */}
            {streakData && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 text-tribe-sage-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    </div>
                    This Week
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-end gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                      const isActive = streakData.weeklyActivity[6 - i];
                      const isToday = i === new Date().getDay();
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div
                            className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-gradient-to-br from-tribe-sage-400 to-green-500 text-white'
                                : isToday
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                            }`}
                          >
                            {isActive && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Total XP</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{streakData.totalXP.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
