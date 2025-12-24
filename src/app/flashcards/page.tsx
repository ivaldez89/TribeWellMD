'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Rotation, MedicalSystem } from '@/types';

// Shelf categories for browsing
const SHELF_CATEGORIES: { id: Rotation; name: string; icon: string; color: string }[] = [
  { id: 'Internal Medicine', name: 'Internal Medicine', icon: '🩺', color: 'from-[#5B7B6D] to-[#6B8B7D]' },
  { id: 'Surgery', name: 'Surgery', icon: '🔪', color: 'from-[#8B7355] to-[#A89070]' },
  { id: 'Pediatrics', name: 'Pediatrics', icon: '👶', color: 'from-[#7FA08F] to-[#8BA89A]' },
  { id: 'OB/GYN', name: 'OB/GYN', icon: '🤰', color: 'from-[#A89070] to-[#C4A77D]' },
  { id: 'Psychiatry', name: 'Psychiatry', icon: '🧠', color: 'from-[#6B8B7D] to-[#7FA08F]' },
  { id: 'Family Medicine', name: 'Family Medicine', icon: '👨‍👩‍👧', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'Neurology', name: 'Neurology', icon: '⚡', color: 'from-[#8B7355] to-[#C4A77D]' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine', icon: '🚨', color: 'from-[#A89070] to-[#8B7355]' },
];

// System categories for browsing
const SYSTEM_CATEGORIES: { id: MedicalSystem; name: string; icon: string }[] = [
  { id: 'Cardiology', name: 'Cardiology', icon: '❤️' },
  { id: 'Pulmonology', name: 'Pulmonology', icon: '🫁' },
  { id: 'Gastroenterology', name: 'Gastroenterology', icon: '🫃' },
  { id: 'Neurology', name: 'Neurology', icon: '🧠' },
  { id: 'Endocrinology', name: 'Endocrinology', icon: '🦋' },
  { id: 'Nephrology', name: 'Nephrology', icon: '🫘' },
  { id: 'Rheumatology', name: 'Rheumatology', icon: '🦴' },
  { id: 'Hematology/Oncology', name: 'Hematology/Oncology', icon: '🩸' },
  { id: 'Infectious Disease', name: 'Infectious Disease', icon: '🦠' },
  { id: 'Dermatology', name: 'Dermatology', icon: '🧴' },
  { id: 'Psychiatry', name: 'Psychiatry', icon: '💭' },
  { id: 'Pediatrics', name: 'Pediatrics', icon: '👶' },
  { id: 'OB/GYN', name: 'OB/GYN', icon: '🤰' },
  { id: 'Surgery', name: 'Surgery', icon: '🔪' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine', icon: '🚨' },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const {
    cards,
    dueCards,
    stats,
    filters,
    setFilters,
    topicPerformance,
  } = useFlashcards();

  // Browse dropdown states
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);

  // Get cards by system
  const getCardsBySystem = (system: MedicalSystem) => {
    return cards.filter(c => c.metadata.system === system);
  };

  // Get cards by rotation
  const getCardsByRotation = (rotation: Rotation) => {
    return cards.filter(c => c.metadata.rotation === rotation);
  };

  // Calculate weak topics (topics with low retention)
  const weakTopics = useMemo(() => {
    return topicPerformance
      .filter(t => t.strength === 'weak' || t.strength === 'moderate')
      .slice(0, 3);
  }, [topicPerformance]);

  // Calculate progress percentage
  const progressPercentage = stats.totalCards > 0
    ? Math.round(((stats.totalCards - stats.newCards) / stats.totalCards) * 100)
    : 0;

  // Handle starting study session
  const handleStartStudy = () => {
    router.push('/flashcards/study');
  };

  // Handle shelf selection
  const handleShelfSelect = (rotation: Rotation) => {
    setFilters({
      ...filters,
      rotations: [rotation],
      systems: [],
    });
    setShowShelfDropdown(false);
    router.push('/flashcards/study');
  };

  // Handle system selection
  const handleSystemSelect = (system: MedicalSystem) => {
    setFilters({
      ...filters,
      systems: [system],
      rotations: [],
    });
    setShowSystemDropdown(false);
    router.push('/flashcards/study');
  };

  // Handle weak topic selection
  const handleWeakTopicSelect = (system: MedicalSystem) => {
    setFilters({
      ...filters,
      systems: [system],
      rotations: [],
    });
    router.push('/flashcards/study');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C4A77D] via-[#A89070] to-[#8B7355] p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 to-transparent rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Message */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  {dueCards.length > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                      <span>{dueCards.length} cards due for review</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>All caught up!</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  <span className="text-[#F5F0E8]">Flashcards</span>
                </h1>

                <p className="text-white/80 text-lg max-w-md">
                  Master clinical concepts with spaced repetition. Browse by shelf exam or topic system.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.totalCards}</p>
                    <p className="text-white/60 text-sm">Total Cards</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.dueToday}</p>
                    <p className="text-white/60 text-sm">Due Today</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.reviewCards}</p>
                    <p className="text-white/60 text-sm">Reviewed</p>
                  </div>
                </div>
              </div>

              {/* Right side - CTA Button */}
              <div className="flex flex-col items-center gap-4">
                {dueCards.length > 0 ? (
                  <button
                    onClick={handleStartStudy}
                    className="group relative px-10 py-5 bg-white hover:bg-[#F5F0E8] text-slate-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-[#8B7355]/25 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      Start Studying
                      <span className="px-3 py-1 bg-[#C4A77D] text-white text-base rounded-full">
                        {dueCards.length}
                      </span>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <div className="px-10 py-5 bg-white/20 backdrop-blur text-white font-semibold text-xl rounded-2xl flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#F5F0E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All Caught Up!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main 3-Box Navigation Grid */}
        <section className="mb-8 animate-fade-in-up animation-delay-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Box 1: Weak Topics */}
            <div
              onClick={() => {
                if (weakTopics.length > 0) {
                  handleWeakTopicSelect(weakTopics[0].system);
                }
              }}
              className={`group relative p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                weakTopics.length > 0
                  ? 'bg-gradient-to-br from-[#8B7355] to-[#A89070] shadow-[#8B7355]/25 hover:shadow-[#8B7355]/40 hover:scale-[1.02] cursor-pointer'
                  : 'bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] shadow-[#5B7B6D]/25'
              } text-white`}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  {weakTopics.length > 0 ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <h3 className="font-bold text-xl mb-1">{weakTopics.length > 0 ? 'Weak Topics' : 'Strong Across Topics'}</h3>
                <p className="text-white/70 text-sm mb-3">
                  {weakTopics.length > 0 ? 'Areas that need more practice' : 'Great job on all topics!'}
                </p>
                {weakTopics.length > 0 ? (
                  <div className="space-y-1">
                    {weakTopics.map((topic) => (
                      <div key={topic.topic} className="flex items-center gap-2 text-sm">
                        <span className="text-white/80">{topic.topic}</span>
                        <span className="text-white/50 text-xs">({Math.round(topic.retentionRate * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">Keep up the great work!</p>
                )}
              </div>
              {weakTopics.length > 0 && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}
            </div>

            {/* Box 2: Browse by Shelf / System */}
            <div className="relative p-6 bg-gradient-to-br from-[#6B8B7D] to-[#7FA08F] rounded-2xl shadow-lg shadow-[#6B8B7D]/25 text-white">
              {/* Background decoration */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-1">Browse Cards</h3>
                <p className="text-white/70 text-sm mb-4">Find by shelf or system</p>

                {/* Dropdown Buttons */}
                <div className="space-y-2">
                  {/* Shelf Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowShelfDropdown(!showShelfDropdown);
                        setShowSystemDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                    >
                      <span>By Shelf Exam</span>
                      <svg className={`w-4 h-4 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* System Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSystemDropdown(!showSystemDropdown);
                        setShowShelfDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                    >
                      <span>By System</span>
                      <svg className={`w-4 h-4 transition-transform ${showSystemDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shelf Dropdown Menu */}
              {showShelfDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowShelfDropdown(false)}
                  />
                  <div className="absolute left-6 right-6 top-[calc(100%-3.5rem)] mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                    {SHELF_CATEGORIES.map((shelf) => {
                      const count = getCardsByRotation(shelf.id).length;
                      return (
                        <button
                          key={shelf.id}
                          onClick={() => handleShelfSelect(shelf.id)}
                          disabled={count === 0}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                            count > 0
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{shelf.icon}</span>
                            <span className="text-sm font-medium">{shelf.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            count > 0
                              ? 'bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#5B7B6D] dark:text-[#7FA08F]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* System Dropdown Menu */}
              {showSystemDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowSystemDropdown(false)}
                  />
                  <div className="absolute left-6 right-6 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                    {SYSTEM_CATEGORIES.map((sys) => {
                      const count = getCardsBySystem(sys.id).length;
                      return (
                        <button
                          key={sys.id}
                          onClick={() => handleSystemSelect(sys.id)}
                          disabled={count === 0}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                            count > 0
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{sys.icon}</span>
                            <span className="text-sm font-medium">{sys.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            count > 0
                              ? 'bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#5B7B6D] dark:text-[#7FA08F]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Box 3: Progress */}
            <div className="group relative p-6 bg-gradient-to-br from-[#A89070] to-[#C4A77D] rounded-2xl shadow-lg shadow-[#A89070]/25 text-white overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-1">Your Progress</h3>
                <p className="text-white/70 text-sm mb-3">Track your mastery</p>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{stats.reviewCards} reviewed</span>
                  <span className="font-bold">{progressPercentage}%</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="mb-8 animate-fade-in-up animation-delay-150">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/generate"
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#C4A77D] dark:hover:border-[#A89070] hover:shadow-md transition-all text-slate-700 dark:text-slate-200 font-medium"
            >
              <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Generator
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#C4A77D] dark:hover:border-[#A89070] hover:shadow-md transition-all text-slate-700 dark:text-slate-200 font-medium"
            >
              <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Cards
            </Link>
            <Link
              href="/progress/rapid-review"
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 font-medium"
            >
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Rapid Review
            </Link>
          </div>
        </section>

        {/* Shelf Exam Cards Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Study by Shelf Exam</h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{SHELF_CATEGORIES.length} shelves</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHELF_CATEGORIES.map((shelf) => {
              const cardCount = getCardsByRotation(shelf.id).length;
              const dueCount = dueCards.filter(c => c.metadata.rotation === shelf.id).length;

              return (
                <button
                  key={shelf.id}
                  onClick={() => cardCount > 0 && handleShelfSelect(shelf.id)}
                  disabled={cardCount === 0}
                  className={`group p-5 rounded-xl border text-left transition-all ${
                    cardCount > 0
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#C4A77D] dark:hover:border-[#A89070] hover:shadow-lg cursor-pointer'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${shelf.color} flex items-center justify-center text-xl`}>
                      {shelf.icon}
                    </div>
                    {dueCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                        {dueCount} due
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-[#8B7355] dark:group-hover:text-[#C4A77D] transition-colors">
                    {shelf.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {cardCount} cards
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* System Cards Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Study by System</h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{SYSTEM_CATEGORIES.length} systems</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SYSTEM_CATEGORIES.map((sys) => {
              const cardCount = getCardsBySystem(sys.id).length;
              const dueCount = dueCards.filter(c => c.metadata.system === sys.id).length;

              return (
                <button
                  key={sys.id}
                  onClick={() => cardCount > 0 && handleSystemSelect(sys.id)}
                  disabled={cardCount === 0}
                  className={`group p-4 rounded-xl border text-left transition-all ${
                    cardCount > 0
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#5B7B6D] dark:hover:border-[#7FA08F] hover:shadow-md cursor-pointer'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{sys.icon}</span>
                    {dueCount > 0 && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-0.5 group-hover:text-[#5B7B6D] dark:group-hover:text-[#7FA08F] transition-colors truncate">
                    {sys.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cardCount} cards
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Empty state if no cards */}
        {stats.totalCards === 0 && (
          <section className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E8E0D5] to-[#D4C4B0] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Flashcards Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Get started by generating cards with AI or importing your own deck.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/generate"
                  className="px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Generate with AI
                </Link>
                <Link
                  href="/import"
                  className="px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:border-[#C4A77D] transition-all"
                >
                  Import Cards
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
