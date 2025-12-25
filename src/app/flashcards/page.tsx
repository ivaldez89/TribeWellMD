'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Rotation, MedicalSystem } from '@/types';

// Shelf categories for browsing
// Note: Gradients use raw palette colors (allowed per architecture)
const SHELF_CATEGORIES: { id: Rotation; name: string; icon: string; color: string }[] = [
  { id: 'Internal Medicine', name: 'Internal Medicine', icon: '🩺', color: 'from-forest-500 to-forest-400' },
  { id: 'Surgery', name: 'Surgery', icon: '🔪', color: 'from-sand-700 to-sand-600' },
  { id: 'Pediatrics', name: 'Pediatrics', icon: '👶', color: 'from-forest-400 to-forest-300' },
  { id: 'OB/GYN', name: 'OB/GYN', icon: '🤰', color: 'from-sand-600 to-sand-500' },
  { id: 'Psychiatry', name: 'Psychiatry', icon: '🧠', color: 'from-forest-400 to-forest-300' },
  { id: 'Family Medicine', name: 'Family Medicine', icon: '👨‍👩‍👧', color: 'from-forest-500 to-forest-400' },
  { id: 'Neurology', name: 'Neurology', icon: '⚡', color: 'from-sand-700 to-sand-500' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine', icon: '🚨', color: 'from-sand-600 to-sand-700' },
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sand-500 via-sand-600 to-sand-700 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements - pointer-events-none ensures no interference */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
                      <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
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
                  <span className="text-sand-50">Flashcards</span>
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
              <div>
                {dueCards.length > 0 ? (
                  <button
                    onClick={handleStartStudy}
                    className="px-8 py-4 bg-surface border border-border rounded-xl"
                  >
                    <span className="text-lg font-semibold text-content">Start Studying</span>
                    <span className="ml-3 px-2.5 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      {dueCards.length}
                    </span>
                  </button>
                ) : (
                  <div className="px-8 py-4 bg-surface border border-border rounded-xl">
                    <span className="text-lg font-semibold text-content">All Caught Up!</span>
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
                  ? 'bg-gradient-to-br from-sand-700 to-sand-600 shadow-sand-700/25 hover:shadow-sand-700/40 hover:scale-[1.02] cursor-pointer'
                  : 'bg-gradient-to-br from-forest-500 to-forest-400 shadow-forest-500/25'
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
            <div className="relative p-6 bg-gradient-to-br from-forest-400 to-forest-300 rounded-2xl shadow-lg shadow-forest-400/25 text-white">
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
                  <div className="absolute left-6 right-6 top-[calc(100%-3.5rem)] mt-2 bg-surface rounded-xl shadow-2xl border border-border z-[110] max-h-64 overflow-y-auto">
                    {SHELF_CATEGORIES.map((shelf) => {
                      const count = getCardsByRotation(shelf.id).length;
                      return (
                        <button
                          key={shelf.id}
                          onClick={() => handleShelfSelect(shelf.id)}
                          disabled={count === 0}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                            count > 0
                              ? 'hover:bg-surface-muted text-content'
                              : 'text-content-muted/50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{shelf.icon}</span>
                            <span className="text-sm font-medium">{shelf.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            count > 0
                              ? 'bg-primary-light text-primary'
                              : 'bg-surface-muted text-content-muted'
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
                  <div className="absolute left-6 right-6 top-full mt-2 bg-surface rounded-xl shadow-2xl border border-border z-[110] max-h-64 overflow-y-auto">
                    {SYSTEM_CATEGORIES.map((sys) => {
                      const count = getCardsBySystem(sys.id).length;
                      return (
                        <button
                          key={sys.id}
                          onClick={() => handleSystemSelect(sys.id)}
                          disabled={count === 0}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                            count > 0
                              ? 'hover:bg-surface-muted text-content'
                              : 'text-content-muted/50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{sys.icon}</span>
                            <span className="text-sm font-medium">{sys.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            count > 0
                              ? 'bg-primary-light text-primary'
                              : 'bg-surface-muted text-content-muted'
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
            <div className="group relative p-6 bg-gradient-to-br from-sand-600 to-sand-500 rounded-2xl shadow-lg shadow-sand-600/25 text-white overflow-hidden">
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
              className="flex items-center gap-2 px-5 py-3 bg-surface rounded-xl border border-border hover:border-secondary hover:shadow-md transition-all text-content-secondary font-medium"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Generator
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-2 px-5 py-3 bg-surface rounded-xl border border-border hover:border-secondary hover:shadow-md transition-all text-content-secondary font-medium"
            >
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Cards
            </Link>
            <Link
              href="/progress/rapid-review"
              className="flex items-center gap-2 px-5 py-3 bg-surface rounded-xl border border-border hover:border-accent hover:shadow-md transition-all text-content-secondary font-medium"
            >
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h2 className="text-lg font-bold text-content">Study by Shelf Exam</h2>
            </div>
            <span className="text-sm text-content-muted">{SHELF_CATEGORIES.length} shelves</span>
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
                      ? 'bg-surface border-border hover:border-secondary hover:shadow-lg cursor-pointer'
                      : 'bg-surface-muted border-border-light opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${shelf.color} flex items-center justify-center text-xl`}>
                      {shelf.icon}
                    </div>
                    {dueCount > 0 && (
                      <span className="px-2 py-0.5 bg-warning-light text-warning text-xs font-medium rounded-full">
                        {dueCount} due
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-content mb-1 group-hover:text-secondary transition-colors">
                    {shelf.name}
                  </h3>
                  <p className="text-sm text-content-muted">
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
              <h2 className="text-lg font-bold text-content">Study by System</h2>
            </div>
            <span className="text-sm text-content-muted">{SYSTEM_CATEGORIES.length} systems</span>
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
                      ? 'bg-surface border-border hover:border-primary hover:shadow-md cursor-pointer'
                      : 'bg-surface-muted border-border-light opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{sys.icon}</span>
                    {dueCount > 0 && (
                      <span className="w-2 h-2 bg-warning rounded-full" />
                    )}
                  </div>
                  <h3 className="font-medium text-content text-sm mb-0.5 group-hover:text-primary transition-colors truncate">
                    {sys.name}
                  </h3>
                  <p className="text-xs text-content-muted">
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
            <div className="bg-surface rounded-2xl border border-border p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center">
                <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-content mb-2">No Flashcards Yet</h2>
              <p className="text-content-muted mb-6 max-w-md mx-auto">
                Get started by generating cards with AI or importing your own deck.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/generate"
                  className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Generate with AI
                </Link>
                <Link
                  href="/import"
                  className="px-6 py-3 bg-surface border border-border text-content-secondary font-semibold rounded-xl hover:border-secondary transition-all"
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
