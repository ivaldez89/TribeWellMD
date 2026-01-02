'use client';

import { ReactNode, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggleSimple } from '@/components/theme/ThemeProvider';
import { LabReferencePanel } from '@/components/study/LabReferencePanel';
import { MessengerPanel } from '@/components/chat/ChatBubble';
import { MusicPanel } from '@/components/panels/MusicPanel';
import { ScenePanel } from '@/components/panels/ScenePanel';
import { useAudio } from '@/contexts/AudioContext';
import { useScene } from '@/contexts/SceneContext';

// ============================================================================
// StudyLayout - Shared layout for all study experiences
// ============================================================================
// This component provides:
// 1. Consistent header with navigation and panel controls
// 2. Scene background layer (positioned between header and footer)
// 3. Right-side panels (Labs, Messages, Music, Scene)
// 4. Optional footer
//
// All study pages (Flashcards, QBank, Cases) MUST use this layout
// to ensure consistent behavior of Scene and Audio systems.
//
// IMPORTANT:
// - Scene background uses zIndex: 0, content uses zIndex: 1
// - When a scene is active, the container bg becomes transparent
// - Non-study pages (Home, Community, Wellness) must NOT use this layout
// - Study pages must NOT implement their own background logic
// ============================================================================

// Panel types for unified state management (only one panel open at a time)
export type PanelType = 'labs' | 'messages' | 'music' | 'scene' | null;

interface StudyLayoutProps {
  children: ReactNode;

  // Header customization
  backHref: string;
  backLabel?: string;

  // Center content for header (e.g., question number, timer)
  headerCenter?: ReactNode;

  // Additional header right content (before panel buttons)
  headerRight?: ReactNode;

  // Footer content (optional - if not provided, no footer)
  footer?: ReactNode;

  // Control panel state from outside (optional)
  activePanel?: PanelType;
  onPanelChange?: (panel: PanelType) => void;

  // Control which panels are visible
  showLabsPanel?: boolean;
  showMessagesPanel?: boolean;
  showMusicPanel?: boolean;
  showScenePanel?: boolean;
}

export function StudyLayout({
  children,
  backHref,
  backLabel,
  headerCenter,
  headerRight,
  footer,
  activePanel: externalActivePanel,
  onPanelChange,
  showLabsPanel = true,
  showMessagesPanel = true,
  showMusicPanel = true,
  showScenePanel = true,
}: StudyLayoutProps) {
  // Internal panel state (used if not controlled externally)
  const [internalActivePanel, setInternalActivePanel] = useState<PanelType>(null);

  // Use external state if provided, otherwise internal
  const activePanel = externalActivePanel !== undefined ? externalActivePanel : internalActivePanel;
  const setActivePanel = onPanelChange || setInternalActivePanel;

  // Global audio state
  const { activeAmbientSound } = useAudio();

  // Global scene state
  const { selectedBackground, opacity, getBackgroundImageUrl, isLoaded } = useScene();

  // Toggle panel helper - closes other panels when opening one
  const togglePanel = useCallback((panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  }, [activePanel, setActivePanel]);

  // Keyboard shortcuts for panels
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (key === 'l' && showLabsPanel) {
        e.preventDefault();
        togglePanel('labs');
      } else if (key === 'm' && showMessagesPanel) {
        e.preventDefault();
        togglePanel('messages');
      } else if (key === 's' && showMusicPanel) {
        e.preventDefault();
        togglePanel('music');
      } else if (key === 'b' && showScenePanel) {
        e.preventDefault();
        togglePanel('scene');
      } else if (key === 'escape') {
        setActivePanel(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel, setActivePanel, showLabsPanel, showMessagesPanel, showMusicPanel, showScenePanel]);

  // Get background URL
  const backgroundUrl = isLoaded && selectedBackground !== 'none' ? getBackgroundImageUrl() : null;
  const hasActiveScene = !!backgroundUrl;

  return (
    // When a scene is active, make container transparent so scene shows through
    // When no scene, use normal bg-background for consistent theming
    <div className={`min-h-screen relative overflow-x-auto ${hasActiveScene ? '' : 'bg-background'}`}>
      {/* Scene Background Layer - zIndex 0, content is zIndex 1 */}
      {backgroundUrl && (
        <div
          className="fixed left-0 right-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
          style={{
            top: '48px',
            bottom: footer ? '48px' : '0',
            backgroundImage: `url(${backgroundUrl})`,
            opacity: opacity,
            zIndex: 0, // Base layer - content sits above at zIndex 1
            pointerEvents: 'none', // Never block interaction
          }}
          aria-hidden="true"
        />
      )}

      {/* Study Header - UWorld style forest green (h-12 = 48px) */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#5B7B6D] dark:bg-[#3d5a4d] text-white shadow-lg">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left: Back button + Logo */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href={backHref}
                className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={backLabel}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link href="/home" className="flex items-center gap-1.5 group flex-shrink-0">
                <div className="w-7 h-7 rounded-lg shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
                  <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-bold text-white">Tribe</span>
                  <span className="text-sm font-bold text-[#C4A77D]">Well</span>
                  <span className="text-sm font-light text-white/80">MD</span>
                </div>
              </Link>
            </div>

            {/* Center: Custom content (question #, timer, etc.) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {headerCenter}
            </div>

            {/* Right: Custom content + Panel controls + Theme */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Custom header right content */}
              {headerRight}

              {/* Messages button */}
              {showMessagesPanel && (
                <button
                  onClick={() => togglePanel('messages')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'messages'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Messages (M)
                  </span>
                </button>
              )}

              {/* Labs Reference button */}
              {showLabsPanel && (
                <button
                  onClick={() => togglePanel('labs')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'labs'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Labs (L)
                  </span>
                </button>
              )}

              {/* Music button - uses global AudioContext */}
              {showMusicPanel && (
                <button
                  onClick={() => togglePanel('music')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'music' || activeAmbientSound
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {activeAmbientSound && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Music (S)
                  </span>
                </button>
              )}

              {/* Scene button */}
              {showScenePanel && (
                <button
                  onClick={() => togglePanel('scene')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'scene'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Scene (B)
                  </span>
                </button>
              )}

              {/* Day/Night Theme Toggle */}
              <ThemeToggleSimple variant="greenHeader" />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header (h-12 = 48px) */}
      <div className="h-12" />

      {/* Main content area - z-index above background */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>

      {/* Footer (if provided) */}
      {footer && (
        <>
          <footer className="fixed bottom-0 left-0 right-0 z-40 h-12 bg-[#5B7B6D] dark:bg-[#3d5a4d] text-white shadow-lg">
            {footer}
          </footer>
          {/* Spacer for fixed footer */}
          <div className="h-12" />
        </>
      )}

      {/* Right-side Panels */}
      {showLabsPanel && (
        <LabReferencePanel
          isOpen={activePanel === 'labs'}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showMessagesPanel && (
        <MessengerPanel
          isOpen={activePanel === 'messages'}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showMusicPanel && (
        <MusicPanel
          isOpen={activePanel === 'music'}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showScenePanel && (
        <ScenePanel
          isOpen={activePanel === 'scene'}
          onClose={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}

// Export hook for accessing panel state
export function useStudyLayout() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const togglePanel = useCallback((panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  return {
    activePanel,
    setActivePanel,
    togglePanel,
  };
}
