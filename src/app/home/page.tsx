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

// Calendar event interface
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  source: 'google' | 'outlook' | 'manual';
}

// Get calendar events from localStorage
function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tribewellmd_calendar_events');
  if (stored) {
    const events = JSON.parse(stored);
    return events.map((e: CalendarEvent) => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end)
    }));
  }
  // Demo events
  return [
    {
      id: '1',
      title: 'Anatomy Lab',
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 0, 0, 0)),
      color: 'bg-[#5B7B6D]',
      source: 'google'
    },
    {
      id: '2',
      title: 'Pathology Lecture',
      start: new Date(new Date().setHours(13, 0, 0, 0)),
      end: new Date(new Date().setHours(14, 30, 0, 0)),
      color: 'bg-[#8B7355]',
      source: 'outlook'
    },
    {
      id: '3',
      title: 'Study Group',
      start: new Date(new Date().setHours(16, 0, 0, 0)),
      end: new Date(new Date().setHours(18, 0, 0, 0)),
      color: 'bg-[#6B8B7D]',
      source: 'manual'
    }
  ];
}

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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
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

      const loadedTasks = getTasks();
      setAllTasks(loadedTasks);
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = loadedTasks
        .filter(t => t.status !== 'completed' && t.dueDate === today)
        .slice(0, 4);
      setTasks(todayTasks);

      setCalendarEvents(getCalendarEvents());

      // Generate mock activity feed with forest theme colors
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'study',
          title: 'Study session completed',
          description: 'Reviewed 25 cards in Cardiology',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          iconType: 'book',
          color: 'from-[#3D5A4C] to-[#4A6B5D]'
        },
        {
          id: '2',
          type: 'wellness',
          title: 'Daily challenge completed',
          description: '10-minute meditation - earned 50 points',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          iconType: 'heart',
          color: 'from-[#5B7B6D] to-[#6B8B7D]'
        },
        {
          id: '3',
          type: 'tribe',
          title: 'Group milestone reached',
          description: 'Cardiology Study Group hit 50 members',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          iconType: 'target',
          color: 'from-[#6B5344] to-[#8B7355]'
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
      <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-3xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-96 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-2xl" />
              <div className="h-96 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-2xl" />
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get today's calendar events
  const todaysEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Count pending and completed tasks
  const pendingTasks = allTasks.filter(t => t.status !== 'completed').length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Subtle organic pattern overlay on sides */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* ===== PROFILE SECTION ===== */}
          <section className="mb-6">
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-[#6B5344]/10 border border-[#D4C4B0]/50 dark:border-slate-700">
              {/* Forest gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3D5A4C] via-[#5B7B6D] to-[#8B7355]" />

              {/* Decorative shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#5B7B6D]/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#8B7355]/5 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left - User Info */}
                  <div className="flex items-center gap-4">
                    <Link href="/profile" className="group">
                      <div className="relative">
                        {profile?.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-[#D4C4B0] shadow-lg group-hover:border-[#5B7B6D] transition-all"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#5B7B6D] to-[#3D5A4C] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#D4C4B0] shadow-lg group-hover:border-[#5B7B6D] transition-all">
                            {initials}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5B7B6D] border-2 border-white dark:border-slate-800 rounded-full" />
                      </div>
                    </Link>
                    <div>
                      <p className="text-[#8B7355] dark:text-[#A89070] text-sm font-medium">{greeting}</p>
                      <h1 className="text-2xl md:text-3xl font-bold text-[#3D5A4C] dark:text-white">
                        {displayName}
                      </h1>
                      {profile?.currentYear && (
                        <p className="text-[#6B5344]/70 dark:text-slate-400 text-sm mt-0.5">
                          {profile.currentYear} {profile.school ? `at ${profile.school}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right - Quick Stats */}
                  <div className="flex items-center gap-3 md:gap-4">
                    {streakData && (
                      <>
                        <div className="text-center px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-600">
                          <div className="flex items-center justify-center gap-1 text-[#6B5344] dark:text-[#A89070] text-2xl font-bold">
                            <svg className="w-5 h-5 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                            </svg>
                            {streakData.currentStreak}
                          </div>
                          <p className="text-[#6B5344]/70 dark:text-slate-400 text-xs">Streak</p>
                        </div>
                        <div className="text-center px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-600">
                          <p className="text-[#3D5A4C] dark:text-white text-2xl font-bold">Lv.{streakData.level}</p>
                          <p className="text-[#6B5344]/70 dark:text-slate-400 text-xs">{xpProgress.current}/{xpProgress.needed} XP</p>
                        </div>
                      </>
                    )}
                    <div className="text-center px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-600">
                      <p className="text-[#5B7B6D] dark:text-[#6B8B7D] text-2xl font-bold">{wellnessProfile?.villagePoints?.available || 0}</p>
                      <p className="text-[#6B5344]/70 dark:text-slate-400 text-xs">Village Pts</p>
                    </div>
                  </div>
                </div>

                {/* Today's Focus Bar */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {dueCards.length > 0 && (
                    <Link
                      href="/progress"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] hover:bg-[#E8DFD0] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 rounded-xl text-[#3D5A4C] dark:text-white text-sm font-medium transition-all border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                      {dueCards.length} cards due
                    </Link>
                  )}
                  {tasks.length > 0 && (
                    <Link
                      href="/tasks"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] hover:bg-[#E8DFD0] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 rounded-xl text-[#3D5A4C] dark:text-white text-sm font-medium transition-all border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      <span className="w-2 h-2 bg-[#8B7355] rounded-full" />
                      {tasks.length} tasks today
                    </Link>
                  )}
                  {pendingCount > 0 && (
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] hover:bg-[#E8DFD0] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 rounded-xl text-[#3D5A4C] dark:text-white text-sm font-medium transition-all border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      <span className="w-2 h-2 bg-[#6B5344] rounded-full animate-pulse" />
                      {pendingCount} connection requests
                    </Link>
                  )}
                  {completedChallenges < dailyChallenges.length && (
                    <Link
                      href="/wellness"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] hover:bg-[#E8DFD0] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 rounded-xl text-[#3D5A4C] dark:text-white text-sm font-medium transition-all border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      <span className="w-2 h-2 bg-[#4A6B5D] rounded-full" />
                      {dailyChallenges.length - completedChallenges} wellness challenges
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ===== MAIN DASHBOARD GRID ===== */}
          <div className="grid lg:grid-cols-12 gap-6">

            {/* ===== LEFT COLUMN (8 cols) - Study, Wellness, Community ===== */}
            <div className="lg:col-span-8 space-y-6">

              {/* ===== STUDY SECTION ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#3D5A4C]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-[#3D5A4C] to-[#5B7B6D]">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-6 h-6"><Icons.Book /></div>
                    Study
                  </h2>
                  <Link href="/progress" className="text-sm text-white/80 hover:text-white font-medium">
                    View All →
                  </Link>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#E8DFD0] dark:border-slate-600">
                      <p className="text-2xl font-bold text-[#3D5A4C] dark:text-white">{stats.totalCards}</p>
                      <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Total Cards</p>
                    </div>
                    <div className="text-center p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#E8DFD0] dark:border-slate-600">
                      <p className="text-2xl font-bold text-[#5B7B6D] dark:text-[#6B8B7D]">{stats.reviewCards}</p>
                      <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Mastered</p>
                    </div>
                    <div className="text-center p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#E8DFD0] dark:border-slate-600">
                      <p className="text-2xl font-bold text-[#8B7355] dark:text-[#A89070]">{stats.learningCards}</p>
                      <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Learning</p>
                    </div>
                    <div className="text-center p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl border border-[#E8DFD0] dark:border-slate-600">
                      <p className="text-2xl font-bold text-[#6B5344] dark:text-[#C4A77D]">{dueCards.length}</p>
                      <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Due Today</p>
                    </div>
                  </div>

                  {/* Daily Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#3D5A4C] dark:text-slate-300">Daily Goal</span>
                      <span className="text-sm font-bold text-[#5B7B6D] dark:text-[#6B8B7D]">{dailyProgress}%</span>
                    </div>
                    <div className="h-3 bg-[#E8DFD0] dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#4A6B5D] rounded-full transition-all duration-500"
                        style={{ width: `${dailyProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                      href="/progress"
                      className="px-4 py-3 bg-gradient-to-r from-[#3D5A4C] to-[#5B7B6D] text-white rounded-xl text-center font-medium shadow-md shadow-[#3D5A4C]/20 hover:shadow-lg hover:shadow-[#3D5A4C]/30 transition-all text-sm"
                    >
                      Flashcards
                    </Link>
                    <Link
                      href="/cases"
                      className="px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#3D5A4C] dark:text-slate-200 rounded-xl text-center font-medium transition-all text-sm border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      Cases
                    </Link>
                    <Link
                      href="/progress/rapid-review"
                      className="px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#3D5A4C] dark:text-slate-200 rounded-xl text-center font-medium transition-all text-sm border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      Rapid Review
                    </Link>
                    <Link
                      href="/progress/rooms"
                      className="px-4 py-3 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#3D5A4C] dark:text-slate-200 rounded-xl text-center font-medium transition-all text-sm border border-[#D4C4B0]/50 dark:border-slate-600"
                    >
                      Study Group
                    </Link>
                  </div>
                </div>
              </div>

              {/* ===== WELLNESS SECTION ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#5B7B6D]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D]">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-6 h-6"><Icons.Heart /></div>
                    Wellness
                  </h2>
                  <Link href="/wellness" className="text-sm text-white/80 hover:text-white font-medium">
                    View All →
                  </Link>
                </div>
                <div className="p-6">
                  {/* Daily Challenges */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[#3D5A4C] dark:text-slate-300">Daily Challenges</span>
                      <span className="text-sm text-[#5B7B6D] dark:text-[#6B8B7D] font-medium">{completedChallenges}/{dailyChallenges.length}</span>
                    </div>
                    <div className="space-y-2">
                      {dailyChallenges.slice(0, 3).map((challenge) => (
                        <div
                          key={challenge.id}
                          className={`p-3 rounded-xl border transition-all ${
                            challenge.completed
                              ? 'bg-[#F5EFE6] dark:bg-[#5B7B6D]/20 border-[#5B7B6D]/30 dark:border-[#5B7B6D]/50'
                              : 'bg-white dark:bg-slate-700/50 border-[#E8DFD0] dark:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              challenge.completed
                                ? 'bg-[#5B7B6D] text-white'
                                : 'border-2 border-[#D4C4B0] dark:border-slate-500'
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
                                  ? 'text-[#5B7B6D] dark:text-[#6B8B7D] line-through'
                                  : 'text-[#3D5A4C] dark:text-slate-200'
                              }`}>
                                {challenge.title}
                              </p>
                            </div>
                            <span className="text-xs text-[#8B7355] dark:text-[#A89070]">
                              +{challenge.villagePointsReward} VP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Village Points & Impact */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5EFE6] to-[#E8DFD0] dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl">
                    <div>
                      <p className="text-sm text-[#6B5344]/80 dark:text-slate-400">Village Points Available</p>
                      <p className="text-2xl font-bold text-[#5B7B6D] dark:text-[#6B8B7D]">{wellnessProfile?.villagePoints?.available || 0}</p>
                    </div>
                    <Link
                      href="/impact"
                      className="px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      Donate to Cause
                    </Link>
                  </div>
                </div>
              </div>

              {/* ===== COMMUNITY SECTION ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#6B5344]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-[#6B5344] to-[#8B7355]">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-6 h-6"><Icons.Users /></div>
                    Community
                  </h2>
                  <Link href="/groups" className="text-sm text-white/80 hover:text-white font-medium">
                    View All →
                  </Link>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* My Primary Group */}
                    <div>
                      <h3 className="text-sm font-medium text-[#6B5344]/80 dark:text-slate-400 mb-3">My Primary Group</h3>
                      {primaryTribe ? (
                        <Link
                          href={`/groups/${primaryTribe.id}`}
                          className="block p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl hover:bg-[#E8DFD0] dark:hover:bg-slate-600/50 transition-colors border border-[#D4C4B0]/50 dark:border-slate-600"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${primaryTribe.color} flex items-center justify-center shadow-md`}>
                              <div className="w-6 h-6 text-white"><Icons.Users /></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#3D5A4C] dark:text-white truncate">{primaryTribe.name}</p>
                              <p className="text-sm text-[#6B5344]/70 dark:text-slate-400">{primaryTribe.memberCount} members</p>
                            </div>
                          </div>
                          {primaryTribe.currentGoal && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[#6B5344]/70 dark:text-slate-400 truncate">{primaryTribe.currentGoal.title}</span>
                                <span className="font-medium text-[#5B7B6D] dark:text-[#6B8B7D]">
                                  {Math.round((primaryTribe.currentGoal.currentPoints / primaryTribe.currentGoal.targetPoints) * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#E8DFD0] dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#6B5344] to-[#8B7355] rounded-full"
                                  style={{ width: `${Math.min((primaryTribe.currentGoal.currentPoints / primaryTribe.currentGoal.targetPoints) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl text-center border border-[#D4C4B0]/50 dark:border-slate-600">
                          <p className="text-sm text-[#6B5344]/70 dark:text-slate-400 mb-3">Join a group to connect with peers</p>
                          <Link
                            href="/groups"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6B5344] to-[#8B7355] text-white font-medium rounded-xl text-sm"
                          >
                            Explore Groups
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Connections */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-[#6B5344]/80 dark:text-slate-400">Your Connections</h3>
                        <span className="text-sm font-medium text-[#5B7B6D] dark:text-[#6B8B7D]">{connections.length}</span>
                      </div>
                      <div className="space-y-2">
                        {connections.length > 0 ? (
                          connections.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5EFE6]/50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7B6D] via-[#6B5344] to-[#8B7355] flex items-center justify-center text-white font-bold text-sm">
                                  {user.firstName[0]}{user.lastName[0]}
                                </div>
                                {user.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5B7B6D] border-2 border-white dark:border-slate-800 rounded-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#3D5A4C] dark:text-white text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-[#6B5344]/70 dark:text-slate-400 truncate">
                                  {user.specialty || user.currentYear}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[#6B5344]/70 dark:text-slate-400 text-center py-4">Start building your network!</p>
                        )}
                        <Link
                          href="/profile"
                          className="block w-full px-4 py-2 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#3D5A4C] dark:text-slate-200 rounded-xl text-center text-sm font-medium transition-colors border border-[#D4C4B0]/50 dark:border-slate-600"
                        >
                          {pendingCount > 0 ? `${pendingCount} Pending Requests` : 'Find Connections'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== RIGHT COLUMN (4 cols) - Calendar, Tasks, Activity ===== */}
            <div className="lg:col-span-4 space-y-6">

              {/* ===== CALENDAR WIDGET ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#6B5344]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-[#8B7355] to-[#A89070]">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </h2>
                  <Link href="/calendar" className="text-sm text-white/80 hover:text-white font-medium">
                    Full View →
                  </Link>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-[#6B5344]/70 dark:text-slate-400 mb-3">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>

                  {todaysEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <svg className="w-10 h-10 mx-auto text-[#D4C4B0] dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-[#6B5344]/60 dark:text-slate-500">No events scheduled today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todaysEvents.map(event => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-[#F5EFE6] dark:bg-slate-700/50 border border-[#E8DFD0] dark:border-slate-600"
                        >
                          <div className={`w-1.5 h-full min-h-[36px] rounded-full ${event.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3D5A4C] dark:text-white truncate">{event.title}</p>
                            <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== TASKS WIDGET ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#6B5344]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-[#6B8B7D] to-[#7FA08F]">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Tasks
                  </h2>
                  <Link href="/tasks" className="text-sm text-white/80 hover:text-white font-medium">
                    View All →
                  </Link>
                </div>
                <div className="p-4">
                  {/* Task Summary */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DFD0] dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#6B5344] dark:text-[#A89070]">{pendingTasks}</p>
                      <p className="text-xs text-[#6B5344]/60 dark:text-slate-500">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#5B7B6D] dark:text-[#6B8B7D]">{completedTasks}</p>
                      <p className="text-xs text-[#6B5344]/60 dark:text-slate-500">Completed</p>
                    </div>
                  </div>

                  {/* Today's Tasks */}
                  {tasks.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-[#6B5344]/60 dark:text-slate-500">No tasks due today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[#F5EFE6] dark:bg-slate-700/50 border border-[#E8DFD0] dark:border-slate-600"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                            task.status === 'completed'
                              ? 'bg-[#5B7B6D] text-white'
                              : 'border-2 border-[#D4C4B0] dark:border-slate-500'
                          }`}>
                            {task.status === 'completed' && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3D5A4C] dark:text-white truncate">{task.title}</p>
                            {task.priority && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/tasks"
                    className="mt-4 block w-full px-4 py-2 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#3D5A4C] dark:text-slate-200 rounded-xl text-center text-sm font-medium transition-colors border border-[#D4C4B0]/50 dark:border-slate-600"
                  >
                    Manage Tasks
                  </Link>
                </div>
              </div>

              {/* ===== ACTIVITY FEED ===== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#6B5344]/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between bg-[#F5EFE6]/50 dark:bg-slate-700/30">
                  <h2 className="text-lg font-semibold text-[#3D5A4C] dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 text-[#5B7B6D]"><Icons.Lightning /></div>
                    Activity
                  </h2>
                </div>
                <div className="divide-y divide-[#E8DFD0] dark:divide-slate-700">
                  {activityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className="px-4 py-3 hover:bg-[#F5EFE6]/50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                          {activity.iconType === 'book' && <Icons.Book />}
                          {activity.iconType === 'heart' && <Icons.Heart />}
                          {activity.iconType === 'target' && <Icons.Target />}
                          {activity.iconType === 'trophy' && <Icons.Trophy />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#3D5A4C] dark:text-white text-sm truncate">
                            {activity.title}
                          </p>
                          <p className="text-[#6B5344]/70 dark:text-slate-400 text-xs truncate">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-[#8B7355] dark:text-slate-500 flex-shrink-0">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-[#F5EFE6]/50 dark:bg-slate-700/30 text-center border-t border-[#E8DFD0] dark:border-slate-700">
                  <Link
                    href="/progress/progress"
                    className="text-sm text-[#5B7B6D] dark:text-[#6B8B7D] hover:underline font-medium"
                  >
                    View Full Progress
                  </Link>
                </div>
              </div>

              {/* ===== WEEKLY PROGRESS ===== */}
              {streakData && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-md shadow-[#6B5344]/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E8DFD0] dark:border-slate-700 bg-[#F5EFE6]/50 dark:bg-slate-700/30">
                    <h2 className="text-lg font-semibold text-[#3D5A4C] dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
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
                                  ? 'bg-gradient-to-br from-[#3D5A4C] to-[#5B7B6D] text-white'
                                  : isToday
                                    ? 'bg-[#F5EFE6] dark:bg-slate-700 text-[#8B7355] dark:text-[#A89070] ring-2 ring-[#8B7355]'
                                    : 'bg-[#F5EFE6] dark:bg-slate-700 text-[#D4C4B0]'
                              }`}
                            >
                              {isActive && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${isToday ? 'text-[#8B7355] dark:text-[#A89070]' : 'text-[#6B5344]/50'}`}>
                              {day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#E8DFD0] dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm text-[#6B5344]/70 dark:text-slate-400">Total XP</span>
                      <span className="text-lg font-bold text-[#3D5A4C] dark:text-white">{streakData.totalXP.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
