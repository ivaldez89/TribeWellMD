'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { Icons } from '@/components/ui/Icons';
import { useVignettes } from '@/hooks/useVignettes';
import type { MedicalSystem } from '@/types';

// Icon component helper for dynamic icon names
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Stethoscope: <Icons.Stethoscope />,
    Scalpel: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>,
    Baby: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" /></svg>,
    Heart: <Icons.Heart />,
    Brain: <Icons.Brain />,
    Users: <Icons.Users />,
    Zap: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Ambulance: <Icons.Hospital />,
    Lungs: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Stomach: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" /></svg>,
    Thyroid: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Kidney: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Bone: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Blood: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Virus: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Skin: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Default: <Icons.Book />,
  };
  return iconMap[iconName] || iconMap.Default;
};

// Shelf categories for browsing - using semantic gradient colors
const SHELF_CATEGORIES = [
  { id: 'internal-medicine', name: 'Internal Medicine', icon: 'Stethoscope', color: 'from-forest-500 to-forest-400' },
  { id: 'surgery', name: 'Surgery', icon: 'Scalpel', color: 'from-sand-700 to-sand-600' },
  { id: 'pediatrics', name: 'Pediatrics', icon: 'Baby', color: 'from-forest-400 to-forest-300' },
  { id: 'obgyn', name: 'OB/GYN', icon: 'Heart', color: 'from-sand-600 to-sand-500' },
  { id: 'psychiatry', name: 'Psychiatry', icon: 'Brain', color: 'from-forest-400 to-forest-300' },
  { id: 'family-medicine', name: 'Family Medicine', icon: 'Users', color: 'from-forest-500 to-forest-400' },
  { id: 'neurology', name: 'Neurology', icon: 'Zap', color: 'from-sand-700 to-sand-500' },
  { id: 'emergency', name: 'Emergency Medicine', icon: 'Ambulance', color: 'from-sand-600 to-sand-700' },
];

// System/Category options for browsing (matches MedicalSystem type) - using icon names
const SYSTEM_CATEGORIES: { id: MedicalSystem; name: string; icon: string }[] = [
  { id: 'Cardiology', name: 'Cardiology', icon: 'Heart' },
  { id: 'Pulmonology', name: 'Pulmonology', icon: 'Lungs' },
  { id: 'Gastroenterology', name: 'Gastroenterology', icon: 'Stomach' },
  { id: 'Neurology', name: 'Neurology', icon: 'Brain' },
  { id: 'Endocrinology', name: 'Endocrinology', icon: 'Thyroid' },
  { id: 'Nephrology', name: 'Nephrology', icon: 'Kidney' },
  { id: 'Rheumatology', name: 'Rheumatology', icon: 'Bone' },
  { id: 'Hematology/Oncology', name: 'Hematology/Oncology', icon: 'Blood' },
  { id: 'Infectious Disease', name: 'Infectious Disease', icon: 'Virus' },
  { id: 'Dermatology', name: 'Dermatology', icon: 'Skin' },
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

  // Browse dropdown states
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  // Handle starting a due case
  const handleStartDue = () => {
    if (dueCases.length > 0) {
      router.push(`/cases/${dueCases[0].id}`);
    }
  };

  // Handle shelf selection
  const handleShelfSelect = (shelfId: string) => {
    setShowShelfDropdown(false);
    router.push(`/cases?shelf=${shelfId}`);
  };

  // Handle category selection
  const handleCategorySelect = (category: MedicalSystem) => {
    setShowCategoryDropdown(false);
    const casesInCategory = getCasesBySystem(category);
    if (casesInCategory.length > 0) {
      router.push(`/cases/${casesInCategory[0].id}`);
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

  // Mobile Header Card
  const mobileHeader = (
    <div className={CARD_STYLES.container}>
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-forest-500 via-forest-400 to-forest-300 p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white/90 text-xs font-medium mb-3">
            {dueCases.length > 0 ? (
              <>
                <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                <span>{dueCases.length} due</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>All caught up!</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Clinical Cases</h1>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-content">{stats.total}</p>
            <p className="text-content-muted text-xs">Total</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-content">{stats.dueToday}</p>
            <p className="text-content-muted text-xs">Due</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-content">{stats.mastered}</p>
            <p className="text-content-muted text-xs">Mastered</p>
          </div>
        </div>
        {dueCases.length > 0 && (
          <button
            onClick={handleStartDue}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg"
          >
            Start Review
          </button>
        )}
      </div>
    </div>
  );

  // Left Sidebar
  const leftSidebar = (
    <>
      {/* Header Card with Stats */}
      <div className={CARD_STYLES.container}>
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-forest-500 via-forest-400 to-forest-300 p-5">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur rounded-full text-white/90 text-xs font-medium mb-2">
              {dueCases.length > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
                  <span>{dueCases.length} due for review</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All caught up!</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">Clinical Cases</h1>
            <p className="text-white/70 text-sm mt-1">Interactive patient scenarios</p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-content">{stats.total}</p>
              <p className="text-content-muted text-xs">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-content">{stats.dueToday}</p>
              <p className="text-content-muted text-xs">Due</p>
            </div>
            <div>
              <p className="text-lg font-bold text-content">{stats.mastered}</p>
              <p className="text-content-muted text-xs">Mastered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="text-sm font-semibold text-content mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {dueCases.length > 0 ? (
            <button
              onClick={handleStartDue}
              className="w-full flex items-center gap-3 p-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Start Review ({dueCases.length})</span>
            </button>
          ) : (
            <div className="p-3 bg-surface-muted rounded-xl text-center">
              <p className="text-sm text-content-muted">No cases due!</p>
            </div>
          )}
          <Link
            href="/progress/progress"
            className="w-full flex items-center gap-3 p-3 bg-surface-muted hover:bg-surface rounded-xl text-sm font-medium text-content transition-colors"
          >
            <Icons.Target />
            <span>View Progress</span>
          </Link>
        </div>
      </div>

      {/* Browse by System */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="text-sm font-semibold text-content mb-3">Browse by System</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {SYSTEM_CATEGORIES.map((cat) => {
            const count = getCasesBySystem(cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                disabled={count === 0}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm transition-colors ${
                  count > 0
                    ? 'hover:bg-surface-muted text-content'
                    : 'text-content-muted/50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-primary">{getIconComponent(cat.icon)}</span>
                  <span>{cat.name}</span>
                </div>
                <span className="text-xs text-content-muted">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  // Right Sidebar
  const rightSidebar = (
    <>
      {/* Progress Overview */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="text-sm font-semibold text-content mb-3">Your Progress</h3>
        <div className="mb-3">
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-content-muted">{stats.mastered} mastered</span>
          <span className="font-medium text-content">{progressPercentage}%</span>
        </div>
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Needs Practice
          </h3>
          <div className="space-y-2">
            {weakTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleCategorySelect(topic.id)}
                className="w-full flex items-center justify-between p-2 bg-surface-muted hover:bg-surface rounded-lg text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-primary">{getIconComponent(topic.icon)}</span>
                  <span className="text-content">{topic.name}</span>
                </div>
                <span className="text-xs text-content-muted">{Math.round(topic.masteryRate * 100)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Daily Challenge */}
      {vignettes.length > 0 && (
        <div className={CARD_STYLES.container}>
          <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-sand-700 via-sand-600 to-sand-500 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Icons.Target />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Daily Challenge</h3>
                <span className="text-white/70 text-xs">+50 XP Bonus</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={() => {
                const challengeCase = vignettes.find(v => {
                  const progress = getProgressForVignette(v.id);
                  return !progress || progress.overallMastery !== 'mastered';
                }) || vignettes[0];
                if (challengeCase) {
                  router.push(`/cases/${challengeCase.id}`);
                }
              }}
              className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg"
            >
              Start Challenge
            </button>
          </div>
        </div>
      )}

      {/* Study Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="text-sm font-semibold text-content mb-3">Study Tips</h3>
        <ul className="space-y-2 text-xs text-content-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">1.</span>
            Read the case presentation carefully
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">2.</span>
            Think before selecting answers
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">3.</span>
            Review explanations thoroughly
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
      isLoading={isLoading}
      loadingContent={<ThreeColumnLayoutSkeleton />}
    >
      {/* Hero Card in Center Column */}
      <div className={CARD_STYLES.container}>
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-forest-500 via-forest-400 to-forest-300 p-6 md:p-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
              {dueCases.length > 0 ? (
                <>
                  <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                  <span>{dueCases.length} cases due for review</span>
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

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              Clinical <span className="text-sand-200">Cases</span>
            </h1>

            <p className="text-white/80 text-sm md:text-base max-w-md">
              Master clinical reasoning with interactive patient scenarios. Make decisions and see the outcomes.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-content">{stats.total}</p>
                <p className="text-content-muted text-xs">Total Cases</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-content">{stats.dueToday}</p>
                <p className="text-content-muted text-xs">Due Today</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-content">{stats.mastered}</p>
                <p className="text-content-muted text-xs">Mastered</p>
              </div>
            </div>

            {dueCases.length > 0 && (
              <button
                onClick={handleStartDue}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
              >
                Start Review
                <span className="ml-2 px-2 py-0.5 bg-white/20 text-sm rounded-full">
                  {dueCases.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Box Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Weak Topics */}
        {(() => {
          const hasWeakTopics = weakTopics.length > 0;
          const topWeakTopic = weakTopics[0];

          return (
            <div
              onClick={() => {
                if (hasWeakTopics && topWeakTopic) {
                  handleCategorySelect(topWeakTopic.id);
                }
              }}
              className={`group relative p-5 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                hasWeakTopics
                  ? 'bg-gradient-to-br from-[#8B3A3A] to-[#A04040] shadow-[#8B3A3A]/25 hover:shadow-[#8B3A3A]/40 hover:scale-[1.02] cursor-pointer'
                  : 'bg-gradient-to-br from-forest-500 to-forest-400 shadow-forest-500/25'
              } text-white`}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  {hasWeakTopics ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{hasWeakTopics ? 'Weak Topics' : 'Strong Across Topics'}</h3>
                <p className="text-white/70 text-xs mb-2">
                  {hasWeakTopics ? 'Areas that need more practice' : 'Great job on all topics!'}
                </p>
                {hasWeakTopics && (
                  <div className="space-y-1">
                    {weakTopics.slice(0, 2).map((topic) => (
                      <div key={topic.id} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3">{getIconComponent(topic.icon)}</span>
                        <span className="text-white/80">{topic.name}</span>
                        <span className="text-white/50">({Math.round(topic.masteryRate * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Box 2: Browse Cases */}
        <div className="relative p-5 bg-gradient-to-br from-forest-400 to-forest-300 rounded-2xl shadow-lg shadow-forest-400/25 text-white">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-1">Browse Cases</h3>
            <p className="text-white/70 text-xs mb-3">Find by shelf or system</p>

            <div className="space-y-2">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowShelfDropdown(!showShelfDropdown);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
                >
                  <span>By Shelf Exam</span>
                  <svg className={`w-3 h-3 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowShelfDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
                >
                  <span>By System</span>
                  <svg className={`w-3 h-3 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="absolute left-4 right-4 top-full mt-2 bg-surface rounded-xl shadow-2xl border border-border z-[110] max-h-48 overflow-y-auto">
                {SHELF_CATEGORIES.map((shelf) => (
                  <button
                    key={shelf.id}
                    onClick={() => handleShelfSelect(shelf.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-muted transition-colors text-left text-content first:rounded-t-xl last:rounded-b-xl text-sm"
                  >
                    <span className="w-4 h-4 text-primary">{getIconComponent(shelf.icon)}</span>
                    <span>{shelf.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Category Dropdown Menu */}
          {showCategoryDropdown && (
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setShowCategoryDropdown(false)}
              />
              <div className="absolute left-4 right-4 top-full mt-2 bg-surface rounded-xl shadow-2xl border border-border z-[110] max-h-48 overflow-y-auto">
                {SYSTEM_CATEGORIES.map((cat) => {
                  const count = getCasesBySystem(cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      disabled={count === 0}
                      className={`w-full flex items-center justify-between px-3 py-2 transition-colors text-left first:rounded-t-xl last:rounded-b-xl text-sm ${
                        count > 0
                          ? 'hover:bg-surface-muted text-content'
                          : 'text-content-muted/50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-primary">{getIconComponent(cat.icon)}</span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-xs text-content-muted">{count}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Box 3: Progress */}
        <Link
          href="/progress/progress"
          className="group relative p-5 bg-gradient-to-br from-sand-600 to-sand-500 rounded-2xl shadow-lg shadow-sand-600/25 hover:shadow-sand-600/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-1">Your Progress</h3>
            <p className="text-white/70 text-xs mb-2">Track your mastery</p>

            <div className="mb-2">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/70">{stats.mastered} mastered</span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </Link>
      </div>

    </ThreeColumnLayout>
  );
}
