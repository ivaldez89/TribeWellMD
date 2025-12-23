'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { DeckFilterPanel } from '@/components/deck/DeckFilterPanel';
import { CardEditor } from '@/components/deck/CardEditor';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { recordCardReview, AchievementNotification } from '@/components/study/StudyStats';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import { ExamCountdown } from '@/components/study/ExamCountdown';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useStreak } from '@/hooks/useStreak';
import { Icons } from '@/components/ui/Icons';
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

// Helper to render audio icons
const AudioIcon = ({ iconId }: { iconId: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    'radio': <Icons.Radio />,
    'pink': <Icons.PinkNoise />,
    'brown': <Icons.BrownNoise />,
    'rain': <Icons.Rain />,
    'wind': <Icons.Wind />,
    'brain': <Icons.Brain />,
    'headphones': <Icons.Headphones />,
    'violin': <Icons.Violin />,
    'piano': <Icons.Piano />,
    'saxophone': <Icons.Saxophone />,
    'wave': <Icons.Wave />,
    'coffee': <Icons.Coffee />,
  };
  return <span className="w-5 h-5 flex items-center justify-center">{iconMap[iconId] || <Icons.Music />}</span>;
};

// Ambient sound definitions - generated using Web Audio API
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', icon: 'radio' },
  { id: 'pinknoise', name: 'Pink Noise', icon: 'pink' },
  { id: 'brownnoise', name: 'Brown Noise', icon: 'brown' },
  { id: 'rain', name: 'Rain', icon: 'rain' },
  { id: 'wind', name: 'Wind', icon: 'wind' },
  { id: 'binaural', name: 'Focus 40Hz', icon: 'brain' },
];

// Study music streams - royalty-free radio stations
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Hip Hop', icon: 'headphones', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'classical', name: 'Classical', icon: 'violin', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', icon: 'piano', url: 'https://streams.ilovemusic.de/iloveradio28.mp3' },
  { id: 'jazz', name: 'Jazz', icon: 'saxophone', url: 'https://streaming.radio.co/s774887f7b/listen' },
  { id: 'ambient', name: 'Ambient', icon: 'wave', url: 'https://streams.ilovemusic.de/iloveradio6.mp3' },
  { id: 'chillout', name: 'Chill Out', icon: 'coffee', url: 'https://streams.ilovemusic.de/iloveradio7.mp3' },
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

  // Streak/XP system
  const { addXP } = useStreak();

  const [showEditor, setShowEditor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Ref for Audio panel to detect outside clicks
  const audioPanelRef = useRef<HTMLDivElement>(null);
  const audioButtonRef = useRef<HTMLButtonElement>(null);
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

  // Close Audio panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showAmbient &&
        audioPanelRef.current &&
        audioButtonRef.current &&
        !audioPanelRef.current.contains(event.target as Node) &&
        !audioButtonRef.current.contains(event.target as Node)
      ) {
        setShowAmbient(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAmbient]);

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

  // Handle card rating with achievement tracking and XP
  const handleRateCard = (rating: Rating) => {
    // Record the review for stats/achievements
    const { newAchievements } = recordCardReview();

    // Show achievement notification if any
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }

    // Award XP based on rating quality (better recall = more XP)
    const xpRewards: Record<Rating, number> = {
      'again': 5,   // Again - still learning
      'hard': 8,    // Hard - some effort
      'good': 10,   // Good - solid recall
      'easy': 12    // Easy - mastered
    };
    addXP(xpRewards[rating], 'Flashcard review');

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
      <div className="min-h-screen flex items-center justify-center bg-[#E8DFD0] dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[#5B7B6D] border-t-transparent rounded-full" />
          <p className="text-[#6B5344]/80 dark:text-slate-400">Loading cards...</p>
        </div>
      </div>
    );
  }

  // No cards due - show completion screen
  if (filteredDueCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900">
        <Header stats={stats} />

        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#5B7B6D]/20 to-[#3D5A4C]/20 dark:from-[#5B7B6D]/30 dark:to-[#3D5A4C]/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {hasActiveFilters && dueCards.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold text-[#3D5A4C] dark:text-white mb-4">
                  No Cards Match Filters
                </h1>
                <p className="text-lg text-[#6B5344]/80 dark:text-slate-400 max-w-md mx-auto mb-6">
                  You have {dueCards.length} cards due, but none match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white font-medium rounded-xl hover:from-[#4A6B5D] hover:to-[#5B7B6D] transition-colors shadow-lg shadow-[#5B7B6D]/20"
                >
                  Clear Filters & Study All
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-[#3D5A4C] dark:text-white mb-4">
                  All Caught Up!
                </h1>
                <p className="text-lg text-[#6B5344]/80 dark:text-slate-400 max-w-md mx-auto">
                  You've reviewed all your due cards. Great work! Come back later for your next review session.
                </p>
              </>
            )}
          </div>
          
          {session && session.cardsReviewed > 0 && (
            <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm shadow-[#3D5A4C]/5 inline-block">
              <h2 className="text-sm font-semibold text-[#6B5344]/80 dark:text-slate-400 uppercase tracking-wide mb-4">
                Session Summary
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#3D5A4C] dark:text-white">{session.cardsReviewed}</p>
                  <p className="text-sm text-[#6B5344]/70 dark:text-slate-400">Reviewed</p>
                </div>
                <div className="w-px h-12 bg-[#D4C4B0]/50 dark:bg-slate-700" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#5B7B6D]">{session.cardsCorrect}</p>
                  <p className="text-sm text-[#6B5344]/70 dark:text-slate-400">Correct</p>
                </div>
                <div className="w-px h-12 bg-[#D4C4B0]/50 dark:bg-slate-700" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{session.cardsFailed}</p>
                  <p className="text-sm text-[#6B5344]/70 dark:text-slate-400">Again</p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5EFE6] hover:bg-[#E8DFD0] dark:bg-slate-700 dark:hover:bg-slate-600 text-[#6B5344] dark:text-slate-300 font-medium rounded-xl transition-colors"
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
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 relative">
      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>
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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2 bg-[#E8DFD0] dark:bg-slate-900 py-2 -mx-4 px-4 -mt-8 pt-8">
          <div className="flex items-center gap-4">
            {session && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#5B7B6D] font-medium">{session.cardsCorrect}</span>
                  <span className="text-[#6B5344]/70 dark:text-slate-400">correct</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500 font-medium">{session.cardsFailed}</span>
                  <span className="text-[#6B5344]/70 dark:text-slate-400">again</span>
                </div>
              </>
            )}
            
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm px-2 py-1 bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/20 text-[#5B7B6D] rounded-lg">
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
                  ? 'bg-[#8B7355]/20 text-[#6B5344] border border-[#8B7355]/30 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
                  : cramCards.length > 0
                    ? 'text-[#6B5344]/70 dark:text-slate-400 hover:text-[#6B5344] dark:hover:text-slate-200 hover:bg-[#F5EFE6] dark:hover:bg-slate-700'
                    : 'text-[#D4C4B0] dark:text-slate-600 cursor-not-allowed'
              }`}
              title={cramCards.length === 0 ? 'No cards to cram - you haven\'t missed any yet!' : `Cram ${cramCards.length} missed cards`}
            >
              <span className="w-4 h-4 text-[#8B7355] dark:text-orange-500"><Icons.Fire /></span>
              <span>Cram</span>
              {cramCards.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  cramMode ? 'bg-[#8B7355]/30 dark:bg-orange-800' : 'bg-[#E8DFD0] dark:bg-slate-700'
                }`}>
                  {cramCards.length}
                </span>
              )}
            </button>

            {/* Sounds & Music button */}
            <button
              ref={audioButtonRef}
              onClick={() => setShowAmbient(!showAmbient)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showAmbient || isPlaying || isMusicPlaying
                  ? 'bg-[#5B7B6D]/20 text-[#3D5A4C] dark:bg-purple-900/30 dark:text-purple-300'
                  : 'text-[#6B5344]/70 dark:text-slate-400 hover:text-[#6B5344] dark:hover:text-slate-200 hover:bg-[#F5EFE6] dark:hover:bg-slate-700'
              }`}
            >
              {isPlaying || isMusicPlaying ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  {isPlaying
                    ? <AudioIcon iconId={AMBIENT_SOUNDS.find(s => s.id === currentSound)?.icon || 'radio'} />
                    : <AudioIcon iconId={MUSIC_STREAMS.find(s => s.id === currentMusic)?.icon || 'headphones'} />
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

            {/* Calendar Widget */}
            <CalendarWidget variant="compact" />

            {/* Toggle filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFilters
                  ? 'bg-[#5B7B6D]/20 text-[#3D5A4C] dark:bg-[#5B7B6D]/30 dark:text-[#6B8B7D]'
                  : 'text-[#6B5344]/70 dark:text-slate-400 hover:text-[#6B5344] dark:hover:text-slate-200 hover:bg-[#F5EFE6] dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            <button
              onClick={endSession}
              className="text-sm text-[#6B5344]/70 dark:text-slate-400 hover:text-[#6B5344] dark:hover:text-slate-200 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Audio Panel - Ambient Sounds & Music */}
        {showAmbient && (
          <div ref={audioPanelRef} className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm shadow-[#3D5A4C]/5">
            {/* Header with Stop button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3D5A4C] dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Sounds & Music
              </h3>
              {(isPlaying || isMusicPlaying) && (
                <button
                  onClick={stopAll}
                  className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Stop All
                </button>
              )}
            </div>

            {/* Ambient Sounds Section */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Icons.Headphones /> Ambient Sounds
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {AMBIENT_SOUNDS.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => playSound(sound.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      currentSound === sound.id && isPlaying
                        ? 'bg-[#5B7B6D]/20 border-2 border-[#5B7B6D] shadow-sm dark:bg-[#5B7B6D]/30'
                        : 'bg-[#F5EFE6] dark:bg-slate-700 border-2 border-transparent hover:bg-[#E8DFD0] dark:hover:bg-slate-600'
                    }`}
                  >
                    <AudioIcon iconId={sound.icon} />
                    <span className="text-xs font-medium text-[#6B5344] dark:text-slate-300">{sound.name}</span>
                    {currentSound === sound.id && isPlaying && (
                      <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {isPlaying && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#6B5344]/60 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-[#D4C4B0]/50 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-[#5B7B6D]"
                  />
                  <span className="text-sm text-[#6B5344]/70 dark:text-slate-400 w-12 text-right">{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#D4C4B0]/50 dark:border-slate-700 my-4" />

            {/* Study Music Section */}
            <div>
              <h4 className="text-sm font-medium text-[#6B5344]/80 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Icons.Music /> Study Music
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {MUSIC_STREAMS.map((music) => (
                  <button
                    key={music.id}
                    onClick={() => playMusic(music.id)}
                    disabled={isMusicLoading && currentMusic !== music.id}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      currentMusic === music.id && (isMusicPlaying || isMusicLoading)
                        ? 'bg-[#6B8B7D]/20 border-2 border-[#6B8B7D] shadow-sm dark:bg-[#6B8B7D]/30'
                        : 'bg-[#F5EFE6] dark:bg-slate-700 border-2 border-transparent hover:bg-[#E8DFD0] dark:hover:bg-slate-600'
                    } ${isMusicLoading && currentMusic !== music.id ? 'opacity-50' : ''}`}
                  >
                    <AudioIcon iconId={music.icon} />
                    <span className="text-xs font-medium text-[#6B5344] dark:text-slate-300">{music.name}</span>
                    {currentMusic === music.id && isMusicLoading && (
                      <span className="w-3 h-3 border-2 border-[#6B8B7D] border-t-transparent rounded-full animate-spin" />
                    )}
                    {currentMusic === music.id && isMusicPlaying && !isMusicLoading && (
                      <span className="w-2 h-2 bg-[#6B8B7D] rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {isMusicPlaying && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#6B5344]/60 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-[#D4C4B0]/50 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-[#6B8B7D]"
                  />
                  <span className="text-sm text-[#6B5344]/70 dark:text-slate-400 w-12 text-right">{Math.round(musicVolume * 100)}%</span>
                </div>
              )}
            </div>

            {/* Tips */}
            <p className="mt-4 text-xs text-[#6B5344]/60 dark:text-slate-500 flex items-start gap-1">
              <span className="w-4 h-4 flex-shrink-0"><Icons.Lightbulb /></span>
              <span>Ambient sounds are generated locally. Music streams from free internet radio stations.
              Use headphones for binaural beats (Focus 40Hz).</span>
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
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-[#C4A77D]/20 to-[#A89070]/20 dark:from-[#8B7355]/30 dark:to-[#6B5344]/30 rounded-xl border border-[#C4A77D]/40 dark:border-[#8B7355]/50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 text-[#8B7355] dark:text-[#C4A77D]"><Icons.Fire /></span>
                <div>
                  <h2 className="font-semibold text-[#6B5344] dark:text-[#C4A77D]">Cram Mode</h2>
                  <p className="text-sm text-[#8B7355] dark:text-[#A89070]">Reviewing cards you've missed before</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#8B7355] dark:text-[#A89070]">
                  {cramIndex + 1} of {cramCards.length}
                </span>
                <button
                  onClick={() => {
                    setCramMode(false);
                    setCramIndex(0);
                    setCramRevealed(false);
                  }}
                  className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#C4A77D]/50 dark:border-[#8B7355]/50 text-[#6B5344] dark:text-[#C4A77D] rounded-lg hover:bg-[#F5EFE6] dark:hover:bg-slate-700 transition-colors"
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
                      className="px-8 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-medium rounded-xl hover:from-[#A89070] hover:to-[#8B7355] transition-all shadow-lg shadow-[#8B7355]/20"
                    >
                      {cramIndex < cramCards.length - 1 ? 'Next Card' : 'Finish Cram'}
                    </button>
                  </div>
                )}

                {/* Card Stats */}
                <div className="mt-4 text-center text-sm text-[#6B5344]/70 dark:text-slate-400">
                  <span>This card has been missed {currentCramCard.spacedRepetition.lapses} time{currentCramCard.spacedRepetition.lapses !== 1 ? 's' : ''}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#6B5344]/70 dark:text-slate-400">No more cards to cram!</p>
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
          <p className="text-sm text-[#6B5344]/60 dark:text-slate-500">
            <kbd className="px-1.5 py-0.5 bg-[#D4C4B0]/50 dark:bg-slate-700 rounded text-xs font-mono text-[#6B5344] dark:text-slate-300">Space</kbd> to reveal
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 bg-[#D4C4B0]/50 dark:bg-slate-700 rounded text-xs font-mono text-[#6B5344] dark:text-slate-300">1-4</kbd> to rate
            {cramMode && (
              <>
                <span className="mx-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-[#C4A77D]/30 dark:bg-[#8B7355]/30 rounded text-xs font-mono text-[#8B7355] dark:text-[#C4A77D]">Esc</kbd> exit cram
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
