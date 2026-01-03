'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/footer/Footer';
import { StudyLayout, useStudyLayout } from '@/components/layout/StudyLayout';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { CardEditor } from '@/components/deck/CardEditor';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { recordCardReview, AchievementNotification } from '@/components/study/StudyStats';
import { ThemeToggleSimple } from '@/components/theme/ThemeProvider';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Rating } from '@/types';
import { FireIcon } from '@/components/icons/MedicalIcons';

// Achievement type for notifications
interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string | null;
  requirement: number;
  type: 'cards' | 'streak' | 'days' | 'pomodoro';
}

export default function FlashcardsPage() {
  const {
    cards,
    dueCards,
    filteredDueCards,
    currentCard,
    currentIndex,
    isRevealed,
    isLoading,
    stats,
    session,
    intervalPreview,
    filters,
    availableTags,
    availableSystems,
    revealAnswer,
    rateCard,
    startSession,
    endSession,
    updateCard,
    deleteCard,
    setFilters,
    clearFilters,
    goToCard
  } = useFlashcards();

  const [showEditor, setShowEditor] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [cramMode, setCramMode] = useState(false);
  const [cramIndex, setCramIndex] = useState(0);
  const [cramRevealed, setCramRevealed] = useState(false);

  // Panel state from StudyLayout hook
  const { activePanel, setActivePanel, togglePanel } = useStudyLayout();

  // Cram mode: cards with lapses (cards user got wrong before)
  const cramCards = cards.filter(card => card.spacedRepetition.lapses > 0);
  const currentCramCard = cramMode ? cramCards[cramIndex] : null;

  // Auto-start session when page loads with due cards
  useEffect(() => {
    if (!isLoading && filteredDueCards.length > 0 && !session) {
      startSession();
    }
  }, [isLoading, filteredDueCards.length, session, startSession]);

  const handleEditCard = () => {
    setShowEditor(true);
  };

  const handleSaveCard = (card: typeof currentCard) => {
    if (card) {
      updateCard(card);
    }
    setShowEditor(false);
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
    setShowEditor(false);
  };

  // Handle going back to previous card
  const handleBack = () => {
    if (currentIndex > 0) {
      goToCard(currentIndex - 1);
    }
  };

  // Handle card rating with achievement tracking
  const handleRateCard = (rating: Rating) => {
    // Record the review for stats/achievements
    const { newAchievements } = recordCardReview();

    // Show achievement notification if any
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }

    // Call the original rate function
    rateCard(rating);
  };

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.systems.length > 0 ||
    filters.rotations.length > 0 ||
    filters.states.length > 0 ||
    filters.difficulties.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full" />
          <p className="text-content-muted">Loading cards...</p>
        </div>
      </div>
    );
  }

  // No cards due - show completion screen (uses simplified header, not full StudyLayout)
  if (filteredDueCards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header for completion screen */}
        <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#5B7B6D] dark:bg-[#3d5a4d] text-white shadow-lg">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/flashcards" className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Link href="/home" className="flex items-center gap-1.5 group flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
                    <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm font-bold text-white">Tribe</span>
                    <span className="text-sm font-bold text-[#C4A77D]">Well</span>
                    <span className="text-sm font-light text-white/80">MD</span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                <span className="text-sm font-medium text-white">Complete</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <ThemeToggleSimple variant="greenHeader" />
              </div>
            </div>
          </div>
        </header>
        <div className="h-12" />

        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {hasActiveFilters && dueCards.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold text-content mb-4">
                  No Cards Match Filters
                </h1>
                <p className="text-lg text-content-muted max-w-md mx-auto mb-6">
                  You have {dueCards.length} cards due, but none match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 text-white font-medium rounded-xl hover:from-sand-600 hover:to-sand-700 transition-all shadow-lg"
                >
                  Clear Filters & Study All
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-content mb-4">
                  All Caught Up!
                </h1>
                <p className="text-lg text-content-muted max-w-md mx-auto">
                  You've reviewed all your due cards. Great work! Come back later for your next review session.
                </p>
              </>
            )}
          </div>

          {session && session.cardsReviewed > 0 && (
            <div className="mb-8 p-6 bg-surface rounded-2xl border border-border shadow-sm inline-block">
              <h2 className="text-sm font-semibold text-content-muted uppercase tracking-wide mb-4">
                Session Summary
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-content">{session.cardsReviewed}</p>
                  <p className="text-sm text-content-muted">Reviewed</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{session.cardsCorrect}</p>
                  <p className="text-sm text-content-muted">Correct</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-error">{session.cardsFailed}</p>
                  <p className="text-sm text-content-muted">Again</p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-muted hover:bg-surface text-content-secondary font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
          </div>
        </main>
      </div>
    );
  }

  // Header center content: Card number and session stats
  const headerCenter = (
    <>
      {/* Card Number */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <span className="text-[10px] text-white/70 hidden sm:inline">Card</span>
        <span className="font-bold text-sm text-white tabular-nums">
          {currentIndex + 1}<span className="text-white/60 font-normal">/{filteredDueCards.length}</span>
        </span>
      </div>

      {/* Session Stats */}
      {session && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
          <span className="text-sm font-medium text-green-300">{session.cardsCorrect}</span>
          <span className="text-white/40">/</span>
          <span className="text-sm font-medium text-red-300">{session.cardsFailed}</span>
        </div>
      )}
    </>
  );

  // Header right content: Pomodoro timer
  const headerRight = <PomodoroTimer variant="header" />;

  return (
    <StudyLayout
      backHref="/flashcards"
      backLabel="Back to Flashcards"
      headerCenter={headerCenter}
      headerRight={headerRight}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    >
      <main className="relative px-4 py-6 max-w-5xl mx-auto">
        {/* Cram Mode UI */}
        {cramMode && (
          <div className="mb-6">
            {/* Cram Mode Header */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-accent-light to-warning-light rounded-xl border border-accent">
              <div className="flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-accent" />
                <div>
                  <h2 className="font-semibold text-accent">Cram Mode</h2>
                  <p className="text-sm text-secondary">Reviewing cards you've missed before</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-secondary">
                  {cramIndex + 1} of {cramCards.length}
                </span>
                <button
                  onClick={() => {
                    setCramMode(false);
                    setCramIndex(0);
                    setCramRevealed(false);
                  }}
                  className="text-sm px-3 py-1.5 bg-surface border border-accent text-accent rounded-lg hover:bg-accent-light transition-colors"
                >
                  Exit Cram
                </button>
              </div>
            </div>

            {/* Cram Card Display */}
            {currentCramCard ? (
              <>
                <FlashcardViewer
                  card={currentCramCard}
                  isRevealed={cramRevealed}
                  onReveal={() => setCramRevealed(true)}
                  onEdit={() => {}}
                  onBack={cramIndex > 0 ? () => { setCramIndex(cramIndex - 1); setCramRevealed(false); } : undefined}
                  cardNumber={cramIndex + 1}
                  totalCards={cramCards.length}
                />

                {/* Cram Navigation */}
                {cramRevealed && (
                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      onClick={() => {
                        if (cramIndex < cramCards.length - 1) {
                          setCramIndex(cramIndex + 1);
                          setCramRevealed(false);
                        } else {
                          setCramMode(false);
                          setCramIndex(0);
                          setCramRevealed(false);
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-sand-500 to-sand-600 text-white font-medium rounded-xl hover:from-sand-600 hover:to-sand-700 transition-all shadow-lg"
                    >
                      {cramIndex < cramCards.length - 1 ? 'Next Card' : 'Finish Cram'}
                    </button>
                  </div>
                )}

                {/* Card Stats */}
                <div className="mt-4 text-center text-sm text-content-muted">
                  <span>This card has been missed {currentCramCard.spacedRepetition.lapses} time{currentCramCard.spacedRepetition.lapses !== 1 ? 's' : ''}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-content-muted">No more cards to cram!</p>
              </div>
            )}
          </div>
        )}

        {/* Regular Flashcard - only show when not in cram mode */}
        {!cramMode && currentCard && (
          <>
            <FlashcardViewer
              card={currentCard}
              isRevealed={isRevealed}
              onReveal={revealAnswer}
              onEdit={handleEditCard}
              onBack={currentIndex > 0 ? handleBack : undefined}
              cardNumber={currentIndex + 1}
              totalCards={filteredDueCards.length}
            />

            {/* Answer buttons - only show when revealed */}
            <AnswerButtons
              onRate={handleRateCard}
              disabled={!isRevealed}
              intervalPreview={intervalPreview}
            />
          </>
        )}

        {/* Keyboard shortcuts help - with readable background */}
        <div className="mt-8 text-center">
          <p className="inline-block study-overlay-surface-sm text-sm">
            <kbd className="study-overlay-kbd">Space</kbd> to reveal
            <span className="mx-2 study-overlay-muted">•</span>
            <kbd className="study-overlay-kbd">1-4</kbd> to rate
            {cramMode && (
              <>
                <span className="mx-2 study-overlay-muted">•</span>
                <kbd className="study-overlay-kbd">Esc</kbd> exit cram
              </>
            )}
          </p>
        </div>
      </main>

      {/* Card Editor Modal */}
      {showEditor && currentCard && (
        <CardEditor
          card={currentCard}
          onSave={handleSaveCard}
          onCancel={() => setShowEditor(false)}
          onDelete={handleDeleteCard}
        />
      )}

      {/* Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}

      {/* Shared Footer */}
      <Footer />
    </StudyLayout>
  );
}
