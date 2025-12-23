'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useFlashcards } from '@/hooks/useFlashcards';
import { Icons } from '@/components/ui/Icons';

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
    stats
  } = useFlashcards();

  const reviewCards = filteredDueCards.length > 0 ? filteredDueCards : cards.slice(0, 50);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.25); // Default 1.25x speed baseline
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [cardsReviewedThisSession, setCardsReviewedThisSession] = useState(0);
  const [rapidStats, setRapidStats] = useState<RapidReviewStats>({ totalCardsReviewed: 0, totalSessions: 0, lastSessionDate: null, todayCardsReviewed: 0, streak: 0 });

  // Voice selection
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(-1);
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'female' | 'male'>('all');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewedCardsRef = useRef<Set<string>>(new Set());

  const currentCard = reviewCards[currentIndex];

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
      // Filter to English voices and sort by quality indicators
      const englishVoices = availableVoices
        .filter(v => v.lang.startsWith('en'))
        .sort((a, b) => {
          // Prioritize Aaron (en-US) first, then premium/enhanced voices
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

      // Auto-select best voice - prioritize Aaron (en-US) as baseline
      if (englishVoices.length > 0 && selectedVoiceIndex === -1) {
        // Try to find Aaron (en-US) first - this is the baseline default
        const aaronIndex = englishVoices.findIndex(v =>
          v.name.toLowerCase().includes('aaron') && v.lang === 'en-US'
        );
        const siriIndex = englishVoices.findIndex(v => v.name.includes('Siri'));
        const samanthaIndex = englishVoices.findIndex(v => v.name.includes('Samantha'));
        const premiumIndex = englishVoices.findIndex(v => v.name.includes('Premium') || v.name.includes('Enhanced'));

        // Baseline: Aaron (en-US), fallback to other quality voices
        if (aaronIndex >= 0) setSelectedVoiceIndex(aaronIndex);
        else if (siriIndex >= 0) setSelectedVoiceIndex(siriIndex);
        else if (samanthaIndex >= 0) setSelectedVoiceIndex(samanthaIndex);
        else if (premiumIndex >= 0) setSelectedVoiceIndex(premiumIndex);
        else setSelectedVoiceIndex(0);
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
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

  // Guess gender from voice name (heuristic)
  const getVoiceGender = (voice: SpeechSynthesisVoice): 'female' | 'male' | 'unknown' => {
    const name = voice.name.toLowerCase();
    const femaleNames = ['samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'alice', 'allison', 'ava', 'susan', 'zoe', 'nicky', 'siri female', 'female'];
    const maleNames = ['aaron', 'alex', 'daniel', 'fred', 'ralph', 'tom', 'oliver', 'james', 'lee', 'siri male', 'male'];

    if (femaleNames.some(n => name.includes(n))) return 'female';
    if (maleNames.some(n => name.includes(n))) return 'male';
    return 'unknown';
  };

  // Filter voices by gender
  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true;
    return getVoiceGender(v) === voiceFilter;
  });

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
    
    // Use selected voice
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
      } else if (e.code === 'KeyS') {
        stopSpeaking();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, nextCard, prevCard, togglePlay, stopSpeaking, handleReveal]);

  // Speak just the current visible text
  const speakCurrent = () => {
    if (!currentCard) return;
    const text = isRevealed 
      ? currentCard.content.back 
      : currentCard.content.front;
    speak(text);
  };

  // Test current voice
  const testVoice = () => {
    speak("Hello! This is how I sound. Testing one, two, three.");
  };

  // Speed options from 0.5 to 3 in 0.25 increments
  const speedOptions = Array.from({ length: 11 }, (_, i) => 0.5 + (i * 0.25));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#5B7B6D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#6B5344]/80 dark:text-slate-400">Loading rapid review...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reviewCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#5B7B6D]/20 to-[#3D5A4C]/20 dark:from-[#5B7B6D]/30 dark:to-[#3D5A4C]/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#5B7B6D] dark:text-[#6B8B7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#3D5A4C] dark:text-white mb-4">No Cards Available</h1>
            <p className="text-lg text-[#6B5344]/80 dark:text-slate-400 mb-8">Import some cards first to use Rapid Review mode.</p>
            <Link href="/study" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6B5D] hover:to-[#5B7B6D] text-white font-medium rounded-xl transition-colors shadow-lg shadow-[#5B7B6D]/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Study
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 relative">
      <Header />

      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] p-8 md:p-10 shadow-2xl shadow-[#3D5A4C]/20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#F5F0E8]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Title & Stats */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-[#F5F0E8] rounded-full animate-pulse" />
                  <span>Speed through your cards</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  <span className="text-[#F5F0E8]">Rapid</span> Review
                </h1>

                <p className="text-white/80 text-lg max-w-md mb-6">
                  Listen and learn with text-to-speech. Perfect for reviewing on the go or reinforcing concepts.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{cardsReviewedThisSession}</p>
                    <p className="text-white/60 text-xs">This Session</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{rapidStats.todayCardsReviewed}</p>
                    <p className="text-white/60 text-xs">Today</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{rapidStats.totalCardsReviewed}</p>
                    <p className="text-white/60 text-xs">All Time</p>
                  </div>
                  {rapidStats.streak > 1 && (
                    <div className="text-center px-4 py-2 bg-[#3D5A4C]/30 backdrop-blur rounded-xl border border-[#6B8B7D]/50">
                      <p className="text-2xl md:text-3xl font-bold text-[#F5EFE6]">{rapidStats.streak}</p>
                      <p className="text-[#F5EFE6]/60 text-xs">Day Streak</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Back link only */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/study"
                  className="px-4 py-2 bg-white/90 dark:bg-slate-800/90 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors shadow-sm"
                >
                  ← Back to Flashcards
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Text-to-Speech Control Bar - Always visible, collapsible */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm shadow-[#3D5A4C]/5 overflow-hidden">
          {/* Header - always visible */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#F5EFE6] to-[#E8DFD0] dark:from-[#5B7B6D]/20 dark:to-[#3D5A4C]/20 hover:from-[#E8DFD0] hover:to-[#D4C4B0] dark:hover:from-[#5B7B6D]/30 dark:hover:to-[#3D5A4C]/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] flex items-center justify-center text-white shadow-lg shadow-[#5B7B6D]/25">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#3D5A4C] dark:text-white flex items-center gap-2">
                  Text-to-Speech Controls
                  <span className="px-2 py-0.5 text-xs bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/30 text-[#5B7B6D] dark:text-[#E8E0D5] rounded-full">
                    {voices[selectedVoiceIndex]?.name?.split(' ')[0] || 'Default'} @ {speechRate}x
                  </span>
                </h3>
                <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">
                  Listen and learn hands-free • {showSettings ? 'Click to minimize' : 'Click to expand settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick play button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying
                    ? 'bg-red-500 text-white'
                    : 'bg-[#5B7B6D] text-white hover:bg-[#4A6B5D]'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              {/* Expand/collapse arrow */}
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Expanded Settings */}
          {showSettings && (
            <div className="p-4 border-t border-[#D4C4B0]/50 dark:border-slate-700">
              <div className="space-y-4">
                {/* Voice Selection Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gender Filter */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2">Voice Type</label>
                    <div className="flex gap-1">
                      {(['all', 'female', 'male'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setVoiceFilter(filter)}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize flex items-center justify-center gap-1 ${
                            voiceFilter === filter
                              ? 'bg-[#5B7B6D] text-white'
                              : 'bg-[#F5EFE6] dark:bg-slate-700 text-[#6B5344] dark:text-slate-300 hover:bg-[#E8DFD0] dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className="w-4 h-4">{filter === 'all' ? <Icons.Group /> : <Icons.Person />}</span>
                          <span className="capitalize">{filter}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2">
                      Select Voice ({filteredVoices.length} available)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedVoiceIndex}
                        onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 bg-[#F5EFE6] dark:bg-slate-700 text-[#3D5A4C] dark:text-white rounded-lg border border-[#D4C4B0]/50 dark:border-slate-600 focus:border-[#5B7B6D] focus:ring-[#5B7B6D] focus:outline-none text-sm"
                      >
                        {filteredVoices.map((voice, idx) => {
                          const originalIdx = voices.indexOf(voice);
                          const qualityBadge = voice.name.includes('Premium') || voice.name.includes('Enhanced') || voice.name.includes('Siri')
                            ? ' ★' : '';
                          return (
                            <option key={originalIdx} value={originalIdx}>
                              {voice.name}{qualityBadge} ({voice.lang})
                            </option>
                          );
                        })}
                      </select>
                      <button
                        onClick={testVoice}
                        className="px-4 py-2 bg-[#F5EFE6] dark:bg-slate-600 text-[#6B5344] dark:text-white rounded-lg hover:bg-[#E8DFD0] dark:hover:bg-slate-500 transition-colors text-sm font-medium"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>

                {/* Speed and Auto-advance Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Speech Speed - Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2">Speech Speed</label>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F5EFE6] dark:bg-slate-700 text-[#3D5A4C] dark:text-white rounded-lg border border-[#D4C4B0]/50 dark:border-slate-600 focus:border-[#5B7B6D] focus:ring-[#5B7B6D] focus:outline-none text-sm"
                    >
                      {speedOptions.map((speed) => (
                        <option key={speed} value={speed}>
                          {speed.toFixed(2)}x {speed === 1 ? '(Normal)' : speed < 1 ? '(Slow)' : speed >= 2 ? '(Fast)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto Advance */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2">Auto-Advance</label>
                    <button
                      onClick={() => setAutoAdvance(!autoAdvance)}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        autoAdvance
                          ? 'bg-[#5B7B6D] text-white'
                          : 'bg-[#F5EFE6] dark:bg-slate-700 text-[#6B5344] dark:text-slate-300 hover:bg-[#E8DFD0] dark:hover:bg-slate-600'
                      }`}
                    >
                      {autoAdvance ? '✓ Auto-advance On' : 'Auto-advance Off'}
                    </button>
                  </div>

                  {/* Delay */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2">Pause After Answer</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={autoAdvanceDelay}
                        onChange={(e) => setAutoAdvanceDelay(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-[#E8DFD0] dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5B7B6D]"
                      />
                      <span className="text-sm text-[#3D5A4C] dark:text-white font-medium w-12 text-right">{autoAdvanceDelay}s</span>
                    </div>
                  </div>
                </div>

                {/* Voice tip */}
                <p className="text-xs text-[#6B5344]/70 dark:text-slate-400 flex items-start gap-1 pt-2 border-t border-[#D4C4B0]/30 dark:border-slate-700">
                  <span className="w-4 h-4 flex-shrink-0"><Icons.Lightbulb /></span>
                  <span>Tip: On Mac, go to System Settings → Accessibility → Spoken Content → System Voice → Manage Voices to download premium voices like "Siri Voice 1" for the most natural sound.</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 h-2 bg-[#E8DFD0] dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / reviewCards.length) * 100}%` }}
          />
        </div>
        {/* Card Counter */}
        <div className="text-center mb-6">
          <span className="text-[#6B5344]/70 dark:text-slate-400 text-sm">
            Card {currentIndex + 1} of {reviewCards.length}
          </span>
          {currentCard && isRevealed && (
            <span className="ml-3 px-2 py-0.5 text-xs bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/30 text-[#5B7B6D] dark:text-[#E8E0D5] rounded">
              {currentCard.metadata.system}
            </span>
          )}
        </div>

        {/* Card */}
        {currentCard && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 overflow-hidden shadow-xl shadow-[#3D5A4C]/10">
            {/* Question */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-bold bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/30 text-[#5B7B6D] dark:text-[#E8E0D5] rounded-full">
                  IF YOU SEE
                </span>
                {isSpeaking && !isRevealed && (
                  <span className="flex items-center gap-1.5 text-xs text-[#5B7B6D] dark:text-[#6B8B7D]">
                    <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                    Speaking...
                  </span>
                )}
              </div>
              <p className="text-xl md:text-2xl text-[#3D5A4C] dark:text-white leading-relaxed">
                {currentCard.content.front}
              </p>
            </div>

            {/* Reveal Button or Answer */}
            {!isRevealed ? (
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <button
                  onClick={handleReveal}
                  className="w-full py-4 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6B5D] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5B7B6D]/25"
                >
                  <span>Reveal Answer</span>
                  <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs">Space</kbd>
                </button>
              </div>
            ) : (
              <div className="border-t border-[#D4C4B0]/50 dark:border-slate-700">
                <div className="p-6 md:p-8 bg-gradient-to-br from-[#F5EFE6] to-[#E8DFD0] dark:from-[#5B7B6D]/20 dark:to-[#3D5A4C]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-bold bg-[#5B7B6D]/20 dark:bg-[#5B7B6D]/30 text-[#3D5A4C] dark:text-[#D4C4B0] rounded-full">
                      THEN THINK
                    </span>
                    {isSpeaking && isRevealed && (
                      <span className="flex items-center gap-1.5 text-xs text-[#5B7B6D] dark:text-[#6B8B7D]">
                        <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                        Speaking...
                      </span>
                    )}
                  </div>
                  <p className="text-xl md:text-2xl text-[#3D5A4C] dark:text-[#F5EFE6] leading-relaxed whitespace-pre-wrap">
                    {currentCard.content.back}
                  </p>

                  {currentCard.content.explanation && (
                    <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/50 rounded-xl border border-[#D4C4B0]/50 dark:border-[#5B7B6D]">
                      <p className="text-sm text-[#6B5344] dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="w-4 h-4 flex-shrink-0"><Icons.Lightbulb /></span>
                        <span>{currentCard.content.explanation}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {/* Previous */}
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-white dark:bg-slate-800 text-[#6B5344] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5EFE6] dark:hover:bg-slate-700 transition-colors border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm"
            title="Previous card"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Speak Current */}
          <button
            onClick={speakCurrent}
            className={`p-3 rounded-full transition-colors border shadow-sm ${
              isSpeaking
                ? 'bg-[#5B7B6D] text-white border-[#4A6B5D]'
                : 'bg-white dark:bg-slate-800 text-[#6B5344] dark:text-white hover:bg-[#F5EFE6] dark:hover:bg-slate-700 border-[#D4C4B0]/50 dark:border-slate-700'
            }`}
            title="Read aloud"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>

          {/* Play/Pause Auto */}
          <button
            onClick={togglePlay}
            className={`p-4 rounded-full transition-colors shadow-lg ${
              isPlaying
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white hover:from-[#4A6B5D] hover:to-[#5B7B6D] shadow-[#5B7B6D]/30'
            }`}
            title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Stop */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors border border-red-400 shadow-sm"
              title="Stop speaking"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          )}

          {/* Next */}
          <button
            onClick={nextCard}
            disabled={currentIndex === reviewCards.length - 1}
            className="p-3 rounded-full bg-white dark:bg-slate-800 text-[#6B5344] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5EFE6] dark:hover:bg-slate-700 transition-colors border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm"
            title="Next card"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Current voice indicator */}
        {voices[selectedVoiceIndex] && (
          <div className="mt-4 text-center">
            <span className="text-xs text-[#6B5344]/70 dark:text-slate-400 flex items-center justify-center gap-1">
              <span className="w-4 h-4"><Icons.Headphones /></span>
              {voices[selectedVoiceIndex].name} @ {speechRate}x speed
            </span>
          </div>
        )}

        {/* Keyboard shortcuts */}
        <div className="mt-6 text-center text-sm text-[#6B5344]/70 dark:text-slate-400 space-x-3">
          <span><kbd className="px-1.5 py-0.5 bg-[#E8DFD0] dark:bg-slate-700 rounded text-xs border border-[#D4C4B0]/50 dark:border-slate-600">Space</kbd> reveal/next</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#E8DFD0] dark:bg-slate-700 rounded text-xs border border-[#D4C4B0]/50 dark:border-slate-600">←</kbd><kbd className="px-1.5 py-0.5 bg-[#E8DFD0] dark:bg-slate-700 rounded text-xs border border-[#D4C4B0]/50 dark:border-slate-600 ml-0.5">→</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#E8DFD0] dark:bg-slate-700 rounded text-xs border border-[#D4C4B0]/50 dark:border-slate-600">P</kbd> play/pause</span>
        </div>
      </main>
    </div>
  );
}
