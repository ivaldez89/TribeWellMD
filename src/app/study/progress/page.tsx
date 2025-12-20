'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { StudyStatsDisplay, getStudyStats } from '@/components/study/StudyStats';
import { PerformanceAnalytics } from '@/components/deck/PerformanceAnalytics';
import type { TopicPerformance } from '@/types';

interface DayData {
  date: Date;
  cardsStudied: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface StudySession {
  date: string;
  cardsStudied: number;
  duration: number; // minutes
  correctRate: number;
}

export default function ProgressPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStudyStats> | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'performance' | 'achievements'>('calendar');

  useEffect(() => {
    // Load study stats
    setStats(getStudyStats());

    // Load study sessions from localStorage
    const sessions = localStorage.getItem('step2_study_sessions');
    if (sessions) {
      setStudySessions(JSON.parse(sessions));
    }

    // Load topic performance from localStorage
    const performance = localStorage.getItem('step2_topic_performance');
    if (performance) {
      setTopicPerformance(JSON.parse(performance));
    }
  }, []);

  // Generate calendar data
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        cardsStudied: getCardsForDate(date),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        cardsStudied: getCardsForDate(date),
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime()
      });
    }

    // Add days from next month to complete the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        cardsStudied: getCardsForDate(date),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentMonth, studySessions]);

  function getCardsForDate(date: Date): number {
    const dateStr = date.toDateString();
    const session = studySessions.find(s => new Date(s.date).toDateString() === dateStr);
    return session?.cardsStudied || 0;
  }

  function navigateMonth(direction: 'prev' | 'next') {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthSessions = studySessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
    });

    const totalCards = monthSessions.reduce((sum, s) => sum + s.cardsStudied, 0);
    const totalDays = new Set(monthSessions.map(s => new Date(s.date).toDateString())).size;
    const avgCorrectRate = monthSessions.length > 0
      ? monthSessions.reduce((sum, s) => sum + s.correctRate, 0) / monthSessions.length
      : 0;

    return { totalCards, totalDays, avgCorrectRate };
  }, [currentMonth, studySessions]);

  function getActivityColor(cards: number): string {
    if (cards === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (cards < 10) return 'bg-emerald-200 dark:bg-emerald-900';
    if (cards < 25) return 'bg-emerald-400 dark:bg-emerald-700';
    if (cards < 50) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-teal-950/20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/study"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Study
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Your Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your study habits, view achievements, and analyze your performance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'performance', label: 'Performance', icon: '📊' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square p-1 rounded-lg transition-all ${
                        day.isCurrentMonth
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-600'
                      } ${day.isToday ? 'ring-2 ring-teal-500' : ''}`}
                    >
                      <div className={`w-full h-full rounded-md flex flex-col items-center justify-center ${
                        getActivityColor(day.cardsStudied)
                      }`}>
                        <span className={`text-sm font-medium ${
                          day.cardsStudied > 25 ? 'text-white' : ''
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {day.cardsStudied > 0 && (
                          <span className={`text-xs ${
                            day.cardsStudied > 25 ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {day.cardsStudied}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900"></div>
                    <div className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-700"></div>
                    <div className="w-3 h-3 rounded bg-emerald-500 dark:bg-emerald-600"></div>
                    <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{monthlyStats.totalCards}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cards This Month</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{monthlyStats.totalDays}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Days Active</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(monthlyStats.avgCorrectRate * 100) || 0}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Accuracy</p>
              </div>
            </div>

            {/* Streak Information */}
            {stats && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl border border-orange-200 dark:border-orange-800/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-4xl">
                    {stats.currentStreak > 0 ? '🔥' : '❄️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {stats.currentStreak > 0
                        ? `${stats.currentStreak} Day Streak!`
                        : 'No Active Streak'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {stats.currentStreak > 0
                        ? 'Keep it up! Study today to maintain your streak.'
                        : 'Start studying to begin a new streak.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Best Streak</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.longestStreak}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Study Overview</h3>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Total Cards Reviewed</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{stats.totalCardsReviewed}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Total Study Days</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{stats.totalStudyDays}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Current Level</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Level {stats.level}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-600 dark:text-slate-400">Total XP</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{stats.xp} XP</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">This Week</h3>
                {stats && (
                  <div className="space-y-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                      const count = stats.weeklyActivity[i] || 0;
                      const maxCount = Math.max(...stats.weeklyActivity, 1);
                      const width = (count / maxCount) * 100;
                      const today = new Date().getDay();

                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className={`w-8 text-sm ${i === today ? 'font-bold text-teal-600' : 'text-slate-500'}`}>
                            {day}
                          </span>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                i === today ? 'bg-teal-500' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="w-8 text-sm text-right text-slate-600 dark:text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Topic Performance */}
            <PerformanceAnalytics topicPerformance={topicPerformance} />
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <StudyStatsDisplay />
          </div>
        )}

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Continue Studying
          </Link>
        </div>
      </main>
    </div>
  );
}
