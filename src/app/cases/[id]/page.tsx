'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useVignette } from '@/hooks/useVignette';
import { VignetteViewer } from '@/components/vignettes/VignetteViewer';
import { VignetteProgress } from '@/components/vignettes/VignetteProgress';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import { useStreak } from '@/hooks/useStreak';

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', emoji: '📻' },
  { id: 'pinknoise', name: 'Pink Noise', emoji: '🩷' },
  { id: 'brownnoise', name: 'Brown Noise', emoji: '🟤' },
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'wind', name: 'Wind', emoji: '💨' },
  { id: 'binaural', name: 'Focus 40Hz', emoji: '🧠' },
];

// Study music streams
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

export default function CasePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const vignetteId = params.id as string;

  const {
    vignette,
    currentNode,
    session,
    isLoading,
    error,
    isComplete,
    nodeCount,
    currentNodeIndex,
    selectedChoice,
    showFeedback,
    nodeHistory,
    startVignette,
    makeChoice,
    continueAfterFeedback,
    retryCurrentQuestion,
    restartVignette,
    endSession
  } = useVignette(vignetteId);

  // Streak/XP system
  const { addXP } = useStreak();

  // Study background state
  const { selectedBackground, setSelectedBackground, opacity, setOpacity } = useStudyBackground();

  // Audio state
  const [showAudio, setShowAudio] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const noiseGenRef = useRef<NoiseGenerator | null>(null);
  const audioPanelRef = useRef<HTMLDivElement>(null);
  const audioButtonRef = useRef<HTMLButtonElement>(null);

  // Music stream state
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Show progress view after completion
  const [showProgress, setShowProgress] = useState(false);

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

  // Close audio panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showAudio &&
        audioPanelRef.current &&
        audioButtonRef.current &&
        !audioPanelRef.current.contains(event.target as Node) &&
        !audioButtonRef.current.contains(event.target as Node)
      ) {
        setShowAudio(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAudio]);

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

  // Start the vignette when loaded
  useEffect(() => {
    if (vignette && !session) {
      startVignette();
    }
  }, [vignette, session, startVignette]);

  const handleBack = () => {
    stopAll();
    if (session) {
      endSession();
    }
    router.push('/cases');
  };

  const handleRestart = () => {
    setShowProgress(false);
    restartVignette();
  };

  const handleFinish = () => {
    // Award XP for completing the case (bonus for optimal path)
    const baseXP = 25;
    const optimalBonus = session?.completedOptimally ? 15 : 0;
    addXP(baseXP + optimalBonus, 'Case completion');

    stopAll();
    endSession();
    router.push('/cases');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading case...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vignette) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary mb-2">Case Not Found</h2>
            <p className="text-content-muted mb-6">{error || 'The requested case could not be loaded.'}</p>
            <button
              onClick={() => router.push('/cases')}
              className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors"
            >
              Back to Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentNode || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Starting case...</p>
          </div>
        </div>
      </div>
    );
  }

  // Outcome screen
  if (isComplete && !showFeedback) {
    const wasOptimal = session.completedOptimally;

    return (
      <div className="min-h-screen bg-background relative">
        <Header />

        {/* Background */}
        {selectedBackground !== 'none' && (
          <div
            className="fixed inset-0 bg-no-repeat transition-opacity duration-500 pointer-events-none"
            style={{
              top: '64px',
              backgroundImage: `url(${getBackgroundUrl(selectedBackground)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: opacity,
              zIndex: 0
            }}
          />
        )}

        <div className="relative z-10 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Case toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 text-content-muted hover:text-secondary hover:bg-surface/80 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-secondary">{vignette.title}</h1>
              </div>
              <BackgroundSelector
                selectedBackground={selectedBackground}
                opacity={opacity}
                onBackgroundChange={setSelectedBackground}
                onOpacityChange={setOpacity}
                variant="light"
              />
            </div>

            {showProgress ? (
              <div className="bg-surface/95 backdrop-blur rounded-2xl shadow-xl shadow-border/50 border border-border p-6 md:p-8">
                <VignetteProgress session={session} vignette={vignette} />

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 px-6 bg-surface-muted hover:bg-border text-secondary font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish & Return
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface/95 backdrop-blur rounded-2xl shadow-xl shadow-border/50 border border-border overflow-hidden">
                {/* Result header */}
                <div className={`
                  px-6 py-8 text-center
                  ${wasOptimal
                    ? 'bg-gradient-to-r from-forest-500 to-forest-400'
                    : 'bg-gradient-to-r from-sand-500 to-sand-600'
                  }
                `}>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {wasOptimal ? (
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {wasOptimal ? 'Excellent Work!' : 'Case Completed'}
                  </h2>
                  <p className="text-white/80">
                    {wasOptimal
                      ? 'You made optimal choices throughout.'
                      : 'Review your decisions to see where you could improve.'
                    }
                  </p>
                </div>

                {/* Outcome content */}
                <div className="p-6 md:p-8">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-secondary leading-relaxed whitespace-pre-wrap text-[15px]">
                      {currentNode.content}
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-surface-muted rounded-xl">
                      <div className="text-2xl font-bold text-secondary">{session.decisions.length}</div>
                      <div className="text-sm text-content-muted">Decisions</div>
                    </div>
                    <div className="p-4 bg-primary-light rounded-xl">
                      <div className="text-2xl font-bold text-primary">
                        {session.decisions.filter(d => d.wasOptimal).length}
                      </div>
                      <div className="text-sm text-content-muted">Optimal</div>
                    </div>
                    <div className="p-4 bg-secondary-light rounded-xl">
                      <div className="text-2xl font-bold text-secondary">
                        {session.decisions.filter(d => d.wasAcceptable && !d.wasOptimal).length}
                      </div>
                      <div className="text-sm text-content-muted">Acceptable</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowProgress(true)}
                      className="flex-1 py-3 px-6 border border-border hover:border-secondary text-secondary font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={handleRestart}
                      className="flex-1 py-3 px-6 bg-surface-muted hover:bg-border text-secondary font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                    <button
                      onClick={handleFinish}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Finish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Header />

      {/* Background */}
      {selectedBackground !== 'none' && (
        <div
          className="fixed inset-0 bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{
            top: '64px',
            backgroundImage: `url(${getBackgroundUrl(selectedBackground)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}

      {/* Case toolbar */}
      <div className="sticky top-[64px] z-20 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/cases"
              onClick={handleBack}
              className="p-2 -ml-2 text-content-muted hover:text-secondary hover:bg-surface-muted rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-semibold text-secondary text-sm md:text-base line-clamp-1">{vignette.title}</h1>
              <div className="flex items-center gap-2 text-xs text-content-muted">
                <span>{vignette.metadata.system}</span>
                <span>-</span>
                <span>Step {currentNodeIndex + 1} of {nodeCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio dropdown */}
            <div className="relative">
              <button
                ref={audioButtonRef}
                onClick={() => setShowAudio(!showAudio)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showAudio || isPlaying || isMusicPlaying
                    ? 'bg-surface-muted text-secondary'
                    : 'text-content-muted hover:text-secondary hover:bg-surface-muted'
                }`}
              >
                {isPlaying || isMusicPlaying ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
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
                <span className="hidden sm:inline">Audio</span>
              </button>

              {/* Audio dropdown panel */}
              {showAudio && (
                <div
                  ref={audioPanelRef}
                  className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span className="font-semibold text-secondary">Audio</span>
                    </div>
                    {(isPlaying || isMusicPlaying) && (
                      <button
                        onClick={stopAll}
                        className="text-xs px-2 py-1 bg-error-light text-error rounded-lg hover:bg-error/20 transition-colors"
                      >
                        Stop
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {/* Ambient Sounds */}
                    <div>
                      <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">Ambient Sounds</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {AMBIENT_SOUNDS.map((sound) => (
                          <button
                            key={sound.id}
                            onClick={() => playSound(sound.id)}
                            className={`
                              flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center
                              ${currentSound === sound.id && isPlaying
                                ? 'bg-surface-muted border-2 border-secondary shadow-sm'
                                : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'
                              }
                            `}
                          >
                            <span className="text-xl">{sound.emoji}</span>
                            <span className="text-xs font-medium text-secondary leading-tight">{sound.name}</span>
                            {currentSound === sound.id && isPlaying && (
                              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                      {isPlaying && (
                        <div className="flex items-center gap-2 mt-3 px-1">
                          <span className="text-xs text-content-muted">Vol</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                          <span className="text-xs text-content-muted w-8">{Math.round(volume * 100)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Music Streams */}
                    <div>
                      <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">Study Music</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {MUSIC_STREAMS.map((music) => (
                          <button
                            key={music.id}
                            onClick={() => playMusic(music.id)}
                            disabled={isMusicLoading && currentMusic !== music.id}
                            className={`
                              flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center
                              ${currentMusic === music.id && (isMusicPlaying || isMusicLoading)
                                ? 'bg-surface-muted border-2 border-secondary shadow-sm'
                                : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'
                              }
                              ${isMusicLoading && currentMusic !== music.id ? 'opacity-50' : ''}
                            `}
                          >
                            <span className="text-xl">{music.emoji}</span>
                            <span className="text-xs font-medium text-secondary leading-tight">{music.name}</span>
                            {currentMusic === music.id && isMusicLoading && (
                              <span className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                            )}
                            {currentMusic === music.id && isMusicPlaying && !isMusicLoading && (
                              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                      {isMusicPlaying && (
                        <div className="flex items-center gap-2 mt-3 px-1">
                          <span className="text-xs text-content-muted">Vol</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                          <span className="text-xs text-content-muted w-8">{Math.round(musicVolume * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scene selector */}
            <BackgroundSelector
              selectedBackground={selectedBackground}
              opacity={opacity}
              onBackgroundChange={setSelectedBackground}
              onOpacityChange={setOpacity}
              variant="light"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-[1] max-w-4xl mx-auto px-4 py-6">
        <VignetteViewer
          vignette={vignette}
          currentNode={currentNode}
          nodeIndex={currentNodeIndex}
          totalNodes={nodeCount}
          onMakeChoice={makeChoice}
          onContinue={continueAfterFeedback}
          onRetry={retryCurrentQuestion}
          onBack={handleBack}
          selectedChoice={selectedChoice}
          showFeedback={showFeedback}
          isComplete={isComplete}
          history={nodeHistory}
        />
      </main>

      {/* Keyboard shortcuts */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <p className="inline-block px-4 py-2 bg-surface/90 backdrop-blur rounded-full text-xs text-content-muted shadow-sm">
          <kbd className="px-1.5 py-0.5 bg-surface-muted rounded font-mono">1-9</kbd> select choice
          <span className="mx-2">-</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted rounded font-mono">Enter</kbd> continue
        </p>
      </div>
    </div>
  );
}
