'use client';

import React from 'react';
import { useContextPanelContext } from './useContextPanel';

// Background scene options
const BACKGROUND_SCENES = [
  { id: 'none', name: 'None', preview: null, description: 'No background image' },
  { id: 'library', name: 'Library', preview: '📚', description: 'Quiet study space' },
  { id: 'cafe', name: 'Café', preview: '☕', description: 'Cozy coffee shop' },
  { id: 'nature', name: 'Nature', preview: '🌲', description: 'Peaceful forest' },
  { id: 'beach', name: 'Beach', preview: '🏖️', description: 'Ocean waves' },
  { id: 'mountain', name: 'Mountain', preview: '🏔️', description: 'Alpine serenity' },
  { id: 'rain', name: 'Rainy Day', preview: '🌧️', description: 'Cozy rain ambiance' },
  { id: 'night', name: 'Night Sky', preview: '🌙', description: 'Starry evening' },
  { id: 'minimal', name: 'Minimal', preview: '⬜', description: 'Clean, simple' },
];

// Get background URL (placeholder - would be actual image URLs)
export function getBackgroundUrl(sceneId: string): string {
  const urls: Record<string, string> = {
    library: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80',
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    night: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1920&q=80',
    minimal: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
  };
  return urls[sceneId] || '';
}

interface SceneTabProps {
  className?: string;
}

export function SceneTab({ className = '' }: SceneTabProps) {
  const {
    selectedBackground,
    setSelectedBackground,
    backgroundOpacity,
    setBackgroundOpacity,
  } = useContextPanelContext();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-secondary">Study Environment</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Opacity Control */}
        {selectedBackground !== 'none' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-content-muted uppercase tracking-wide">Opacity</span>
              <span className="text-xs text-content-muted">{Math.round(backgroundOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Background opacity"
            />
          </div>
        )}

        {/* Scene Selection */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide">Background Scene</h4>
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUND_SCENES.map((scene) => {
              const isActive = selectedBackground === scene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => setSelectedBackground(scene.id)}
                  className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center overflow-hidden ${
                    isActive
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : 'hover:bg-surface-muted'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Preview thumbnail */}
                  {scene.id !== 'none' && scene.preview ? (
                    <div className="w-full h-12 rounded-lg bg-surface-muted flex items-center justify-center text-2xl">
                      {scene.preview}
                    </div>
                  ) : (
                    <div className="w-full h-12 rounded-lg bg-surface-muted flex items-center justify-center">
                      <svg className="w-6 h-6 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-medium text-secondary">{scene.name}</span>
                  <span className="text-[10px] text-content-muted">{scene.description}</span>
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-surface-muted/50 rounded-xl">
          <h5 className="text-xs font-medium text-secondary mb-1">Study Environment Tips</h5>
          <ul className="text-xs text-content-muted space-y-1">
            <li>• Choose a scene that helps you focus</li>
            <li>• Lower opacity reduces distraction</li>
            <li>• Combine with ambient audio for immersion</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30">
        <p className="text-xs text-content-muted text-center">
          Press <kbd className="px-1 py-0.5 bg-surface rounded text-xs font-mono">B</kbd> to toggle Scene panel
        </p>
      </div>
    </div>
  );
}
