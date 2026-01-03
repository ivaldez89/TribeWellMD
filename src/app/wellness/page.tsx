'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { useWellness } from '@/hooks/useWellness';
import { useWHO5 } from '@/hooks/useWHO5';
import { HealthConnect } from '@/components/health/HealthConnect';
import { WHO5CheckIn, WHO5ScoreCard } from '@/components/wellness';
import { WELLNESS_DOMAINS, CHARITABLE_CAUSES, type WellnessDomain, type CharitableCause } from '@/types/wellness';
import { type WHO5Assessment } from '@/types/who5';
import { useTribes } from '@/hooks/useTribes';
import { Icons } from '@/components/ui/Icons';
import { SparklesIcon } from '@/components/icons/MedicalIcons';
import { createClient } from '@/lib/supabase/client';

// Mood level arrays (1-5 scale)
const MOOD_LEVELS = [1, 2, 3, 4, 5];
const ENERGY_LEVELS = [1, 2, 3, 4, 5];
const STRESS_LEVELS = [1, 2, 3, 4, 5];

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
    getStats,
    earnRewards
  } = useWellness();

  const [activeTab, setActiveTab] = useState<'journey' | 'village' | 'impact' | 'skills'>('village');

  // Get user ID for WHO-5
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // WHO-5 hook
  const {
    assessments: who5Assessments,
    streak: who5Streak,
    saveAssessment: saveWHO5Assessment,
    getLatestAssessment,
    shouldPrompt: shouldPromptWHO5
  } = useWHO5(userId);

  // Handle tab query parameter from dropdown menu
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['journey', 'village', 'impact', 'skills'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [searchParams]);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showWHO5Modal, setShowWHO5Modal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [moodData, setMoodData] = useState({ mood: 3, energy: 3, stress: 3, notes: '' });
  const [donateAmount, setDonateAmount] = useState(10);
  const [selectedCause, setSelectedCause] = useState<CharitableCause>('physician-wellness');

  // Handle WHO-5 completion
  const handleWHO5Complete = (assessment: WHO5Assessment) => {
    const rewards = saveWHO5Assessment(assessment);
    // Also add rewards through the wellness system
    earnRewards(rewards.xp, rewards.points, 'WHO-5 Daily Check-in');
  };

  const stats = getStats();
  const userVillages = getUserVillages();
  const { userTribes, primaryTribe, setPrimaryTribe: setUserPrimaryTribe } = useTribes();

  if (isLoading) {
    return (
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
    );
  }

  // Mobile Header
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Wellness</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats?.villagePoints || 0} points</p>
          </div>
        </div>
        <button
          onClick={() => setShowWHO5Modal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white text-sm font-medium rounded-xl flex items-center gap-1"
        >
          Check-In
          {who5Streak.current > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">{who5Streak.current}</span>
          )}
        </button>
      </div>
    </div>
  );

  // Left Sidebar
  const leftSidebar = (
    <>
      {/* Stats Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        <div className="h-16 bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Wellness</h2>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{stats?.villagePoints || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Points</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{stats?.donated || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Donated</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#8B7355]">{stats?.activeJourneys || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Journeys</p>
            </div>
          </div>

          {/* Daily Check-in Button - WHO-5 */}
          <button
            onClick={() => setShowWHO5Modal(true)}
            className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            WHO-5 Check-In
            {who5Streak.current > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {who5Streak.current}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Actions</h3>
        <nav className="space-y-1">
          <Link href="/groups" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
              <Icons.Village />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-teal-600">Groups</span>
          </Link>

          <button
            onClick={() => setShowDonateModal(true)}
            disabled={!profile?.villagePoints.available}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B3A3A] to-[#A64D4D] flex items-center justify-center text-white">
              <Icons.HeartHand />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#8B3A3A]">Donate Points</span>
          </button>

          <a
            href="tel:988"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white">
              <Icons.Emergency />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-600">988 Crisis Line</span>
          </a>
        </nav>
      </div>

      {/* Daily Challenges */}
      {dailyChallenges.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            Today&apos;s Challenges
          </h3>
          <div className="space-y-2">
            {dailyChallenges.slice(0, 3).map((challenge) => (
              <div
                key={challenge.id}
                className={`p-3 rounded-xl transition-all ${
                  challenge.completed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${challenge.completed ? 'line-through text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {challenge.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">+{challenge.xpReward} XP</p>
                  </div>
                  {!challenge.completed && (
                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      className="px-2 py-1 text-xs bg-[#C4A77D] text-white rounded-lg"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar
  const rightSidebar = (
    <>
      {/* My Groups */}
      {userTribes.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">My Groups</h3>
            <Link href="/groups" className="text-xs text-[#5B7B6D] hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {userTribes.slice(0, 3).map((tribe) => (
              <Link
                key={tribe.id}
                href={`/groups/${tribe.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                >
                  {tribe.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{tribe.name}</p>
                  <p className="text-xs text-slate-500">{tribe.memberCount} members</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Villages */}
      {userVillages.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">My Villages</h3>
          <div className="space-y-2">
            {userVillages.slice(0, 3).map((village) => (
              <div
                key={village.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{village.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{village.name}</p>
                    <p className="text-xs text-slate-500">{village.memberCount} members</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-amber-500" />
          Wellness Tips
        </h3>
        <div className="space-y-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#5B7B6D]">Daily check-ins</span> improve self-awareness and emotional regulation.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <ThreeColumnLayout
        mobileHeader={mobileHeader}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
      >
        {/* Navigation Tabs */}
        <div className={CARD_STYLES.containerWithPadding}>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'village', label: 'My Village', icon: <Icons.Village /> },
              { id: 'journey', label: 'My Journey', icon: <Icons.Compass /> },
              { id: 'skills', label: 'Social Skills', icon: <Icons.Target /> },
              { id: 'impact', label: 'Social Impact', icon: <Icons.HeartHand /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="w-5 h-5">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'journey' && (
          <>
            {/* Health App Integration */}
            <div className={CARD_STYLES.containerWithPadding}>
              <HealthConnect variant="full" />
            </div>

            {/* Wellness Domains */}
            <div className={CARD_STYLES.containerWithPadding}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Wellness Journeys</h2>
              <div className="grid gap-3">
                {Object.entries(WELLNESS_DOMAINS).map(([key, domain]) => {
                  const activeJourney = profile?.activeJourneys.find(j => j.domain === key);
                  const isActive = !!activeJourney;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#F5F0E8] dark:bg-[#C4A77D]/20 border-[#C4A77D]/30'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center text-white`}>
                          {(() => {
                            const IconComponent = Icons[domain.icon as keyof typeof Icons];
                            return IconComponent ? <IconComponent /> : null;
                          })()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{domain.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{domain.description}</p>

                          {isActive ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#C4A77D] font-medium">Level {activeJourney.level}</span>
                                <span className="text-slate-500">{activeJourney.xp}/{activeJourney.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] rounded-full"
                                  style={{ width: `${(activeJourney.xp / activeJourney.xpToNextLevel) * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startJourney(key as WellnessDomain)}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-600 hover:bg-[#C4A77D]/20 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all"
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
            </div>
          </>
        )}

        {activeTab === 'village' && (
          <>
            {/* My Groups */}
            {userTribes.length > 0 && (
              <div className={CARD_STYLES.containerWithPadding}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Groups</h2>
                  <Link href="/groups" className="text-sm text-[#5B7B6D] hover:underline">View All</Link>
                </div>
                <div className="grid gap-3">
                  {userTribes.map((tribe) => {
                    const isPrimary = primaryTribe?.id === tribe.id;
                    return (
                      <div
                        key={tribe.id}
                        className={`relative p-4 rounded-xl border transition-all ${
                          isPrimary
                            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 ring-2 ring-teal-500/50'
                            : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <Link href={`/groups/${tribe.id}`} className="flex items-start gap-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                          >
                            {tribe.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{tribe.name}</h3>
                              {isPrimary && (
                                <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">PRIMARY</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 capitalize">{tribe.type}</p>
                            <div className="flex items-center gap-3 text-xs mt-1">
                              <span className="text-[#5B7B6D]">{tribe.memberCount} members</span>
                              <span className="text-cyan-600">{tribe.totalPoints} pts</span>
                            </div>
                          </div>
                        </Link>
                        {!isPrimary && (
                          <button
                            onClick={() => setUserPrimaryTribe(tribe.id)}
                            className="mt-3 w-full py-2 bg-slate-100 dark:bg-slate-600 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg transition-all"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Groups Yet */}
            {userTribes.length === 0 && (
              <div className={CARD_STYLES.containerWithPadding + ' text-center'}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
                  <Icons.Users />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join Your First Group</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                  Groups are interest-based communities. Connect with like-minded peers!
                </p>
                <Link
                  href="/groups"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl transition-all"
                >
                  Explore Groups
                </Link>
              </div>
            )}

            {/* Discover Villages */}
            <div className={CARD_STYLES.containerWithPadding}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Discover Villages</h2>
              <div className="grid gap-3">
                {villages.filter(v => !profile?.villages.includes(v.id)).slice(0, 4).map((village) => (
                  <div
                    key={village.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-2xl">
                        {village.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{village.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{village.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{village.memberCount} members</span>
                          <button
                            onClick={() => joinVillage(village.id)}
                            className="px-3 py-1.5 bg-[#C4A77D] text-white text-xs font-medium rounded-lg"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'skills' && (
          <>
            {/* Social Skills Intro */}
            <div className={CARD_STYLES.containerWithPadding}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                  <Icons.Target />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Social Skills Training</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Evidence-based modules to help you build deeper connections and a more supportive network.
                  </p>
                </div>
              </div>
            </div>

            {/* Skill Categories */}
            <div className={CARD_STYLES.containerWithPadding}>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Core Skills</h3>
              <div className="grid gap-3">
                {[
                  { id: 'communication', title: 'Communication', description: 'Express yourself clearly and listen deeply', icon: <Icons.Chat />, level: profile?.socialSkillsProgress?.skillLevels?.communication || 0 },
                  { id: 'boundaries', title: 'Setting Boundaries', description: 'Protect your time and energy', icon: <Icons.Shield />, level: profile?.socialSkillsProgress?.skillLevels?.boundaries || 0 },
                  { id: 'empathy', title: 'Empathy & Compassion', description: 'Understand others while protecting your wellbeing', icon: <Icons.HeartHand />, level: profile?.socialSkillsProgress?.skillLevels?.empathy || 0 },
                  { id: 'conflict', title: 'Conflict Resolution', description: 'Navigate disagreements constructively', icon: <Icons.Handshake />, level: profile?.socialSkillsProgress?.skillLevels?.conflict || 0 },
                ].map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        {skill.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{skill.title}</h4>
                          <span className="text-xs text-amber-600 font-medium">Lv. {skill.level}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{skill.description}</p>
                        <div className="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            style={{ width: `${(skill.level / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'impact' && (
          <>
            {/* Impact Stats */}
            <div className={CARD_STYLES.containerWithPadding}>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-br from-[#8B3A3A] to-[#A64D4D] rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">{stats?.donated || 0}</p>
                  <p className="text-white/80 text-xs">Donated</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#5B7B6D] to-[#3D5A4C] rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">{profile?.villagePoints.available || 0}</p>
                  <p className="text-white/80 text-xs">Available</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#8B7355] to-[#6B5344] rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">{userVillages.length}</p>
                  <p className="text-white/80 text-xs">Villages</p>
                </div>
              </div>
            </div>

            {/* Donate Section */}
            <div className={CARD_STYLES.containerWithPadding}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Support a Cause</h2>
              <div className="grid gap-3">
                {Object.entries(CHARITABLE_CAUSES).slice(0, 4).map(([key, cause]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedCause(key as CharitableCause)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedCause === key
                        ? 'bg-[#F5F0E8] dark:bg-[#C4A77D]/20 border-[#C4A77D]/40'
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F0E8] dark:bg-[#C4A77D]/30 flex items-center justify-center text-[#C4A77D]">
                        {(() => {
                          const IconComponent = Icons[cause.icon as keyof typeof Icons];
                          return IconComponent ? <IconComponent /> : null;
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{cause.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{cause.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Donate Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowDonateModal(true)}
                  disabled={!profile?.villagePoints.available}
                  className="px-8 py-3 bg-gradient-to-r from-[#8B3A3A] to-[#A64D4D] hover:from-[#7A3232] hover:to-[#953F3F] disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Donate Village Points
                </button>
              </div>
            </div>
          </>
        )}
      </ThreeColumnLayout>

      {/* Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Daily Check-In</h3>

            {/* Mood */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">How&apos;s your mood? (1-5)</label>
              <div className="flex justify-between">
                {MOOD_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setMoodData(prev => ({ ...prev, mood: level as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                      moodData.mood === level
                        ? 'bg-[#C4A77D] text-white scale-110 ring-2 ring-[#C4A77D]'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Energy level? (1-5)</label>
              <div className="flex justify-between">
                {ENERGY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setMoodData(prev => ({ ...prev, energy: level as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                      moodData.energy === level
                        ? 'bg-[#A89070] text-white scale-110 ring-2 ring-[#A89070]'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Stress level? (1-5)</label>
              <div className="flex justify-between">
                {STRESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setMoodData(prev => ({ ...prev, stress: level as 1|2|3|4|5 }))}
                    className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                      moodData.stress === level
                        ? 'bg-[#8B7355] text-white scale-110 ring-2 ring-[#8B7355]'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                    }`}
                  >
                    {level}
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
                className="flex-1 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
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
                        ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white'
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
                  <option key={key} value={key}>{cause.title}</option>
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
                className="flex-1 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Donate {donateAmount} Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHO-5 Check-In Modal */}
      <WHO5CheckIn
        isOpen={showWHO5Modal}
        onClose={() => setShowWHO5Modal(false)}
        onComplete={handleWHO5Complete}
        userId={userId || 'anonymous'}
      />
    </>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function WellnessPage() {
  return (
    <Suspense fallback={
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
    }>
      <WellnessPageContent />
    </Suspense>
  );
}
