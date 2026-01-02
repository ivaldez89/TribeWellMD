'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES } from '@/components/layout/ThreeColumnLayout';
import { useVignettes } from '@/hooks/useVignettes';
import { getSystemIcon } from '@/components/icons/MedicalIcons';
import type { MedicalSystem } from '@/types';

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

export default function CasesPage() {
  const router = useRouter();
  const {
    vignettes,
    isLoading,
    stats,
    getDueForReview,
    getProgressForVignette
  } = useVignettes();

  // Browse dropdown state
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);

  // Get due cases
  const dueCases = useMemo(() => getDueForReview(), [getDueForReview]);

  // Get cases by system
  const getCasesBySystem = (system: MedicalSystem) => {
    return vignettes.filter(v => v.metadata.system === system);
  };

  // Calculate progress percentage
  const progressPercentage = stats.total > 0
    ? Math.round((stats.mastered / stats.total) * 100)
    : 0;

  // Handle starting study session
  const handleStartStudy = () => {
    if (dueCases.length > 0) {
      router.push(`/cases/${dueCases[0].id}`);
    }
  };

  // Handle system selection
  const handleSystemSelect = (system: MedicalSystem) => {
    setShowSystemDropdown(false);
    const casesInSystem = getCasesBySystem(system);
    if (casesInSystem.length > 0) {
      router.push(`/cases/${casesInSystem[0].id}`);
    }
  };

  // Calculate weak topics
  const weakTopics = useMemo(() => {
    return SYSTEM_CATEGORIES
      .map(cat => {
        const casesInSystem = vignettes.filter(v => v.metadata.system === cat.id);
        const masteredCount = casesInSystem.filter(v => {
          const progress = getProgressForVignette(v.id);
          return progress?.overallMastery === 'mastered';
        }).length;
        const total = casesInSystem.length;
        const masteryRate = total > 0 ? masteredCount / total : 0;
        return { ...cat, masteryRate, total, mastered: masteredCount };
      })
      .filter(cat => cat.total > 0 && cat.masteryRate < 0.5)
      .sort((a, b) => a.masteryRate - b.masteryRate)
      .slice(0, 3);
  }, [vignettes, getProgressForVignette]);

  // Mobile Header Card - matches Flashcards
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Cases</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats.total} total cases</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#5B7B6D]">{stats.dueToday}</p>
            <p className="text-[10px] text-slate-400">Due</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#C4A77D]">{stats.mastered}</p>
            <p className="text-[10px] text-slate-400">Mastered</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Sidebar Content - matches Flashcards structure
  const leftSidebar = (
    <>
      {/* Stats Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        {/* Header gradient - green for Cases (vs gold for Flashcards) */}
        <div className="h-16 bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Clinical Cases</h2>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{stats.total}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#8B7355]">{stats.dueToday}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Due Today</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{stats.mastered}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Mastered</p>
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
          {dueCases.length > 0 && (
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Review</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCases.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Actions</h3>
        <nav className="space-y-1">
          <Link href="/cases/create" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">Create Case</span>
          </Link>

          <Link href="/progress/progress" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">View Progress</span>
          </Link>

          <Link href="/qbank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#A89070] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#8B7355]">QBank Practice</span>
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
                key={topic.id}
                onClick={() => handleSystemSelect(topic.id)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B7355]/10 text-[#8B7355]">
                  {Math.round(topic.masteryRate * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar Content - matches Flashcards
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
              <span className="font-medium text-[#5B7B6D]">Read Carefully:</span> Analyze the clinical presentation before jumping to conclusions.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#C4A77D]">Think Stepwise:</span> Work through differential diagnosis systematically.
            </p>
          </div>
        </div>
      </div>

      {/* This Week Stats */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">This Week</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Cases reviewed</span>
            <span className="font-semibold text-[#5B7B6D]">{stats.total - stats.dueToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Due today</span>
            <span className="font-semibold text-[#8B7355]">{stats.dueToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Mastered</span>
            <span className="font-semibold text-[#C4A77D]">{stats.mastered}</span>
          </div>
        </div>
      </div>
    </>
  );

  // Show loading state
  if (isLoading) {
    return (
      <ThreeColumnLayout
        mobileHeader={mobileHeader}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
      >
        <div className={CARD_STYLES.containerWithPadding + ' text-center py-12'}>
          <div className="w-12 h-12 border-4 border-[#5B7B6D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
        </div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Mobile: Start Study Card */}
      <div className="lg:hidden">
        {dueCases.length > 0 && (
          <div className={CARD_STYLES.containerWithPadding}>
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Review</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCases.length} due</span>
            </button>
          </div>
        )}
      </div>

      {/* Browse Cases Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Browse Cases</h2>
        </div>

        {/* System Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowSystemDropdown(!showSystemDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] rounded-xl transition-colors text-sm font-medium text-white"
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
                  const count = getCasesBySystem(sys.id).length;
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
      </div>

      {/* Case Library Section */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Case Library</h2>
        </div>

        {/* Case Preview List */}
        {vignettes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No clinical cases available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {vignettes.slice(0, 5).map((vignette) => {
              const progress = getProgressForVignette(vignette.id);
              return (
                <Link
                  key={vignette.id}
                  href={`/cases/${vignette.id}`}
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#5B7B6D]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {vignette.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {vignette.metadata.system}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full ${
                      progress?.overallMastery === 'mastered'
                        ? 'bg-[#5B7B6D]/10 text-[#5B7B6D]'
                        : progress?.overallMastery === 'learning'
                        ? 'bg-[#C4A77D]/10 text-[#C4A77D]'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                      {progress?.overallMastery === 'mastered' ? 'Mastered' :
                       progress?.overallMastery === 'learning' ? 'Learning' : 'New'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Study All Button */}
        {vignettes.length > 0 && (
          <>
            <button
              onClick={handleStartStudy}
              disabled={dueCases.length === 0}
              className={`w-full mt-4 py-3 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                dueCases.length > 0
                  ? 'bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{dueCases.length > 0 ? 'Study Due Cases' : 'All Caught Up!'}</span>
              {dueCases.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCases.length}</span>
              )}
            </button>

            {/* Show more indicator */}
            {vignettes.length > 5 && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
                +{vignettes.length - 5} more cases
              </p>
            )}
          </>
        )}
      </div>

      {/* Empty state if no cases */}
      {stats.total === 0 && (
        <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-8') + ' text-center'}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5B7B6D]/20 to-[#7FA08F]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Cases Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
            Clinical cases will appear here as they are added.
          </p>
          <Link
            href="/cases/create"
            className="inline-block px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl shadow-md transition-all text-sm"
          >
            Create Case
          </Link>
        </div>
      )}
    </ThreeColumnLayout>
  );
}
