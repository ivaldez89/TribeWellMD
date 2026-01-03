'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import Link from 'next/link';
import { useWellness } from '@/hooks/useWellness';
import { useTribes } from '@/hooks/useTribes';
import { Icons } from '@/components/ui/Icons';
import { WELLNESS_DOMAINS } from '@/types/wellness';

interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  stress: number;
}

export default function WellnessProgressPage() {
  const {
    profile,
    dailyChallenges,
    isLoading,
    getStats
  } = useWellness();

  const { userTribes, primaryTribe } = useTribes();
  const stats = getStats();

  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'journeys' | 'impact'>('overview');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  // Load mood history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('tribewellmd_mood_history');
    if (history) {
      setMoodHistory(JSON.parse(history));
    }
  }, []);

  // Calculate mood trends
  const moodTrends = useMemo(() => {
    if (moodHistory.length === 0) return null;

    const last7Days = moodHistory.slice(-7);
    const avgMood = last7Days.reduce((sum, e) => sum + e.mood, 0) / last7Days.length;
    const avgEnergy = last7Days.reduce((sum, e) => sum + e.energy, 0) / last7Days.length;
    const avgStress = last7Days.reduce((sum, e) => sum + e.stress, 0) / last7Days.length;

    return { avgMood, avgEnergy, avgStress, entries: last7Days.length };
  }, [moodHistory]);

  // Calculate journey stats
  const journeyStats = useMemo(() => {
    if (!profile?.activeJourneys) return { total: 0, totalXp: 0, avgLevel: 0 };

    const total = profile.activeJourneys.length;
    const totalXp = profile.activeJourneys.reduce((sum, j) => sum + j.xp, 0);
    const avgLevel = total > 0 ? profile.activeJourneys.reduce((sum, j) => sum + j.level, 0) / total : 0;

    return { total, totalXp, avgLevel: Math.round(avgLevel * 10) / 10 };
  }, [profile]);

  if (isLoading) {
    return (
      <ContentPageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C4A77D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading your wellness progress...</p>
          </div>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout maxWidth="xl" className="bg-gradient-to-b from-slate-50 to-[#F5F0E8]/30 dark:from-slate-900 dark:to-[#C4A77D]/10">
        {/* Back Link */}
        <Link
          href="/wellness"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#C4A77D] dark:hover:text-[#D4A574] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Wellness
        </Link>

        {/* Hero Banner */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8E0D5] via-[#D4C4B0] to-[#C4A77D] p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#D4C4B0]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/20 backdrop-blur rounded-full text-slate-800 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-slate-700 rounded-full animate-pulse" />
                <span>Your Wellness Journey</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 leading-tight">
                Wellness <span className="text-slate-700">Progress</span>
              </h1>

              <p className="text-slate-700 text-lg max-w-2xl mb-6">
                Track your wellness journey, mood patterns, and community impact over time.
              </p>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                <div className="text-center px-4 py-2 bg-slate-800/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats?.villagePoints || 0}</p>
                  <p className="text-slate-600 text-xs">Village Points</p>
                </div>
                <div className="text-center px-4 py-2 bg-slate-800/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats?.donated || 0}</p>
                  <p className="text-slate-600 text-xs">Points Donated</p>
                </div>
                <div className="text-center px-4 py-2 bg-slate-800/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-slate-800">{journeyStats.total}</p>
                  <p className="text-slate-600 text-xs">Active Journeys</p>
                </div>
                <div className="text-center px-4 py-2 bg-slate-800/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-slate-800">{userTribes.length}</p>
                  <p className="text-slate-600 text-xs">Tribes Joined</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto animate-fade-in-up animation-delay-100">
          {[
            { id: 'overview', label: 'Overview', icon: <Icons.Chart /> },
            { id: 'mood', label: 'Mood Trends', icon: <Icons.Heart /> },
            { id: 'journeys', label: 'My Journeys', icon: <Icons.Compass /> },
            { id: 'impact', label: 'My Impact', icon: <Icons.HeartHand /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#C4A77D] dark:text-[#D4A574] border-[#C4A77D] dark:border-[#D4A574]'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-5 h-5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Village Points Card */}
              <div className="bg-gradient-to-br from-[#2D5A4A] to-[#3D6B5A] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Heart />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Village Points</span>
                </div>
                <p className="text-3xl font-bold">{stats?.villagePoints?.toLocaleString() || 0}</p>
                <p className="text-white/60 text-sm mt-1">
                  ${((stats?.villagePoints || 0) / 1000).toFixed(2)} charity value
                </p>
              </div>

              {/* Points Donated Card */}
              <div className="bg-gradient-to-br from-[#C4A77D] to-[#B89B78] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Gift />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Points Donated</span>
                </div>
                <p className="text-3xl font-bold">{stats?.donated?.toLocaleString() || 0}</p>
                <p className="text-white/60 text-sm mt-1">
                  ${((stats?.donated || 0) / 1000).toFixed(2)} to charity
                </p>
              </div>

              {/* Challenges Card */}
              <div className="bg-gradient-to-br from-[#5D6B5E] to-[#4D5B4E] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Target />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Today's Challenges</span>
                </div>
                <p className="text-3xl font-bold">
                  {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
                </p>
                <p className="text-white/60 text-sm mt-1">completed today</p>
              </div>

              {/* Tribes Card */}
              <div className="bg-gradient-to-br from-[#6B5344] to-[#5B4334] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Village />
                  </div>
                  <span className="text-white/80 text-sm font-medium">My Tribes</span>
                </div>
                <p className="text-3xl font-bold">{userTribes.length}</p>
                <p className="text-white/60 text-sm mt-1">
                  {primaryTribe ? `Primary: ${primaryTribe.name}` : 'No primary tribe'}
                </p>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Today's Wellness</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Daily Challenges</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {dailyChallenges.filter(c => c.completed).length} / {dailyChallenges.length}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] rounded-full transition-all"
                      style={{ width: `${dailyChallenges.length > 0 ? (dailyChallenges.filter(c => c.completed).length / dailyChallenges.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                {dailyChallenges.filter(c => c.completed).length === dailyChallenges.length && dailyChallenges.length > 0 && (
                  <div className="flex items-center gap-2 text-tribe-sage-600 dark:text-tribe-sage-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">All challenges completed!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Journeys Preview */}
            {profile?.activeJourneys && profile.activeJourneys.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Journeys</h3>
                  <button
                    onClick={() => setActiveTab('journeys')}
                    className="text-sm text-[#C4A77D] dark:text-[#D4A574] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.activeJourneys.slice(0, 3).map((journey) => {
                    const domain = WELLNESS_DOMAINS[journey.domain];
                    return (
                      <div
                        key={journey.domain}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${domain.gradient} flex items-center justify-center text-white`}>
                            {(() => {
                              const IconComponent = Icons[domain.icon as keyof typeof Icons];
                              return IconComponent ? <IconComponent /> : null;
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{domain.title}</p>
                            <p className="text-xs text-slate-500">Level {journey.level}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">{journey.xp} XP</span>
                            <span className="text-slate-500">{journey.xpToNextLevel} XP</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] rounded-full"
                              style={{ width: `${(journey.xp / journey.xpToNextLevel) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tribes Preview */}
            {userTribes.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Tribes</h3>
                  <Link
                    href="/tribes"
                    className="text-sm text-[#C4A77D] dark:text-[#D4A574] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTribes.slice(0, 3).map((tribe) => (
                    <Link
                      key={tribe.id}
                      href={`/tribes/${tribe.id}`}
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                        >
                          {tribe.icon}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tribe.name}</p>
                          <p className="text-xs text-slate-500">{tribe.memberCount} members</p>
                        </div>
                        {primaryTribe?.id === tribe.id && (
                          <span className="ml-auto px-2 py-0.5 bg-tribe-sage-100 dark:bg-tribe-sage-900/50 text-tribe-sage-700 dark:text-tribe-sage-300 text-xs rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood Trends Tab */}
        {activeTab === 'mood' && (
          <div className="space-y-6">
            {moodTrends ? (
              <>
                {/* Mood Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#F5F0E8] dark:bg-[#C4A77D]/30 flex items-center justify-center text-[#C4A77D] dark:text-[#D4A574]">
                      <Icons.Heart />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{moodTrends.avgMood.toFixed(1)}</p>
                    <p className="text-slate-600 dark:text-slate-400">Avg Mood (7 days)</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#E8F0ED] dark:bg-[#5D6B5E]/30 flex items-center justify-center text-[#5D6B5E] dark:text-[#A0B0A0]">
                      <Icons.Lightning />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{moodTrends.avgEnergy.toFixed(1)}</p>
                    <p className="text-slate-600 dark:text-slate-400">Avg Energy (7 days)</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#E8F0ED] dark:bg-[#2D5A4A]/30 flex items-center justify-center text-[#2D5A4A] dark:text-[#6B9080]">
                      <Icons.Fire />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{moodTrends.avgStress.toFixed(1)}</p>
                    <p className="text-slate-600 dark:text-slate-400">Avg Stress (7 days)</p>
                  </div>
                </div>

                {/* Mood History */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Check-ins</h3>
                  <div className="space-y-3">
                    {moodHistory.slice(-7).reverse().map((entry, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="text-sm text-slate-500 w-24">
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[#C4A77D]">Mood:</span>
                            <span className="font-medium">{entry.mood}/5</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#A89070]">Energy:</span>
                            <span className="font-medium">{entry.energy}/5</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#8B7355]">Stress:</span>
                            <span className="font-medium">{entry.stress}/5</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F5F0E8] dark:bg-[#C4A77D]/30 flex items-center justify-center text-[#C4A77D] dark:text-[#D4A574]">
                  <Icons.Heart />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Mood Data Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start logging your daily mood to see trends and patterns over time.
                </p>
                <Link
                  href="/wellness"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
                >
                  Log Your First Mood
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Journeys Tab */}
        {activeTab === 'journeys' && (
          <div className="space-y-6">
            {profile?.activeJourneys && profile.activeJourneys.length > 0 ? (
              <>
                {/* Journey Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-[#C4A77D] dark:text-[#D4A574]">{journeyStats.total}</p>
                    <p className="text-slate-600 dark:text-slate-400">Active Journeys</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-[#A89070] dark:text-[#B89B78]">{journeyStats.totalXp}</p>
                    <p className="text-slate-600 dark:text-slate-400">Total XP Earned</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-[#8B7355] dark:text-[#9A8565]">{journeyStats.avgLevel}</p>
                    <p className="text-slate-600 dark:text-slate-400">Average Level</p>
                  </div>
                </div>

                {/* All Journeys */}
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.activeJourneys.map((journey) => {
                    const domain = WELLNESS_DOMAINS[journey.domain];
                    return (
                      <div
                        key={journey.domain}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center text-white shadow-lg`}>
                            {(() => {
                              const IconComponent = Icons[domain.icon as keyof typeof Icons];
                              return IconComponent ? <IconComponent /> : null;
                            })()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{domain.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{domain.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#C4A77D] dark:text-[#D4A574] font-medium">Level {journey.level}</span>
                                <span className="text-slate-500">{journey.xp}/{journey.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] rounded-full"
                                  style={{ width: `${(journey.xp / journey.xpToNextLevel) * 100}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Icons.Fire />
                                <span>{journey.currentStreak} day streak</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F5F0E8] dark:bg-[#C4A77D]/30 flex items-center justify-center text-[#C4A77D] dark:text-[#D4A574]">
                  <Icons.Compass />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Journeys</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start a wellness journey to track your progress in different areas of wellbeing.
                </p>
                <Link
                  href="/wellness?tab=journey"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
                >
                  Start a Journey
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            {/* Impact Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#2D5A4A] to-[#3D6B5A] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icons.Heart />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total Village Points</p>
                    <p className="text-3xl font-bold">{stats?.villagePoints?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Worth ${((stats?.villagePoints || 0) / 1000).toFixed(2)} in charitable donations
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#C4A77D] to-[#B89B78] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icons.Gift />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Points Donated</p>
                    <p className="text-3xl font-bold">{stats?.donated?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  You've donated ${((stats?.donated || 0) / 1000).toFixed(2)} to charity!
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">How Village Points Work</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Icons.Meditation />, title: 'Practice Wellness', desc: 'Complete daily challenges' },
                  { icon: <Icons.Star />, title: 'Earn Points', desc: 'Every activity earns VP' },
                  { icon: <Icons.Gift />, title: 'Donate Points', desc: 'Convert to real donations' },
                  { icon: <Icons.Globe />, title: 'Make Impact', desc: 'Help verified charities' },
                ].map((step, i) => (
                  <div key={i} className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#E8F0ED] dark:bg-[#2D5A4A]/30 flex items-center justify-center text-[#2D5A4A] dark:text-[#6B9080]">
                      {step.icon}
                    </div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-[#F5F0E8] to-[#E8F0ED] dark:from-[#C4A77D]/20 dark:to-[#A89070]/20 rounded-xl border border-[#C4A77D]/30 dark:border-[#C4A77D]/50">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  <span className="font-semibold">1,000 Village Points = $1.00</span> to verified 501(c)(3) charities
                </p>
              </div>
            </div>

            {/* Learn More CTA */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white">
                <Icons.HeartHand />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Make a Difference?</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Donate your Village Points to causes you care about and see your wellness journey create real-world impact.
              </p>
              <Link
                href="/wellness?tab=impact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
              >
                Donate Points
              </Link>
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <Link
            href="/wellness"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C4A77D] hover:bg-[#B89B78] text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            <Icons.Heart />
            Continue Wellness Journey
          </Link>
        </div>
    </ContentPageLayout>
  );
}
