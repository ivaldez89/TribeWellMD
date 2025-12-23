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
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import { ExamCountdown } from '@/components/study/ExamCountdown';
import { useFlashcards } from '@/hooks/useFlashcards';
import { shelfCategories, topicCategories } from '@/data/tribewellmd-library';
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
    'leaf': <Icons.Leaf />,
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

// Study music streams - verified reliable radio stations
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Beats', icon: 'headphones', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
  { id: 'classical', name: 'Classical', icon: 'violin', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', icon: 'piano', url: 'https://pianosolo.streamguys1.com/live' },
  { id: 'jazz', name: 'Jazz', icon: 'saxophone', url: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
  { id: 'nature', name: 'Nature Sounds', icon: 'leaf', url: 'https://ice5.somafm.com/dronezone-128-mp3' },
  { id: 'focus', name: 'Deep Focus', icon: 'brain', url: 'https://ice5.somafm.com/deepspaceone-128-mp3' },
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
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#E8DFD0] dark:bg-slate-900">
        <div className="animate-spin w-8 h-8 border-4 border-[#5B7B6D] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 relative">
      <Header stats={stats} />

      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>

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
            <section className="mb-8 animate-fade-in-up">
              <div className={`relative rounded-3xl ${
                stats.dueToday > 0
                  ? 'bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F]'
                  : 'bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F]'
              } p-8 md:p-10 shadow-2xl`}>
                {/* Animated background elements - contained with overflow-hidden */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
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
                        <><span className="text-yellow-300">Flashcards</span></>
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

                  {/* Right side - CTA Buttons */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Main Study Button */}
                    {filteredDueCards.length > 0 ? (
                      <button
                        onClick={handleStartStudying}
                        className="group relative w-full min-w-[280px] px-8 py-4 bg-white hover:bg-yellow-50 text-slate-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <span className="flex items-center justify-center gap-3">
                          <svg className="w-5 h-5 text-tribe-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Start Studying
                          <span className="px-2.5 py-0.5 bg-[#5B7B6D] text-white text-sm rounded-full">
                            {filteredDueCards.length}
                          </span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </button>
                    ) : (
                      <div className="w-full min-w-[280px] px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold text-lg rounded-xl flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Done for Now
                      </div>
                    )}

                    {/* Secondary Action - Calendar Widget matching hero width */}
                    <div className="w-full min-w-[280px]">
                      <ExamCountdown variant="expanded" />
                    </div>
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

            {/* 3-Box Navigation Grid - Mirrors Clinical Cases layout */}
            <section className="mb-8 animate-fade-in-up animation-delay-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Box 1: Weak Topics */}
                {(() => {
                  // Calculate weak topics from cards
                  const weakTopics = shelfCategories
                    .map(cat => {
                      const cardsInCategory = cards.filter(c =>
                        c.metadata?.rotation === cat.id ||
                        c.metadata?.tags?.some(t => t.toLowerCase().includes(cat.id.toLowerCase()) || t.toLowerCase().includes(cat.name.toLowerCase()))
                      );
                      const masteredCount = cardsInCategory.filter(c =>
                        c.spacedRepetition.state === 'review' && c.spacedRepetition.ease >= 2.5
                      ).length;
                      const total = cardsInCategory.length;
                      const masteryRate = total > 0 ? masteredCount / total : 0;
                      return { ...cat, masteryRate, total, mastered: masteredCount };
                    })
                    .filter(cat => cat.total > 0 && cat.masteryRate < 0.5)
                    .sort((a, b) => a.masteryRate - b.masteryRate)
                    .slice(0, 3);

                  const hasWeakTopics = weakTopics.length > 0;

                  return (
                    <div
                      className={`group relative p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                        hasWeakTopics
                          ? 'bg-gradient-to-br from-[#A89070] to-[#8B7355] shadow-[#8B7355]/25'
                          : 'bg-gradient-to-br from-[#5B7B6D] to-[#4A6A5C] shadow-[#5B7B6D]/25'
                      } text-white`}
                    >
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      </div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                          {hasWeakTopics ? (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <h3 className="font-bold text-xl mb-1">{hasWeakTopics ? 'Weak Topics' : 'Strong Across Topics'}</h3>
                        <p className="text-white/70 text-sm mb-3">
                          {hasWeakTopics ? 'Areas that need more practice' : 'Great job on all topics!'}
                        </p>
                        {hasWeakTopics ? (
                          <div className="space-y-1">
                            {weakTopics.map((topic) => (
                              <div key={topic.id} className="flex items-center gap-2 text-sm">
                                <span>{topic.icon}</span>
                                <span className="text-white/80">{topic.name}</span>
                                <span className="text-white/50 text-xs">({Math.round(topic.masteryRate * 100)}%)</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/60 text-sm">Keep up the great work!</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Box 2: Browse Cards by Shelf / Topic */}
                <div className="relative p-6 bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] rounded-2xl shadow-lg shadow-[#5B7B6D]/25 text-white z-20">
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  </div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl mb-1">Browse Cards</h3>
                    <p className="text-white/70 text-sm mb-4">Find by shelf or topic</p>

                    {/* Dropdown Buttons */}
                    <div className="space-y-2">
                      {/* Shelf Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowShelfDropdown(!showShelfDropdown);
                            setShowTopicDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                        >
                          <span>By Shelf Exam</span>
                          <svg className={`w-4 h-4 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Topic Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowTopicDropdown(!showTopicDropdown);
                            setShowShelfDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
                        >
                          <span>By Topic</span>
                          <svg className={`w-4 h-4 transition-transform ${showTopicDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shelf Dropdown Menu */}
                  {showShelfDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowShelfDropdown(false)}
                      />
                      <div className="absolute left-6 right-6 top-[calc(100%-3.5rem)] mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                        {shelfCategories.map((shelf) => (
                          <Link
                            key={shelf.id}
                            href={`/library?category=${shelf.id}`}
                            onClick={() => setShowShelfDropdown(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-slate-900 dark:text-white first:rounded-t-xl last:rounded-b-xl"
                          >
                            <span className="text-lg">{shelf.icon}</span>
                            <span className="text-sm font-medium">{shelf.name}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Topic Dropdown Menu */}
                  {showTopicDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowTopicDropdown(false)}
                      />
                      <div className="absolute left-6 right-6 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] max-h-64 overflow-y-auto">
                        {topicCategories.slice(0, 10).map((topic) => (
                          <Link
                            key={topic.id}
                            href={`/library?topic=${topic.id}`}
                            onClick={() => setShowTopicDropdown(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-slate-900 dark:text-white first:rounded-t-xl last:rounded-b-xl"
                          >
                            <span className="text-lg">{topic.icon}</span>
                            <span className="text-sm font-medium">{topic.name}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Box 3: Your Progress */}
                <Link
                  href="/study/progress"
                  className="group relative p-6 bg-gradient-to-br from-[#5B7B6D] to-[#4A6A5C] rounded-2xl shadow-lg shadow-[#5B7B6D]/25 hover:shadow-[#5B7B6D]/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl mb-1">Your Progress</h3>
                    <p className="text-white/70 text-sm mb-3">Track your mastery</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${stats.totalCards > 0 ? Math.round((stats.reviewCards / stats.totalCards) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">{stats.reviewCards} mastered</span>
                      <span className="font-bold">{stats.totalCards > 0 ? Math.round((stats.reviewCards / stats.totalCards) * 100) : 0}%</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              </div>
            </section>

            {/* Daily Challenge Section */}
            {cards.length > 0 && (
              <section className="mb-8 animate-fade-in-up animation-delay-200">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A89070] via-[#8B7355] to-[#7A6348] p-6 shadow-lg">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#C4A77D]/20 rounded-full blur-2xl" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-white">Daily Challenge</h3>
                          <span className="px-2 py-0.5 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                            +50 XP Bonus
                          </span>
                        </div>
                        <p className="text-white/80 text-sm">
                          Complete 20 cards today to earn bonus XP
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleStartStudying}
                      disabled={filteredDueCards.length === 0}
                      className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all ${
                        filteredDueCards.length > 0
                          ? 'bg-white hover:bg-[#F5F0E8] text-[#8B7355] hover:scale-105'
                          : 'bg-white/30 text-white/60 cursor-not-allowed'
                      }`}
                    >
                      {filteredDueCards.length > 0 ? 'Start Challenge' : 'No Cards Due'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Secondary Actions Row */}
            <section className="mb-8 animate-fade-in-up animation-delay-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Rapid Review */}
                <Link
                  href="/study/rapid-review"
                  className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 hover:border-[#8B7355] dark:hover:border-[#C4A77D] hover:shadow-lg hover:shadow-[#8B7355]/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A89070] to-[#8B7355] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D5A4C] dark:text-white text-sm group-hover:text-[#8B7355] dark:group-hover:text-[#C4A77D] transition-colors">Rapid Review</h3>
                    <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Audio TTS mode</p>
                  </div>
                </Link>

                {/* AI Generate */}
                <Link
                  href="/generate"
                  className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 hover:border-[#5B7B6D] dark:hover:border-[#7FA08F] hover:shadow-lg hover:shadow-[#5B7B6D]/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B8B7D] to-[#5B7B6D] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D5A4C] dark:text-white text-sm group-hover:text-[#5B7B6D] dark:group-hover:text-[#7FA08F] transition-colors">AI Generate</h3>
                    <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">From your notes</p>
                  </div>
                </Link>

                {/* Import Cards */}
                <Link
                  href="/import"
                  className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 hover:border-[#5B7B6D] dark:hover:border-[#7FA08F] hover:shadow-lg hover:shadow-[#5B7B6D]/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D5A4C] dark:text-white text-sm group-hover:text-[#5B7B6D] dark:group-hover:text-[#7FA08F] transition-colors">Import Cards</h3>
                    <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Anki or CSV</p>
                  </div>
                </Link>

                {/* Card Library */}
                <Link
                  href="/library"
                  className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 hover:border-[#8B7355] dark:hover:border-[#A89070] hover:shadow-lg hover:shadow-[#8B7355]/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#6B5A48] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D5A4C] dark:text-white text-sm group-hover:text-[#8B7355] dark:group-hover:text-[#C4A77D] transition-colors">Card Library</h3>
                    <p className="text-xs text-[#6B5344]/70 dark:text-slate-400">Browse all cards</p>
                  </div>
                </Link>
              </div>
            </section>
          </>
        )}

        {/* Active Study Session */}
        {isStudying && (
          <>
            {/* Session toolbar */}
            <div className="relative z-[60] mb-6 flex items-center justify-between flex-wrap gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur py-3 px-4 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 shadow-sm shadow-[#3D5A4C]/5">
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
                  <span className="w-4 h-4 text-orange-500"><Icons.Fire /></span>
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
                              <Icons.Music />
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
                                  <AudioIcon iconId={sound.icon} />
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
                                  <AudioIcon iconId={music.icon} />
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
                    <span className="w-8 h-8 text-orange-500"><Icons.Fire /></span>
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
                  <svg className="w-12 h-12 text-tribe-sage-600 dark:text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">All Caught Up!</h2>
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
                        <p className="text-3xl font-bold text-tribe-sage-600">{session.cardsCorrect}</p>
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
          ${highlight ? 'bg-tribe-sage-100 dark:bg-tribe-sage-900/50 text-tribe-sage-600 dark:text-tribe-sage-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
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
