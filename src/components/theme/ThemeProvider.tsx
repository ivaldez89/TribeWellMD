'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * TribeWellMD Theme Provider
 *
 * Manages light/dark mode switching for the Forest Theme.
 *
 * Architecture:
 * - Single theme (Forest Theme) with light/dark modes
 * - CSS variables defined in globals.css
 * - Tailwind's 'class' strategy for dark mode
 *
 * Future Extension:
 * - To add new color themes, add a `colorTheme` state
 * - Apply via data-theme attribute: [data-theme="ocean"]
 * - Define new CSS variable sets in globals.css
 */

// =============================================================================
// TYPES
// =============================================================================

type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** Current color mode setting */
  mode: ColorMode;
  /** Resolved mode (light or dark, after system preference resolution) */
  resolvedMode: 'light' | 'dark';
  /** Set the color mode */
  setMode: (mode: ColorMode) => void;
  /** Toggle between light and dark (ignores system) */
  toggleMode: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key for persistence
const STORAGE_KEY = 'tribewellmd_theme_mode';

// =============================================================================
// PROVIDER
// =============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  // Resolve and apply theme
  useEffect(() => {
    const applyMode = (isDark: boolean) => {
      setResolvedMode(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyMode(mode === 'dark');
    }
  }, [mode]);

  const setMode = useCallback((newMode: ColorMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedMode, setMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access theme state and controls
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Full theme toggle with light/dark/system options
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const options: { value: ColorMode; icon: React.ReactNode; label: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-lg">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setMode(option.value)}
            className={`p-2 rounded-md transition-all ${
              mode === option.value
                ? 'bg-surface text-primary shadow-sm'
                : 'text-content-muted hover:text-content-secondary'
            }`}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact theme toggle for mobile/tight spaces
 * Cycles through: light → dark → system
 */
export function ThemeToggleCompact() {
  const { mode, resolvedMode, setMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const cycleMode = () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <button
      onClick={cycleMode}
      className="p-2 rounded-lg text-content-muted hover:bg-surface-muted transition-colors"
      title={`Theme: ${mode} (click to change)`}
    >
      {resolvedMode === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Simple toggle button (light ↔ dark only)
 * @param variant - 'default' for standard surfaces, 'greenHeader' for the QBank green header
 */
export function ThemeToggleSimple({ variant = 'default' }: { variant?: 'default' | 'greenHeader' }) {
  const { resolvedMode, toggleMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const buttonClass = variant === 'greenHeader'
    ? 'flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors'
    : 'flex items-center justify-center w-9 h-9 rounded-lg bg-surface-muted hover:bg-surface text-content-secondary hover:text-content transition-colors';

  return (
    <div className="group relative">
      <button
        onClick={toggleMode}
        className={buttonClass}
        title={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedMode === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      {/* Tooltip on hover */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {resolvedMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </div>
  );
}

/**
 * Forest Theme Demo Toggle
 *
 * TEMPORARY: Demo/debug toggle for testing Forest Light ↔ Forest Dark.
 * Shows clear labeling of current theme mode.
 *
 * Displays as a pill-style toggle with "Light" / "Dark" labels.
 */
export function ForestThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[140px]" />;
  }

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted border border-border-light hover:border-border transition-all"
      title={`Forest Theme: ${resolvedMode === 'dark' ? 'Dark' : 'Light'} (click to toggle)`}
    >
      {/* Sun icon */}
      <svg
        className={`w-4 h-4 transition-colors ${resolvedMode === 'light' ? 'text-warning' : 'text-content-muted'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>

      {/* Toggle track */}
      <div className="relative w-10 h-5 bg-border rounded-full">
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary shadow-sm transition-all duration-200 ${
            resolvedMode === 'dark' ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </div>

      {/* Moon icon */}
      <svg
        className={`w-4 h-4 transition-colors ${resolvedMode === 'dark' ? 'text-info' : 'text-content-muted'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  );
}
