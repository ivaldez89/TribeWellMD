'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useContextPanelContext } from './useContextPanel';

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', icon: '📻', description: 'Consistent background noise' },
  { id: 'pinknoise', name: 'Pink Noise', icon: '🌸', description: 'Softer, natural sound' },
  { id: 'brownnoise', name: 'Brown Noise', icon: '🟤', description: 'Deep, rumbling tone' },
  { id: 'rain', name: 'Rain', icon: '🌧️', description: 'Gentle rainfall' },
  { id: 'wind', name: 'Wind', icon: '💨', description: 'Soft breeze' },
  { id: 'binaural', name: 'Focus 40Hz', icon: '🧠', description: 'Binaural beats for concentration' },
];

// Study music streams
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Hip Hop', icon: '🎧', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'classical', name: 'Classical', icon: '🎻', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', icon: '🎹', url: 'https://streams.ilovemusic.de/iloveradio28.mp3' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', url: 'https://streaming.radio.co/s774887f7b/listen' },
  { id: 'ambient', name: 'Ambient', icon: '🌌', url: 'https://streams.ilovemusic.de/iloveradio6.mp3' },
  { id: 'chillout', name: 'Chill Out', icon: '☕', url: 'https://streams.ilovemusic.de/iloveradio7.mp3' },
];

// Noise generator class
class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private oscillators: OscillatorNode[] = [];

  start(type: string, volume: number) {
    this.stop();
    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'whitenoise': this.createWhiteNoise(); break;
      case 'pinknoise': this.createPinkNoise(); break;
      case 'brownnoise': this.createBrownNoise(); break;
      case 'rain': this.createRain(); break;
      case 'wind': this.createWind(); break;
      case 'binaural': this.createBinaural(); break;
    }
  }

  private createWhiteNoise() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
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
      if (Math.random() > 0.9997) output[i] += (Math.random() - 0.5) * 0.3;
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
    if (this.gainNode) this.gainNode.gain.value = volume;
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
  }
}

interface AudioTabProps {
  className?: string;
}

export function AudioTab({ className = '' }: AudioTabProps) {
  const {
    isAudioPlaying,
    setIsAudioPlaying,
    currentAudioId,
    setCurrentAudioId,
    audioVolume,
    setAudioVolume,
  } = useContextPanelContext();

  const noiseGenRef = useRef<NoiseGenerator | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);
  const [isMusicLoading, setIsMusicLoading] = React.useState(false);

  // Initialize noise generator
  useEffect(() => {
    noiseGenRef.current = new NoiseGenerator();
    audioRef.current = new Audio();
    audioRef.current.volume = audioVolume;

    return () => {
      if (noiseGenRef.current) noiseGenRef.current.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (noiseGenRef.current && isAudioPlaying) {
      noiseGenRef.current.setVolume(audioVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume, isAudioPlaying]);

  const playAmbientSound = useCallback((soundId: string) => {
    if (!noiseGenRef.current) return;

    // Stop music if playing
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }

    // Toggle or switch sound
    if (currentAudioId === soundId && isAudioPlaying) {
      noiseGenRef.current.stop();
      setIsAudioPlaying(false);
      setCurrentAudioId(null);
    } else {
      noiseGenRef.current.stop();
      noiseGenRef.current.start(soundId, audioVolume);
      setCurrentAudioId(soundId);
      setIsAudioPlaying(true);
    }
  }, [currentAudioId, isAudioPlaying, audioVolume, isMusicPlaying, setIsAudioPlaying, setCurrentAudioId]);

  const playMusic = useCallback((musicId: string) => {
    if (!audioRef.current) return;

    // Stop ambient sound if playing
    if (noiseGenRef.current && isAudioPlaying) {
      noiseGenRef.current.stop();
      setIsAudioPlaying(false);
    }

    // Toggle or switch music
    if (currentAudioId === musicId && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      setCurrentAudioId(null);
    } else {
      const stream = MUSIC_STREAMS.find(s => s.id === musicId);
      if (stream) {
        setIsMusicLoading(true);
        setCurrentAudioId(musicId);
        audioRef.current.src = stream.url;
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true);
            setIsMusicLoading(false);
          })
          .catch(() => {
            setIsMusicLoading(false);
            setIsMusicPlaying(false);
          });
      }
    }
  }, [currentAudioId, isMusicPlaying, isAudioPlaying, setIsAudioPlaying, setCurrentAudioId]);

  const stopAll = useCallback(() => {
    if (noiseGenRef.current) noiseGenRef.current.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsAudioPlaying(false);
    setIsMusicPlaying(false);
    setCurrentAudioId(null);
  }, [setIsAudioPlaying, setCurrentAudioId]);

  const isPlaying = isAudioPlaying || isMusicPlaying;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-secondary">Study Audio</span>
        {isPlaying && (
          <button
            onClick={stopAll}
            className="text-xs px-2 py-1 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
          >
            Stop All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wide">Volume</span>
            <span className="text-xs text-content-muted">{Math.round(audioVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioVolume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Audio volume"
          />
        </div>

        {/* Ambient Sounds */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide">Ambient Sounds</h4>
          <div className="grid grid-cols-2 gap-2">
            {AMBIENT_SOUNDS.map((sound) => {
              const isActive = currentAudioId === sound.id && isAudioPlaying;
              return (
                <button
                  key={sound.id}
                  onClick={() => playAmbientSound(sound.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary shadow-sm'
                      : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-xs font-medium text-secondary">{sound.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Music Streams */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide">Study Music</h4>
          <div className="grid grid-cols-2 gap-2">
            {MUSIC_STREAMS.map((music) => {
              const isActive = currentAudioId === music.id && (isMusicPlaying || isMusicLoading);
              const isLoading = currentAudioId === music.id && isMusicLoading;
              return (
                <button
                  key={music.id}
                  onClick={() => playMusic(music.id)}
                  disabled={isMusicLoading && currentAudioId !== music.id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary shadow-sm'
                      : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'
                  } ${isMusicLoading && currentAudioId !== music.id ? 'opacity-50' : ''}`}
                  aria-pressed={isActive}
                >
                  <span className="text-xl">{music.icon}</span>
                  <span className="text-xs font-medium text-secondary">{music.name}</span>
                  {isLoading && (
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {isActive && !isLoading && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30">
        <p className="text-xs text-content-muted text-center">
          Press <kbd className="px-1 py-0.5 bg-surface rounded text-xs font-mono">M</kbd> to toggle Audio panel
        </p>
      </div>
    </div>
  );
}
