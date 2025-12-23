'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useStreak } from '@/hooks/useStreak';
import { useWellness } from '@/hooks/useWellness';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { getTasks, getTaskStats } from '@/lib/storage/taskStorage';
import type { Task, TaskStats } from '@/types/tasks';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { dueCards, stats, isLoading: cardsLoading } = useFlashcards();
  const { streakData, isLoading: streakLoading, getDailyProgress, getXPToNextLevel } = useStreak();
  const { profile, dailyChallenges, isLoading: wellnessLoading } = useWellness();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [greeting, setGreeting] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load tasks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allTasks = getTasks();
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = allTasks
        .filter(t => t.status !== 'completed' && t.dueDate === today)
        .slice(0, 5);
      setTasks(todayTasks);
      setTaskStats(getTaskStats());
    }
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const isLoading = cardsLoading || streakLoading || wellnessLoading || isAuthenticated === null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const dailyProgress = getDailyProgress();
  const xpProgress = getXPToNextLevel();
  const completedChallenges = dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tribe-sage-500 via-cyan-500 to-blue-500 p-8 md:p-10 shadow-2xl">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-tribe-sage-100 text-sm font-medium mb-1">{greeting}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Your Dashboard
                </h1>
                <p className="text-white/80 max-w-lg">
                  {dueCards.length > 0
                    ? `You have ${dueCards.length} cards due for review today. Let's keep that streak going!`
                    : `Great job! You're all caught up on reviews. Check out your wellness challenges!`
                  }
                </p>
              </div>

              {/* Streak & Level Display */}
              <div className="flex items-center gap-4">
                {streakData && (
                  <>
                    <div className="text-center px-5 py-3 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                      <div className="flex items-center justify-center gap-1 text-yellow-300 text-3xl font-bold">
                        <span className="text-2xl">🔥</span>
                        {streakData.currentStreak}
                      </div>
                      <p className="text-white/70 text-xs mt-1">Day Streak</p>
                    </div>
                    <div className="text-center px-5 py-3 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                      <p className="text-white text-3xl font-bold">Lv.{streakData.level}</p>
                      <p className="text-white/70 text-xs mt-1">{xpProgress.current}/{xpProgress.needed} XP</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Row */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards Due */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{dueCards.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cards Due</p>
                </div>
              </div>
              <Link
                href="/study"
                className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                Start Review →
              </Link>
            </div>

            {/* Daily Goal */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-tribe-sage-500 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{dailyProgress}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daily Goal</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-tribe-sage-500 transition-all duration-500"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>

            {/* Tasks Today */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{taskStats?.pendingToday || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tasks Today</p>
                </div>
              </div>
              <Link
                href="/tasks"
                className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                View Tasks →
              </Link>
            </div>

            {/* Village Points */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.villagePoints?.available || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Village Points</p>
                </div>
              </div>
              <Link
                href="/wellness?tab=impact"
                className="text-sm text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Donate →
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Study & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Study Overview
                </h2>
                <Link
                  href="/study/progress"
                  className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline font-medium"
                >
                  View All →
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">Review</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.learningCards}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Learning</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/study"
                    className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-tribe-sage-500 to-cyan-500 text-white rounded-xl text-center font-medium shadow-lg shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40 transition-all"
                  >
                    Start Flashcards
                  </Link>
                  <Link
                    href="/study/rapid-review"
                    className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-center font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
                  >
                    Rapid Review
                  </Link>
                  <Link
                    href="/cases"
                    className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-center font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                  >
                    Clinical Cases
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  Today's Tasks
                </h2>
                <Link
                  href="/tasks"
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Manage All →
                </Link>
              </div>
              <div className="p-6">
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{task.title}</span>
                        <span className="text-xs text-slate-400 capitalize">{task.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No tasks scheduled for today</p>
                    <Link
                      href="/tasks"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Task
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Wellness & Quick Links */}
          <div className="space-y-6">
            {/* Daily Challenges */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Daily Challenges
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {completedChallenges}/{dailyChallenges.length}
                </span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {dailyChallenges.map(challenge => (
                    <div
                      key={challenge.id}
                      className={`p-3 rounded-xl border transition-all ${
                        challenge.completed
                          ? 'bg-tribe-sage-50 dark:bg-tribe-sage-900/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
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
                          <p className={`text-sm font-medium ${
                            challenge.completed
                              ? 'text-tribe-sage-700 dark:text-tribe-sage-300 line-through'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {challenge.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            +{challenge.villagePointsReward} points
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/wellness?tab=journey"
                  className="mt-4 block w-full px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl text-center text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                >
                  View Wellness Journey
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Quick Access
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/calendar"
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-2xl">📅</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Calendar</span>
                  </Link>
                  <Link
                    href="/library"
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-2xl">📖</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Library</span>
                  </Link>
                  <Link
                    href="/resources"
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-2xl">📊</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Resources</span>
                  </Link>
                  <Link
                    href="/tribes"
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Tribes</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            {streakData && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">📈</span>
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
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{streakData.totalXP}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
