'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useWellness } from '@/hooks/useWellness';
import { WELLNESS_DOMAINS, CHARITABLE_CAUSES, type WellnessDomain, type CharitableCause } from '@/types/wellness';
import { useTribes } from '@/hooks/useTribes';

// Mood emoji mapping
const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊'];
const ENERGY_EMOJIS = ['😴', '🥱', '😌', '⚡', '🔥'];
const STRESS_EMOJIS = ['😌', '🙂', '😐', '😰', '🤯'];

function WellnessPageContent() {
  const searchParams = useSearchParams();
  const {
    profile,
    villages,
    dailyChallenges,
    isLoading,
    startJourney,
    completeChallenge,
    logMood,
    donatePoints,
    joinVillage,
    getUserVillages,
    getStats
  } = useWellness();

  const [activeTab, setActiveTab] = useState<'journey' | 'village' | 'impact' | 'skills'>('village');

  // Handle tab query parameter from dropdown menu
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['journey', 'village', 'impact', 'skills'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [searchParams]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [moodData, setMoodData] = useState({ mood: 3, energy: 3, stress: 3, notes: '' });
  const [donateAmount, setDonateAmount] = useState(10);
  const [selectedCause, setSelectedCause] = useState<CharitableCause>('physician-wellness');

  const stats = getStats();
  const userVillages = getUserVillages();

  // Get user's tribes with primary tribe info
  const { userTribes, primaryTribe, setPrimaryTribe: setUserPrimaryTribe } = useTribes();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading your wellness journey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-600 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Welcome & Stats */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" />
                  <span>Your wellness village awaits</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Welcome to <span className="text-pink-200">TribeWellz</span>
                </h1>

                <p className="text-white/80 text-lg max-w-md mb-6">
                  Personal growth and collective progress are mutually reinforcing. Your wellness journey helps you and your community thrive.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats?.villagePoints || 0}</p>
                    <p className="text-white/60 text-xs">Village Points</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats?.donated || 0}</p>
                    <p className="text-white/60 text-xs">Points Donated</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats?.activeJourneys || 0}</p>
                    <p className="text-white/60 text-xs">Active Journeys</p>
                  </div>
                </div>
              </div>

              {/* Right side - Quick Actions */}
              <div className="flex flex-col items-center gap-4">
                {/* Daily Check-in Card */}
                <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 w-full max-w-xs">
                  <div className="text-center">
                    <h3 className="text-white font-semibold mb-2">Daily Check-In</h3>
                    <p className="text-white/70 text-sm mb-4">How are you feeling today?</p>
                    <button
                      onClick={() => setShowMoodModal(true)}
                      className="w-full px-6 py-3 bg-white hover:bg-pink-50 text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                      Log My Mood
                    </button>
                  </div>
                </div>

                {/* Crisis Resources */}
                <a
                  href="tel:988"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur hover:bg-white/30 text-white font-medium rounded-xl transition-all"
                >
                  <span>🆘</span>
                  988 Crisis Line (24/7)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="mb-6">
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
            {[
              { id: 'village', label: 'My Village', icon: '🏘️' },
              { id: 'journey', label: 'My Journey', icon: '🧭' },
              { id: 'skills', label: 'Social Skills', icon: '🎯' },
              { id: 'impact', label: 'Social Impact', icon: '💚' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'journey' && (
          <>
            {/* Daily Challenges */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  Today's Challenges
                </h2>
                <span className="text-sm text-slate-500">
                  {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} completed
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {dailyChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      challenge.completed
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        challenge.completed
                          ? 'bg-emerald-500 text-white'
                          : `bg-gradient-to-br ${WELLNESS_DOMAINS[challenge.domain].gradient} text-white`
                      }`}>
                        {challenge.completed ? '✓' : WELLNESS_DOMAINS[challenge.domain].icon}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">+{challenge.xpReward} XP</span>
                        <br />
                        <span className="text-xs text-pink-600 dark:text-pink-400">+{challenge.villagePointsReward} VP</span>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-1 ${challenge.completed ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{challenge.description}</p>
                    {!challenge.completed && (
                      <button
                        onClick={() => completeChallenge(challenge.id)}
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Wellness Domains */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wellness Journeys
                </h2>
                <span className="text-sm text-slate-500">
                  Choose your path to well-being
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(WELLNESS_DOMAINS).map(([key, domain]) => {
                  const activeJourney = profile?.activeJourneys.find(j => j.domain === key);
                  const isActive = !!activeJourney;

                  return (
                    <div
                      key={key}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <span className="text-2xl">{domain.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{domain.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{domain.description}</p>

                          {isActive ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-purple-600 dark:text-purple-400 font-medium">Level {activeJourney.level}</span>
                                <span className="text-slate-500">{activeJourney.xp}/{activeJourney.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                  style={{ width: `${(activeJourney.xp / activeJourney.xpToNextLevel) * 100}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>🔥 {activeJourney.currentStreak} day streak</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startJourney(key as WellnessDomain)}
                              className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all"
                            >
                              Start Journey
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'village' && (
          <>
            {/* My Tribes - Featured Section */}
            {userTribes.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 bg-teal-500 rounded-full" />
                    My Tribes
                  </h2>
                  <Link
                    href="/tribes"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    View All Tribes →
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTribes.map((tribe) => {
                    const isPrimary = primaryTribe?.id === tribe.id;
                    return (
                      <div
                        key={tribe.id}
                        className={`relative p-5 rounded-2xl border transition-all ${
                          isPrimary
                            ? 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-300 dark:border-teal-700 ring-2 ring-teal-500/50'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                        }`}
                      >
                        {/* Primary Badge */}
                        {isPrimary && (
                          <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ⭐ PRIMARY
                          </div>
                        )}

                        <Link href={`/tribes/${tribe.id}`} className="block">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                              style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                            >
                              {tribe.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{tribe.name}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-2">{tribe.type}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-teal-600 dark:text-teal-400">{tribe.memberCount} members</span>
                                <span className="text-cyan-600 dark:text-cyan-400">{tribe.totalPoints} pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Goal Progress */}
                          {tribe.currentGoal && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{tribe.currentGoal.title}</span>
                                <span className="font-medium text-teal-600 dark:text-teal-400">
                                  {Math.round((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                                  style={{ width: `${Math.min((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </Link>

                        {/* Set as Primary Button */}
                        {!isPrimary && (
                          <button
                            onClick={() => setUserPrimaryTribe(tribe.id)}
                            className="mt-3 w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-medium rounded-lg transition-all"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explore More Tribes CTA */}
                <div className="mt-4 p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Looking for more communities?</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Discover tribes that match your interests</p>
                    </div>
                    <Link
                      href="/tribes"
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
                    >
                      Explore Tribes
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* No Tribes Yet */}
            {userTribes.length === 0 && (
              <section className="mb-8">
                <div className="p-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-teal-200 dark:border-teal-800 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-3xl">🏘️</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join Your First Tribe</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Tribes are communities with shared missions and social impact goals. Join up to 5 tribes and make a difference together!
                  </p>
                  <Link
                    href="/tribes"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all"
                  >
                    Explore Tribes
                  </Link>
                </div>
              </section>
            )}

            {/* My Villages */}
            {userVillages.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full" />
                  My Villages
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {userVillages.map((village) => (
                    <div
                      key={village.id}
                      className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                          {village.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{village.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{village.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-purple-600 dark:text-purple-400">{village.memberCount} members</span>
                            <span className="text-pink-600 dark:text-pink-400">${village.totalDonated} raised</span>
                          </div>
                        </div>
                      </div>
                      {/* Weekly Progress */}
                      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Weekly Goal</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">{village.weeklyProgress}/{village.weeklyGoal} VP</span>
                        </div>
                        <div className="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${Math.min((village.weeklyProgress / village.weeklyGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Discover Villages */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Discover Villages
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {villages.filter(v => !profile?.villages.includes(v.id)).map((village) => (
                  <div
                    key={village.id}
                    className="group p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${village.color}-400 to-${village.color}-600 flex items-center justify-center text-2xl shadow-lg`}>
                        {village.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{village.name}</h3>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full capitalize">
                              {village.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 my-2">{village.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span>{village.memberCount} members</span>
                          <span>${village.totalDonated} raised</span>
                        </div>
                        <button
                          onClick={() => joinVillage(village.id)}
                          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          Join Village
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Create Village CTA */}
            <section className="mb-8">
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-3xl">🏘️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create Your Own Village</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start a wellness community around your rotation, specialty interest, or a cause you care about.
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all">
                  Create Village
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === 'skills' && (
          <>
            {/* Social Skills Intro */}
            <section className="mb-8">
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">App-Taught Social Skills</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Medicine teaches you to heal bodies, but rarely how to build the relationships that sustain you.
                      These evidence-based modules help you develop the social skills that lead to deeper connections and a more supportive network.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Skill Categories */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Core Skills</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'communication',
                    title: 'Communication',
                    description: 'Express yourself clearly and listen deeply',
                    icon: '💬',
                    level: profile?.socialSkillsProgress?.skillLevels?.communication || 0,
                    color: 'blue',
                    modules: ['Active Listening', 'Assertive Expression', 'Non-Verbal Cues', 'Difficult Conversations']
                  },
                  {
                    id: 'boundaries',
                    title: 'Setting Boundaries',
                    description: 'Protect your time and energy while maintaining relationships',
                    icon: '🛡️',
                    level: profile?.socialSkillsProgress?.skillLevels?.boundaries || 0,
                    color: 'purple',
                    modules: ['Identifying Limits', 'Saying No Gracefully', 'Managing Expectations', 'Self-Advocacy']
                  },
                  {
                    id: 'empathy',
                    title: 'Empathy & Compassion',
                    description: 'Understand others while protecting your own wellbeing',
                    icon: '💗',
                    level: profile?.socialSkillsProgress?.skillLevels?.empathy || 0,
                    color: 'pink',
                    modules: ['Perspective Taking', 'Emotional Validation', 'Compassion Fatigue Prevention', 'Self-Compassion']
                  },
                  {
                    id: 'conflict',
                    title: 'Conflict Resolution',
                    description: 'Navigate disagreements constructively',
                    icon: '🤝',
                    level: profile?.socialSkillsProgress?.skillLevels?.conflict || 0,
                    color: 'orange',
                    modules: ['Understanding Triggers', 'De-escalation', 'Finding Common Ground', 'Repair & Reconnection']
                  },
                  {
                    id: 'support',
                    title: 'Giving & Receiving Support',
                    description: 'Build a network that lifts everyone up',
                    icon: '🌟',
                    level: profile?.socialSkillsProgress?.skillLevels?.support || 0,
                    color: 'amber',
                    modules: ['Asking for Help', 'Offering Support', 'Peer Mentoring', 'Building Your Village']
                  },
                ].map((skill) => (
                  <div
                    key={skill.id}
                    className="group p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${skill.color}-400 to-${skill.color}-600 flex items-center justify-center text-xl flex-shrink-0`}>
                        {skill.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{skill.title}</h3>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Lv. {skill.level}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{skill.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Modules Preview */}
                        <div className="space-y-1">
                          {skill.modules.slice(0, 2).map((module, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <div className={`w-4 h-4 rounded-full border-2 ${idx === 0 ? 'border-amber-500 bg-amber-500/20' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center`}>
                                {idx === 0 && <span className="text-[8px] text-amber-600">1</span>}
                              </div>
                              {module}
                            </div>
                          ))}
                          <button className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline">
                            +{skill.modules.length - 2} more modules
                          </button>
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all">
                      {skill.level > 0 ? 'Continue Learning' : 'Start Learning'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Module */}
            <section className="mb-8">
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl">🎧</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      Featured Module
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">The Art of Active Listening</h3>
                    <p className="text-slate-400 mb-4">
                      Learn the HEAR technique - Hold space, Empathize, Ask questions, Reflect back.
                      This 15-minute interactive module will transform how you connect with patients, colleagues, and loved ones.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all">
                        Start Module
                      </button>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>15 min</span>
                        <span>•</span>
                        <span>+50 XP</span>
                        <span>•</span>
                        <span>+15 VP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Tips */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daily Social Tips</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'The 2-Minute Rule',
                    tip: 'If a supportive text takes less than 2 minutes to send, do it now. Small gestures maintain big relationships.',
                    icon: '⏱️'
                  },
                  {
                    title: 'Name It to Tame It',
                    tip: 'When stressed, name the emotion out loud. "I\'m feeling anxious about this presentation." Naming reduces intensity by 50%.',
                    icon: '🏷️'
                  },
                  {
                    title: 'The Pause Button',
                    tip: 'Before responding to a triggering message, take 3 breaths. Your future self will thank you.',
                    icon: '⏸️'
                  },
                ].map((tip, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl mb-3">
                      {tip.icon}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{tip.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'impact' && (
          <>
            {/* Impact Stats */}
            <section className="mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">💚</span>
                    <div>
                      <p className="text-3xl font-bold">{stats?.donated || 0}</p>
                      <p className="text-emerald-100 text-sm">Points Donated</p>
                    </div>
                  </div>
                  <p className="text-emerald-100 text-xs">Every point makes a difference</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🌍</span>
                    <div>
                      <p className="text-3xl font-bold">{profile?.villagePoints.available || 0}</p>
                      <p className="text-purple-100 text-sm">Available to Donate</p>
                    </div>
                  </div>
                  <p className="text-purple-100 text-xs">Choose a cause you care about</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🤝</span>
                    <div>
                      <p className="text-3xl font-bold">{userVillages.length}</p>
                      <p className="text-pink-100 text-sm">Villages Joined</p>
                    </div>
                  </div>
                  <p className="text-pink-100 text-xs">Stronger together</p>
                </div>
              </div>
            </section>

            {/* Donate Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Support a Cause
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CHARITABLE_CAUSES).map(([key, cause]) => (
                  <div
                    key={key}
                    className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
                      profile?.preferredCause === key
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedCause(key as CharitableCause)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-2xl">
                        {cause.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{cause.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{cause.description}</p>
                        <span className="text-xs text-purple-600 dark:text-purple-400">{cause.organization}</span>
                      </div>
                    </div>
                    {profile?.preferredCause === key && (
                      <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Your preferred cause</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Donate Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowDonateModal(true)}
                  disabled={!profile?.villagePoints.available}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                >
                  Donate Village Points
                </button>
                {profile?.villagePoints.available === 0 && (
                  <p className="text-sm text-slate-500 mt-2">Complete challenges to earn points to donate!</p>
                )}
              </div>
            </section>

            {/* How It Works */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 text-center">How Village Points Work</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { icon: '🧘', title: 'Practice Wellness', desc: 'Complete daily challenges and progress in your journeys' },
                    { icon: '⭐', title: 'Earn Points', desc: 'Every activity earns Village Points for you and your community' },
                    { icon: '💝', title: 'Donate Points', desc: 'Convert your points into real donations to causes you care about' },
                    { icon: '🌍', title: 'Make Impact', desc: 'Watch your personal growth create collective change' },
                  ].map((step, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center">
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                      <p className="text-slate-400 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

      </main>

      {/* Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Daily Check-In</h3>

            {/* Mood */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">How's your mood?</label>
              <div className="flex justify-between">
                {MOOD_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setMoodData(prev => ({ ...prev, mood: (i + 1) as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                      moodData.mood === i + 1
                        ? 'bg-purple-100 dark:bg-purple-900/30 scale-110 ring-2 ring-purple-500'
                        : 'bg-slate-100 dark:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Energy level?</label>
              <div className="flex justify-between">
                {ENERGY_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setMoodData(prev => ({ ...prev, energy: (i + 1) as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                      moodData.energy === i + 1
                        ? 'bg-amber-100 dark:bg-amber-900/30 scale-110 ring-2 ring-amber-500'
                        : 'bg-slate-100 dark:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Stress level?</label>
              <div className="flex justify-between">
                {STRESS_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setMoodData(prev => ({ ...prev, stress: (i + 1) as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                      moodData.stress === i + 1
                        ? 'bg-rose-100 dark:bg-rose-900/30 scale-110 ring-2 ring-rose-500'
                        : 'bg-slate-100 dark:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes (optional)</label>
              <textarea
                value={moodData.notes}
                onChange={(e) => setMoodData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How are you really feeling?"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 text-slate-900 dark:text-white placeholder-slate-500 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMoodModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logMood(moodData.mood as 1|2|3|4|5, moodData.energy as 1|2|3|4|5, moodData.stress as 1|2|3|4|5, moodData.notes);
                  setShowMoodModal(false);
                  setMoodData({ mood: 3, energy: 3, stress: 3, notes: '' });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Log Check-In (+10 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Donate Village Points</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-6">
              Available: {profile?.villagePoints.available || 0} points
            </p>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Amount to donate</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonateAmount(amount)}
                    disabled={(profile?.villagePoints.available || 0) < amount}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      donateAmount === amount
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Cause Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select cause</label>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value as CharitableCause)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 text-slate-900 dark:text-white"
              >
                {Object.entries(CHARITABLE_CAUSES).map(([key, cause]) => (
                  <option key={key} value={key}>{cause.icon} {cause.title}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDonateModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  donatePoints(donateAmount, selectedCause);
                  setShowDonateModal(false);
                }}
                disabled={(profile?.villagePoints.available || 0) < donateAmount}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Donate {donateAmount} Points
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function WellnessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading your wellness journey...</p>
          </div>
        </div>
      </div>
    }>
      <WellnessPageContent />
    </Suspense>
  );
}
