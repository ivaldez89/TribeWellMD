'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES } from '@/components/layout/ThreeColumnLayout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { getShelfIcon, getSystemIcon } from '@/components/icons/MedicalIcons';
import type { Rotation, MedicalSystem } from '@/types';

// Shelf categories for browsing
const SHELF_CATEGORIES: { id: Rotation; name: string; color: string }[] = [
  { id: 'Internal Medicine', name: 'Internal Medicine', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'Surgery', name: 'Surgery', color: 'from-[#8B7355] to-[#A89070]' },
  { id: 'Pediatrics', name: 'Pediatrics', color: 'from-[#7FA08F] to-[#9FBFAF]' },
  { id: 'OB/GYN', name: 'OB/GYN', color: 'from-[#C4A77D] to-[#D4B78D]' },
  { id: 'Psychiatry', name: 'Psychiatry', color: 'from-[#6B8B7D] to-[#8BA89A]' },
  { id: 'Family Medicine', name: 'Family Medicine', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'Neurology', name: 'Neurology', color: 'from-[#8B7355] to-[#C4A77D]' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine', color: 'from-[#C4A77D] to-[#8B7355]' },
];

// System categories for browsing
const SYSTEM_CATEGORIES: { id: MedicalSystem; name: string }[] = [
  { id: 'Cardiology', name: 'Cardiology' },
  { id: 'Pulmonology', name: 'Pulmonology' },
  { id: 'Gastroenterology', name: 'Gastroenterology' },
  { id: 'Neurology', name: 'Neurology' },
  { id: 'Endocrinology', name: 'Endocrinology' },
  { id: 'Nephrology', name: 'Nephrology' },
  { id: 'Rheumatology', name: 'Rheumatology' },
  { id: 'Hematology/Oncology', name: 'Hematology/Oncology' },
  { id: 'Infectious Disease', name: 'Infectious Disease' },
  { id: 'Dermatology', name: 'Dermatology' },
  { id: 'Psychiatry', name: 'Psychiatry' },
  { id: 'Pediatrics', name: 'Pediatrics' },
  { id: 'OB/GYN', name: 'OB/GYN' },
  { id: 'Surgery', name: 'Surgery' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine' },
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

  // Mobile Header Card
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Flashcards</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats.totalCards} total cards</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#C4A77D]">{stats.dueToday}</p>
            <p className="text-[10px] text-slate-400">Due</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#5B7B6D]">{stats.reviewCards}</p>
            <p className="text-[10px] text-slate-400">Reviewed</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Sidebar Content
  const leftSidebar = (
    <>
      {/* Stats Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        {/* Header gradient */}
        <div className="h-16 bg-gradient-to-br from-[#C4A77D] via-[#D4B78D] to-[#8B7355] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Flashcards</h2>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{stats.totalCards}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#8B7355]">{stats.dueToday}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Due Today</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{stats.reviewCards}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Reviewed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span className="font-medium text-[#5B7B6D]">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Start Study Button */}
          {dueCards.length > 0 && (
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Studying</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCards.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Actions</h3>
        <nav className="space-y-1">
          <Link href="/generate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">AI Generator</span>
          </Link>

          <Link href="/import" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">Import Cards</span>
          </Link>

          <Link href="/progress/rapid-review" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-500">Rapid Review</span>
          </Link>
        </nav>
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Needs Practice
          </h3>
          <div className="space-y-2">
            {weakTopics.map((topic) => (
              <button
                key={topic.topic}
                onClick={() => handleWeakTopicSelect(topic.system)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.topic}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B7355]/10 text-[#8B7355]">
                  {Math.round(topic.retentionRate * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar Content
  const rightSidebar = (
    <>
      {/* Study Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          Study Tips
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#5B7B6D]">Spaced Repetition:</span> Cards appear at optimal intervals for long-term retention.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#C4A77D]">Active Recall:</span> Try to answer before flipping for better learning.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">This Week</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Cards studied</span>
            <span className="font-semibold text-[#5B7B6D]">{stats.reviewCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">New cards</span>
            <span className="font-semibold text-[#C4A77D]">{stats.newCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Learning</span>
            <span className="font-semibold text-[#8B7355]">{stats.learningCards}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Mobile: Start Study Card */}
      <div className="lg:hidden">
        {dueCards.length > 0 && (
          <div className={CARD_STYLES.containerWithPadding}>
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Studying</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCards.length} due</span>
            </button>
          </div>
        )}
      </div>

      {/* Browse Cards Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Browse Cards</h2>
        </div>

        {/* Dropdown Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Shelf Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShelfDropdown(!showShelfDropdown);
                setShowSystemDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] rounded-xl transition-colors text-sm font-medium text-white"
            >
              <span>By Shelf Exam</span>
              <svg className={`w-4 h-4 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Shelf Dropdown Menu */}
            {showShelfDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowShelfDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 z-[110] max-h-64 overflow-y-auto">
                  {SHELF_CATEGORIES.map((shelf) => {
                    const count = getCardsByRotation(shelf.id).length;
                    return (
                      <button
                        key={shelf.id}
                        onClick={() => handleShelfSelect(shelf.id)}
                        disabled={count === 0}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                          count > 0
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = getShelfIcon(shelf.id); return <Icon className="w-5 h-5" />; })()}
                          <span className="text-sm font-medium">{shelf.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          count > 0
                            ? 'bg-[#5B7B6D]/10 text-[#5B7B6D]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
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

          {/* System Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSystemDropdown(!showSystemDropdown);
                setShowShelfDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] hover:from-[#B39870] hover:to-[#C4A77D] rounded-xl transition-colors text-sm font-medium text-white"
            >
              <span>By System</span>
              <svg className={`w-4 h-4 transition-transform ${showSystemDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* System Dropdown Menu */}
            {showSystemDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowSystemDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 z-[110] max-h-64 overflow-y-auto">
                  {SYSTEM_CATEGORIES.map((sys) => {
                    const count = getCardsBySystem(sys.id).length;
                    return (
                      <button
                        key={sys.id}
                        onClick={() => handleSystemSelect(sys.id)}
                        disabled={count === 0}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                          count > 0
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = getSystemIcon(sys.id); return <Icon className="w-5 h-5" />; })()}
                          <span className="text-sm font-medium">{sys.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          count > 0
                            ? 'bg-[#C4A77D]/10 text-[#C4A77D]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
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
        </div>
      </div>

      {/* Empty state if no cards */}
      {stats.totalCards === 0 && (
        <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-8') + ' text-center'}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C4A77D]/20 to-[#D4B78D]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Flashcards Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
            Get started by generating cards with AI or importing your own deck.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/generate"
              className="px-4 py-2 bg-gradient-to-r from-[#C4A77D] to-[#D4B78D] hover:from-[#B39870] hover:to-[#C4A77D] text-white font-semibold rounded-xl shadow-md transition-all text-sm"
            >
              Generate with AI
            </Link>
            <Link
              href="/import"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all text-sm"
            >
              Import Cards
            </Link>
          </div>
        </div>
      )}
    </ThreeColumnLayout>
  );
}
