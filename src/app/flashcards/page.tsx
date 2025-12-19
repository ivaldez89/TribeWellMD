'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { DeckFilterPanel } from '@/components/deck/DeckFilterPanel';
import { CardEditor } from '@/components/deck/CardEditor';
import { useFlashcards } from '@/hooks/useFlashcards';

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_3b65c15d51.mp3' },
  { id: 'thunder', name: 'Thunder', emoji: '⛈️', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_f2cbc47b97.mp3' },
  { id: 'forest', name: 'Forest', emoji: '🌲', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3' },
  { id: 'fire', name: 'Fireplace', emoji: '🔥', url: 'https://cdn.pixabay.com/audio/2022/11/17/audio_fe4e9cf054.mp3' },
  { id: 'cafe', name: 'Café', emoji: '☕', url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c121d4f7ce.mp3' },
];

export default function FlashcardsPage() {
  const {
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
    previousCard,
    goToCard
  } = useFlashcards();

  const [showEditor, setShowEditor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  
  // Ambient sound state
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play/pause sound
  const playSound = (soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound || !audioRef.current) return;

    if (currentSound === soundId && isPlaying) {
      // Pause current sound
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play new or resume sound
      if (currentSound !== soundId) {
        audioRef.current.src = sound.url;
        setCurrentSound(soundId);
      }
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        console.log('Audio playback failed');
      });
      setIsPlaying(true);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

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

  const hasActiveFilters = 
    filters.tags.length > 0 || 
    filters.systems.length > 0 || 
    filters.rotations.length > 0 ||
    filters.states.length > 0 ||
    filters.difficulties.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
          <p className="text-slate-500">Loading cards...</p>
        </div>
      </div>
    );
  }

  // No cards due - show completion screen
  if (filteredDueCards.length === 0) {
    return (
      <div className="min-h-screen">
        <Header stats={stats} />
        
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {hasActiveFilters && dueCards.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  No Cards Match Filters
                </h1>
                <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
                  You have {dueCards.length} cards due, but none match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters & Study All
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  All Caught Up! 🎉
                </h1>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                  You've reviewed all your due cards. Great work! Come back later for your next review session.
                </p>
              </>
            )}
          </div>
          
          {session && session.cardsReviewed > 0 && (
            <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Session Summary
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{session.cardsReviewed}</p>
                  <p className="text-sm text-slate-500">Reviewed</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{session.cardsCorrect}</p>
                  <p className="text-sm text-slate-500">Correct</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{session.cardsFailed}</p>
                  <p className="text-sm text-slate-500">Again</p>
                </div>
              </div>
            </div>
          )}
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header stats={stats} />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Session progress bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {session && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-600 font-medium">{session.cardsCorrect}</span>
                  <span className="text-slate-400">correct</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500 font-medium">{session.cardsFailed}</span>
                  <span className="text-slate-400">again</span>
                </div>
              </>
            )}
            
            {/* Filter indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filtered</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Ambient sounds button */}
            <button
              onClick={() => setShowAmbient(!showAmbient)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showAmbient || isPlaying
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isPlaying ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  {AMBIENT_SOUNDS.find(s => s.id === currentSound)?.emoji}
                </span>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              )}
              Sounds
            </button>

            {/* Toggle filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            
            <button
              onClick={endSession}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Ambient Sound Panel */}
        {showAmbient && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Ambient Sounds
              </h3>
              {isPlaying && (
                <button
                  onClick={stopSound}
                  className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Stop
                </button>
              )}
            </div>
            
            {/* Sound buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => playSound(sound.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    currentSound === sound.id && isPlaying
                      ? 'bg-purple-100 border-2 border-purple-400 shadow-sm'
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-xs font-medium text-slate-600">{sound.name}</span>
                  {currentSound === sound.id && isPlaying && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Volume control */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-sm text-slate-500 w-12 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* Collapsible filter panel */}
        {showFilters && (
          <div className="mb-6">
            <DeckFilterPanel
              filters={filters}
              availableTags={availableTags}
              availableSystems={availableSystems}
              filteredCount={filteredDueCards.length}
              totalDueCount={dueCards.length}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />
          </div>
        )}
        
        {/* Flashcard */}
        {currentCard && (
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
              onRate={rateCard}
              disabled={!isRevealed}
              intervalPreview={intervalPreview}
            />
          </>
        )}
        
        {/* Keyboard shortcuts help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">Space</kbd> to reveal
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">1-4</kbd> to rate
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
    </div>
  );
}
