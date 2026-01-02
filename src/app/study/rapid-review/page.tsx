'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { StudyLayout, useStudyLayout } from '@/components/layout/StudyLayout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { LightbulbIcon } from '@/components/icons/MedicalIcons';

// Rapid review stats type
interface RapidReviewStats {
  totalCardsReviewed: number;
  totalSessions: number;
  lastSessionDate: string | null;
  todayCardsReviewed: number;
  streak: number;
}

// Get rapid review stats from localStorage
function getRapidReviewStats(): RapidReviewStats {
  if (typeof window === 'undefined') {
    return { totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 };
  }
  const stored = localStorage.getItem('step2_rapid_review_stats');
  if (stored) {
    const stats = JSON.parse(stored);
    // Reset today's count if it's a new day
    const today = new Date().toDateString();
    if (stats.lastSessionDate !== today) {
      stats.todayCardsReviewed = 0;
    }
    return stats;
  }
  return { totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 };
}

// Save rapid review stats to localStorage
function saveRapidReviewStats(stats: RapidReviewStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('step2_rapid_review_stats', JSON.stringify(stats));
  }
}

// Update stats when a card is reviewed
function trackCardReviewed() {
  const stats = getRapidReviewStats();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  stats.totalCardsReviewed++;
  stats.todayCardsReviewed++;

  // Update streak
  if (stats.lastSessionDate === yesterday) {
    stats.streak++;
  } else if (stats.lastSessionDate !== today) {
    stats.streak = 1;
  }

  stats.lastSessionDate = today;
  saveRapidReviewStats(stats);
  return stats;
}

// Track session start
function trackSessionStart() {
  const stats = getRapidReviewStats();
  stats.totalSessions++;
  saveRapidReviewStats(stats);
}

export default function RapidReviewPage() {
  const {
    filteredDueCards,
    cards,
    isLoading,
  } = useFlashcards();

  const reviewCards = filteredDueCards.length > 0 ? filteredDueCards : cards.slice(0, 50);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.25);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(3);
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [cardsReviewedThisSession, setCardsReviewedThisSession] = useState(0);
  const [rapidStats, setRapidStats] = useState<RapidReviewStats>({ totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 });

  // Voice selection
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(-1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewedCardsRef = useRef<Set<string>>(new Set());

  const currentCard = reviewCards[currentIndex];

  // Panel state from StudyLayout hook
  const { activePanel, setActivePanel } = useStudyLayout();

  // Load stats on mount
  useEffect(() => {
    setRapidStats(getRapidReviewStats());
  }, []);

  // Track session start
  useEffect(() => {
    if (!sessionStarted && currentCard) {
      setSessionStarted(true);
      trackSessionStart();
    }
  }, [sessionStarted, currentCard]);

  // Track card reviewed when answer is revealed
  const markCardReviewed = useCallback(() => {
    if (currentCard && !reviewedCardsRef.current.has(currentCard.id)) {
      reviewedCardsRef.current.add(currentCard.id);
      const newStats = trackCardReviewed();
      setRapidStats(newStats);
      setCardsReviewedThisSession(prev => prev + 1);
    }
  }, [currentCard]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      const englishVoices = availableVoices
        .filter(v => v.lang.startsWith('en'))
        .sort((a, b) => {
          const aScore = (a.name.toLowerCase().includes('aaron') && a.lang === 'en-US' ? 200 : 0) +
                        (a.name.includes('Premium') || a.name.includes('Enhanced') || a.name.includes('Siri') ? 100 : 0) +
                        (a.localService ? 10 : 0) +
                        (a.name.includes('Samantha') || a.name.includes('Alex') ? 50 : 0);
          const bScore = (b.name.toLowerCase().includes('aaron') && b.lang === 'en-US' ? 200 : 0) +
                        (b.name.includes('Premium') || b.name.includes('Enhanced') || b.name.includes('Siri') ? 100 : 0) +
                        (b.localService ? 10 : 0) +
                        (b.name.includes('Samantha') || b.name.includes('Alex') ? 50 : 0);
          return bScore - aScore;
        });
      setVoices(englishVoices);

      if (englishVoices.length > 0 && selectedVoiceIndex === -1) {
        const aaronIndex = englishVoices.findIndex(v =>
          v.name.toLowerCase().includes('aaron') && v.lang === 'en-US'
        );
        const siriIndex = englishVoices.findIndex(v => v.name.includes('Siri'));
        const samanthaIndex = englishVoices.findIndex(v => v.name.includes('Samantha'));
        const premiumIndex = englishVoices.findIndex(v => v.name.includes('Premium') || v.name.includes('Enhanced'));

        if (aaronIndex >= 0) setSelectedVoiceIndex(aaronIndex);
        else if (siriIndex >= 0) setSelectedVoiceIndex(siriIndex);
        else if (samanthaIndex >= 0) setSelectedVoiceIndex(samanthaIndex);
        else if (premiumIndex >= 0) setSelectedVoiceIndex(premiumIndex);
        else setSelectedVoiceIndex(0);
      }
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Speak text function
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (selectedVoiceIndex >= 0 && voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [speechRate, selectedVoiceIndex, voices]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Go to next card
  const nextCard = useCallback(() => {
    stopSpeaking();
    if (currentIndex < reviewCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, reviewCards.length, stopSpeaking]);

  // Go to previous card
  const prevCard = useCallback(() => {
    stopSpeaking();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
    }
  }, [currentIndex, stopSpeaking]);

  // Handle reveal - track the card
  const handleReveal = useCallback(() => {
    setIsRevealed(true);
    markCardReviewed();
  }, [markCardReviewed]);

  // Play current card with TTS
  const playCard = useCallback(() => {
    if (!currentCard) return;

    const questionText = `If you see: ${currentCard.content.front}`;
    const answerText = `Then think: ${currentCard.content.back}`;

    if (!isRevealed) {
      speak(questionText, () => {
        handleReveal();
        timerRef.current = setTimeout(() => {
          speak(answerText, () => {
            if (autoAdvance && isPlaying) {
              timerRef.current = setTimeout(() => {
                nextCard();
              }, autoAdvanceDelay * 1000);
            }
          });
        }, 500);
      });
    } else {
      speak(answerText, () => {
        if (autoAdvance && isPlaying) {
          timerRef.current = setTimeout(() => {
            nextCard();
          }, autoAdvanceDelay * 1000);
        }
      });
    }
  }, [currentCard, isRevealed, speak, autoAdvance, autoAdvanceDelay, isPlaying, nextCard, handleReveal]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, stopSpeaking]);

  // Auto-play when isPlaying changes or card changes
  useEffect(() => {
    if (isPlaying && currentCard) {
      playCard();
    }
  }, [isPlaying, currentIndex]); // eslint-disable-line

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        } else {
          nextCard();
        }
      } else if (e.code === 'ArrowRight') {
        nextCard();
      } else if (e.code === 'ArrowLeft') {
        prevCard();
      } else if (e.code === 'KeyP') {
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, nextCard, prevCard, togglePlay, handleReveal]);

  // Speak just the current visible text
  const speakCurrent = () => {
    if (!currentCard) return;
    const text = isRevealed
      ? currentCard.content.back
      : currentCard.content.front;
    speak(text);
  };

  // Speed options
  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full" />
          <p className="text-content-muted">Loading rapid review...</p>
        </div>
      </div>
    );
  }

  if (reviewCards.length === 0) {
    return (
      <StudyLayout
        backHref="/study"
        backLabel="Back to Study"
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      >
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-content mb-4">No Cards Available</h1>
            <p className="text-content-muted mb-6">Import some cards first to use Rapid Review mode.</p>
            <Link
              href="/flashcards"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-info text-primary-foreground font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Flashcards
            </Link>
          </div>
        </main>
      </StudyLayout>
    );
  }

  // Header center content: Card number and session stats
  const headerCenter = (
    <>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <span className="text-[10px] text-white/70 hidden sm:inline">Card</span>
        <span className="font-bold text-sm text-white tabular-nums">
          {currentIndex + 1}<span className="text-white/60 font-normal">/{reviewCards.length}</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <span className="text-sm font-medium text-green-300">{cardsReviewedThisSession}</span>
        <span className="text-white/40 text-xs">reviewed</span>
      </div>
    </>
  );

  // Header right content: TTS indicator
  const headerRight = isSpeaking ? (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-xs text-white/80 hidden sm:inline">Speaking</span>
    </div>
  ) : null;

  return (
    <StudyLayout
      backHref="/study"
      backLabel="Back to Study"
      headerCenter={headerCenter}
      headerRight={headerRight}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    >
      <main className="relative px-4 py-6 max-w-3xl mx-auto">
        {/* Compact TTS Control Bar */}
        <div className="mb-6 bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTTSSettings(!showTTSSettings)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-content">Text-to-Speech</span>
                <span className="ml-2 text-xs text-content-muted">
                  {voices[selectedVoiceIndex]?.name?.split(' ')[0] || 'Default'} @ {speechRate}x
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying
                    ? 'bg-error text-error-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              {/* Expand arrow */}
              <svg
                className={`w-4 h-4 text-content-muted transition-transform ${showTTSSettings ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Expanded Settings */}
          {showTTSSettings && (
            <div className="p-4 border-t border-border bg-surface-muted/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Voice Selection */}
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1.5">Voice</label>
                  <select
                    value={selectedVoiceIndex}
                    onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface text-content rounded-lg border border-border focus:border-primary focus:ring-primary focus:outline-none text-sm"
                  >
                    {voices.map((voice, idx) => (
                      <option key={idx} value={idx}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed */}
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1.5">Speed</label>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-surface text-content rounded-lg border border-border focus:border-primary focus:ring-primary focus:outline-none text-sm"
                  >
                    {speedOptions.map((speed) => (
                      <option key={speed} value={speed}>
                        {speed.toFixed(2)}x
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-advance */}
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1.5">Auto-advance</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoAdvance(!autoAdvance)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        autoAdvance
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-content-muted border border-border hover:bg-surface-muted'
                      }`}
                    >
                      {autoAdvance ? 'On' : 'Off'}
                    </button>
                    {autoAdvance && (
                      <select
                        value={autoAdvanceDelay}
                        onChange={(e) => setAutoAdvanceDelay(parseInt(e.target.value))}
                        className="w-16 px-2 py-2 bg-surface text-content rounded-lg border border-border focus:border-primary focus:outline-none text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <option key={s} value={s}>{s}s</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-end mb-4 px-1">
          <div className="flex items-center gap-3 study-overlay-surface-sm">
            <span className="font-medium text-sm">{currentIndex + 1} / {reviewCards.length}</span>
            <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reviewCards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border overflow-hidden">
              {/* System tag header - only show after reveal */}
              {isRevealed && (
                <div className="px-6 py-3 bg-gradient-to-r from-surface-muted to-surface border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-content-secondary">
                      {currentCard.metadata.system}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-sm text-content-muted">
                      {currentCard.metadata.topic}
                    </span>
                  </div>
                </div>
              )}

              {/* Question (Front) - IF YOU SEE */}
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
                      IF YOU SEE
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg md:text-xl text-content leading-relaxed">
                    {currentCard.content.front}
                  </p>
                </div>
                {isSpeaking && !isRevealed && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Speaking...
                  </div>
                )}
              </div>

              {/* Reveal Button or Answer */}
              {!isRevealed ? (
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <button
                    onClick={handleReveal}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-info hover:from-primary-hover hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Reveal Answer</span>
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-xs font-mono">
                      Space
                    </kbd>
                  </button>
                </div>
              ) : (
                <div className="border-t border-border">
                  <div className="p-6 md:p-8 bg-gradient-to-b from-success-light/50 to-surface">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1 text-xs font-bold bg-primary/20 text-primary rounded-full">
                          THEN THINK
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-lg md:text-xl text-content leading-relaxed whitespace-pre-wrap">
                        {currentCard.content.back}
                      </p>
                    </div>
                    {isSpeaking && isRevealed && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Speaking...
                      </div>
                    )}

                    {currentCard.content.explanation && (
                      <div className="mt-6 p-4 bg-warning-light border border-warning/30 rounded-xl">
                        <div className="flex items-start gap-2">
                          <LightbulbIcon className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-secondary leading-relaxed">
                            {currentCard.content.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {/* Previous */}
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="p-3 rounded-full bg-surface text-content-muted disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors border border-border shadow-sm"
                title="Previous card"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Speak Current */}
              <button
                onClick={speakCurrent}
                className={`p-3 rounded-full transition-colors border shadow-sm ${
                  isSpeaking
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface text-content-muted hover:bg-surface-muted border-border'
                }`}
                title="Read aloud"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>

              {/* Play/Pause Auto */}
              <button
                onClick={togglePlay}
                className={`p-4 rounded-full transition-colors shadow-lg ${
                  isPlaying
                    ? 'bg-error text-error-foreground shadow-error/30'
                    : 'bg-gradient-to-r from-primary to-info text-primary-foreground hover:from-primary-hover hover:to-primary shadow-primary/30'
                }`}
                title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Stop (only when speaking) */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-3 rounded-full bg-error text-error-foreground hover:bg-error/90 transition-colors border border-error shadow-sm"
                  title="Stop speaking"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </button>
              )}

              {/* Next */}
              <button
                onClick={nextCard}
                disabled={currentIndex === reviewCards.length - 1}
                className="p-3 rounded-full bg-surface text-content-muted disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors border border-border shadow-sm"
                title="Next card"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Keyboard shortcuts help */}
            <div className="mt-8 text-center">
              <p className="inline-block study-overlay-surface-sm text-sm">
                <kbd className="study-overlay-kbd">Space</kbd> reveal/next
                <span className="mx-2 study-overlay-muted">•</span>
                <kbd className="study-overlay-kbd">←</kbd>
                <kbd className="study-overlay-kbd ml-0.5">→</kbd> navigate
                <span className="mx-2 study-overlay-muted">•</span>
                <kbd className="study-overlay-kbd">P</kbd> play/pause
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </StudyLayout>
  );
}
