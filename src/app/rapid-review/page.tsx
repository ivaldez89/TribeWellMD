'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useFlashcards } from '@/hooks/useFlashcards';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';

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

  // Study background state
  const { selectedBackground, setSelectedBackground, opacity, setOpacity } = useStudyBackground();
  
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4A77D] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (reviewCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F0E8]">
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#8B7355] mb-4">No Cards Available</h1>
          <p className="text-[#A89070] mb-6">Import some cards first to use Rapid Review mode.</p>
          <Link href="/" className="text-[#C4A77D] hover:underline">← Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E0D5] via-[#F5F0E8] to-[#E8E0D5] relative">
      {/* Background overlay - positioned below header/stats bar */}
      {selectedBackground !== 'none' && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-no-repeat transition-opacity duration-500"
          style={{
            top: '100px', // Below header + stats bar
            backgroundImage: `url(${getBackgroundUrl(selectedBackground)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom', // Anchor to bottom so beach/horizon stays visible
            backgroundAttachment: 'fixed', // Prevents shifting when scrolling/resizing
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}

      {/* Header */}
      <header className="border-b border-[#D4C4B0] bg-[#F5F0E8]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#8B7355] hover:text-[#C4A77D] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          <h1 className="text-lg font-semibold text-[#8B7355] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Rapid Review
          </h1>

          <div className="flex items-center gap-2">
            {/* Background scene selector */}
            <BackgroundSelector
              selectedBackground={selectedBackground}
              opacity={opacity}
              onBackgroundChange={setSelectedBackground}
              onOpacityChange={setOpacity}
              variant="dark"
            />

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-[#C4A77D] text-white' : 'text-[#A89070] hover:text-[#8B7355]'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Session Stats Bar */}
      <div className="border-b border-[#D4C4B0] bg-gradient-to-r from-[#5B7B6D]/10 to-[#C4A77D]/10">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#C4A77D]">⚡</span>
            <span className="text-[#A89070]">This session:</span>
            <span className="font-bold text-[#8B7355]">{cardsReviewedThisSession}</span>
          </div>
          <div className="w-px h-4 bg-[#D4C4B0]" />
          <div className="flex items-center gap-2">
            <span className="text-[#C4A77D]">📅</span>
            <span className="text-[#A89070]">Today:</span>
            <span className="font-bold text-[#8B7355]">{rapidStats.todayCardsReviewed}</span>
          </div>
          <div className="w-px h-4 bg-[#D4C4B0]" />
          <div className="flex items-center gap-2">
            <span className="text-[#C4A77D]">🏆</span>
            <span className="text-[#A89070]">Total:</span>
            <span className="font-bold text-[#8B7355]">{rapidStats.totalCardsReviewed}</span>
          </div>
          {rapidStats.streak > 1 && (
            <>
              <div className="w-px h-4 bg-[#D4C4B0]" />
              <div className="flex items-center gap-2">
                <span className="text-[#5B7B6D]">🔥</span>
                <span className="font-bold text-[#5B7B6D]">{rapidStats.streak} day streak!</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-[#D4C4B0] bg-[#E8E0D5]/90 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="space-y-5">
              {/* Voice Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-medium text-[#A89070] mb-2">Voice Type</label>
                  <div className="flex gap-1">
                    {(['all', 'female', 'male'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setVoiceFilter(filter)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                          voiceFilter === filter
                            ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white'
                            : 'bg-[#D4C4B0] text-[#8B7355] hover:bg-[#C4A77D]/30'
                        }`}
                      >
                        {filter === 'all' ? '👥 All' : filter === 'female' ? '👩 Female' : '👨 Male'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#A89070] mb-2">
                    Select Voice ({filteredVoices.length} available)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 bg-white text-[#8B7355] rounded-lg border border-[#D4C4B0] focus:border-[#C4A77D] focus:ring-[#C4A77D] focus:outline-none text-sm"
                    >
                      {filteredVoices.map((voice, idx) => {
                        const originalIdx = voices.indexOf(voice);
                        const gender = getVoiceGender(voice);
                        const genderIcon = gender === 'female' ? '👩' : gender === 'male' ? '👨' : '🔊';
                        const qualityBadge = voice.name.includes('Premium') || voice.name.includes('Enhanced') || voice.name.includes('Siri')
                          ? ' ⭐' : '';
                        return (
                          <option key={originalIdx} value={originalIdx}>
                            {genderIcon} {voice.name}{qualityBadge} ({voice.lang})
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={testVoice}
                      className="px-4 py-2 bg-[#A89070] text-white rounded-lg hover:bg-[#8B7355] transition-colors text-sm font-medium"
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
                  <label className="block text-xs font-medium text-[#A89070] mb-2">Speech Speed</label>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white text-[#8B7355] rounded-lg border border-[#D4C4B0] focus:border-[#C4A77D] focus:ring-[#C4A77D] focus:outline-none text-sm"
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
                  <label className="block text-xs font-medium text-[#A89070] mb-2">Auto-Advance</label>
                  <button
                    onClick={() => setAutoAdvance(!autoAdvance)}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      autoAdvance
                        ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white'
                        : 'bg-[#D4C4B0] text-[#8B7355] hover:bg-[#C4A77D]/30'
                    }`}
                  >
                    {autoAdvance ? '✓ Auto-advance On' : 'Auto-advance Off'}
                  </button>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-xs font-medium text-[#A89070] mb-2">Pause After Answer</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={autoAdvanceDelay}
                      onChange={(e) => setAutoAdvanceDelay(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-[#D4C4B0] rounded-lg appearance-none cursor-pointer accent-[#5B7B6D]"
                    />
                    <span className="text-sm text-[#8B7355] font-medium w-12 text-right">{autoAdvanceDelay}s</span>
                  </div>
                </div>
              </div>

              {/* Voice tip */}
              <p className="text-xs text-[#A89070]">
                💡 Tip: On Mac, go to System Settings → Accessibility → Spoken Content → System Voice → Manage Voices to download premium voices like "Siri Voice 1" for the most natural sound.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-1 bg-[#E8E0D5]">
        <div
          className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / reviewCards.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card Counter */}
        <div className="text-center mb-6">
          <span className="text-[#A89070] text-sm">
            Card {currentIndex + 1} of {reviewCards.length}
          </span>
          {currentCard && isRevealed && (
            <span className="ml-3 px-2 py-0.5 text-xs bg-[#D4C4B0] text-[#8B7355] rounded">
              {currentCard.metadata.system}
            </span>
          )}
        </div>

        {/* Card */}
        {currentCard && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#D4C4B0] overflow-hidden shadow-2xl">
            {/* Question */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-bold bg-[#C4A77D]/20 text-[#C4A77D] rounded-full">
                  IF YOU SEE
                </span>
                {isSpeaking && !isRevealed && (
                  <span className="flex items-center gap-1.5 text-xs text-[#C4A77D]">
                    <span className="w-2 h-2 bg-[#C4A77D] rounded-full animate-pulse" />
                    Speaking...
                  </span>
                )}
              </div>
              <p className="text-xl md:text-2xl text-[#8B7355] leading-relaxed">
                {currentCard.content.front}
              </p>
            </div>

            {/* Reveal Button or Answer */}
            {!isRevealed ? (
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <button
                  onClick={handleReveal}
                  className="w-full py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C4A77D]/20"
                >
                  <span>Reveal Answer</span>
                  <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs">Space</kbd>
                </button>
              </div>
            ) : (
              <div className="border-t border-[#D4C4B0]">
                <div className="p-6 md:p-8 bg-gradient-to-br from-[#5B7B6D]/10 to-[#C4A77D]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-bold bg-[#5B7B6D]/20 text-[#5B7B6D] rounded-full">
                      THEN THINK
                    </span>
                    {isSpeaking && isRevealed && (
                      <span className="flex items-center gap-1.5 text-xs text-[#5B7B6D]">
                        <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                        Speaking...
                      </span>
                    )}
                  </div>
                  <p className="text-xl md:text-2xl text-[#8B7355] leading-relaxed whitespace-pre-wrap">
                    {currentCard.content.back}
                  </p>

                  {currentCard.content.explanation && (
                    <div className="mt-6 p-4 bg-white/50 rounded-xl border border-[#D4C4B0]">
                      <p className="text-sm text-[#8B7355] leading-relaxed">
                        💡 {currentCard.content.explanation}
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
            className="p-3 rounded-full bg-white text-[#8B7355] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8E0D5] transition-colors border border-[#D4C4B0]"
            title="Previous card"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Speak Current */}
          <button
            onClick={speakCurrent}
            className={`p-3 rounded-full transition-colors border ${
              isSpeaking
                ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white border-[#C4A77D]'
                : 'bg-white text-[#8B7355] hover:bg-[#E8E0D5] border-[#D4C4B0]'
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
                ? 'bg-gradient-to-r from-[#5B7B6D] to-[#2D5A4A] text-white shadow-[#5B7B6D]/30'
                : 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white hover:from-[#A89070] hover:to-[#8B7355] shadow-[#C4A77D]/30'
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
              className="p-3 rounded-full bg-gradient-to-r from-[#5B7B6D] to-[#2D5A4A] text-white hover:from-[#2D5A4A] hover:to-[#5B7B6D] transition-colors border border-[#5B7B6D]"
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
            className="p-3 rounded-full bg-white text-[#8B7355] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8E0D5] transition-colors border border-[#D4C4B0]"
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
            <span className="text-xs text-[#A89070]">
              🔊 {voices[selectedVoiceIndex].name} @ {speechRate}x speed
            </span>
          </div>
        )}

        {/* Keyboard shortcuts */}
        <div className="mt-6 text-center text-sm text-[#A89070] space-x-3">
          <span><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#D4C4B0]">Space</kbd> reveal/next</span>
          <span><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#D4C4B0]">←</kbd><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#D4C4B0] ml-0.5">→</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#D4C4B0]">P</kbd> play/pause</span>
        </div>
      </main>
    </div>
  );
}
