'use client';

import { useSpotify, STUDY_PLAYLISTS } from '@/contexts/SpotifyContext';

export function PersistentSpotifyPlayer() {
  const {
    selectedPlaylist,
    isPlayerVisible,
    isMinimized,
    toggleMinimize,
    stopPlayback,
    getSelectedPlaylistData
  } = useSpotify();

  const playlistData = getSelectedPlaylistData();

  // Don't render if no playlist selected or player hidden
  if (!selectedPlaylist || !isPlayerVisible || !playlistData) {
    return null;
  }

  return (
    <div
      className={`fixed z-[200] transition-all duration-300 ease-in-out ${
        isMinimized
          ? 'bottom-4 right-4 w-64'
          : 'bottom-4 right-4 w-80'
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-tribe-sage-600 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
            <svg className="w-4 h-4 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="font-medium text-white text-sm truncate">
              {playlistData.name}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Minimize/Expand Button */}
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={isMinimized ? 'Expand player' : 'Minimize player'}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </button>
            {/* Stop Button */}
            <button
              onClick={stopPlayback}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Stop music"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Player Content - Only show when not minimized */}
        {!isMinimized && (
          <div className="p-2">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${playlistData.spotifyUri}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        )}

        {/* Minimized info */}
        {isMinimized && (
          <div className="px-3 py-2 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${playlistData.color} flex items-center justify-center`}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Now Playing</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{playlistData.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
