'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getBackgroundUrl } from '@/data/scene-catalog';

// ============================================================================
// Types
// ============================================================================

interface SceneState {
  selectedBackground: string;
  opacity: number;
  customBackgroundUrl: string | null;
  isLoaded: boolean;
}

interface SceneContextValue extends SceneState {
  setSelectedBackground: (id: string) => void;
  setOpacity: (opacity: number) => void;
  setCustomBackgroundUrl: (url: string | null) => void;
  getBackgroundImageUrl: () => string | null;
}

// ============================================================================
// Storage keys
// ============================================================================

const STORAGE_KEY_BG = 'step2_study_background';
const STORAGE_KEY_OPACITY = 'step2_study_bg_opacity';
const STORAGE_KEY_CUSTOM_BG = 'step2_custom_background';
const STORAGE_KEY_VERSION = 'step2_study_bg_version';
const CURRENT_VERSION = '4';

// Default values - Misty Forest is the default for all study pages
const DEFAULT_BACKGROUND = 'misty-forest';
const DEFAULT_OPACITY = 1.0;

// ============================================================================
// Context
// ============================================================================

const SceneContext = createContext<SceneContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface SceneProviderProps {
  children: ReactNode;
}

export function SceneProvider({ children }: SceneProviderProps) {
  const [selectedBackground, setSelectedBackgroundState] = useState(DEFAULT_BACKGROUND);
  const [opacity, setOpacityState] = useState(DEFAULT_OPACITY);
  const [customBackgroundUrl, setCustomBackgroundUrlState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

      // If version mismatch or no version, reset to new defaults
      if (savedVersion !== CURRENT_VERSION) {
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        localStorage.setItem(STORAGE_KEY_BG, DEFAULT_BACKGROUND);
        localStorage.setItem(STORAGE_KEY_OPACITY, DEFAULT_OPACITY.toString());
        setSelectedBackgroundState(DEFAULT_BACKGROUND);
        setOpacityState(DEFAULT_OPACITY);
        setIsLoaded(true);
        return;
      }

      const savedBg = localStorage.getItem(STORAGE_KEY_BG);
      const savedOpacity = localStorage.getItem(STORAGE_KEY_OPACITY);
      const savedCustomBg = localStorage.getItem(STORAGE_KEY_CUSTOM_BG);

      setSelectedBackgroundState(savedBg || DEFAULT_BACKGROUND);
      setOpacityState(savedOpacity ? parseFloat(savedOpacity) : DEFAULT_OPACITY);
      if (savedCustomBg) setCustomBackgroundUrlState(savedCustomBg);
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage when changed
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BG, selectedBackground);
      localStorage.setItem(STORAGE_KEY_OPACITY, opacity.toString());
      if (customBackgroundUrl) {
        localStorage.setItem(STORAGE_KEY_CUSTOM_BG, customBackgroundUrl);
      }
    }
  }, [selectedBackground, opacity, customBackgroundUrl, isLoaded]);

  const setSelectedBackground = useCallback((id: string) => {
    setSelectedBackgroundState(id);
  }, []);

  const setOpacity = useCallback((value: number) => {
    setOpacityState(value);
  }, []);

  const setCustomBackgroundUrl = useCallback((url: string | null) => {
    setCustomBackgroundUrlState(url);
    if (url) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_BG, url);
    }
  }, []);

  const getBackgroundImageUrl = useCallback(() => {
    return getBackgroundUrl(selectedBackground, customBackgroundUrl);
  }, [selectedBackground, customBackgroundUrl]);

  const value: SceneContextValue = {
    selectedBackground,
    opacity,
    customBackgroundUrl,
    isLoaded,
    setSelectedBackground,
    setOpacity,
    setCustomBackgroundUrl,
    getBackgroundImageUrl,
  };

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useScene(): SceneContextValue {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
}

// ============================================================================
// Global Scene Background Component
// Renders the scene background at fixed position behind all content
// Should be rendered once in the app layout
// ============================================================================

interface GlobalSceneBackgroundProps {
  /** Whether to show the background (e.g., only on study pages) */
  enabled?: boolean;
}

export function GlobalSceneBackground({ enabled = true }: GlobalSceneBackgroundProps) {
  const { selectedBackground, opacity, getBackgroundImageUrl, isLoaded } = useScene();

  // Don't render until loaded from localStorage
  if (!isLoaded) return null;

  // Don't render if disabled or no background selected
  if (!enabled || selectedBackground === 'none') return null;

  const url = getBackgroundImageUrl();
  if (!url) return null;

  // CRITICAL: This component must be a TRUE background layer
  // - Uses z-index: -1 to ensure it's BEHIND all page content
  // - pointer-events: none ensures it never blocks interaction
  // - position: fixed keeps it in viewport
  // - Positioned between header (48px) and footer (48px)
  return (
    <div
      className="fixed left-0 right-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 pointer-events-none"
      style={{
        top: '48px',
        bottom: '48px',
        backgroundImage: `url(${url})`,
        opacity: opacity,
        zIndex: -1, // MUST be negative to stay behind all content
      }}
      aria-hidden="true"
    />
  );
}
