'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { DeckFilterPanel } from '@/components/deck/DeckFilterPanel';
import { PerformanceAnalytics } from '@/components/deck/PerformanceAnalytics';
import { useFlashcards } from '@/hooks/useFlashcards';

// Rapid review stats type
interface RapidReviewStats {
  totalCardsReviewed: number;
  totalSessions: number;
  lastSessionDate: string | null;
  todayCardsReviewed: number;
  streak: number;
}

// Get rapid review stats from localStorage
function getRapidReviewStats(): RapidReviewStats {
  if (typeof window === 'undefined') {
    return { totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 };
  }
  const stored = localStorage.getItem('step2_rapid_review_stats');
  if (stored) {
    const stats = JSON.parse(stored);
    // Reset today's count if it's a new day
    const today = new Date().toDateString();
    if (stats.lastSessionDate !== today) {
      stats.todayCardsReviewed = 0;
    }
    return stats;
  }
  return { totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 };
}

export default function HomePage() {
  const { 
    stats, 
    dueCards, 
    filteredDueCards,
    isLoading, 
    filters, 
    availableTags, 
    availableSystems,
    topicPerformance,
    setFilters,
    clearFilters
  } = useFlashcards();

  const [rapidStats, setRapidStats] = useState<RapidReviewStats>({ totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 });

  // Load rapid review stats on mount
  useEffect(() => {
    setRapidStats(getRapidReviewStats());
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasActiveFilters = 
    filters.tags.length > 0 || 
    filters.systems.length > 0 || 
    filters.rotations.length > 0 ||
    filters.states.length > 0 ||
    filters.difficulties.length > 0;

  return (
    <div className="min-h-screen">
      <Header stats={stats} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Master <span className="text-gradient">Step 2 CK</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Evidence-based spaced repetition with clinical vignettes designed for 
            high-yield retention. Study smarter, not harder.
          </p>
          
          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {filteredDueCards.length > 0 ? (
              <Link
                href="/flashcards"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Start Studying</span>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                    {filteredDueCards.length} cards
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : dueCards.length > 0 && hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-50 text-amber-700 font-semibold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Clear filters ({dueCards.length} cards due)</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 font-semibold rounded-xl">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>All caught up! No cards due.</span>
              </div>
            )}
            
            {/* Rapid Review Button */}
            <Link
              href="/rapid-review"
              className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Rapid Review</span>
            </Link>
          </div>
        </section>
        
        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Due Today"
            value={hasActiveFilters ? filteredDueCards.length : stats.dueToday}
            subValue={hasActiveFilters ? `of ${stats.dueToday}` : undefined}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            highlight={stats.dueToday > 0}
          />
          <StatCard
            label="Total Cards"
            value={stats.totalCards}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatCard
            label="New"
            value={stats.newCards}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
          <StatCard
            label="Learning"
            value={stats.learningCards}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </section>

        {/* Rapid Review Stats Card */}
        {rapidStats.totalCardsReviewed > 0 && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Rapid Review Progress</h3>
                {rapidStats.streak > 1 && (
                  <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full flex items-center gap-1">
                    🔥 {rapidStats.streak} day streak!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{rapidStats.todayCardsReviewed}</p>
                  <p className="text-sm text-slate-600">Today</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{rapidStats.totalCardsReviewed}</p>
                  <p className="text-sm text-slate-600">Total Reviews</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{rapidStats.totalSessions}</p>
                  <p className="text-sm text-slate-600">Sessions</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filter Panel and Analytics */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <DeckFilterPanel
            filters={filters}
            availableTags={availableTags}
            availableSystems={availableSystems}
            filteredCount={filteredDueCards.length}
            totalDueCount={dueCards.length}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
          <PerformanceAnalytics topicPerformance={topicPerformance} />
        </section>
        
        {/* Quick Actions */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Shelf Exam Selector */}
          <Link
            href="/shelf"
            className="group p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 text-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold group-hover:translate-x-1 transition-transform">
                  Shelf Exams
                </h3>
                <p className="text-white/80 mt-1 text-sm">
                  Pick a rotation to study targeted content
                </p>
              </div>
            </div>
          </Link>

          {/* Study Session */}
          <Link
            href="/flashcards"
            className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <svg className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Study Session
                </h3>
                <p className="text-slate-600 mt-1 text-sm">
                  Review due cards with spaced repetition
                </p>
              </div>
            </div>
          </Link>
          
          {/* Import Cards */}
          <Link
            href="/import"
            className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <svg className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Import Cards
                </h3>
                <p className="text-slate-600 mt-1 text-sm">
                  Add new flashcards from JSON files
                </p>
              </div>
            </div>
          </Link>
        </section>
        
        {/* FSRS Info */}
        <section className="mt-12 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Powered by FSRS Algorithm</h3>
              <p className="text-slate-300 leading-relaxed">
                Step2Cards uses the Free Spaced Repetition Scheduler (FSRS), a modern algorithm 
                that optimizes review intervals based on your performance. Cards you find easy 
                will appear less frequently, while challenging material gets more practice time.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, subValue, icon, highlight }: StatCardProps) {
  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-300
      ${highlight 
        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
        : 'bg-white border-slate-200'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
        `}>
          {icon}
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subValue && <span className="text-sm text-slate-400">{subValue}</span>}
          </div>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
