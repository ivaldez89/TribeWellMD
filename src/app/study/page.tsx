'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { DeckFilterPanel } from '@/components/deck/DeckFilterPanel';
import { CardEditor } from '@/components/deck/CardEditor';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { recordCardReview, AchievementNotification } from '@/components/study/StudyStats';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import { SpotifyWidget } from '@/components/music/SpotifyWidget';
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import { ExamCountdown } from '@/components/study/ExamCountdown';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useMissedConcepts } from '@/hooks/useMissedConcepts';
import { QBankLookup } from '@/components/study/QBankLookup';
import { shelfCategories, topicCategories } from '@/data/tribewellmd-library';
import type { Rating, Flashcard } from '@/types';

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

// Study music streams - verified reliable radio stations
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Beats', emoji: '🎧', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
  { id: 'classical', name: 'Classical', emoji: '🎻', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', emoji: '🎹', url: 'https://pianosolo.streamguys1.com/live' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', url: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
  { id: 'nature', name: 'Nature Sounds', emoji: '🌿', url: 'https://ice5.somafm.com/dronezone-128-mp3' },
  { id: 'focus', name: 'Deep Focus', emoji: '🧠', url: 'https://ice5.somafm.com/deepspaceone-128-mp3' },
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

export default function StudyPage() {
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
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [cramMode, setCramMode] = useState(false);
  const [cramIndex, setCramIndex] = useState(0);
  const [cramRevealed, setCramRevealed] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [showQBankLookup, setShowQBankLookup] = useState(false);

  // Missed concepts tracking
  const {
    getStats: getMissedStats,
    getHighPriorityConcepts,
    getDueConceptsToday,
    recordMissedConcept
  } = useMissedConcepts();

  const missedStats = getMissedStats();
  const priorityConcepts = getHighPriorityConcepts(3);
  const dueConceptsCount = getDueConceptsToday().length;

  // Cram mode: cards with lapses (cards user got wrong before)
  const cramCards = cards.filter(card => card.spacedRepetition.lapses > 0);
  const currentCramCard = cramMode ? cramCards[cramIndex] : null;

  // Study background state (with custom background support)
  const { selectedBackground, setSelectedBackground, opacity, setOpacity, customBackgroundUrl, setCustomBackgroundUrl } = useStudyBackground();

  // Ambient sound state - default to max volume
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const noiseGenRef = useRef<NoiseGenerator | null>(null);

  // Music stream state - default to max volume
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(1.0);
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

  const handleStartStudying = () => {
    setIsStudying(true);
    if (filteredDueCards.length > 0 && !session) {
      startSession();
    }
  };

  const handleEndSession = () => {
    setIsStudying(false);
    endSession();
  };

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

  const handleBack = () => {
    if (currentIndex > 0) {
      goToCard(currentIndex - 1);
    }
  };

  const handleRateCard = (rating: Rating) => {
    const { newAchievements } = recordCardReview();

    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      <Header stats={stats} />

      {/* Background overlay when studying */}
      {isStudying && selectedBackground !== 'none' && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{
            top: '64px',
            backgroundImage: `url(${getBackgroundUrl(selectedBackground, customBackgroundUrl)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundAttachment: 'fixed',
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        {/* Main Navigation and Study Dashboard */}
        {!isStudying && (
          <>
            {/* Hero Study Section - Primary CTA */}
            <section className="mb-8">
              <div className={`relative overflow-hidden rounded-3xl ${
                stats.dueToday > 0
                  ? 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600'
                  : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600'
              } p-8 md:p-10 shadow-2xl`}>
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
                      {stats.dueToday > 0 ? (
                        <>
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <span>{filteredDueCards.length} cards waiting for you</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>You're all caught up!</span>
                        </>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                      {stats.dueToday > 0 ? (
                        <>Ready to <span className="text-yellow-300">Study</span>?</>
                      ) : (
                        <>Great Job! <span className="text-yellow-300">Rest Up</span></>
                      )}
                    </h1>

                    <p className="text-white/80 text-lg max-w-md">
                      {stats.dueToday > 0
                        ? "Your spaced repetition cards are ready. Every review strengthens your memory."
                        : "Come back later when more cards are due. Consistency is key!"
                      }
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 mt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{stats.dueToday}</p>
                        <p className="text-white/60 text-sm">Due Today</p>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{stats.totalCards}</p>
                        <p className="text-white/60 text-sm">Total Cards</p>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{stats.averageEase.toFixed(0)}%</p>
                        <p className="text-white/60 text-sm">Avg Ease</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - CTA Button */}
                  <div className="flex flex-col items-center gap-4">
                    {filteredDueCards.length > 0 ? (
                      <button
                        onClick={handleStartStudying}
                        className="group relative px-10 py-5 bg-white hover:bg-yellow-50 text-slate-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                      >
                        <span className="flex items-center gap-3">
                          Start Studying
                          <span className="px-3 py-1 bg-teal-500 text-white text-base rounded-full">
                            {filteredDueCards.length}
                          </span>
                          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </button>
                    ) : (
                      <div className="px-10 py-5 bg-white/20 backdrop-blur text-white font-semibold text-xl rounded-2xl flex items-center gap-3">
                        <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Done for Now
                      </div>
                    )}

                    {/* Exam countdown inline */}
                    <ExamCountdown variant="compact" />
                  </div>
                </div>

                {/* Filter toggle at bottom */}
                {stats.dueToday > 0 && (
                  <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium">{showFilters ? 'Hide filters' : 'Filter cards'}</span>
                        {hasActiveFilters && (
                          <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">
                            Active
                          </span>
                        )}
                      </button>

                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    {showFilters && (
                      <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-xl">
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
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions Bar */}
            <section className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/study/progress"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </Link>
                <Link
                  href="/study/rapid-review"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Rapid Review
                </Link>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse content below to add more cards
              </p>
            </section>

            {/* Main Navigation Tabs */}
            <section className="mb-8">
              <div className="grid grid-cols-4 gap-4">
                {/* Shelf Exams */}
                <Link
                  href="/library?view=shelves"
                  className="group relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Shelf Exams</h3>
                    <p className="text-white/70 text-sm">{shelfCategories.length} rotations</p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>

                {/* Topics */}
                <Link
                  href="/library?view=topics"
                  className="group relative p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Topics</h3>
                    <p className="text-white/70 text-sm">{topicCategories.length} systems</p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>

                {/* AI Generate */}
                <Link
                  href="/generate"
                  className="group relative p-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                      AI Generate
                      <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded-full">NEW</span>
                    </h3>
                    <p className="text-white/70 text-sm">From your notes</p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>

                {/* Import Cards */}
                <Link
                  href="/import"
                  className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-500 flex items-center justify-center mb-4 transition-colors">
                      <svg className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Import Cards</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Your own decks</p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              </div>
            </section>

            {/* QBank Lookup - Compact */}
            <section className="mb-8">
              <button
                onClick={() => setShowQBankLookup(!showQBankLookup)}
                className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  showQBankLookup
                    ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">QBank Lookup</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Find concepts for missed questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {missedStats.totalTracked > 0 && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                      {missedStats.totalTracked} tracked
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showQBankLookup ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded QBank Lookup */}
              {showQBankLookup && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <QBankLookup />

                  {/* Missed Concepts Summary */}
                  {missedStats.totalTracked > 0 && priorityConcepts.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm flex items-center gap-2">
                          Weak Concepts
                          {dueConceptsCount > 0 && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                              {dueConceptsCount} due
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {priorityConcepts.slice(0, 3).map(({ conceptCode, missCount, concept }) => (
                          <div
                            key={conceptCode}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-amber-200 dark:border-amber-700"
                          >
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {concept?.name || conceptCode}
                              </p>
                              <p className="text-xs text-teal-600 dark:text-teal-400">
                                {concept?.clinicalDecision}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded">
                              {missCount}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* Active Study Session */}
        {isStudying && (
          <>
            {/* Session toolbar */}
            <div className="relative z-[60] mb-6 flex items-center justify-between flex-wrap gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700">
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
                  <div className="flex items-center gap-2 text-sm px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filtered</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <PomodoroTimer />
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
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                      : cramCards.length > 0
                        ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  title={cramCards.length === 0 ? 'No cards to cram' : `Cram ${cramCards.length} missed cards`}
                >
                  <span className="text-base">🔥</span>
                  <span>Cram</span>
                  {cramCards.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      cramMode ? 'bg-orange-200 dark:bg-orange-800' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      {cramCards.length}
                    </span>
                  )}
                </button>

                {/* Audio button with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowAmbient(!showAmbient)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      showAmbient || isPlaying || isMusicPlaying
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
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

                  {/* Audio Dropdown Panel */}
                  {showAmbient && (
                    <>
                      {/* Backdrop to close panel */}
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowAmbient(false)}
                      />

                      {/* Dropdown panel */}
                      <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-[110] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>🎵</span>
                              <span>Audio</span>
                            </h3>
                            {(isPlaying || isMusicPlaying) && (
                              <button
                                onClick={stopAll}
                                className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              >
                                Stop
                              </button>
                            )}
                          </div>

                          {/* Ambient Sounds Grid */}
                          <div className="mb-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ambient</p>
                            <div className="grid grid-cols-4 gap-2">
                              {AMBIENT_SOUNDS.map((sound) => (
                                <button
                                  key={sound.id}
                                  onClick={() => playSound(sound.id)}
                                  className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                    currentSound === sound.id && isPlaying
                                      ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500'
                                      : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-600'
                                  }`}
                                  title={sound.name}
                                >
                                  <span className="text-lg">{sound.emoji}</span>
                                  <span className="text-[10px] truncate w-full text-center text-slate-600 dark:text-slate-300">{sound.name.split(' ')[0]}</span>
                                  {currentSound === sound.id && isPlaying && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Volume slider for ambient */}
                          {isPlaying && (
                            <div className="flex items-center gap-2 mb-3 px-1">
                              <span className="text-xs text-slate-400">Vol</span>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                              <span className="text-xs text-slate-500 w-8">{Math.round(volume * 100)}%</span>
                            </div>
                          )}

                          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

                          {/* Music Streams Grid */}
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Music</p>
                            <div className="grid grid-cols-4 gap-2">
                              {MUSIC_STREAMS.map((music) => (
                                <button
                                  key={music.id}
                                  onClick={() => playMusic(music.id)}
                                  disabled={isMusicLoading && currentMusic !== music.id}
                                  className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                    currentMusic === music.id && (isMusicPlaying || isMusicLoading)
                                      ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500'
                                      : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-600'
                                  } ${isMusicLoading && currentMusic !== music.id ? 'opacity-50' : ''}`}
                                  title={music.name}
                                >
                                  <span className="text-lg">{music.emoji}</span>
                                  <span className="text-[10px] truncate w-full text-center text-slate-600 dark:text-slate-300">{music.name.split(' ')[0]}</span>
                                  {currentMusic === music.id && isMusicLoading && (
                                    <span className="absolute top-1 right-1 w-2 h-2 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                  )}
                                  {currentMusic === music.id && isMusicPlaying && !isMusicLoading && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Volume slider for music */}
                          {isMusicPlaying && (
                            <div className="flex items-center gap-2 mt-3 px-1">
                              <span className="text-xs text-slate-400">Vol</span>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                              <span className="text-xs text-slate-500 w-8">{Math.round(musicVolume * 100)}%</span>
                            </div>
                          )}

                          <p className="mt-3 text-[10px] text-slate-400">
                            Use headphones for binaural beats (Focus 40Hz)
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  opacity={opacity}
                  onBackgroundChange={setSelectedBackground}
                  onOpacityChange={setOpacity}
                  customBackgroundUrl={customBackgroundUrl}
                  onCustomBackgroundChange={setCustomBackgroundUrl}
                  variant="light"
                />

                {/* Spotify Widget */}
                <SpotifyWidget variant="compact" />

                {/* Calendar Widget */}
                <CalendarWidget variant="compact" />

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>

                <button
                  onClick={handleEndSession}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Filter panel in session */}
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
            {cramMode && currentCramCard && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h2 className="font-semibold text-orange-900 dark:text-orange-100">Cram Mode</h2>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Cards you've missed before</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {cramIndex + 1} of {cramCards.length}
                    </span>
                    <button
                      onClick={() => {
                        setCramMode(false);
                        setCramIndex(0);
                        setCramRevealed(false);
                      }}
                      className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      Exit Cram
                    </button>
                  </div>
                </div>

                <FlashcardViewer
                  card={currentCramCard}
                  isRevealed={cramRevealed}
                  onReveal={() => setCramRevealed(true)}
                  onEdit={() => {}}
                  onBack={cramIndex > 0 ? () => { setCramIndex(cramIndex - 1); setCramRevealed(false); } : undefined}
                  cardNumber={cramIndex + 1}
                  totalCards={cramCards.length}
                />

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

                <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  <span>This card has been missed {currentCramCard.spacedRepetition.lapses} time{currentCramCard.spacedRepetition.lapses !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Regular Flashcard */}
            {!cramMode && filteredDueCards.length > 0 && currentCard && (
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

                <AnswerButtons
                  onRate={handleRateCard}
                  disabled={!isRevealed}
                  intervalPreview={intervalPreview}
                />
              </>
            )}

            {/* Session complete */}
            {!cramMode && filteredDueCards.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">All Caught Up! 🎉</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Great work! Come back later for your next review.</p>

                {session && session.cardsReviewed > 0 && (
                  <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm inline-block">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Session Summary</h3>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{session.cardsReviewed}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Reviewed</p>
                      </div>
                      <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-600">{session.cardsCorrect}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Correct</p>
                      </div>
                      <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{session.cardsFailed}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Again</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleEndSession}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            )}

            {/* Keyboard shortcuts */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Space</kbd> to reveal
                <span className="mx-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">1-4</kbd> to rate
                {cramMode && (
                  <>
                    <span className="mx-2">•</span>
                    <kbd className="px-1.5 py-0.5 bg-orange-200 dark:bg-orange-800 rounded text-xs font-mono">Esc</kbd> exit cram
                  </>
                )}
              </p>
            </div>
          </>
        )}
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

      {/* Footer - only show when not studying */}
      {!isStudying && <Footer />}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, subValue, icon, highlight }: StatCardProps) {
  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-300
      ${highlight
        ? 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${highlight ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
        `}>
          {icon}
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            {subValue && <span className="text-sm text-slate-400">{subValue}</span>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
