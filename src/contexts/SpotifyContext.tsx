'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Curated study playlists (Spotify embed URIs)
// Icon colors use TribeWellMD theme palette for visual distinction
export const STUDY_PLAYLISTS = [
  {
    id: 'focus',
    name: 'Deep Focus',
    description: 'Instrumental focus music',
    spotifyUri: '37i9dQZF1DWZeKCadgRdKQ',
    color: 'from-[#5B7B6D] to-[#3D5A4F]', // tribe-sage green
    icon: 'focus', // brain/target icon
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Study',
    description: 'Chill beats to study to',
    spotifyUri: '37i9dQZF1DWWQRwui0ExPn',
    color: 'from-[#4A7C59] to-[#3A6147]', // emerald green
    icon: 'lofi', // headphones/chill icon
  },
  {
    id: 'classical',
    name: 'Classical Focus',
    description: 'Classical music for concentration',
    spotifyUri: '37i9dQZF1DWV0gynK7G6pD',
    color: 'from-[#2D5A4A] to-[#1E4035]', // deep teal green
    icon: 'classical', // violin/classical icon
  },
  {
    id: 'ambient',
    name: 'Peaceful Piano',
    description: 'Relaxing piano melodies',
    spotifyUri: '37i9dQZF1DX4sWSpwq3LiO',
    color: 'from-[#7C9A92] to-[#5B7B6D]', // soft sage
    icon: 'piano', // piano keys icon
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    description: 'Calming nature ambience',
    spotifyUri: '37i9dQZF1DX4PP3DA4J0N8',
    color: 'from-[#6B8F71] to-[#4A7050]', // forest green
    icon: 'nature', // leaf/tree icon
  },
  {
    id: 'jazz',
    name: 'Jazz Study',
    description: 'Smooth jazz for studying',
    spotifyUri: '37i9dQZF1DX0SM0LYsmbMT',
    color: 'from-[#3D6B5C] to-[#2A4D42]', // muted sage green
    icon: 'jazz', // saxophone icon
  },
];

export type Playlist = typeof STUDY_PLAYLISTS[number];

interface SpotifyContextType {
  isConnected: boolean;
  selectedPlaylist: string | null;
  isPlayerVisible: boolean;
  isMinimized: boolean;
  connect: () => void;
  disconnect: () => void;
  selectPlaylist: (playlistId: string) => void;
  stopPlayback: () => void;
  toggleMinimize: () => void;
  hidePlayer: () => void;
  showPlayer: () => void;
  getSelectedPlaylistData: () => Playlist | undefined;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check for saved Spotify connection and playlist on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem('tribewellmd_spotify_connected');
    const savedPlaylist = localStorage.getItem('tribewellmd_spotify_playlist');
    const savedMinimized = localStorage.getItem('tribewellmd_spotify_minimized');

    if (savedConnection === 'true') {
      setIsConnected(true);
    }
    if (savedPlaylist) {
      setSelectedPlaylist(savedPlaylist);
      setIsPlayerVisible(true);
    }
    if (savedMinimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  const connect = () => {
    setIsConnected(true);
    localStorage.setItem('tribewellmd_spotify_connected', 'true');
  };

  const disconnect = () => {
    setIsConnected(false);
    setSelectedPlaylist(null);
    setIsPlayerVisible(false);
    localStorage.removeItem('tribewellmd_spotify_connected');
    localStorage.removeItem('tribewellmd_spotify_playlist');
  };

  const selectPlaylist = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    setIsPlayerVisible(true);
    setIsMinimized(false);
    localStorage.setItem('tribewellmd_spotify_playlist', playlistId);
    localStorage.setItem('tribewellmd_spotify_minimized', 'false');
  };

  const stopPlayback = () => {
    setSelectedPlaylist(null);
    setIsPlayerVisible(false);
    localStorage.removeItem('tribewellmd_spotify_playlist');
  };

  const toggleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    localStorage.setItem('tribewellmd_spotify_minimized', String(newMinimized));
  };

  const hidePlayer = () => {
    setIsPlayerVisible(false);
  };

  const showPlayer = () => {
    if (selectedPlaylist) {
      setIsPlayerVisible(true);
    }
  };

  const getSelectedPlaylistData = () => {
    return STUDY_PLAYLISTS.find(p => p.id === selectedPlaylist);
  };

  return (
    <SpotifyContext.Provider
      value={{
        isConnected,
        selectedPlaylist,
        isPlayerVisible,
        isMinimized,
        connect,
        disconnect,
        selectPlaylist,
        stopPlayback,
        toggleMinimize,
        hidePlayer,
        showPlayer,
        getSelectedPlaylistData,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

// Default context values for SSR/when provider is not available
const defaultContext: SpotifyContextType = {
  isConnected: false,
  selectedPlaylist: null,
  isPlayerVisible: false,
  isMinimized: false,
  connect: () => {},
  disconnect: () => {},
  selectPlaylist: () => {},
  stopPlayback: () => {},
  toggleMinimize: () => {},
  hidePlayer: () => {},
  showPlayer: () => {},
  getSelectedPlaylistData: () => undefined,
};

export function useSpotify() {
  const context = useContext(SpotifyContext);
  // Return default values instead of throwing for SSR safety
  if (context === undefined) {
    return defaultContext;
  }
  return context;
}
