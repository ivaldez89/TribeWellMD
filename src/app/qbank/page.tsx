'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { createClient } from '@/lib/supabase/client';
import { getShelfIcon, getSystemIcon } from '@/components/icons/MedicalIcons';

interface QuestionSummary {
  batch: string;
  system: string;
  count: number;
}

interface PreviousTest {
  id: string;
  date: string;
  shelves: string[];
  systems: string[];
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  mode: 'tutor' | 'timed';
  isInProgress?: boolean; // For active, non-finalized sessions
  sessionKey?: string; // To resume the session
}

// Map internal batch names to user-friendly Shelf Exam names
const SHELF_EXAM_LABELS: Record<string, string> = {
  'Batch1': 'Internal Medicine',
  'Batch2': 'Surgery',
  'Batch3': 'Pediatrics',
  'Batch4': 'OB/GYN',
  'Batch5': 'Psychiatry',
  'Batch6': 'Family Medicine',
  'Batch7': 'Neurology',
  'Batch8': 'Emergency Medicine',
};

function getShelfLabel(batchId: string): string {
  // If it's already mapped, return the label
  if (SHELF_EXAM_LABELS[batchId]) {
    return SHELF_EXAM_LABELS[batchId];
  }
  // Fallback: try to make any batch ID more readable (remove "Batch" prefix if present)
  if (batchId.toLowerCase().startsWith('batch')) {
    return `Set ${batchId.replace(/batch/i, '').trim()}`;
  }
  return batchId;
}

export default function QBankPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionSummary, setQuestionSummary] = useState<QuestionSummary[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Selection state (internal uses batch names, UI shows shelf labels)
  const [selectedShelves, setSelectedShelves] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [mode, setMode] = useState<'tutor' | 'timed'>('tutor');
  const [questionCode, setQuestionCode] = useState('');
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);
  const [previousTests, setPreviousTests] = useState<PreviousTest[]>([]);

  // Load previous tests from localStorage (including in-progress sessions)
  useEffect(() => {
    try {
      // Load completed tests
      const stored = localStorage.getItem('qbank-previous-tests');
      const completedTests: PreviousTest[] = stored ? JSON.parse(stored) : [];

      // Scan for in-progress sessions (session keys start with 'qbank-session-')
      const inProgressSessions: PreviousTest[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('qbank-session-')) {
          try {
            const sessionData = JSON.parse(localStorage.getItem(key) || '{}');
            // Check if session is recent (less than 24 hours old)
            const isRecent = Date.now() - (sessionData.lastUpdated || 0) < 24 * 60 * 60 * 1000;

            if (isRecent && sessionData.questionIds && sessionData.questionIds.length > 0) {
              // Parse session key to extract batches, systems, count, mode
              // Key format: qbank-session-[batches]-[systems]-[count]-[mode]
              const keyParts = key.replace('qbank-session-', '').split('-');
              const mode = keyParts[keyParts.length - 1] as 'tutor' | 'timed';

              // Count answered questions
              const questionStates = sessionData.questionStates || {};
              const statesArray = Object.values(questionStates) as Array<{ isSubmitted?: boolean; isCorrect?: boolean }>;
              const answeredCount = statesArray.filter(state => state?.isSubmitted).length;

              // Count correct answers
              const correctCount = statesArray.filter(state => state?.isCorrect === true).length;

              // Only show if there's actual progress (at least on one question or just started)
              inProgressSessions.push({
                id: key,
                date: new Date(sessionData.lastUpdated).toISOString(),
                shelves: [], // Will be parsed from URL when resuming
                systems: [],
                questionCount: sessionData.questionIds.length,
                answeredCount,
                correctCount,
                mode: mode === 'timed' || mode === 'tutor' ? mode : 'tutor',
                isInProgress: true,
                sessionKey: key
              });
            }
          } catch (e) {
            console.warn('Failed to parse session:', key, e);
          }
        }
      }

      // Combine in-progress sessions (first) with completed tests
      setPreviousTests([...inProgressSessions, ...completedTests]);
    } catch (e) {
      console.error('Failed to load tests:', e);
    }
  }, []);

  // Fetch question summary from Supabase
  useEffect(() => {
    async function fetchSummary() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from('questions')
          .select('batch, system')
          .eq('status', 'active');

        if (error) {
          setError(error.message);
          return;
        }

        // Aggregate by batch and system
        const summary: Record<string, QuestionSummary> = {};
        data?.forEach((q) => {
          const key = `${q.batch}-${q.system}`;
          if (!summary[key]) {
            summary[key] = { batch: q.batch, system: q.system, count: 0 };
          }
          summary[key].count++;
        });

        setQuestionSummary(Object.values(summary));
        setTotalQuestions(data?.length || 0);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  // Get unique shelves (batches) and systems
  const shelves = useMemo(() => {
    const uniqueBatches = Array.from(new Set(questionSummary.map(q => q.batch))).sort();
    return uniqueBatches.map(batch => ({
      id: batch,
      label: getShelfLabel(batch),
      count: questionSummary.filter(q => q.batch === batch).reduce((sum, q) => sum + q.count, 0)
    }));
  }, [questionSummary]);

  const systems = useMemo(() => {
    const uniqueSystems = Array.from(new Set(questionSummary.map(q => q.system)))
      .filter(system => system && system.trim() !== '') // Filter out empty/blank systems
      .sort();
    return uniqueSystems.map(system => ({
      name: system,
      count: questionSummary.filter(q => q.system === system).reduce((sum, q) => sum + q.count, 0)
    }));
  }, [questionSummary]);

  // Calculate available questions based on selection
  const availableQuestions = useMemo(() => {
    if (selectedShelves.length === 0 && selectedSystems.length === 0) {
      return totalQuestions;
    }

    return questionSummary
      .filter(q => {
        const shelfMatch = selectedShelves.length === 0 || selectedShelves.includes(q.batch);
        const systemMatch = selectedSystems.length === 0 || selectedSystems.includes(q.system);
        return shelfMatch && systemMatch;
      })
      .reduce((sum, q) => sum + q.count, 0);
  }, [questionSummary, selectedShelves, selectedSystems, totalQuestions]);

  // Debug: Log filter state (remove after debugging)
  useEffect(() => {
    console.log('[QBank Debug]', {
      totalQuestions,
      questionSummaryLength: questionSummary.length,
      selectedShelves,
      selectedSystems,
      availableQuestions,
      isLoading,
      error
    });
  }, [totalQuestions, questionSummary, selectedShelves, selectedSystems, availableQuestions, isLoading, error]);

  // Toggle shelf selection
  const toggleShelf = (shelfId: string) => {
    setSelectedShelves(prev =>
      prev.includes(shelfId)
        ? prev.filter(s => s !== shelfId)
        : [...prev, shelfId]
    );
  };

  // Toggle system selection
  const toggleSystem = (system: string) => {
    setSelectedSystems(prev =>
      prev.includes(system)
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  // Remove a filter chip
  const removeShelf = (shelfId: string) => {
    setSelectedShelves(prev => prev.filter(s => s !== shelfId));
  };

  const removeSystem = (system: string) => {
    setSelectedSystems(prev => prev.filter(s => s !== system));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedShelves([]);
    setSelectedSystems([]);
    setQuestionCode('');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedShelves.length > 0 || selectedSystems.length > 0;

  // Start practice
  const handleStartPractice = () => {
    const params = new URLSearchParams();
    if (selectedShelves.length > 0) {
      params.set('batches', selectedShelves.join(','));
    }
    if (selectedSystems.length > 0) {
      params.set('systems', selectedSystems.join(','));
    }
    params.set('count', questionCount.toString());
    params.set('mode', mode);

    router.push(`/qbank/practice?${params.toString()}`);
  };

  // Left sidebar - Context & Memory
  const leftSidebar = (
    <>
      {/* QBank Summary Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-content dark:text-white">Question Bank</h2>
            <p className="text-sm text-content-muted">{totalQuestions} total questions</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-muted dark:bg-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-content-secondary dark:text-slate-400">Available</span>
            <span className="text-2xl font-bold text-primary">{availableQuestions}</span>
          </div>
          <div className="h-1.5 bg-border dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${totalQuestions > 0 ? (availableQuestions / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-content dark:text-white text-sm">Active Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-content-muted hover:text-primary transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap gap-2">
            {selectedShelves.map(shelfId => {
              const shelf = shelves.find(s => s.id === shelfId);
              return (
                <span
                  key={shelfId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {shelf?.label || shelfId}
                  <button
                    onClick={() => removeShelf(shelfId)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
            {selectedSystems.map(system => (
              <span
                key={system}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
              >
                {system}
                <button
                  onClick={() => removeSystem(system)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-muted text-center py-3">
            No filters applied — all questions selected
          </p>
        )}
      </div>
    </>
  );

  // Right sidebar - Action & Reassurance
  const rightSidebar = (
    <>
      {/* Test Settings */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-medium text-content dark:text-white mb-4 text-sm">Test Settings</h3>

        {/* Question Count - Manual Input */}
        <div className="mb-5">
          <label className="block text-xs text-content-muted mb-2">
            Number of Questions
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={availableQuestions}
              value={questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuestionCount(Math.min(Math.max(1, val), availableQuestions));
              }}
              className="flex-1 px-3 py-2.5 rounded-xl bg-surface-muted dark:bg-slate-800 border border-border text-content dark:text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <span className="text-xs text-content-muted whitespace-nowrap">
              of {availableQuestions}
            </span>
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-xs text-content-muted mb-2">
            Mode
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setMode('tutor')}
              className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                mode === 'tutor'
                  ? 'bg-primary/5 border-primary'
                  : 'bg-surface-muted dark:bg-slate-800 border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'tutor' ? 'border-primary' : 'border-content-muted'
                }`}>
                  {mode === 'tutor' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm font-medium ${mode === 'tutor' ? 'text-primary' : 'text-content-secondary dark:text-slate-300'}`}>
                  Tutor Mode
                </span>
              </div>
              <p className="text-xs text-content-muted mt-1 ml-6">
                See explanations after each question
              </p>
            </button>

            <button
              onClick={() => setMode('timed')}
              className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                mode === 'timed'
                  ? 'bg-primary/5 border-primary'
                  : 'bg-surface-muted dark:bg-slate-800 border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'timed' ? 'border-primary' : 'border-content-muted'
                }`}>
                  {mode === 'timed' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm font-medium ${mode === 'timed' ? 'text-primary' : 'text-content-secondary dark:text-slate-300'}`}>
                  Timed Mode
                </span>
              </div>
              <p className="text-xs text-content-muted mt-1 ml-6">
                90 seconds per question
              </p>
            </button>
          </div>
        </div>

        {/* Start Button - integrated */}
        <button
          onClick={handleStartPractice}
          disabled={availableQuestions === 0}
          className="w-full mt-5 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
        <p className="text-center text-xs text-content-muted mt-2">
          {questionCount} questions in {mode === 'tutor' ? 'tutor' : 'timed'} mode
        </p>
      </div>
    </>
  );

  // Mobile header
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-content dark:text-white">QBank</h1>
            <p className="text-sm text-content-muted">{availableQuestions} available</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ThreeColumnLayout>
        <div className={CARD_STYLES.containerWithPadding + ' text-center py-8'}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-content dark:text-white mb-2">Error Loading Questions</h1>
          <p className="text-content-muted">{error}</p>
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
      {/* Browse Questions Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-content dark:text-white">Browse Questions</h2>
          <span className="ml-auto text-sm text-content-muted">{totalQuestions} total</span>
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
                  {shelves.map((shelf) => {
                    const ShelfIcon = getShelfIcon(shelf.label);
                    return (
                      <button
                        key={shelf.id}
                        onClick={() => {
                          setSelectedShelves([shelf.id]);
                          setSelectedSystems([]);
                          setShowShelfDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-center gap-3">
                          <ShelfIcon className="w-5 h-5 text-[#5B7B6D]" />
                          <span className="text-sm font-medium">{shelf.label}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {shelf.count}
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
                  {systems.map((system) => {
                    // For combined systems like "Endocrinology, Nephrology", use the first part
                    const primarySystem = system.name.split(',')[0].trim();
                    const SystemIcon = getSystemIcon(primarySystem);
                    return (
                      <button
                        key={system.name}
                        onClick={() => {
                          setSelectedSystems([system.name]);
                          setSelectedShelves([]);
                          setShowSystemDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-center gap-3">
                          <SystemIcon className="w-5 h-5 text-[#C4A77D]" />
                          <span className="text-sm font-medium">{system.name}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A77D]/10 text-[#C4A77D]">
                          {system.count}
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

      {/* Previous Tests Section */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-content dark:text-white">Previous Tests</h2>
        </div>

        {previousTests.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-muted dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-content-muted text-sm">No previous tests yet</p>
            <p className="text-content-muted text-xs mt-1">Complete a practice session to see your history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {previousTests.slice(0, 5).map((test) => {
              const score = test.answeredCount > 0 ? Math.round((test.correctCount / test.answeredCount) * 100) : 0;
              const dateStr = new Date(test.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              });
              const filterLabel = test.shelves.length > 0
                ? test.shelves.map(s => getShelfLabel(s)).join(', ')
                : test.systems.length > 0
                  ? test.systems.join(', ')
                  : 'All Questions';

              // For in-progress sessions, show resume button
              if (test.isInProgress) {
                return (
                  <div
                    key={test.id}
                    className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary uppercase tracking-wide">
                            In Progress
                          </span>
                        </div>
                        <p className="font-medium text-content dark:text-white text-sm mt-1">
                          Question {test.answeredCount + 1}/{test.questionCount}
                        </p>
                        <p className="text-xs text-content-muted">{dateStr}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Parse the session key to rebuild the URL
                          // Key format: qbank-session-[batches]-[systems]-[count]-[mode]
                          const keyContent = test.sessionKey?.replace('qbank-session-', '') || '';
                          const parts = keyContent.replace(/_/g, ',').split('-');
                          const mode = parts[parts.length - 1];
                          const count = parts[parts.length - 2];

                          // Build URL params - the session will be auto-restored
                          const params = new URLSearchParams();
                          params.set('count', count || test.questionCount.toString());
                          params.set('mode', mode || test.mode);

                          router.push(`/qbank/practice?${params.toString()}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resume
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-content-muted">
                      <span>{test.answeredCount}/{test.questionCount} answered</span>
                      {test.answeredCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{test.correctCount} correct</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="capitalize">{test.mode}</span>
                    </div>
                  </div>
                );
              }

              // Completed test display
              return (
                <div
                  key={test.id}
                  className="p-4 rounded-xl bg-surface-muted dark:bg-slate-800 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-content dark:text-white text-sm truncate">
                        {filterLabel}
                      </p>
                      <p className="text-xs text-content-muted">{dateStr}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      score >= 80
                        ? 'bg-success/10 text-success'
                        : score >= 60
                          ? 'bg-warning/10 text-warning'
                          : 'bg-error/10 text-error'
                    }`}>
                      {score}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-content-muted">
                    <span>{test.answeredCount}/{test.questionCount} answered</span>
                    <span>•</span>
                    <span>{test.correctCount} correct</span>
                    <span>•</span>
                    <span className="capitalize">{test.mode}</span>
                  </div>
                </div>
              );
            })}
            {previousTests.length > 5 && (
              <p className="text-center text-xs text-content-muted pt-2">
                + {previousTests.length - 5} more tests
              </p>
            )}
          </div>
        )}
      </div>

    </ThreeColumnLayout>
  );
}
