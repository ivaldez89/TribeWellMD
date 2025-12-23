'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PARTNER_CHARITIES } from '@/data/charities';

// Point conversion rates
const POINT_CONVERSIONS = {
  study: [
    { activity: 'Flashcard review (Easy)', xp: 12, villagePoints: 1, verification: 'automatic' },
    { activity: 'Flashcard review (Good)', xp: 10, villagePoints: 1, verification: 'automatic' },
    { activity: 'Flashcard review (Hard)', xp: 8, villagePoints: 1, verification: 'automatic' },
    { activity: 'Flashcard review (Again)', xp: 5, villagePoints: 0, verification: 'automatic' },
    { activity: 'Case completion', xp: 25, villagePoints: 2, verification: 'automatic' },
    { activity: 'Case completion (optimal path)', xp: 40, villagePoints: 4, verification: 'automatic' },
    { activity: 'Daily goal completion', xp: 50, villagePoints: 5, verification: 'automatic' },
    { activity: '7-day streak bonus', xp: 100, villagePoints: 10, verification: 'automatic' },
  ],
  wellness: [
    { activity: 'Daily mood check-in', xp: 10, villagePoints: 1, verification: 'self-reported' },
    { activity: '5-minute breathing exercise', xp: 25, villagePoints: 2, verification: 'self-reported' },
    { activity: 'Gratitude journal entry', xp: 20, villagePoints: 2, verification: 'self-reported' },
    { activity: 'Mindful meal (no screens)', xp: 30, villagePoints: 3, verification: 'photo-verified' },
    { activity: 'Walking break (10 min)', xp: 25, villagePoints: 2, verification: 'self-reported' },
    { activity: '10,000 steps', xp: 50, villagePoints: 5, verification: 'health-app' },
    { activity: '30-minute workout', xp: 75, villagePoints: 8, verification: 'health-app' },
    { activity: '7+ hours sleep', xp: 40, villagePoints: 4, verification: 'health-app' },
  ],
  social: [
    { activity: 'Connect with a friend', xp: 35, villagePoints: 4, verification: 'self-reported' },
    { activity: 'Group study session', xp: 50, villagePoints: 5, verification: 'photo-verified' },
    { activity: 'Tribe challenge participation', xp: 40, villagePoints: 4, verification: 'automatic' },
    { activity: 'Helping a tribe member', xp: 30, villagePoints: 3, verification: 'peer-confirmed' },
  ]
};

// Verification tier info - icons are SVG component names from Icons.tsx
const VERIFICATION_TIERS = [
  {
    tier: 'Self-Reported',
    icon: 'Hand',
    multiplier: '1x',
    description: 'Honor system - we trust you',
    examples: ['Mood check-ins', 'Gratitude journaling', 'Breathing exercises'],
    color: 'from-slate-400 to-slate-500'
  },
  {
    tier: 'Photo Verified',
    icon: 'Camera',
    multiplier: '2x',
    description: 'AI-analyzed photo evidence',
    examples: ['Healthy meals', 'Group study selfies', 'Workout photos'],
    color: 'from-[#6B8B7D] to-[#5B7B6D]'
  },
  {
    tier: 'Health App Verified',
    icon: 'Watch',
    multiplier: '3x',
    description: 'Connected device data',
    examples: ['Step counts', 'Sleep tracking', 'Workout minutes'],
    color: 'from-[#5B7B6D] to-[#4A6A5C]'
  },
  {
    tier: 'Automatic',
    icon: 'Sparkles',
    multiplier: '1x',
    description: 'Tracked by the platform',
    examples: ['Flashcard reviews', 'Case completions', 'Streaks'],
    color: 'from-[#8B7355] to-[#7A6348]'
  }
];

export default function ImpactPage() {
  const [activeCategory, setActiveCategory] = useState<'study' | 'wellness' | 'social'>('study');
  const [showConversionCalc, setShowConversionCalc] = useState(false);
  const [calcPoints, setCalcPoints] = useState(1000);

  // Calculate dollar value (1000 points = $1.00 for now, adjustable based on funding)
  const pointsToDollars = (points: number) => (points / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-[#C4A77D] rounded-full animate-pulse" />
              Your growth fuels community impact
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              How Your <span className="text-[#E8E0D5]">Self-Care</span><br />
              Becomes <span className="text-[#C4A77D]">Charity</span>
            </h1>

            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Every flashcard you review, every step you take, every healthy choice you make
              generates Village Points that translate into real donations to causes you care about.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-4 bg-white/20 backdrop-blur rounded-2xl">
                <div className="text-3xl font-bold text-white">10 XP</div>
                <div className="text-white/70 text-sm">= 1 Village Point</div>
              </div>
              <div className="px-6 py-4 bg-white/20 backdrop-blur rounded-2xl">
                <div className="text-3xl font-bold text-white">1,000 pts</div>
                <div className="text-white/70 text-sm">= $1.00 to charity</div>
              </div>
              <div className="px-6 py-4 bg-white/20 backdrop-blur rounded-2xl">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-white/70 text-sm">goes to your cause</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                The TribeWellMD Impact Cycle
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                A simple but powerful system where taking care of yourself automatically helps others
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: 1, icon: 'Book', title: 'Study & Practice', desc: 'Review flashcards, complete cases, maintain your streak' },
                { step: 2, icon: 'Meditation', title: 'Wellness Activities', desc: 'Exercise, meditate, sleep well, eat healthy' },
                { step: 3, icon: 'Sparkles', title: 'Earn Village Points', desc: 'Every activity generates points based on verification tier' },
                { step: 4, icon: 'Heart', title: 'Impact Charity', desc: 'Points pool together and convert to real donations' }
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-[#E8E0D5] dark:bg-[#3D4A44] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-[#5B7B6D] dark:text-[#7FA08F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {item.icon === 'Book' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />}
                        {item.icon === 'Meditation' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 6v6l4 2" />}
                        {item.icon === 'Sparkles' && <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />}
                        {item.icon === 'Heart' && <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />}
                      </svg>
                    </div>
                    <div className="text-xs font-bold text-[#5B7B6D] dark:text-[#7FA08F] mb-2">STEP {item.step}</div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300 dark:text-slate-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Tiers */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Verification Tiers
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                We balance trust with verification. Higher verification = more points,
                but we also believe in the honor system for personal wellness.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {VERIFICATION_TIERS.map((tier) => (
                <div key={tier.tier} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className={`bg-gradient-to-r ${tier.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{tier.icon}</span>
                      <span className="text-2xl font-bold">{tier.multiplier}</span>
                    </div>
                    <h3 className="font-semibold mt-2">{tier.tier}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{tier.description}</p>
                    <div className="space-y-1">
                      {tier.examples.map((ex, i) => (
                        <div key={i} className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-slate-400 rounded-full" />
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
              <div className="flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Why Different Tiers?</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    We want to reward verified activities more highly while still honoring your personal wellness journey.
                    Self-reported activities matter - they&apos;re about <em>your</em> growth. But verified activities
                    provide accountability that charity partners appreciate, so they earn bonus points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Point Values Table */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Point Values by Activity
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                See exactly how many points each activity earns
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex justify-center gap-2 mb-8">
              {[
                { key: 'study', label: 'Study', icon: '📚' },
                { key: 'wellness', label: 'Wellness', icon: '🧘' },
                { key: 'social', label: 'Social', icon: '👥' }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as typeof activeCategory)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeCategory === cat.key
                      ? 'bg-tribe-sage-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Points Table */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Activity</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">XP</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Village Points</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Verification</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Cash Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {POINT_CONVERSIONS[activeCategory].map((item, i) => (
                    <tr key={i} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.activity}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.xp}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-tribe-sage-600 dark:text-tribe-sage-400">{item.villagePoints}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.verification === 'automatic' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                          item.verification === 'self-reported' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                          item.verification === 'photo-verified' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300'
                        }`}>
                          {item.verification === 'automatic' ? '🤖' :
                           item.verification === 'self-reported' ? '✋' :
                           item.verification === 'photo-verified' ? '📸' : '⌚'} {item.verification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">
                        ${pointsToDollars(item.villagePoints * 1000 / 1000)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculator */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Points Calculator</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">See how your points translate to real impact</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Your Points</label>
                    <input
                      type="number"
                      value={calcPoints}
                      onChange={(e) => setCalcPoints(parseInt(e.target.value) || 0)}
                      className="w-32 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-lg"
                    />
                  </div>
                  <div className="text-2xl">=</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-tribe-sage-600 dark:text-tribe-sage-400">
                      ${pointsToDollars(calcPoints)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">to charity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Charities */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Our Charity Partners
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                All partner charities are 501(c)(3) verified organizations.
                Choose where your Village Points go.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNER_CHARITIES.map((charity) => (
                <div key={charity.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{charity.icon}</span>
                    {charity.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        501(c)(3)
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{charity.name}</h3>
                  <div className="text-xs text-tribe-sage-600 dark:text-tribe-sage-400 font-medium mb-2">{charity.focus}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{charity.description}</p>
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline"
                  >
                    Learn more →
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/impact/local"
                className="inline-flex items-center gap-2 px-6 py-3 bg-tribe-sage-600 hover:bg-tribe-sage-700 text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Local Charities
              </Link>
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Suggest a Charity
              </Link>
            </div>
          </div>
        </section>

        {/* Impact at Scale */}
        <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Impact at Scale
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                When thousands of medical students study together, the collective impact is enormous
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-tribe-sage-400 mb-2">1,000</div>
                <div className="text-slate-400 mb-4">Active Students</div>
                <div className="text-lg">× 100 points/week</div>
                <div className="text-2xl font-bold text-white mt-2">$100/week</div>
                <div className="text-sm text-slate-500">to charity</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-tribe-sage-400 mb-2">10,000</div>
                <div className="text-slate-400 mb-4">Active Students</div>
                <div className="text-lg">× 100 points/week</div>
                <div className="text-2xl font-bold text-white mt-2">$1,000/week</div>
                <div className="text-sm text-slate-500">to charity</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-2">100,000</div>
                <div className="text-slate-400 mb-4">Active Students</div>
                <div className="text-lg">× 100 points/week</div>
                <div className="text-2xl font-bold text-white mt-2">$10,000/week</div>
                <div className="text-sm text-slate-500">to charity</div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur rounded-2xl text-center">
              <p className="text-lg text-slate-300">
                <strong className="text-white">Institutional sponsors</strong> can multiply this impact by 10-20x
                by funding the points-to-cash conversion directly.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'How do Village Points convert to real money?',
                  a: 'Currently, 1,000 Village Points = $1.00. This rate may improve as we secure more institutional sponsors and charity partners who want to match donations.'
                },
                {
                  q: 'Can I choose which charity receives my points?',
                  a: 'Yes! When you donate your points, you select from our verified partner charities. You can also donate to your Tribe\'s chosen cause for collective impact.'
                },
                {
                  q: 'Why are verified activities worth more?',
                  a: 'Our charity partners appreciate accountability. Verified activities (like step counts from your Apple Watch) provide proof that the wellness work was done, which strengthens our partnership with charities.'
                },
                {
                  q: 'What if I can\'t connect a fitness tracker?',
                  a: 'No problem! Self-reported activities still earn points. We believe in the honor system for personal wellness. You\'re here to grow, and we trust you.'
                },
                {
                  q: 'How do institutional sponsors help?',
                  a: 'Medical schools and residency programs can sponsor the points-to-cash conversion, effectively multiplying the charitable impact of every student\'s wellness activities by 10-20x.'
                },
                {
                  q: 'Are donations tax-deductible?',
                  a: 'Donations go directly to 501(c)(3) verified charities. The tax implications depend on your individual situation - consult a tax professional for advice.'
                }
              ].map((faq, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Start earning Village Points today. Your study session could help fund physician wellness programs,
              medical education scholarships, or healthcare access initiatives.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/study/flashcards"
                className="px-8 py-4 bg-white text-[#5B7B6D] font-semibold rounded-xl hover:bg-[#F5F0E8] transition-colors"
              >
                Start Studying
              </Link>
              <Link
                href="/wellness"
                className="px-8 py-4 bg-[#4A6A5C] text-white font-semibold rounded-xl hover:bg-[#3D5A4C] transition-colors border border-white/20"
              >
                Explore Wellness
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
