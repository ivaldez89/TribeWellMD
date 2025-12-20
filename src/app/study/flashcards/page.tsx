'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { DeckFilterPanel } from '@/components/deck/DeckFilterPanel';
import { CardEditor } from '@/components/deck/CardEditor';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { recordCardReview, AchievementNotification } from '@/components/study/StudyStats';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import { ExamCountdown } from '@/components/study/ExamCountdown';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Rating } from '@/types';

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

// Ambient sound definitions - generated using Web Audio API
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', emoji: '📻' },
  { id: 'pinknoise', name: 'Pink Noise', emoji: '🩷' },
  { id: 'brownnoise', name: 'Brown Noise', emoji: '🟤' },
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'wind', name: 'Wind', emoji: '💨' },
  { id: 'binaural', name: 'Focus 40Hz', emoji: '🧠' },
];

// Study music streams - royalty-free radio stations
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Hip Hop', emoji: '🎧', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'classical', name: 'Classical', emoji: '🎻', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', emoji: '🎹', url: 'https://streams.ilovemusic.de/iloveradio28.mp3' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', url: 'https://streaming.radio.co/s774887f7b/listen' },
  { id: 'ambient', name: 'Ambient', emoji: '🌊', url: 'https://streams.ilovemusic.de/iloveradio6.mp3' },
  { id: 'chillout', name: 'Chill Out', emoji: '☕', url: 'https://streams.ilovemusic.de/iloveradio7.mp3' },
];

// Noise generator using Web Audio API
class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;

  start(type: string, volume: number) {
    this.stop();
    
    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'whitenoise':
        this.createWhiteNoise();
        break;
      case 'pinknoise':
        this.createPinkNoise();
        break;
      case 'brownnoise':
        this.createBrownNoise();
        break;
      case 'rain':
        this.createRain();
        break;
      case 'wind':
        this.createWind();
        break;
      case 'binaural':
        this.createBinaural();
        break;
    }
    
    this.isPlaying = true;
  }

  private createWhiteNoise() {
    if (!this.audioContext || !this.gainNode) return;
    
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createPinkNoise() {
    if (!this.audioContext || !this.gainNode) return;
    
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createBrownNoise() {
    if (!this.audioContext || !this.gainNode) return;
    
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createRain() {
    if (!this.audioContext || !this.gainNode) return;
    
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      
      if (Math.random() > 0.9997) {
        output[i] += (Math.random() - 0.5) * 0.3;
      }
    }
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createWind() {
    if (!this.audioContext || !this.gainNode) return;
    
    const bufferSize = 4 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      const mod = 0.7 + 0.3 * Math.sin(i / (this.audioContext!.sampleRate * 3));
      output[i] *= 3.5 * mod;
    }
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createBinaural() {
    if (!this.audioContext || !this.gainNode) return;
    
    const baseFreq = 200;
    const beatFreq = 40;
    
    const leftOsc = this.audioContext.createOscillator();
    const rightOsc = this.audioContext.createOscillator();
    
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + beatFreq;
    
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    
    const leftPan = this.audioContext.createStereoPanner();
    const rightPan = this.audioContext.createStereoPanner();
    leftPan.pan.value = -1;
    rightPan.pan.value = 1;
    
    leftOsc.connect(leftPan);
    rightOsc.connect(rightPan);
    leftPan.connect(this.gainNode);
    rightPan.connect(this.gainNode);
    
    leftOsc.start();
    rightOsc.start();
    
    this.oscillators = [leftOsc, rightOsc];
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  stop() {
    if (this.noiseNode) {
      this.noiseNode.stop();
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    
    this.oscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    this.oscillators = [];
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isPlaying = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
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
  const [showFilters, setShowFilters] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [cramMode, setCramMode] = useState(false);
  const [cramIndex, setCramIndex] = useState(0);
  const [cramRevealed, setCramRevealed] = useState(false);

  // Cram mode: cards with lapses (cards user got wrong before)
  const cramCards = cards.filter(card => card.spacedRepetition.lapses > 0);
  const currentCramCard = cramMode ? cramCards[cramIndex] : null;

  // Study background state
  const { selectedBackground, setSelectedBackground, opacity, setOpacity } = useStudyBackground();
  
  // Ambient sound state
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const noiseGenRef = useRef<NoiseGenerator | null>(null);

  // Music stream state
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize noise generator
  useEffect(() => {
    noiseGenRef.current = new NoiseGenerator();

    return () => {
      if (noiseGenRef.current) {
        noiseGenRef.current.stop();
      }
    };
  }, []);

  // Initialize audio element for music
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = musicVolume;
    audioRef.current.preload = 'auto';

    // Event listeners for loading state
    const audio = audioRef.current;
    const handleCanPlay = () => setIsMusicLoading(false);
    const handleWaiting = () => setIsMusicLoading(true);
    const handlePlaying = () => setIsMusicLoading(false);
    const handleError = () => {
      setIsMusicLoading(false);
      setIsMusicPlaying(false);
      console.error('Music stream error');
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update sound volume
  useEffect(() => {
    if (noiseGenRef.current && isPlaying) {
      noiseGenRef.current.setVolume(volume);
    }
  }, [volume, isPlaying]);

  // Update music volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Play/pause ambient sound
  const playSound = useCallback((soundId: string) => {
    if (!noiseGenRef.current) return;

    // Stop music if playing
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      setCurrentMusic(null);
    }

    if (currentSound === soundId && isPlaying) {
      noiseGenRef.current.stop();
      setIsPlaying(false);
    } else {
      noiseGenRef.current.stop();
      noiseGenRef.current.start(soundId, volume);
      setCurrentSound(soundId);
      setIsPlaying(true);
    }
  }, [currentSound, isPlaying, volume, isMusicPlaying]);

  // Play/pause music stream
  const playMusic = useCallback((musicId: string) => {
    if (!audioRef.current) return;

    // Stop ambient sound if playing
    if (noiseGenRef.current && isPlaying) {
      noiseGenRef.current.stop();
      setIsPlaying(false);
      setCurrentSound(null);
    }

    if (currentMusic === musicId && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      setIsMusicLoading(false);
    } else {
      const stream = MUSIC_STREAMS.find(s => s.id === musicId);
      if (stream) {
        setIsMusicLoading(true);
        setCurrentMusic(musicId);
        audioRef.current.src = stream.url;
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch((err) => {
          console.error('Failed to play:', err);
          setIsMusicLoading(false);
          setIsMusicPlaying(false);
        });
      }
    }
  }, [currentMusic, isMusicPlaying, isPlaying]);

  const stopSound = useCallback(() => {
    if (noiseGenRef.current) {
      noiseGenRef.current.stop();
    }
    setIsPlaying(false);
    setCurrentSound(null);
  }, []);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsMusicPlaying(false);
    setCurrentMusic(null);
  }, []);

  const stopAll = useCallback(() => {
    stopSound();
    stopMusic();
  }, [stopSound, stopMusic]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 relative">
      <Header stats={stats} />

      {/* Background overlay - positioned below header and toolbar, behind all content */}
      {selectedBackground !== 'none' && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{
            top: '180px', // Below header + toolbar area
            backgroundImage: `url(${getBackgroundUrl(selectedBackground)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundAttachment: 'fixed',
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}

      <main className="relative max-w-5xl mx-auto px-4 py-8" style={{ zIndex: 2 }}>
        {/* Session progress bar - solid background to cover the scene */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2 bg-slate-50 py-2 -mx-4 px-4 -mt-8 pt-8">
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
            
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filtered</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Pomodoro Timer (compact) */}
            <PomodoroTimer />

            {/* Exam Countdown (compact) */}
            <ExamCountdown variant="compact" />

            {/* Cram Mode toggle */}
            <button
              onClick={() => {
                setCramMode(!cramMode);
                setCramIndex(0);
                setCramRevealed(false);
              }}
              disabled={cramCards.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                cramMode
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : cramCards.length > 0
                    ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
              }`}
              title={cramCards.length === 0 ? 'No cards to cram - you haven\'t missed any yet!' : `Cram ${cramCards.length} missed cards`}
            >
              <span className="text-base">🔥</span>
              <span>Cram</span>
              {cramCards.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  cramMode ? 'bg-orange-200' : 'bg-slate-200'
                }`}>
                  {cramCards.length}
                </span>
              )}
            </button>

            {/* Sounds & Music button */}
            <button
              onClick={() => setShowAmbient(!showAmbient)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showAmbient || isPlaying || isMusicPlaying
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isPlaying || isMusicPlaying ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  {isPlaying
                    ? AMBIENT_SOUNDS.find(s => s.id === currentSound)?.emoji
                    : MUSIC_STREAMS.find(s => s.id === currentMusic)?.emoji
                  }
                </span>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              )}
              Audio
            </button>

            {/* Background scene selector */}
            <BackgroundSelector
              selectedBackground={selectedBackground}
              opacity={opacity}
              onBackgroundChange={setSelectedBackground}
              onOpacityChange={setOpacity}
              variant="light"
            />

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

        {/* Audio Panel - Ambient Sounds & Music */}
        {showAmbient && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Header with Stop button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Sounds & Music
              </h3>
              {(isPlaying || isMusicPlaying) && (
                <button
                  onClick={stopAll}
                  className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Stop All
                </button>
              )}
            </div>

            {/* Ambient Sounds Section */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <span>🎧</span> Ambient Sounds
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
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
              {isPlaying && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-sm text-slate-500 w-12 text-right">{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-4" />

            {/* Study Music Section */}
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <span>🎵</span> Study Music
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {MUSIC_STREAMS.map((music) => (
                  <button
                    key={music.id}
                    onClick={() => playMusic(music.id)}
                    disabled={isMusicLoading && currentMusic !== music.id}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      currentMusic === music.id && (isMusicPlaying || isMusicLoading)
                        ? 'bg-indigo-100 border-2 border-indigo-400 shadow-sm'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    } ${isMusicLoading && currentMusic !== music.id ? 'opacity-50' : ''}`}
                  >
                    <span className="text-2xl">{music.emoji}</span>
                    <span className="text-xs font-medium text-slate-600">{music.name}</span>
                    {currentMusic === music.id && isMusicLoading && (
                      <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {currentMusic === music.id && isMusicPlaying && !isMusicLoading && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {isMusicPlaying && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-sm text-slate-500 w-12 text-right">{Math.round(musicVolume * 100)}%</span>
                </div>
              )}
            </div>

            {/* Tips */}
            <p className="mt-4 text-xs text-slate-400">
              💡 Ambient sounds are generated locally. Music streams from free internet radio stations.
              Use headphones for binaural beats (Focus 40Hz).
            </p>
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
        
        {/* Cram Mode UI */}
        {cramMode && (
          <div className="mb-6">
            {/* Cram Mode Header */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <h2 className="font-semibold text-orange-900">Cram Mode</h2>
                  <p className="text-sm text-orange-700">Reviewing cards you've missed before</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-orange-600">
                  {cramIndex + 1} of {cramCards.length}
                </span>
                <button
                  onClick={() => {
                    setCramMode(false);
                    setCramIndex(0);
                    setCramRevealed(false);
                  }}
                  className="text-sm px-3 py-1.5 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
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
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                    >
                      {cramIndex < cramCards.length - 1 ? 'Next Card' : 'Finish Cram'}
                    </button>
                  </div>
                )}

                {/* Card Stats */}
                <div className="mt-4 text-center text-sm text-slate-500">
                  <span>This card has been missed {currentCramCard.spacedRepetition.lapses} time{currentCramCard.spacedRepetition.lapses !== 1 ? 's' : ''}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No more cards to cram!</p>
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

        {/* Keyboard shortcuts help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">Space</kbd> to reveal
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">1-4</kbd> to rate
            {cramMode && (
              <>
                <span className="mx-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-orange-200 rounded text-xs font-mono">Esc</kbd> exit cram
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
    </div>
  );
}
