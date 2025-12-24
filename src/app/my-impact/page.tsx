'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentVillageId, getUserProfile, getTotalPointsContributed, getVillagePoints } from '@/lib/storage/profileStorage';
import { getCharityById, PARTNER_CHARITIES } from '@/data/charities';
import { useWellness } from '@/hooks/useWellness';
import {
  PERSONAL_MILESTONES,
  GLOBAL_MILESTONES,
  pointsToDollars,
  formatDonation,
  formatPoints,
  getNextMilestone,
  getUnlockedMilestones,
  getMilestoneProgress,
} from '@/types/donations';

export default function MyImpactPage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'village' | 'global'>('personal');

  const profile = getUserProfile();
  const villageId = getCurrentVillageId();
  const charity = villageId ? getCharityById(villageId) : null;
  const { getVillageLeaderboard, getUserVillageStats, getGlobalImpactStats } = useWellness();

  const userPoints = getTotalPointsContributed();
  const villageStats = getUserVillageStats();
  const globalStats = getGlobalImpactStats();
  const leaderboard = getVillageLeaderboard();

  const userDollars = pointsToDollars(userPoints);
  const unlockedPersonal = getUnlockedMilestones(userPoints, PERSONAL_MILESTONES);
  const nextPersonal = getNextMilestone(userPoints, PERSONAL_MILESTONES);
  const unlockedGlobal = getUnlockedMilestones(globalStats.totalPoints, GLOBAL_MILESTONES);
  const nextGlobal = getNextMilestone(globalStats.totalPoints, GLOBAL_MILESTONES);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="pt-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Your Impact
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Every point you earn becomes a real donation. Here&apos;s how your wellness journey is changing lives.
            </p>
          </div>

          {/* Impact Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#5B7B6D]">{formatPoints(userPoints)}</p>
              <p className="text-xs md:text-sm text-slate-500">Your Points</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#C4A77D]">{formatDonation(userDollars)}</p>
              <p className="text-xs md:text-sm text-slate-500">You Generated</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{formatDonation(villageStats?.totalVillageDonated || 0)}</p>
              <p className="text-xs md:text-sm text-slate-500">Village Total</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{formatDonation(globalStats.totalDonated)}</p>
              <p className="text-xs md:text-sm text-slate-500">Platform Total</p>
            </div>
          </div>

          {/* Your Village */}
          {charity && (
            <div className="bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Your donations support</p>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{charity.name}</h2>
                  <p className="text-white/80 text-sm max-w-lg">{charity.mission}</p>
                </div>
                <Link
                  href={`/village/${villageId}`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Visit Village
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{formatPoints(villageStats?.totalVillagePoints || 0)}</p>
                  <p className="text-xs text-white/70">Village Points</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">#{villageStats?.villageRank || '-'}</p>
                  <p className="text-xs text-white/70">Leaderboard Rank</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{formatPoints(userPoints)}</p>
                  <p className="text-xs text-white/70">Your Contribution</p>
                </div>
              </div>
            </div>
          )}

          {!charity && (
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 mb-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Join a Village to start converting your points to real donations!
              </p>
              <Link
                href="/village"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B7B6D] text-white font-medium rounded-lg hover:bg-[#4A6A5C] transition-colors"
              >
                Choose Your Village
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Your Milestones
            </button>
            <button
              onClick={() => setActiveTab('village')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'village'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Village Impact
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'global'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Global Impact
            </button>
          </div>

          {/* Personal Milestones */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Next Milestone Progress */}
              {nextPersonal && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#8B7355] flex items-center justify-center text-white">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Next Milestone: {nextPersonal.title}</h3>
                      <p className="text-sm text-slate-500">{nextPersonal.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#5B7B6D]">{formatDonation(nextPersonal.dollarsEquivalent)}</p>
                      <p className="text-xs text-slate-500">{formatPoints(nextPersonal.pointsRequired)} pts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{formatPoints(userPoints)} / {formatPoints(nextPersonal.pointsRequired)} points</span>
                      <span className="font-medium text-[#5B7B6D]">{Math.round(getMilestoneProgress(userPoints, nextPersonal))}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] transition-all duration-500"
                        style={{ width: `${getMilestoneProgress(userPoints, nextPersonal)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Milestones */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6">Achievements Unlocked</h3>
              {unlockedPersonal.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                  <p className="text-slate-500">Start earning points to unlock your first milestone!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {unlockedPersonal.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-white">{milestone.title}</h4>
                        <p className="text-sm text-slate-500 truncate">{milestone.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[#C4A77D]">{formatDonation(milestone.dollarsEquivalent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Locked Milestones Preview */}
              {nextPersonal && (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6">Upcoming Milestones</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {PERSONAL_MILESTONES.filter(m => m.pointsRequired > userPoints).slice(0, 4).map((milestone) => (
                      <div
                        key={milestone.id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 opacity-60"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-600 dark:text-slate-400">{milestone.title}</h4>
                          <p className="text-sm text-slate-400 truncate">{formatPoints(milestone.pointsRequired)} points needed</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-slate-400">{formatDonation(milestone.dollarsEquivalent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Village Impact */}
          {activeTab === 'village' && (
            <div className="space-y-6">
              {/* Village Leaderboard */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Village Leaderboard</h3>
                  <p className="text-sm text-slate-500">See how each charity community is doing</p>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {leaderboard.slice(0, 10).map((village, index) => {
                    const isUserVillage = village.villageId === villageId;
                    return (
                      <Link
                        key={village.villageId}
                        href={`/village/${village.villageId}`}
                        className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          isUserVillage ? 'bg-[#5B7B6D]/5 dark:bg-[#5B7B6D]/10' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-200 text-slate-600' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {getCharityById(village.villageId)?.shortName || village.villageName}
                            </p>
                            {isUserVillage && (
                              <span className="px-2 py-0.5 text-xs bg-[#5B7B6D]/10 text-[#5B7B6D] dark:bg-[#5B7B6D]/20 dark:text-[#7FA08F] rounded-full">
                                Your Village
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{village.memberCount} members</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#5B7B6D]">{formatDonation(village.totalDonated)}</p>
                          <p className="text-xs text-slate-500">{formatPoints(village.totalPoints)} pts</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-[#F5F0E8] to-[#E8F0ED] dark:from-slate-800 dark:to-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">How Points Become Donations</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#5B7B6D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Earn Points</p>
                    <p className="text-xs text-slate-500">Study, exercise, practice wellness</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#C4A77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">1000 pts = $1</p>
                    <p className="text-xs text-slate-500">Points convert to dollars</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">100% Donated</p>
                    <p className="text-xs text-slate-500">Goes to your Village charity</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Global Impact */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              {/* Global Stats */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">TribeWellMD Community Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold">{formatDonation(globalStats.totalDonated)}</p>
                    <p className="text-xs text-slate-400">Total Donated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold">{formatPoints(globalStats.totalPoints)}</p>
                    <p className="text-xs text-slate-400">Total Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold">{globalStats.totalMembers}</p>
                    <p className="text-xs text-slate-400">Active Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold">{globalStats.totalVillages}</p>
                    <p className="text-xs text-slate-400">Villages</p>
                  </div>
                </div>
              </div>

              {/* Next Global Milestone */}
              {nextGlobal && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Community Goal: {nextGlobal.title}</h3>
                      <p className="text-sm text-slate-500">{nextGlobal.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{formatDonation(nextGlobal.dollarsEquivalent)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDonation(globalStats.totalDonated)} / {formatDonation(nextGlobal.dollarsEquivalent)}
                      </span>
                      <span className="font-medium text-purple-600">{Math.round(getMilestoneProgress(globalStats.totalPoints, nextGlobal))}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${getMilestoneProgress(globalStats.totalPoints, nextGlobal)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Global Milestones */}
              <div className="grid sm:grid-cols-2 gap-4">
                {GLOBAL_MILESTONES.map((milestone) => {
                  const isUnlocked = globalStats.totalPoints >= milestone.pointsRequired;
                  return (
                    <div
                      key={milestone.id}
                      className={`rounded-xl border p-4 flex items-center gap-4 ${
                        isUnlocked
                          ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {isUnlocked ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-slate-500 truncate">{milestone.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold ${isUnlocked ? 'text-green-600' : 'text-slate-400'}`}>
                          {formatDonation(milestone.dollarsEquivalent)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
