'use client';

import { useState, useEffect, useRef } from 'react';
import { useSpotify, STUDY_PLAYLISTS } from '@/contexts/SpotifyContext';

interface SpotifyWidgetProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function SpotifyWidget({ variant = 'compact', className = '' }: SpotifyWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    isConnected,
    selectedPlaylist,
    connect,
    selectPlaylist,
    stopPlayback,
  } = useSpotify();

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePlaylistSelect = (playlistId: string) => {
    selectPlaylist(playlistId);
    // Keep dropdown open briefly so user sees selection, then close
    setTimeout(() => setIsOpen(false), 300);
  };

  const selectedPlaylistData = STUDY_PLAYLISTS.find(p => p.id === selectedPlaylist);

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        {/* Spotify Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isOpen || selectedPlaylist
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {selectedPlaylist ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </span>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          )}
          <span className="hidden sm:inline">Spotify</span>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <div
              ref={panelRef}
              className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[110] overflow-hidden"
            >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-tribe-sage-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="font-semibold text-white">Study Music</span>
              </div>
              {selectedPlaylist && (
                <button
                  onClick={() => stopPlayback()}
                  className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  Stop
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {!isConnected ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-tribe-sage-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Connect Your Spotify</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Listen to your favorite study playlists while you learn
                  </p>
                  <button
                    onClick={connect}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-tribe-sage-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg shadow-green-500/25 transition-all"
                  >
                    Connect Spotify
                  </button>
                </div>
              ) : (
                <>
                  {/* Now Playing indicator when a playlist is selected */}
                  {selectedPlaylistData && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedPlaylistData.color} flex items-center justify-center`}>
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Now Playing</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedPlaylistData.name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Music continues playing as you navigate. Check the player in the bottom left corner.
                      </p>
                    </div>
                  )}

                  {/* Playlist Grid */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Study Playlists
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {STUDY_PLAYLISTS.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={() => handlePlaylistSelect(playlist.id)}
                          className={`
                            relative p-3 rounded-xl transition-all text-left overflow-hidden group
                            ${selectedPlaylist === playlist.id
                              ? 'ring-2 ring-green-500 shadow-lg'
                              : 'hover:shadow-md'
                            }
                          `}
                        >
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                          {/* Content */}
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                              {selectedPlaylist === playlist.id && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                              <span className="font-medium text-slate-900 dark:text-white text-sm">
                                {playlist.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {playlist.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Playlist Input */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
                      Or paste a Spotify playlist link
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://open.spotify.com/playlist/..."
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      />
                      <button className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          </>
        )}
      </div>
    );
  }

  // Full variant for study pages
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-tribe-sage-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="font-semibold text-white">Study Music</span>
        </div>
        {selectedPlaylist && (
          <button
            onClick={() => stopPlayback()}
            className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      <div className="p-4">
        {selectedPlaylistData ? (
          <div className="text-center py-6">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedPlaylistData.color} flex items-center justify-center mx-auto mb-4`}>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{selectedPlaylistData.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{selectedPlaylistData.description}</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Now playing - check the player in the bottom left corner
            </p>
            <button
              onClick={() => stopPlayback()}
              className="mt-4 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Choose Different Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {STUDY_PLAYLISTS.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist.id)}
                className="relative p-4 rounded-xl transition-all text-center overflow-hidden group hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative">
                  <span className="font-medium text-slate-900 dark:text-white text-sm block">
                    {playlist.name}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {playlist.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
