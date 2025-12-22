'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';
import { useTribes } from '@/hooks/useTribes';
import { useWellness } from '@/hooks/useWellness';

export default function CommunityPage() {
  const { userTribes, primaryTribe, tribes } = useTribes();
  const { getStats } = useWellness();
  const stats = getStats();

  const [activeTab, setActiveTab] = useState<'overview' | 'tribes' | 'impact' | 'connect'>('overview');

  // Calculate community stats
  const totalTribeMembers = userTribes.reduce((sum, t) => sum + (t.memberCount || 0), 0);
  const totalTribePoints = userTribes.reduce((sum, t) => sum + (t.totalPoints || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" />
                <span>Your Community</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Community <span className="text-orange-200">Hub</span>
              </h1>

              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Connect with your tribes, track your collective impact, and grow together.
              </p>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{userTribes.length}</p>
                  <p className="text-white/60 text-xs">My Tribes</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{totalTribeMembers}</p>
                  <p className="text-white/60 text-xs">Tribe Members</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{totalTribePoints.toLocaleString()}</p>
                  <p className="text-white/60 text-xs">Collective Points</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">${((stats?.donated || 0) / 1000).toFixed(0)}</p>
                  <p className="text-white/60 text-xs">Donated</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto animate-fade-in-up animation-delay-100">
          {[
            { id: 'overview', label: 'Overview', icon: <Icons.Chart /> },
            { id: 'tribes', label: 'My Tribes', icon: <Icons.Village /> },
            { id: 'impact', label: 'Collective Impact', icon: <Icons.HeartHand /> },
            { id: 'connect', label: 'Connect', icon: <Icons.Users /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400'
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
            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tribes Card */}
              <Link
                href="/tribes"
                className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Village />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Study Tribes</span>
                </div>
                <p className="text-3xl font-bold">{userTribes.length}</p>
                <p className="text-white/60 text-sm mt-1">tribes joined</p>
                <div className="mt-3 flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Impact Card */}
              <Link
                href="/impact"
                className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.HeartHand />
                  </div>
                  <span className="text-white/80 text-sm font-medium">How It Works</span>
                </div>
                <p className="text-3xl font-bold">${((stats?.donated || 0) / 1000).toFixed(2)}</p>
                <p className="text-white/60 text-sm mt-1">to charity</p>
                <div className="mt-3 flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Find Charities Card */}
              <Link
                href="/impact/local"
                className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Location />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Find Charities</span>
                </div>
                <p className="text-2xl font-bold">Local</p>
                <p className="text-white/60 text-sm mt-1">verified nonprofits</p>
                <div className="mt-3 flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Explore</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* PreMed Card */}
              <Link
                href="/premed"
                className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.GraduationCap />
                  </div>
                  <span className="text-white/80 text-sm font-medium">PreMed</span>
                </div>
                <p className="text-2xl font-bold">Resources</p>
                <p className="text-white/60 text-sm mt-1">for future doctors</p>
                <div className="mt-3 flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>View</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* My Tribes Preview */}
            {userTribes.length > 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Tribes</h3>
                  <Link
                    href="/tribes"
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
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
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                        >
                          {tribe.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{tribe.name}</p>
                          <p className="text-xs text-slate-500">{tribe.memberCount} members</p>
                        </div>
                        {primaryTribe?.id === tribe.id && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {tribe.currentGoal && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 truncate">{tribe.currentGoal.title}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {Math.round((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              style={{ width: `${Math.min((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Icons.Village />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join Your First Tribe</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Tribes are communities with shared goals. Study together, support each other, and make a collective impact.
                </p>
                <Link
                  href="/tribes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Explore Tribes
                </Link>
              </div>
            )}

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Why Community Matters</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold text-amber-400 mb-1">27%</p>
                  <p className="text-slate-400 text-sm">of medical students experience depression</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold text-amber-400 mb-1">50%</p>
                  <p className="text-slate-400 text-sm">feel they lack adequate mentorship</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold text-amber-400 mb-1">1 in 3</p>
                  <p className="text-slate-400 text-sm">residents report burnout symptoms</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm text-center mt-4">
                You don't have to do this alone. TribeWellMD is building the community that should have always existed.
              </p>
            </div>
          </div>
        )}

        {/* Tribes Tab */}
        {activeTab === 'tribes' && (
          <div className="space-y-6">
            {userTribes.length > 0 ? (
              <>
                {/* Tribe Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{userTribes.length}</p>
                    <p className="text-slate-600 dark:text-slate-400">Tribes Joined</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalTribeMembers}</p>
                    <p className="text-slate-600 dark:text-slate-400">Total Members</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTribePoints.toLocaleString()}</p>
                    <p className="text-slate-600 dark:text-slate-400">Collective Points</p>
                  </div>
                </div>

                {/* All User Tribes */}
                <div className="grid md:grid-cols-2 gap-4">
                  {userTribes.map((tribe) => (
                    <Link
                      key={tribe.id}
                      href={`/tribes/${tribe.id}`}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)` }}
                        >
                          {tribe.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{tribe.name}</h3>
                            {primaryTribe?.id === tribe.id && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs rounded-full flex-shrink-0">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{tribe.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{tribe.memberCount} members</span>
                            <span>{tribe.totalPoints?.toLocaleString() || 0} points</span>
                          </div>
                          {tribe.currentGoal && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{tribe.currentGoal.title}</span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                  {Math.round((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                  style={{ width: `${Math.min((tribe.currentGoal.currentPoints / tribe.currentGoal.targetPoints) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Explore More */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Looking for more tribes?</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Discover communities that match your interests</p>
                    </div>
                    <Link
                      href="/tribes"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      Explore All Tribes
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Icons.Village />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Tribes Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Join tribes to connect with peers, study together, and make a collective impact on causes you care about.
                </p>
                <Link
                  href="/tribes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Explore Tribes
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
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white">
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

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
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
                  You've contributed ${((stats?.donated || 0) / 1000).toFixed(2)} to verified charities!
                </p>
              </div>
            </div>

            {/* How It Works Link */}
            <Link
              href="/impact"
              className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                  <Icons.Lightbulb />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">How Village Points Work</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Learn how your wellness activities convert to real charitable donations
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Find Local Charities */}
            <Link
              href="/impact/local"
              className="block bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-teal-200 dark:border-teal-800 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
                  <Icons.Location />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Find Local Charities</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Discover verified nonprofits in your community where your points can make an impact
                  </p>
                </div>
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Conversion Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Conversion Rate</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                  <p className="text-xl font-bold text-teal-600 dark:text-teal-400">10 XP</p>
                  <p className="text-xs text-slate-500">=</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">1 Village Point</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">1,000 VP</p>
                  <p className="text-xs text-slate-500">=</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">$1.00 to charity</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">100%</p>
                  <p className="text-xs text-slate-500">=</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Transparent</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connect Tab */}
        {activeTab === 'connect' && (
          <div className="space-y-6">
            {/* Coming Soon Features */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Mentorship */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                    <Icons.Target />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Mentorship</h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Find your guide</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Connect with residents and attendings in your specialty interest. Get personalized advice from people who've walked your path.
                </p>
              </div>

              {/* Day in the Life */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <Icons.Camera />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Day-in-the-Life</h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Real residency stories</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  See what residency is really like through authentic daily posts from residents across specialties and programs.
                </p>
              </div>

              {/* Anonymous Support */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                    <Icons.Chat />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Anonymous Support</h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Safe space to share</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  A judgment-free zone to share struggles, seek advice, and support fellow trainees through the challenging moments.
                </p>
              </div>

              {/* Events */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    <Icons.Calendar />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Events & Workshops</h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Learn together</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Virtual workshops, Q&A sessions with specialists, and community events to help you grow personally and professionally.
                </p>
              </div>
            </div>

            {/* Available Now */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Available Now</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/tribes"
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                    <Icons.Village />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Study Tribes</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Join {tribes?.length || 12} active tribes</p>
                  </div>
                </Link>

                <Link
                  href="/wellness"
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white">
                    <Icons.Heart />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Wellness Center</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Resources & self-care tools</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <Link
            href="/tribes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            <Icons.Village />
            Explore Tribes
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
