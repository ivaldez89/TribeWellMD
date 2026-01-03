'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import Link from 'next/link';
import { StudyStatsDisplay, getStudyStats } from '@/components/study/StudyStats';
import { PerformanceAnalytics } from '@/components/deck/PerformanceAnalytics';
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import { Icons } from '@/components/ui/Icons';
import { useStreak, VERIFICATION_MULTIPLIERS, type VerificationTier } from '@/hooks/useStreak';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'schedule' | 'performance' | 'achievements'>('overview');

  // Get streak data for Village Points
  const { streakData } = useStreak();

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
    if (cards < 10) return 'bg-[#E8E0D5] dark:bg-[#5B7B6D]';
    if (cards < 25) return 'bg-[#D4C4B0] dark:bg-[#5B7B6D]';
    if (cards < 50) return 'bg-[#C4A77D] dark:bg-[#A89070]';
    return 'bg-[#A89070] dark:bg-[#C4A77D]';
  }

  return (
    <ContentPageLayout maxWidth="xl" className="bg-[#E8DFD0] dark:from-slate-900 dark:to-[#3D5A4C]/20 relative">
      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>
      <div className="relative z-10">
        {/* Back Link */}
        <Link
          href="/progress"
          className="inline-flex items-center gap-2 text-[#6B5344]/80 dark:text-slate-400 hover:text-[#5B7B6D] dark:hover:text-[#6B8B7D] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Study
        </Link>

        {/* Hero Banner */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] p-8 md:p-10 shadow-2xl shadow-[#3D5A4C]/20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#F5EFE6]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-[#F5F0E8] rounded-full animate-pulse" />
                <span>Track Your Journey</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Your <span className="text-[#F5F0E8]">Progress</span>
              </h1>

              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Track your study habits, view achievements, and analyze your performance over time.
              </p>

              {/* Quick stats row */}
              {stats && (
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalCardsReviewed}</p>
                    <p className="text-white/60 text-xs">Cards Reviewed</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalStudyDays}</p>
                    <p className="text-white/60 text-xs">Study Days</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.currentStreak}</p>
                    <p className="text-white/60 text-xs">Day Streak</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">Lvl {stats.level}</p>
                    <p className="text-white/60 text-xs">Current Level</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-[#D4C4B0]/50 dark:border-slate-700 overflow-x-auto animate-fade-in-up animation-delay-100">
          {[
            { id: 'overview', label: 'Overview', icon: <Icons.Chart /> },
            { id: 'calendar', label: 'Study Activity', icon: <Icons.Calendar /> },
            { id: 'schedule', label: 'My Schedule', icon: <Icons.CalendarSchedule /> },
            { id: 'performance', label: 'Performance', icon: <Icons.Target /> },
            { id: 'achievements', label: 'Achievements', icon: <Icons.Trophy /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#3D5A4C] dark:text-[#6B8B7D] border-[#5B7B6D] dark:border-[#6B8B7D]'
                  : 'text-[#6B5344]/70 dark:text-slate-400 border-transparent hover:text-[#3D5A4C] dark:hover:text-white'
              }`}
            >
              <span className="w-5 h-5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab - All Metrics in One Place */}
        {activeTab === 'overview' && !streakData && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#5B7B6D] border-t-transparent rounded-full" />
          </div>
        )}
        {activeTab === 'overview' && streakData && (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* XP Card */}
              <div className="bg-gradient-to-br from-[#5B7B6D] to-[#4A6B5D] rounded-2xl p-5 text-white shadow-lg shadow-[#3D5A4C]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Lightning />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Experience Points</span>
                </div>
                <p className="text-3xl font-bold">{streakData.totalXP.toLocaleString()}</p>
                <p className="text-white/60 text-sm mt-1">Level {streakData.level}</p>
              </div>

              {/* Village Points Card */}
              <div className="bg-gradient-to-br from-[#6B8B7D] to-[#5B7B6D] rounded-2xl p-5 text-white shadow-lg shadow-[#3D5A4C]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Heart />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Village Points</span>
                </div>
                <p className="text-3xl font-bold">{streakData.totalVillagePoints.toLocaleString()}</p>
                <p className="text-white/60 text-sm mt-1">
                  ${(streakData.totalVillagePoints / 1000).toFixed(2)} to charity
                </p>
              </div>

              {/* Streak Card */}
              <div className="bg-gradient-to-br from-[#8B7355] to-[#6B5344] rounded-2xl p-5 text-white shadow-lg shadow-[#6B5344]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Fire />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Current Streak</span>
                </div>
                <p className="text-3xl font-bold">{streakData.currentStreak} days</p>
                <p className="text-white/60 text-sm mt-1">Best: {streakData.longestStreak} days</p>
              </div>

              {/* Cards Reviewed Card */}
              <div className="bg-gradient-to-br from-[#7FA08F] to-[#6B8B7D] rounded-2xl p-5 text-white shadow-lg shadow-[#3D5A4C]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Cards />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Cards Reviewed</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalCardsReviewed || 0}</p>
                <p className="text-white/60 text-sm mt-1">{stats?.totalStudyDays || 0} study days</p>
              </div>
            </div>

            {/* Daily Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 p-6 shadow-sm shadow-[#3D5A4C]/5">
              <h3 className="text-lg font-semibold text-[#3D5A4C] dark:text-white mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#6B5344]/80 dark:text-slate-400">Daily XP Goal</span>
                    <span className="font-medium text-[#3D5A4C] dark:text-white">
                      {streakData.todayXP} / {streakData.dailyGoalXP} XP
                    </span>
                  </div>
                  <div className="h-3 bg-[#E8DFD0] dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] rounded-full transition-all"
                      style={{ width: `${Math.min((streakData.todayXP / streakData.dailyGoalXP) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {streakData.todayXP >= streakData.dailyGoalXP && (
                  <div className="flex items-center gap-2 text-[#5B7B6D] dark:text-[#6B8B7D]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Daily goal achieved!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Village Points Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 p-6 shadow-sm shadow-[#3D5A4C]/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3D5A4C] dark:text-white">Village Points Breakdown</h3>
                <Link
                  href="/impact"
                  className="text-sm text-[#5B7B6D] dark:text-[#6B8B7D] hover:underline"
                >
                  Learn more
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.entries(streakData.villagePointsByTier) as [VerificationTier, number][]).map(([tier, points]) => (
                  <div
                    key={tier}
                    className="p-4 bg-[#F5EFE6] dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3D5A4C] dark:text-white capitalize">
                        {tier.replace('-', ' ')}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/50 text-[#5B7B6D] dark:text-[#D4C4B0] rounded-full">
                        {VERIFICATION_MULTIPLIERS[tier]}x
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[#5B7B6D] dark:text-[#6B8B7D]">{points}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-[#F5EFE6] to-[#E8DFD0] dark:from-[#5B7B6D]/20 dark:to-[#3D5A4C]/20 rounded-xl border border-[#D4C4B0]/50 dark:border-[#5B7B6D]">
                <p className="text-sm text-[#6B5344]/80 dark:text-slate-400">
                  This week: <span className="font-semibold text-[#5B7B6D] dark:text-[#6B8B7D]">{streakData.weeklyVillagePoints} VP</span> earned
                  <span className="mx-2">•</span>
                  Conversion: 10 XP = 1 Village Point • 1,000 VP = $1 to charity
                </p>
              </div>
            </div>

            {/* Weekly Activity Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 p-6 shadow-sm shadow-[#3D5A4C]/5">
              <h3 className="text-lg font-semibold text-[#3D5A4C] dark:text-white mb-4">This Week</h3>
              <div className="flex items-center justify-between gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  const isActive = streakData.weeklyActivity[6 - i]; // weeklyActivity[0] = today
                  const isToday = i === new Date().getDay();
                  return (
                    <div key={i} className="flex-1 text-center">
                      <p className={`text-xs mb-2 ${isToday ? 'font-bold text-[#5B7B6D]' : 'text-[#6B5344]/70'}`}>{day}</p>
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-[#5B7B6D] text-white'
                          : 'bg-[#F5EFE6] dark:bg-slate-700 text-[#6B5344]/50'
                      }`}>
                        {isActive ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 bg-[#D4C4B0] dark:bg-slate-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm shadow-[#3D5A4C]/5 overflow-hidden">
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
                    className="px-3 py-1.5 text-sm font-medium text-[#8B7355] dark:text-[#C4A77D] hover:bg-[#F5F0E8] dark:hover:bg-[#5B7B6D]/20 rounded-lg transition-colors"
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
                      } ${day.isToday ? 'ring-2 ring-[#C4A77D]' : ''}`}
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
                    <div className="w-3 h-3 rounded bg-[#E8E0D5] dark:bg-[#5B7B6D]"></div>
                    <div className="w-3 h-3 rounded bg-[#D4C4B0] dark:bg-[#5B7B6D]"></div>
                    <div className="w-3 h-3 rounded bg-[#C4A77D] dark:bg-[#A89070]"></div>
                    <div className="w-3 h-3 rounded bg-[#A89070] dark:bg-[#C4A77D]"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-[#8B7355] dark:text-[#C4A77D]">{monthlyStats.totalCards}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cards This Month</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-[#8B7355] dark:text-[#C4A77D]">{monthlyStats.totalDays}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Days Active</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-3xl font-bold text-[#5B7B6D] dark:text-[#C4A77D]">
                  {Math.round(monthlyStats.avgCorrectRate * 100) || 0}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Accuracy</p>
              </div>
            </div>

            {/* Streak Information */}
            {stats && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl border border-orange-200 dark:border-orange-800/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-500 dark:text-orange-400">
                    {stats.currentStreak > 0 ? <Icons.Fire /> : <Icons.Snowflake />}
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

        {/* Schedule Tab - External Calendar Integration */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-[#F5F0E8] to-[#E8E0D5] dark:from-[#5B7B6D]/20 dark:to-[#2D5A4A]/20 rounded-2xl border border-[#D4C4B0] dark:border-[#5B7B6D] p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8E0D5] dark:bg-[#5B7B6D]/50 flex items-center justify-center text-[#8B7355] dark:text-[#C4A77D]">
                  <Icons.CalendarSchedule />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Sync Your Medical School Calendar
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Connect your Google or Outlook calendar to see your classes, labs, clinical rotations,
                    and exams alongside your study progress. Never miss a deadline!
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget variant="full" />
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
                      <span className="font-semibold text-[#8B7355] dark:text-[#C4A77D]">Level {stats.level}</span>
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
                          <span className={`w-8 text-sm ${i === today ? 'font-bold text-[#8B7355]' : 'text-slate-500'}`}>
                            {day}
                          </span>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                i === today ? 'bg-[#C4A77D]' : 'bg-[#A89070]'
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
            href="/progress"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Continue Studying
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
