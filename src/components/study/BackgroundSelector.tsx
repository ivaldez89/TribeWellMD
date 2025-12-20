'use client';

import { useState, useEffect } from 'react';

// Beautiful high-resolution background images from Unsplash
export const STUDY_BACKGROUNDS = [
  // Medical/Study themed backgrounds (featured first)
  {
    id: 'library',
    name: 'Study Library',
    emoji: '📚',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80',
    category: 'medical',
    isDefault: true
  },
  {
    id: 'cozy-study',
    name: 'Cozy Desk',
    emoji: '💡',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80',
    category: 'medical'
  },
  {
    id: 'coffee-study',
    name: 'Coffee & Books',
    emoji: '☕',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    category: 'medical'
  },
  // None option
  {
    id: 'none',
    name: 'None',
    emoji: '⬜',
    url: null,
    category: 'default'
  },
  // Custom upload option
  {
    id: 'custom',
    name: 'Your Image',
    emoji: '📷',
    url: null,
    category: 'custom'
  },
  // Nature backgrounds
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    emoji: '🏖️',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'tropical-beach',
    name: 'Tropical Paradise',
    emoji: '🌴',
    url: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '🌌',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'aurora',
    name: 'Northern Lights',
    emoji: '🌠',
    url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'mountains',
    name: 'Mountain Peaks',
    emoji: '🏔️',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    emoji: '🌲',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    category: 'nature'
  }
];

interface BackgroundSelectorProps {
  selectedBackground: string;
  opacity: number;
  onBackgroundChange: (backgroundId: string) => void;
  onOpacityChange: (opacity: number) => void;
  customBackgroundUrl?: string | null;
  onCustomBackgroundChange?: (url: string | null) => void;
  variant?: 'light' | 'dark';
}

// Storage keys for persisting preferences
const STORAGE_KEY_BG = 'step2_study_background';
const STORAGE_KEY_OPACITY = 'step2_study_bg_opacity';
const STORAGE_KEY_CUSTOM_BG = 'step2_custom_background';
const STORAGE_KEY_VERSION = 'step2_study_bg_version';
const CURRENT_VERSION = '2'; // Increment to reset to new defaults

// Default values - medical library theme at max visibility
const DEFAULT_BACKGROUND = 'library';
const DEFAULT_OPACITY = 0.8;

// Hook to manage background state with localStorage persistence
export function useStudyBackground() {
  const [selectedBackground, setSelectedBackground] = useState(DEFAULT_BACKGROUND);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

      // If version mismatch or no version, reset to new defaults
      if (savedVersion !== CURRENT_VERSION) {
        // Clear old values and set new defaults
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        localStorage.setItem(STORAGE_KEY_BG, DEFAULT_BACKGROUND);
        localStorage.setItem(STORAGE_KEY_OPACITY, DEFAULT_OPACITY.toString());
        setSelectedBackground(DEFAULT_BACKGROUND);
        setOpacity(DEFAULT_OPACITY);
        setIsLoaded(true);
        return;
      }

      const savedBg = localStorage.getItem(STORAGE_KEY_BG);
      const savedOpacity = localStorage.getItem(STORAGE_KEY_OPACITY);
      const savedCustomBg = localStorage.getItem(STORAGE_KEY_CUSTOM_BG);

      // Use saved values or defaults
      setSelectedBackground(savedBg || DEFAULT_BACKGROUND);
      setOpacity(savedOpacity ? parseFloat(savedOpacity) : DEFAULT_OPACITY);
      if (savedCustomBg) setCustomBackgroundUrl(savedCustomBg);
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BG, selectedBackground);
      localStorage.setItem(STORAGE_KEY_OPACITY, opacity.toString());
      if (customBackgroundUrl) {
        localStorage.setItem(STORAGE_KEY_CUSTOM_BG, customBackgroundUrl);
      }
    }
  }, [selectedBackground, opacity, customBackgroundUrl, isLoaded]);

  return {
    selectedBackground,
    setSelectedBackground,
    opacity,
    setOpacity,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    isLoaded
  };
}

// Get background image URL by ID (with optional custom URL)
export function getBackgroundUrl(backgroundId: string, customUrl?: string | null): string | null {
  if (backgroundId === 'custom' && customUrl) {
    return customUrl;
  }
  const bg = STUDY_BACKGROUNDS.find(b => b.id === backgroundId);
  return bg?.url || null;
}

// Background overlay component to apply behind content
interface BackgroundOverlayProps {
  backgroundId: string;
  opacity: number;
  className?: string;
}

export function BackgroundOverlay({ backgroundId, opacity, className = '' }: BackgroundOverlayProps) {
  const url = getBackgroundUrl(backgroundId);

  if (!url) return null;

  return (
    <div
      className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${className}`}
      style={{
        backgroundImage: `url(${url})`,
        opacity: opacity
      }}
    />
  );
}

export function BackgroundSelector({
  selectedBackground,
  opacity,
  onBackgroundChange,
  onOpacityChange,
  customBackgroundUrl,
  onCustomBackgroundChange,
  variant = 'light'
}: BackgroundSelectorProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isDark = variant === 'dark';
  const currentBg = STUDY_BACKGROUNDS.find(b => b.id === selectedBackground);

  // Handle file upload for custom background
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);

    // Convert to base64 and store in localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onCustomBackgroundChange?.(base64);
      onBackgroundChange('custom');
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
          showPanel || selectedBackground !== 'none'
            ? isDark
              ? 'bg-teal-900/50 text-teal-400'
              : 'bg-teal-100 text-teal-700'
            : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span>{currentBg?.emoji || '🖼️'}</span>
        <span>Scene</span>
      </button>

      {/* Dropdown Panel */}
      {showPanel && (
        <>
          {/* Backdrop to close panel */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-[110] ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className="p-4">
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <span>🖼️</span>
                <span>Study Scene</span>
              </h3>

              {/* Background Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {STUDY_BACKGROUNDS.map((bg) => (
                  bg.id === 'custom' ? (
                    // Custom upload button
                    <label
                      key={bg.id}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${
                        selectedBackground === 'custom'
                          ? isDark
                            ? 'bg-teal-900/50 border-2 border-teal-500'
                            : 'bg-teal-50 border-2 border-teal-500'
                          : isDark
                            ? 'bg-slate-700 border-2 border-transparent hover:bg-slate-600'
                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      }`}
                      title="Upload your own image"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {customBackgroundUrl ? (
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${customBackgroundUrl})` }}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-slate-600' : 'bg-slate-200'
                        }`}>
                          {isUploading ? (
                            <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="text-lg">{bg.emoji}</span>
                          )}
                        </div>
                      )}
                      <span className={`text-[10px] truncate w-full text-center ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {customBackgroundUrl ? 'Your Image' : 'Upload'}
                      </span>
                    </label>
                  ) : (
                    <button
                      key={bg.id}
                      onClick={() => onBackgroundChange(bg.id)}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        selectedBackground === bg.id
                          ? isDark
                            ? 'bg-teal-900/50 border-2 border-teal-500'
                            : 'bg-teal-50 border-2 border-teal-500'
                          : isDark
                            ? 'bg-slate-700 border-2 border-transparent hover:bg-slate-600'
                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      }`}
                      title={bg.name}
                    >
                      {bg.url ? (
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${bg.url})` }}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-slate-600' : 'bg-slate-200'
                        }`}>
                          <span className="text-lg">{bg.emoji}</span>
                        </div>
                      )}
                      <span className={`text-[10px] truncate w-full text-center ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {bg.name}
                      </span>
                    </button>
                  )
                ))}
              </div>

              {/* Opacity Slider - only show when background selected */}
              {selectedBackground !== 'none' && (
                <div className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Background Intensity
                    </label>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-700 accent-teal-500'
                        : 'bg-slate-200 accent-teal-500'
                    }`}
                  />
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Lower values = more subtle, higher = more vivid
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BackgroundSelector;
