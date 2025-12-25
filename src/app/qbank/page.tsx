'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { createClient } from '@/lib/supabase/client';

interface QuestionSummary {
  batch: string;
  system: string;
  count: number;
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
    const uniqueSystems = Array.from(new Set(questionSummary.map(q => q.system))).sort();
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

        {/* Question Count */}
        <div className="mb-5">
          <label className="block text-xs text-content-muted mb-2">
            Questions
          </label>
          <div className="flex gap-2">
            {[10, 20, 40].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(Math.min(count, availableQuestions))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  questionCount === count
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted dark:bg-slate-800 text-content-secondary dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-slate-700'
                }`}
              >
                {count}
              </button>
            ))}
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
      </div>

      {/* Start Button */}
      <div className={CARD_STYLES.containerWithPadding}>
        <button
          onClick={handleStartPractice}
          disabled={availableQuestions === 0}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
        <p className="text-center text-xs text-content-muted mt-3">
          {Math.min(questionCount, availableQuestions)} questions in {mode === 'tutor' ? 'tutor' : 'timed'} mode
        </p>
        <p className="text-center text-xs text-content-muted mt-1">
          You can change settings during review
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
      {/* Main Card - Build Your Practice Test */}
      <div className={CARD_STYLES.containerWithPadding + ' space-y-8'}>
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-content dark:text-white mb-1">
            Build Your Practice Test
          </h1>
          <p className="text-sm text-content-muted">
            Select shelf exams and systems to customize your question set
          </p>
        </div>

        {/* Shelf Exam Section */}
        <div>
          <h2 className="text-sm font-medium text-content dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Shelf Exam
          </h2>
          <div className="flex flex-wrap gap-2">
            {shelves.map((shelf) => {
              const isSelected = selectedShelves.includes(shelf.id);
              return (
                <button
                  key={shelf.id}
                  onClick={() => toggleShelf(shelf.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary'
                      : 'bg-surface-muted dark:bg-slate-800 text-content-secondary dark:text-slate-300 border border-border hover:border-primary/50'
                  }`}
                >
                  {shelf.label}
                  <span className={`ml-1.5 ${isSelected ? 'text-primary/70' : 'text-content-muted'}`}>
                    ({shelf.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System / Topic Section */}
        <div>
          <h2 className="text-sm font-medium text-content dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            System / Topic
          </h2>
          <div className="flex flex-wrap gap-2">
            {systems.map((system) => {
              const isSelected = selectedSystems.includes(system.name);
              return (
                <button
                  key={system.name}
                  onClick={() => toggleSystem(system.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary'
                      : 'bg-surface-muted dark:bg-slate-800 text-content-secondary dark:text-slate-300 border border-border hover:border-primary/50'
                  }`}
                >
                  {system.name}
                  <span className={`ml-1.5 ${isSelected ? 'text-primary/70' : 'text-content-muted'}`}>
                    ({system.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Code Lookup */}
        <div>
          <h2 className="text-sm font-medium text-content dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Question Code Lookup
          </h2>
          <div className="relative">
            <input
              type="text"
              value={questionCode}
              onChange={(e) => setQuestionCode(e.target.value)}
              placeholder="Enter UWorld or AMBOSS question ID..."
              className="w-full px-4 py-3 rounded-xl bg-surface-muted dark:bg-slate-800 border border-border text-content dark:text-white placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {questionCode && (
              <p className="mt-2 text-xs text-content-muted">
                Question code lookup coming soon
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Start Button */}
      <div className="lg:hidden">
        <div className={CARD_STYLES.containerWithPadding}>
          <button
            onClick={handleStartPractice}
            disabled={availableQuestions === 0}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Practice ({Math.min(questionCount, availableQuestions)} Qs)
          </button>
          <p className="text-center text-xs text-content-muted mt-2">
            You can change settings during review
          </p>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
