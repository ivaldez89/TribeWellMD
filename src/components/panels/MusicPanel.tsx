'use client';

import { useState } from 'react';
import { useSpotify, STUDY_PLAYLISTS } from '@/contexts/SpotifyContext';
import { useAudio, AMBIENT_SOUNDS } from '@/contexts/AudioContext';
import { ToolPanel } from '@/components/panels/ToolPanel';

interface MusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'spotify' | 'ambient';

// Header icon (matches ToolPanel canonical style - sand-600/sand-400)
const MusicIcon = () => (
  <svg className="w-5 h-5 text-sand-600 dark:text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

// Playlist icons - unique SVG for each playlist type
// Icons are always white on gradient backgrounds
const PlaylistIcon = ({ type, isPlaying }: { type: string; isPlaying?: boolean }) => {
  if (isPlaying) {
    return <span className="w-3 h-3 bg-white/90 rounded-full animate-pulse" />;
  }

  switch (type) {
    case 'focus':
      // Brain/target icon for deep focus
      return (
        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      );
    case 'lofi':
      // Headphones icon for lo-fi
      return (
        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      );
    case 'classical':
      // Musical note icon for classical
      return (
        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      );
    case 'piano':
      // Piano keys pattern
      return (
        <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="6" width="4" height="12" rx="0.5" fillOpacity="0.9" />
          <rect x="8" y="6" width="4" height="12" rx="0.5" fillOpacity="0.9" />
          <rect x="13" y="6" width="4" height="12" rx="0.5" fillOpacity="0.9" />
          <rect x="18" y="6" width="3" height="12" rx="0.5" fillOpacity="0.9" />
          <rect x="5.5" y="6" width="2" height="7" rx="0.25" fill="currentColor" fillOpacity="0.4" />
          <rect x="10.5" y="6" width="2" height="7" rx="0.25" fill="currentColor" fillOpacity="0.4" />
          <rect x="16.5" y="6" width="2" height="7" rx="0.25" fill="currentColor" fillOpacity="0.4" />
        </svg>
      );
    case 'nature':
      // Leaf icon for nature
      return (
        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
        </svg>
      );
    case 'jazz':
      // Saxophone-like musical icon
      return (
        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      );
    default:
      return <span className="w-2 h-2 bg-white/60 rounded-full" />;
  }
};

export function MusicPanel({ isOpen, onClose }: MusicPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ambient');

  // Spotify from SpotifyContext
  const {
    isConnected,
    selectedPlaylist,
    connect,
    selectPlaylist,
    stopPlayback,
  } = useSpotify();

  // Ambient sounds from global AudioContext (persists across navigation)
  const {
    activeAmbientSound,
    ambientVolume,
    playAmbientSound,
    stopAmbientSound,
    setAmbientVolume,
  } = useAudio();

  const selectedPlaylistData = STUDY_PLAYLISTS.find(p => p.id === selectedPlaylist);
  const isSpotifyPlaying = !!selectedPlaylist;

  // Group sounds by category
  const noiseSounds = AMBIENT_SOUNDS.filter(s => s.category === 'noise');
  const natureSounds = AMBIENT_SOUNDS.filter(s => s.category === 'nature');
  const binauralSounds = AMBIENT_SOUNDS.filter(s => s.category === 'binaural');

  // Dynamic footer text
  const footerText = activeAmbientSound
    ? 'Playing - persists across pages'
    : activeTab === 'spotify'
      ? 'Spotify Integration'
      : 'Select a sound';

  return (
    <ToolPanel
      isOpen={isOpen}
      onClose={onClose}
      title="TribeWell Music"
      subtitle="Study sounds & playlists"
      icon={<MusicIcon />}
      shortcutKey="S"
      footerText={footerText}
    >
      {/* Tab Switcher - Green highlight for active tab */}
      <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ambient'
                ? 'bg-[#5B7B6D] text-white'
                : 'bg-surface-muted text-content-muted hover:bg-border'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Ambient
            {activeAmbientSound && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('spotify')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'spotify'
                ? 'bg-[#1DB954] text-white'
                : 'bg-surface-muted text-content-muted hover:bg-border'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
            {isSpotifyPlaying && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Ambient Content */}
      {activeTab === 'ambient' && (
        <div className="p-4 space-y-4">
          {/* Now Playing indicator */}
          {activeAmbientSound && (
            <div className="p-3 bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/20 rounded-xl border border-[#5B7B6D]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#5B7B6D] rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-secondary">
                    {AMBIENT_SOUNDS.find(s => s.id === activeAmbientSound)?.name}
                  </span>
                </div>
                <button
                  onClick={stopAmbientSound}
                  className="p-1.5 text-content-muted hover:text-secondary hover:bg-border rounded-lg transition-colors"
                  title="Stop"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Volume Control */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-content-muted">Volume</span>
                  <span className="text-[10px] text-content-muted">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-border accent-[#5B7B6D]"
                />
              </div>
            </div>
          )}

          {/* Noise Section */}
          <div>
            <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">
              Background Noise
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {noiseSounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => playAmbientSound(sound.id)}
                  className={`p-3 rounded-xl transition-all text-center ${
                    activeAmbientSound === sound.id
                      ? 'bg-[#5B7B6D]/20 dark:bg-[#5B7B6D]/30 ring-2 ring-[#5B7B6D]'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-xs font-medium block ${
                    activeAmbientSound === sound.id ? 'text-[#5B7B6D] dark:text-[#7A9B8D]' : 'text-secondary'
                  }`}>
                    {sound.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nature Section */}
          <div>
            <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">
              Nature Sounds
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {natureSounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => playAmbientSound(sound.id)}
                  className={`p-3 rounded-xl transition-all text-left ${
                    activeAmbientSound === sound.id
                      ? 'bg-[#5B7B6D]/20 dark:bg-[#5B7B6D]/30 ring-2 ring-[#5B7B6D]'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-sm font-medium block ${
                    activeAmbientSound === sound.id ? 'text-[#5B7B6D] dark:text-[#7A9B8D]' : 'text-secondary'
                  }`}>
                    {sound.name}
                  </span>
                  <span className="text-[10px] text-content-muted">{sound.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Binaural Section */}
          <div>
            <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">
              Binaural Beats
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {binauralSounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => playAmbientSound(sound.id)}
                  className={`p-3 rounded-xl transition-all text-left ${
                    activeAmbientSound === sound.id
                      ? 'bg-[#5B7B6D]/20 dark:bg-[#5B7B6D]/30 ring-2 ring-[#5B7B6D]'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-sm font-medium block ${
                    activeAmbientSound === sound.id ? 'text-[#5B7B6D] dark:text-[#7A9B8D]' : 'text-secondary'
                  }`}>
                    {sound.name}
                  </span>
                  <span className="text-[10px] text-content-muted">{sound.description}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-content-muted italic">
              Use headphones for best effect
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 bg-surface-muted rounded-xl">
            <h4 className="text-xs font-semibold text-secondary mb-1">Study Tips</h4>
            <ul className="text-[10px] text-content-muted space-y-1">
              <li>White noise masks distracting sounds</li>
              <li>Brown noise helps with deep focus</li>
              <li>Rain sounds promote calm concentration</li>
              <li>40Hz binaural beats enhance focus</li>
            </ul>
          </div>
        </div>
      )}

      {/* Spotify Content */}
      {activeTab === 'spotify' && (
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-secondary mb-2">Connect Spotify</h3>
              <p className="text-sm text-content-muted mb-4">
                Listen to study playlists while you learn
              </p>
              <button
                onClick={connect}
                className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full shadow-sm transition-all"
              >
                Connect Spotify
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Now Playing */}
              {isSpotifyPlaying && selectedPlaylistData && (
                <div className="p-3 bg-[#1DB954]/10 dark:bg-[#1DB954]/20 rounded-xl border border-[#1DB954]/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPlaylistData.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <PlaylistIcon type={selectedPlaylistData.icon} isPlaying={true} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-secondary truncate">Now Playing</p>
                      <p className="text-xs text-content-muted truncate">{selectedPlaylistData.name}</p>
                    </div>
                    <button
                      onClick={stopPlayback}
                      className="p-2 text-content-muted hover:text-secondary hover:bg-border rounded-lg transition-colors"
                      title="Stop"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>
                  </div>
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${selectedPlaylistData.spotifyUri}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
              )}

              {/* Playlist Selection */}
              <div>
                <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">
                  Study Playlists
                </h4>
                <div className="space-y-2">
                  {STUDY_PLAYLISTS.map(playlist => {
                    const isSelected = selectedPlaylist === playlist.id;
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => selectPlaylist(playlist.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-green-50 dark:bg-[#1DB954]/20 border-2 border-green-600 dark:border-[#1DB954] shadow-[0_4px_12px_rgba(0,128,96,0.15)] dark:shadow-none'
                            : 'bg-white dark:bg-transparent border border-border/40 dark:border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none hover:bg-surface-muted hover:border-border dark:hover:bg-surface-muted'
                        }`}
                      >
                        {/* Icon container: day mode default uses muted bg, selected/dark uses gradient */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br ${playlist.color}`}>
                          <PlaylistIcon type={playlist.icon} isPlaying={isSelected} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-green-900 dark:text-secondary' : 'text-secondary'}`}>
                            {playlist.name}
                          </p>
                          <p className={`text-xs truncate ${isSelected ? 'text-green-800 dark:text-content-muted' : 'text-content-muted'}`}>
                            {playlist.description}
                          </p>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-green-700 dark:text-[#1DB954] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPanel>
  );
}

export default MusicPanel;
