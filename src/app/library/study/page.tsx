'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { AnswerButtons } from '@/components/flashcards/AnswerButtons';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import { ThemeToggleSimple } from '@/components/theme/ThemeProvider';
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import {
  shelfCategories,
  topicCategories,
  getConceptsForSubcategory,
  CardCategory,
  CardSubcategory
} from '@/data/tribewellmd-library';
import { understandingCards, getCardsByConceptCode } from '@/data/understanding-cards';
import { useLibraryProgress } from '@/hooks/useLibraryProgress';
import type { Rating, Flashcard } from '@/types';

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', icon: 'radio' },
  { id: 'pinknoise', name: 'Pink Noise', icon: 'wave' },
  { id: 'brownnoise', name: 'Brown Noise', icon: 'wave-alt' },
  { id: 'rain', name: 'Rain', icon: 'cloud-rain' },
  { id: 'wind', name: 'Wind', icon: 'wind' },
  { id: 'binaural', name: 'Focus 40Hz', icon: 'brain' },
];

// Music streams
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Beats', icon: 'headphones', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
  { id: 'classical', name: 'Classical', icon: 'music-note', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', icon: 'music', url: 'https://pianosolo.streamguys1.com/live' },
  { id: 'jazz', name: 'Jazz', icon: 'music-alt', url: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
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

function LibraryStudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subcategoryId = searchParams.get('subcategory');
  const categoryId = searchParams.get('category');
  const viewType = searchParams.get('view') || 'shelves';

  // Find the category and subcategory
  const categories = viewType === 'shelves' ? shelfCategories : topicCategories;
  const category = categories.find(c => c.id === categoryId);
  const subcategory = category?.subcategories?.find(s => s.id === subcategoryId);

  // Get cards for this subcategory
  const concepts = subcategory ? getConceptsForSubcategory(subcategory.id) : [];
  const conceptCodes = concepts.map(c => c.code);
  const studyCards = understandingCards.filter(card =>
    card.metadata.conceptCode && conceptCodes.includes(card.metadata.conceptCode)
  );

  // Study state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);

  // Library progress tracking
  const { recordCardReview, getSubcategoryProgress } = useLibraryProgress();
  const progress = subcategoryId ? getSubcategoryProgress(subcategoryId) : null;

  // Background and audio state
  const { selectedBackground, setSelectedBackground, opacity, setOpacity, customBackgroundUrl, setCustomBackgroundUrl } = useStudyBackground();
  const [showAmbient, setShowAmbient] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const noiseGenRef = useRef<NoiseGenerator | null>(null);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentCard = studyCards[currentIndex];

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

  // Update volumes
  useEffect(() => {
    if (noiseGenRef.current && isPlaying) {
      noiseGenRef.current.setVolume(volume);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Audio controls
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
        }).catch(() => {
          setIsMusicLoading(false);
          setIsMusicPlaying(false);
        });
      }
    }
  }, [currentMusic, isMusicPlaying, isPlaying]);

  const stopAll = useCallback(() => {
    if (noiseGenRef.current) {
      noiseGenRef.current.stop();
    }
    setIsPlaying(false);
    setCurrentSound(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsMusicPlaying(false);
    setCurrentMusic(null);
  }, []);

  // Card navigation
  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRate = (rating: Rating) => {
    if (!currentCard || !subcategoryId) return;

    const isCorrect = rating !== 'again';

    // Record in library progress
    recordCardReview(currentCard.id, subcategoryId, isCorrect);

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    // Move to next card
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsRevealed(false);
    }
  };

  // Handle missing data
  if (!subcategoryId || !category || !subcategory) {
    return (
      <ContentPageLayout mainClassName="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No cards to study</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please select a subcategory from the library.</p>
          <Link
            href="/library"
            className="px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Back to Library
          </Link>
        </div>
      </ContentPageLayout>
    );
  }

  if (studyCards.length === 0) {
    return (
      <ContentPageLayout mainClassName="flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="text-4xl">{category.icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{subcategory.name}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">{subcategory.description}</p>
          <p className="text-amber-600 dark:text-amber-400 mb-6">
            {concepts.length} concepts mapped, but no understanding cards have been generated yet.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/library"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </ContentPageLayout>
    );
  }

  // Session complete
  if (isComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <ContentPageLayout maxWidth="7xl" mainClassName="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E8E0D5] to-[#D4C4B0] dark:from-[#5B7B6D]/30 dark:to-[#2D5A4A]/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#5B7B6D] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {subcategory.name} Complete!
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Great work on {category.name}!
          </p>

          {/* Session Stats */}
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Session Summary</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{sessionStats.reviewed}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Reviewed</p>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#5B7B6D]">{sessionStats.correct}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Correct</p>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">To Review</p>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#5B7B6D]">{accuracy}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Accuracy</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsRevealed(false);
                setIsComplete(false);
                setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Study Again
            </button>
            <Link
              href={`/library?view=${viewType}`}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout
      maxWidth="7xl"
      className="relative"
      mainClassName="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Background overlay - positioned below header, above footer */}
      {selectedBackground !== 'none' && (
        <div
          className="fixed left-0 right-0 top-12 bottom-12 bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `url(${getBackgroundUrl(selectedBackground, customBackgroundUrl)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}
        {/* Session toolbar */}
        <div className="relative z-[60] mb-6 flex items-center justify-between flex-wrap gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/library?view=${viewType}`} className="text-slate-500 hover:text-[#5B7B6D] transition-colors">
              {viewType === 'shelves' ? 'Shelf Exams' : 'Topics'}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
              <span>{category.icon}</span>
              {subcategory.name}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <PomodoroTimer />

            {/* Progress indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
              <span className="text-[#5B7B6D] font-medium">{sessionStats.correct}</span>
              <span className="text-slate-400">/</span>
              <span className="text-red-500 font-medium">{sessionStats.incorrect}</span>
            </div>

            {/* Audio button */}
            <div className="relative">
              <button
                onClick={() => setShowAmbient(!showAmbient)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showAmbient || isPlaying || isMusicPlaying
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <svg className={`w-4 h-4 ${isPlaying || isMusicPlaying ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Audio
              </button>

              {showAmbient && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setShowAmbient(false)} />
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl border z-[110] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Audio</h3>
                        {(isPlaying || isMusicPlaying) && (
                          <button onClick={stopAll} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                            Stop
                          </button>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-2">Ambient</p>
                        <div className="grid grid-cols-3 gap-2">
                          {AMBIENT_SOUNDS.map((sound) => (
                            <button
                              key={sound.id}
                              onClick={() => playSound(sound.id)}
                              className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                currentSound === sound.id && isPlaying
                                  ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500'
                                  : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              <span className="text-[10px] truncate w-full text-center">{sound.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {isPlaying && (
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span className="text-xs text-slate-400">Vol</span>
                          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1.5 accent-purple-500" />
                          <span className="text-xs text-slate-500 w-8">{Math.round(volume * 100)}%</span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

                      <div>
                        <p className="text-xs text-slate-500 mb-2">Music</p>
                        <div className="grid grid-cols-3 gap-2">
                          {MUSIC_STREAMS.map((music) => (
                            <button
                              key={music.id}
                              onClick={() => playMusic(music.id)}
                              className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                currentMusic === music.id && (isMusicPlaying || isMusicLoading)
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500'
                                  : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              <span className="text-[10px] truncate w-full text-center">{music.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {isMusicPlaying && (
                        <div className="flex items-center gap-2 mt-3 px-1">
                          <span className="text-xs text-slate-400">Vol</span>
                          <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="flex-1 h-1.5 accent-indigo-500" />
                          <span className="text-xs text-slate-500 w-8">{Math.round(musicVolume * 100)}%</span>
                        </div>
                      )}
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

            {/* Day/Night Theme Toggle */}
            <ThemeToggleSimple />

            {/* Calendar Widget */}
            <CalendarWidget variant="compact" />

            <Link
              href={`/library?view=${viewType}`}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              End Session
            </Link>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && (
          <>
            <FlashcardViewer
              card={currentCard}
              isRevealed={isRevealed}
              onReveal={handleReveal}
              onEdit={() => {}}
              onBack={currentIndex > 0 ? handleBack : undefined}
              cardNumber={currentIndex + 1}
              totalCards={studyCards.length}
            />

            <AnswerButtons
              onRate={handleRate}
              disabled={!isRevealed}
            />
          </>
        )}

      {/* Keyboard shortcuts */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Space</kbd> to reveal
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">1-4</kbd> to rate
        </p>
      </div>
    </ContentPageLayout>
  );
}

export default function LibraryStudyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4A77D] border-t-transparent rounded-full" />
      </div>
    }>
      <LibraryStudyContent />
    </Suspense>
  );
}
