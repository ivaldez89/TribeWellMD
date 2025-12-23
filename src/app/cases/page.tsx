'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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

// Shelf categories for browsing - using icon names instead of emojis
const SHELF_CATEGORIES = [
  { id: 'internal-medicine', name: 'Internal Medicine', icon: 'Stethoscope', color: 'from-[#5B7B6D] to-[#6B8B7D]' },
  { id: 'surgery', name: 'Surgery', icon: 'Scalpel', color: 'from-[#8B7355] to-[#A89070]' },
  { id: 'pediatrics', name: 'Pediatrics', icon: 'Baby', color: 'from-[#7FA08F] to-[#8BA89A]' },
  { id: 'obgyn', name: 'OB/GYN', icon: 'Heart', color: 'from-[#A89070] to-[#C4A77D]' },
  { id: 'psychiatry', name: 'Psychiatry', icon: 'Brain', color: 'from-[#6B8B7D] to-[#7FA08F]' },
  { id: 'family-medicine', name: 'Family Medicine', icon: 'Users', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'neurology', name: 'Neurology', icon: 'Zap', color: 'from-[#8B7355] to-[#C4A77D]' },
  { id: 'emergency', name: 'Emergency Medicine', icon: 'Ambulance', color: 'from-[#A89070] to-[#8B7355]' },
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
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MedicalSystem | null>(null);

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
    setSelectedShelf(shelfId);
    setShowShelfDropdown(false);
    // Filter cases by shelf (for now, navigate to filtered view)
    router.push(`/cases?shelf=${shelfId}`);
  };

  // Handle category selection
  const handleCategorySelect = (category: MedicalSystem) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    const casesInCategory = getCasesBySystem(category);
    if (casesInCategory.length > 0) {
      router.push(`/cases/${casesInCategory[0].id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] p-8 md:p-10 shadow-2xl">
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
                  {dueCases.length > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
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

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Clinical <span className="text-[#C4A77D]">Cases</span>
                </h1>

                <p className="text-white/80 text-lg max-w-md">
                  Master clinical reasoning with interactive patient scenarios. Make decisions and see the outcomes.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-white/60 text-sm">Total Cases</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.dueToday}</p>
                    <p className="text-white/60 text-sm">Due Today</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.mastered}</p>
                    <p className="text-white/60 text-sm">Mastered</p>
                  </div>
                </div>
              </div>

              {/* Right side - CTA Button */}
              <div className="flex flex-col items-center gap-4">
                {dueCases.length > 0 ? (
                  <button
                    onClick={handleStartDue}
                    className="group relative px-10 py-5 bg-white hover:bg-[#F5F0E8] text-slate-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-[#5B7B6D]/25 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      Start Review
                      <span className="px-3 py-1 bg-[#5B7B6D] text-white text-base rounded-full">
                        {dueCases.length}
                      </span>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <div className="px-10 py-5 bg-white/20 backdrop-blur text-white font-semibold text-xl rounded-2xl flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            {(() => {
              // Calculate weak topics from vignettes
              const weakTopics = SYSTEM_CATEGORIES
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
                .filter(cat => cat.total > 0 && cat.masteryRate < 0.5) // Topics with <50% mastery
                .sort((a, b) => a.masteryRate - b.masteryRate)
                .slice(0, 3);

              const hasWeakTopics = weakTopics.length > 0;
              const topWeakTopic = weakTopics[0];

              return (
                <div
                  onClick={() => {
                    if (hasWeakTopics && topWeakTopic) {
                      handleCategorySelect(topWeakTopic.id);
                    }
                  }}
                  className={`group relative p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                    hasWeakTopics
                      ? 'bg-gradient-to-br from-[#8B7355] to-[#A89070] shadow-[#8B7355]/25 hover:shadow-[#8B7355]/40 hover:scale-[1.02] cursor-pointer'
                      : 'bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] shadow-[#5B7B6D]/25'
                  } text-white`}
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      {hasWeakTopics ? (
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-1">{hasWeakTopics ? 'Weak Topics' : 'Strong Across Topics'}</h3>
                    <p className="text-white/70 text-sm mb-3">
                      {hasWeakTopics ? 'Areas that need more practice' : 'Great job on all topics!'}
                    </p>
                    {hasWeakTopics ? (
                      <div className="space-y-1">
                        {weakTopics.map((topic, i) => (
                          <div key={topic.id} className="flex items-center gap-2 text-sm">
                            <span className="w-4 h-4">{getIconComponent(topic.icon)}</span>
                            <span className="text-white/80">{topic.name}</span>
                            <span className="text-white/50 text-xs">({Math.round(topic.masteryRate * 100)}%)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60 text-sm">Keep up the great work!</p>
                    )}
                  </div>
                  {hasWeakTopics && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Box 2: Browse by Shelf / Category */}
            <div className="relative p-6 bg-gradient-to-br from-[#6B8B7D] to-[#7FA08F] rounded-2xl shadow-lg shadow-[#6B8B7D]/25 text-white">
              {/* Background decoration - separate from content */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-1">Browse Cases</h3>
                <p className="text-white/70 text-sm mb-4">Find by shelf or system</p>

                {/* Dropdown Buttons */}
                <div className="space-y-2">
                  {/* Shelf Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowShelfDropdown(!showShelfDropdown);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                    >
                      <span>By Shelf Exam</span>
                      <svg className={`w-4 h-4 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                        setShowShelfDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                    >
                      <span>By System</span>
                      <svg className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shelf Dropdown Menu - positioned outside overflow context */}
              {showShelfDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowShelfDropdown(false)}
                  />
                  <div className="absolute left-6 right-6 top-[calc(100%-3.5rem)] mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                    {SHELF_CATEGORIES.map((shelf) => (
                      <button
                        key={shelf.id}
                        onClick={() => handleShelfSelect(shelf.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-slate-900 dark:text-white first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span className="w-5 h-5 text-[#5B7B6D]">{getIconComponent(shelf.icon)}</span>
                        <span className="text-sm font-medium">{shelf.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Category Dropdown Menu - positioned outside overflow context */}
              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute left-6 right-6 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                    {SYSTEM_CATEGORIES.map((cat) => {
                      const count = getCasesBySystem(cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          disabled={count === 0}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                            count > 0
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 text-[#5B7B6D]">{getIconComponent(cat.icon)}</span>
                            <span className="text-sm font-medium">{cat.name}</span>
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
            <Link
              href="/study/progress"
              className="group relative p-6 bg-gradient-to-br from-[#A89070] to-[#C4A77D] rounded-2xl shadow-lg shadow-[#A89070]/25 hover:shadow-[#A89070]/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
            >
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
                  <span className="text-white/70">{stats.mastered} mastered</span>
                  <span className="font-bold">{progressPercentage}%</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>

          </div>
        </section>

        {/* Daily Challenge Section */}
        {vignettes.length > 0 && (
          <section className="mb-8 animate-fade-in-up animation-delay-200">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B7355] via-[#A89070] to-[#C4A77D] p-6 shadow-lg">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Target />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-white">Daily Challenge</h3>
                      <span className="px-2 py-0.5 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                        +50 XP Bonus
                      </span>
                    </div>
                    {(() => {
                      // Pick a "daily challenge" case - one that's not mastered yet
                      const challengeCase = vignettes.find(v => {
                        const progress = getProgressForVignette(v.id);
                        return !progress || progress.overallMastery !== 'mastered';
                      }) || vignettes[0];
                      const systemIconName = SYSTEM_CATEGORIES.find(s => s.id === challengeCase?.metadata.system)?.icon || 'Default';

                      return (
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <span className="w-4 h-4">{getIconComponent(systemIconName)}</span>
                          {challengeCase?.title || 'Complete any case'} - {challengeCase?.metadata.difficulty || 'intermediate'}
                        </p>
                      );
                    })()}
                  </div>
                </div>

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
                  className="px-6 py-3 bg-white hover:bg-[#F5F0E8] text-[#8B7355] font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recommended Cases - Personalized based on weaknesses */}
        {vignettes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recommended For You</h2>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Personalized
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{vignettes.length} cases total</span>
            </div>

            {/* Recommendation Explanation */}
            <div className="mb-4 p-3 bg-gradient-to-r from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] rounded-xl border border-[#C4A77D] dark:border-[#8B7355]">
              <p className="text-sm text-[#5B7B6D] dark:text-[#7FA08F] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>
                  {dueCases.length > 0
                    ? `${dueCases.length} cases due for review. Cases below target systems you haven't mastered yet.`
                    : 'Cases selected based on topics you haven\'t practiced or need more work on.'}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort vignettes: prioritize incomplete > not started > by difficulty */}
              {[...vignettes]
                .sort((a, b) => {
                  const progressA = getProgressForVignette(a.id);
                  const progressB = getProgressForVignette(b.id);

                  // Prioritize cases that haven't been completed
                  const completedA = progressA?.completions || 0;
                  const completedB = progressB?.completions || 0;

                  if (completedA === 0 && completedB > 0) return -1;
                  if (completedB === 0 && completedA > 0) return 1;

                  // Then by mastery level (lower mastery = higher priority)
                  const masteryA = progressA?.overallMastery || 'new';
                  const masteryB = progressB?.overallMastery || 'new';
                  const masteryOrder = { 'new': 0, 'learning': 1, 'familiar': 2, 'mastered': 3 };

                  return (masteryOrder[masteryA] || 0) - (masteryOrder[masteryB] || 0);
                })
                .slice(0, 3)
                .map((vignette) => {
                  const progress = getProgressForVignette(vignette.id);
                  const systemIconName = SYSTEM_CATEGORIES.find(s => s.id === vignette.metadata.system)?.icon || 'Default';
                  const isNew = !progress || progress.completions === 0;
                  const mastery = progress?.overallMastery || 'new';

                  return (
                    <Link
                      key={vignette.id}
                      href={`/cases/${vignette.id}`}
                      className="group p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#5B7B6D] dark:hover:border-[#7FA08F] hover:shadow-lg transition-all relative overflow-hidden"
                    >
                      {/* Recommendation Badge */}
                      {isNew && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-r from-[#8B7355] to-[#A89070] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            NEW
                          </div>
                        </div>
                      )}
                      {!isNew && mastery === 'learning' && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            REVIEW
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 text-[#5B7B6D]">{getIconComponent(systemIconName)}</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {vignette.metadata.system}
                          </span>
                        </div>
                        {progress && progress.completions > 0 && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            mastery === 'mastered'
                              ? 'bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#5B7B6D] dark:text-[#7FA08F]'
                              : mastery === 'familiar'
                                ? 'bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#6B8B7D] dark:text-[#8BA89A]'
                                : 'bg-[#F5F0E8] dark:bg-[#3D3832] text-[#8B7355] dark:text-[#C4A77D]'
                          }`}>
                            {mastery === 'mastered' ? 'Mastered' : mastery === 'familiar' ? 'Familiar' : 'Learning'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-[#5B7B6D] dark:group-hover:text-[#7FA08F] transition-colors">
                        {vignette.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full ${
                          vignette.metadata.difficulty === 'beginner'
                            ? 'bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#5B7B6D] dark:text-[#7FA08F]'
                            : vignette.metadata.difficulty === 'intermediate'
                              ? 'bg-[#F5F0E8] dark:bg-[#3D3832] text-[#8B7355] dark:text-[#C4A77D]'
                              : 'bg-[#E8E0D5] dark:bg-[#3D3832] text-[#A89070] dark:text-[#C4A77D]'
                        }`}>
                          {vignette.metadata.difficulty}
                        </span>
                        <span>~{vignette.metadata.estimatedMinutes || 5} min</span>
                        {progress && progress.completions > 0 && (
                          <span className="text-slate-400">• {progress.completions}x completed</span>
                        )}
                      </div>

                      {/* Why Recommended - subtle hint */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {isNew
                            ? 'You haven\'t tried this case yet'
                            : mastery === 'learning'
                              ? 'Needs more practice to solidify'
                              : mastery === 'familiar'
                                ? 'Almost mastered - one more review!'
                                : 'Keep it fresh with occasional review'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>

            {vignettes.length > 3 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowCategoryDropdown(true)}
                  className="text-sm text-[#5B7B6D] dark:text-[#7FA08F] hover:text-[#4A6A5C] dark:hover:text-[#8FA8A0] font-medium"
                >
                  Browse all {vignettes.length} cases
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
