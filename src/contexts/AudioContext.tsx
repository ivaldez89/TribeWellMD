'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type AmbientSoundType = 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'forest' | 'ocean' | 'fireplace' | 'binaural-focus' | 'binaural-relax';

interface AudioState {
  // Spotify state
  isSpotifyPlaying: boolean;
  currentPlaylistId: string | null;
  spotifyVolume: number;

  // Ambient sound state
  activeAmbientSound: AmbientSoundType | null;
  ambientVolume: number;
}

interface AudioContextValue extends AudioState {
  // Spotify controls
  playSpotifyPlaylist: (playlistId: string) => void;
  stopSpotify: () => void;
  setSpotifyVolume: (volume: number) => void;

  // Ambient sound controls
  playAmbientSound: (soundType: AmbientSoundType) => void;
  stopAmbientSound: () => void;
  setAmbientVolume: (volume: number) => void;

  // Stop all audio
  stopAllAudio: () => void;
}

// ============================================================================
// Noise Generator Class
// ============================================================================

class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private activeNodes: { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }[] = [];
  private audioElement: HTMLAudioElement | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
    const ctx = this.getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
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
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }

    return buffer;
  }

  playNoise(type: 'white' | 'pink' | 'brown', volume: number): void {
    this.stop();
    const ctx = this.getAudioContext();
    const buffer = this.createNoiseBuffer(type);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    this.activeNodes.push({ source, gain });
  }

  playBinauralBeats(baseFreq: number, beatFreq: number, volume: number): void {
    this.stop();
    const ctx = this.getAudioContext();

    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const merger = ctx.createChannelMerger(2);

    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + beatFreq;
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';

    gain.gain.value = volume * 0.3;

    leftOsc.connect(merger, 0, 0);
    rightOsc.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(ctx.destination);

    leftOsc.start();
    rightOsc.start();

    this.activeNodes.push({ source: leftOsc, gain });
    this.activeNodes.push({ source: rightOsc, gain });
  }

  playNatureSound(type: 'rain' | 'forest' | 'ocean' | 'fireplace', volume: number): void {
    this.stop();

    // Nature sounds use audio files
    const soundUrls: Record<string, string> = {
      rain: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1de269bfe8.mp3', // Rain ambience
      forest: 'https://cdn.pixabay.com/audio/2022/02/07/audio_d5ca25c13f.mp3', // Forest birds
      ocean: 'https://cdn.pixabay.com/audio/2022/06/07/audio_45a4c942cd.mp3', // Ocean waves
      fireplace: 'https://cdn.pixabay.com/audio/2022/02/08/audio_96eb42e6ce.mp3', // Fireplace crackling
    };

    const url = soundUrls[type];
    if (!url) return;

    this.audioElement = new Audio(url);
    this.audioElement.loop = true;
    this.audioElement.volume = volume;
    this.audioElement.play().catch(() => {
      // Autoplay blocked - user needs to interact first
      console.log('Audio autoplay blocked');
    });
  }

  setVolume(volume: number): void {
    this.activeNodes.forEach(({ gain }) => {
      gain.gain.value = volume;
    });
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
  }

  stop(): void {
    this.activeNodes.forEach(({ source }) => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeNodes = [];

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
  }
}

// ============================================================================
// Context
// ============================================================================

const AudioContext = createContext<AudioContextValue | null>(null);

// Singleton noise generator
let noiseGeneratorInstance: NoiseGenerator | null = null;

function getNoiseGenerator(): NoiseGenerator {
  if (!noiseGeneratorInstance) {
    noiseGeneratorInstance = new NoiseGenerator();
  }
  return noiseGeneratorInstance;
}

// ============================================================================
// Provider
// ============================================================================

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  // Spotify state
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [spotifyVolume, setSpotifyVolumeState] = useState(0.8);

  // Ambient sound state
  const [activeAmbientSound, setActiveAmbientSound] = useState<AmbientSoundType | null>(null);
  const [ambientVolume, setAmbientVolumeState] = useState(0.3);

  // Spotify controls
  const playSpotifyPlaylist = useCallback((playlistId: string) => {
    setCurrentPlaylistId(playlistId);
    setIsSpotifyPlaying(true);
    // Note: Actual Spotify playback is handled by SpotifyContext
  }, []);

  const stopSpotify = useCallback(() => {
    setCurrentPlaylistId(null);
    setIsSpotifyPlaying(false);
  }, []);

  const setSpotifyVolume = useCallback((volume: number) => {
    setSpotifyVolumeState(volume);
  }, []);

  // Ambient sound controls
  const playAmbientSound = useCallback((soundType: AmbientSoundType) => {
    const generator = getNoiseGenerator();

    // If same sound, toggle off
    if (activeAmbientSound === soundType) {
      generator.stop();
      setActiveAmbientSound(null);
      return;
    }

    // Play the new sound
    switch (soundType) {
      case 'white-noise':
        generator.playNoise('white', ambientVolume);
        break;
      case 'pink-noise':
        generator.playNoise('pink', ambientVolume);
        break;
      case 'brown-noise':
        generator.playNoise('brown', ambientVolume);
        break;
      case 'binaural-focus':
        generator.playBinauralBeats(200, 40, ambientVolume);
        break;
      case 'binaural-relax':
        generator.playBinauralBeats(200, 10, ambientVolume);
        break;
      case 'rain':
      case 'forest':
      case 'ocean':
      case 'fireplace':
        generator.playNatureSound(soundType, ambientVolume);
        break;
    }

    setActiveAmbientSound(soundType);
  }, [activeAmbientSound, ambientVolume]);

  const stopAmbientSound = useCallback(() => {
    const generator = getNoiseGenerator();
    generator.stop();
    setActiveAmbientSound(null);
  }, []);

  const setAmbientVolume = useCallback((volume: number) => {
    setAmbientVolumeState(volume);
    if (activeAmbientSound) {
      const generator = getNoiseGenerator();
      generator.setVolume(volume);
    }
  }, [activeAmbientSound]);

  const stopAllAudio = useCallback(() => {
    stopSpotify();
    stopAmbientSound();
  }, [stopSpotify, stopAmbientSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (noiseGeneratorInstance) {
        noiseGeneratorInstance.stop();
      }
    };
  }, []);

  const value: AudioContextValue = {
    // State
    isSpotifyPlaying,
    currentPlaylistId,
    spotifyVolume,
    activeAmbientSound,
    ambientVolume,

    // Spotify controls
    playSpotifyPlaylist,
    stopSpotify,
    setSpotifyVolume,

    // Ambient controls
    playAmbientSound,
    stopAmbientSound,
    setAmbientVolume,

    // Global controls
    stopAllAudio,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// ============================================================================
// Ambient Sound Definitions (for UI)
// ============================================================================

export const AMBIENT_SOUNDS: { id: AmbientSoundType; name: string; category: 'noise' | 'nature' | 'binaural'; description: string }[] = [
  // Noise
  { id: 'white-noise', name: 'White Noise', category: 'noise', description: 'Equal intensity across frequencies' },
  { id: 'pink-noise', name: 'Pink Noise', category: 'noise', description: 'Balanced, natural sound' },
  { id: 'brown-noise', name: 'Brown Noise', category: 'noise', description: 'Deep, rumbling bass' },

  // Nature
  { id: 'rain', name: 'Rain', category: 'nature', description: 'Gentle rainfall' },
  { id: 'forest', name: 'Forest', category: 'nature', description: 'Birds and nature' },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', description: 'Rolling waves' },
  { id: 'fireplace', name: 'Fireplace', category: 'nature', description: 'Crackling fire' },

  // Binaural
  { id: 'binaural-focus', name: 'Focus (40Hz)', category: 'binaural', description: 'Gamma waves for concentration' },
  { id: 'binaural-relax', name: 'Relax (10Hz)', category: 'binaural', description: 'Alpha waves for calm' },
];
