'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SparklesIcon, BookOpenIcon, ClockIcon } from '@/components/icons/MedicalIcons';
import {
  STUDY_BACKGROUNDS,
  CATEGORY_ORDER as CATALOG_CATEGORY_ORDER,
  CATEGORY_LABELS as CATALOG_CATEGORY_LABELS,
  getBackgroundUrl as catalogGetBackgroundUrl,
  validateSceneCatalog,
  type StudyBackground,
  type SceneCategory
} from '@/data/scene-catalog';

// Re-export for backward compatibility
export { STUDY_BACKGROUNDS } from '@/data/scene-catalog';

// Run validation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  validateSceneCatalog();
}

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
const CURRENT_VERSION = '4'; // Increment to reset to new defaults - changed default to mountains

// Default values - mountains theme at full intensity
const DEFAULT_BACKGROUND = 'mountains';
const DEFAULT_OPACITY = 1.0;

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
// Uses central catalog, re-exported for backward compatibility
export function getBackgroundUrl(backgroundId: string, customUrl?: string | null): string | null {
  return catalogGetBackgroundUrl(backgroundId, customUrl);
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

// Group backgrounds by category for organized display
// Include default and custom in order for UI rendering
const CATEGORY_ORDER: (SceneCategory | 'default' | 'custom')[] = ['medical', 'default', 'custom', ...CATALOG_CATEGORY_ORDER.filter(c => c !== 'medical')];
const CATEGORY_LABELS: Record<string, string> = {
  ...CATALOG_CATEGORY_LABELS,
  // Override with UI-specific labels (with emojis for special items)
  medical: 'Study',
  default: 'None',
  custom: 'Custom',
  nature: 'Nature',
  desert: 'Desert & Savanna',
};

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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // For portal - need to wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when opening
  const handleTogglePanel = () => {
    if (!showPanel && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = 320; // w-80 = 20rem = 320px
      // Position below button, but keep within viewport
      let left = rect.left;
      if (left + panelWidth > window.innerWidth - 8) {
        left = window.innerWidth - panelWidth - 8;
      }
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(8, left)
      });
    }
    setShowPanel(!showPanel);
  };

  const isDark = variant === 'dark';
  const currentBg = STUDY_BACKGROUNDS.find(b => b.id === selectedBackground);

  // Find which category the selected background belongs to
  const selectedCategory = currentBg?.category || 'default';

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
      <div className="group relative">
        <button
          ref={buttonRef}
          onClick={handleTogglePanel}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
            showPanel || selectedBackground !== 'none'
              ? 'bg-[#C4A77D] text-white'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="text-lg">{currentBg?.emoji || <SparklesIcon className="w-5 h-5" />}</span>
        </button>
        {/* Tooltip on hover */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Scene
        </span>
      </div>

      {/* Dropdown Panel - rendered via portal to escape stacking contexts */}
      {showPanel && mounted && createPortal(
        <>
          {/* Backdrop to close panel */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel - positioned directly below the button */}
          <div
            className={`fixed w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl border z-[9999] ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <div className="p-4">
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <SparklesIcon className="w-5 h-5" />
                <span>Study Scene</span>
              </h3>

              {/* Current selection display */}
              {selectedBackground !== 'none' && currentBg && (
                <div className={`mb-3 p-2 rounded-lg flex items-center gap-2 ${
                  isDark ? 'bg-teal-900/30' : 'bg-tribe-sage-50'
                }`}>
                  <span className="text-xl">{currentBg.emoji}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-tribe-sage-300' : 'text-tribe-sage-700'}`}>
                    {currentBg.name}
                  </span>
                  <button
                    onClick={() => onBackgroundChange('none')}
                    className={`ml-auto text-xs px-2 py-1 rounded ${
                      isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Category accordion */}
              <div className="space-y-1 mb-4">
                {CATEGORY_ORDER.map((category) => {
                  const categoryBgs = STUDY_BACKGROUNDS.filter(bg => bg.category === category);
                  if (categoryBgs.length === 0) return null;

                  const isExpanded = expandedCategory === category;
                  const hasSelected = categoryBgs.some(bg => bg.id === selectedBackground);

                  // Skip none and custom in accordion - they're special
                  if (category === 'default' || category === 'custom') {
                    return (
                      <div key={category} className="flex gap-2">
                        {category === 'default' && (
                          <button
                            onClick={() => onBackgroundChange('none')}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedBackground === 'none'
                                ? isDark
                                  ? 'bg-teal-900/50 text-tribe-sage-300'
                                  : 'bg-tribe-sage-100 text-tribe-sage-700'
                                : isDark
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>None</span>
                          </button>
                        )}
                        {category === 'custom' && (
                          <label
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                              selectedBackground === 'custom'
                                ? isDark
                                  ? 'bg-teal-900/50 text-tribe-sage-300'
                                  : 'bg-tribe-sage-100 text-tribe-sage-700'
                                : isDark
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <ClockIcon className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                            <span>{customBackgroundUrl ? 'Your Image' : 'Upload'}</span>
                          </label>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={category}>
                      {/* Category header */}
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          hasSelected
                            ? isDark
                              ? 'bg-teal-900/30 text-tribe-sage-300'
                              : 'bg-tribe-sage-50 text-tribe-sage-700'
                            : isDark
                              ? 'text-slate-300 hover:bg-slate-700'
                              : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-medium">{CATEGORY_LABELS[category] || category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {categoryBgs.length}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Category items - emoji grid (no images!) */}
                      {isExpanded && (
                        <div className="grid grid-cols-4 gap-1 mt-1 px-1">
                          {categoryBgs.map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => {
                                onBackgroundChange(bg.id);
                              }}
                              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                                selectedBackground === bg.id
                                  ? isDark
                                    ? 'bg-teal-900/50 ring-2 ring-tribe-sage-500'
                                    : 'bg-tribe-sage-100 ring-2 ring-tribe-sage-500'
                                  : isDark
                                    ? 'hover:bg-slate-700'
                                    : 'hover:bg-slate-100'
                              }`}
                              title={bg.name}
                            >
                              <span className="text-xl">{bg.emoji}</span>
                              <span className={`text-[9px] truncate w-full text-center ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {bg.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    min="0.5"
                    max="1.0"
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
                    50% = subtle, 100% = full intensity
                  </p>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default BackgroundSelector;
