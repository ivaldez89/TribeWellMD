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
      {/* Tab Switcher */}
      <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ambient'
                ? 'bg-purple-500 text-white'
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
                ? 'bg-green-500 text-white'
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
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {AMBIENT_SOUNDS.find(s => s.id === activeAmbientSound)?.name}
                  </span>
                </div>
                <button
                  onClick={stopAmbientSound}
                  className="p-1.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded-lg transition-colors"
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
                  <span className="text-[10px] text-purple-600 dark:text-purple-400">Volume</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-purple-200 dark:bg-purple-700 accent-purple-500"
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
                      ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-xs font-medium block ${
                    activeAmbientSound === sound.id ? 'text-purple-700 dark:text-purple-300' : 'text-secondary'
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
                      ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-sm font-medium block ${
                    activeAmbientSound === sound.id ? 'text-green-700 dark:text-green-300' : 'text-secondary'
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
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500'
                      : 'bg-surface-muted hover:bg-border'
                  }`}
                >
                  <span className={`text-sm font-medium block ${
                    activeAmbientSound === sound.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-secondary'
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
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">Study Tips</h4>
            <ul className="text-[10px] text-purple-600 dark:text-purple-400 space-y-1">
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
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
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg shadow-green-500/25 transition-all"
              >
                Connect Spotify
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Now Playing */}
              {isSpotifyPlaying && selectedPlaylistData && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedPlaylistData.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-secondary truncate">Now Playing</p>
                      <p className="text-xs text-content-muted truncate">{selectedPlaylistData.name}</p>
                    </div>
                    <button
                      onClick={stopPlayback}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                  {STUDY_PLAYLISTS.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => selectPlaylist(playlist.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedPlaylist === playlist.id
                          ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                          : 'hover:bg-surface-muted'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center flex-shrink-0`}>
                        {selectedPlaylist === playlist.id && (
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary">{playlist.name}</p>
                        <p className="text-xs text-content-muted truncate">{playlist.description}</p>
                      </div>
                      {selectedPlaylist === playlist.id && (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
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
