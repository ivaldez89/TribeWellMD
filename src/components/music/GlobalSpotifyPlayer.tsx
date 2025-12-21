'use client';

import { useState, useRef, useEffect } from 'react';
import { useSpotify, STUDY_PLAYLISTS } from '@/contexts/SpotifyContext';

export function GlobalSpotifyPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

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
        isExpanded &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const selectedPlaylistData = STUDY_PLAYLISTS.find(p => p.id === selectedPlaylist);

  // When music is playing, show the player
  const isPlaying = !!selectedPlaylist;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 left-4 z-40"
    >
      {/* Minimized state - just the button */}
      {isMinimized && !isExpanded && (
        <button
          onClick={() => {
            setIsMinimized(false);
            if (!isConnected) {
              setIsExpanded(true);
            }
          }}
          className={`group flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
            isPlaying
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isPlaying && (
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="text-sm font-medium hidden sm:inline">
            {isPlaying ? 'Lo-Fi Study' : 'Study Music'}
          </span>
        </button>
      )}

      {/* Compact player when music is playing */}
      {!isMinimized && !isExpanded && isPlaying && selectedPlaylistData && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-72">
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-white text-sm font-medium">Lo-Fi Study</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Change playlist"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => {
                  stopPlayback();
                  setIsMinimized(true);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Stop"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Now Playing */}
          <div className="p-3 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedPlaylistData.color} flex items-center justify-center flex-shrink-0`}>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedPlaylistData.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedPlaylistData.description}</p>
            </div>
          </div>

          {/* Embedded Spotify Player - invisible but functional */}
          <div className="px-3 pb-3">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${selectedPlaylist}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Not playing - show connect or select */}
      {!isMinimized && !isExpanded && !isPlaying && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-72">
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Study Music</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            {!isConnected ? (
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Connect Spotify to play study music</p>
                <button
                  onClick={connect}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                >
                  Connect Spotify
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Choose a playlist:</p>
                <div className="grid grid-cols-2 gap-2">
                  {STUDY_PLAYLISTS.slice(0, 4).map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => selectPlaylist(playlist.id)}
                      className="p-2 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{playlist.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full mt-2 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  See all playlists →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded playlist selector */}
      {isExpanded && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-80">
          <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="font-semibold text-white">Study Playlists</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto">
            {!isConnected ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Connect Spotify</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
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
              <div className="space-y-2">
                {STUDY_PLAYLISTS.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      selectPlaylist(playlist.id);
                      setIsExpanded(false);
                      setIsMinimized(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedPlaylist === playlist.id
                        ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center flex-shrink-0`}>
                      {selectedPlaylist === playlist.id && (
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{playlist.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{playlist.description}</p>
                    </div>
                    {selectedPlaylist === playlist.id && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}

                {selectedPlaylist && (
                  <button
                    onClick={() => {
                      stopPlayback();
                      setIsExpanded(false);
                      setIsMinimized(true);
                    }}
                    className="w-full mt-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Stop Music
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
