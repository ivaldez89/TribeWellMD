'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { StudyLayout, useStudyLayout } from '@/components/layout/StudyLayout';
import { useVignette } from '@/hooks/useVignette';
import { VignetteViewer } from '@/components/vignettes/VignetteViewer';
import { VignetteProgress } from '@/components/vignettes/VignetteProgress';
import { useStreak } from '@/hooks/useStreak';

export default function CasePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const vignetteId = params.id as string;

  const {
    vignette,
    currentNode,
    session,
    isLoading,
    error,
    isComplete,
    nodeCount,
    currentNodeIndex,
    selectedChoice,
    showFeedback,
    nodeHistory,
    startVignette,
    makeChoice,
    continueAfterFeedback,
    retryCurrentQuestion,
    restartVignette,
    endSession
  } = useVignette(vignetteId);

  // Streak/XP system
  const { addXP } = useStreak();

  // Panel state from StudyLayout hook
  const { activePanel, setActivePanel } = useStudyLayout();

  // Show progress view after completion
  const [showProgress, setShowProgress] = useState(false);

  // Start the vignette when loaded
  useEffect(() => {
    if (vignette && !session) {
      startVignette();
    }
  }, [vignette, session, startVignette]);

  const handleBack = () => {
    if (session) {
      endSession();
    }
    router.push('/cases');
  };

  const handleRestart = () => {
    setShowProgress(false);
    restartVignette();
  };

  const handleFinish = () => {
    // Award XP for completing the case (bonus for optimal path)
    const baseXP = 25;
    const optimalBonus = session?.completedOptimally ? 15 : 0;
    addXP(baseXP + optimalBonus, 'Case completion');

    endSession();
    router.push('/cases');
  };

  // Loading state - before StudyLayout
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading case...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - before StudyLayout
  if (error || !vignette) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary mb-2">Case Not Found</h2>
            <p className="text-content-muted mb-6">{error || 'The requested case could not be loaded.'}</p>
            <button
              onClick={() => router.push('/cases')}
              className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors"
            >
              Back to Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Starting state - before StudyLayout
  if (!currentNode || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Starting case...</p>
          </div>
        </div>
      </div>
    );
  }

  // Header center content: Case title and step indicator
  const headerCenter = (
    <>
      {/* Case Title (truncated on small screens) */}
      <div className="hidden md:block text-sm font-medium text-white truncate max-w-[200px]">
        {vignette.title}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <span className="text-[10px] text-white/70 hidden sm:inline">Step</span>
        <span className="font-bold text-sm text-white tabular-nums">
          {currentNodeIndex + 1}<span className="text-white/60 font-normal">/{nodeCount}</span>
        </span>
      </div>

      {/* System tag */}
      <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70">
        {vignette.metadata.system}
      </div>
    </>
  );

  // Outcome screen (case complete)
  if (isComplete && !showFeedback) {
    const wasOptimal = session.completedOptimally;

    return (
      <StudyLayout
        backHref="/cases"
        backLabel="Back to Cases"
        headerCenter={headerCenter}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      >
        {/* Backdrop layer - behind modal, above scene */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-10"
          style={{ top: '48px', bottom: '0' }}
          aria-hidden="true"
        />

        <main className="relative px-4 py-6 max-w-3xl mx-auto z-20">
          {showProgress ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
              <VignetteProgress session={session} vignette={vignette} />

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Finish & Return
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Result header */}
              <div className={`
                px-6 py-8 text-center
                ${wasOptimal
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }
              `}>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {wasOptimal ? (
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {wasOptimal ? 'Excellent Work!' : 'Case Completed'}
                </h2>
                <p className="text-white/90 font-medium">
                  {wasOptimal
                    ? 'You made optimal choices throughout.'
                    : 'Review your decisions to see where you could improve.'
                  }
                </p>
              </div>

              {/* Outcome content */}
              <div className="p-6 md:p-8">
                <div className="max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {currentNode.content}
                  </p>
                </div>

                {/* Quick stats */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{session.decisions.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Decisions</div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {session.decisions.filter(d => d.wasOptimal).length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Optimal</div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {session.decisions.filter(d => d.wasAcceptable && !d.wasOptimal).length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Acceptable</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowProgress(true)}
                    className="flex-1 py-3 px-6 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Details
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </StudyLayout>
    );
  }

  // Main case view
  return (
    <StudyLayout
      backHref="/cases"
      backLabel="Back to Cases"
      headerCenter={headerCenter}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    >
      <main className="relative px-4 py-6 max-w-4xl mx-auto">
        <VignetteViewer
          vignette={vignette}
          currentNode={currentNode}
          nodeIndex={currentNodeIndex}
          totalNodes={nodeCount}
          onMakeChoice={makeChoice}
          onContinue={continueAfterFeedback}
          onRetry={retryCurrentQuestion}
          onBack={handleBack}
          selectedChoice={selectedChoice}
          showFeedback={showFeedback}
          isComplete={isComplete}
          history={nodeHistory}
        />
      </main>

      {/* Keyboard shortcuts help - with readable background */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <p className="inline-block study-overlay-surface-sm text-sm">
          <kbd className="study-overlay-kbd">1-9</kbd> select choice
          <span className="mx-2 study-overlay-muted">•</span>
          <kbd className="study-overlay-kbd">Enter</kbd> continue
        </p>
      </div>
    </StudyLayout>
  );
}
