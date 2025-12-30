'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SparklesIcon, BookOpenIcon, ClockIcon } from '@/components/icons/MedicalIcons';

// Beautiful high-resolution background images from Unsplash
export const STUDY_BACKGROUNDS = [
  // Medical/Study themed backgrounds (featured first)
  {
    id: 'library',
    name: 'Study Library',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80',
    category: 'medical',
    isDefault: true
  },
  {
    id: 'cozy-study',
    name: 'Cozy Desk',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80',
    category: 'medical'
  },
  {
    id: 'coffee-study',
    name: 'Coffee & Books',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    category: 'medical'
  },
  // None option
  {
    id: 'none',
    name: 'None',
    emoji: '',
    url: null,
    category: 'default'
  },
  // Custom upload option
  {
    id: 'custom',
    name: 'Upload',
    emoji: '',
    url: null,
    category: 'custom'
  },
  // ==================== BEACH & OCEAN ====================
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'tropical-beach',
    name: 'Tropical',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'maldives',
    name: 'Maldives',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'crystal-water',
    name: 'Crystal Water',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1920&q=80',
    category: 'beach'
  },
  // ==================== UNDERWATER ====================
  {
    id: 'underwater-coral',
    name: 'Coral Reef',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'underwater-blue',
    name: 'Deep Blue',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'underwater-fish',
    name: 'Ocean Life',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=1920&q=80',
    category: 'underwater'
  },
  // ==================== SPACE & COSMOS ====================
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'milky-way',
    name: 'Milky Way',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'nebula',
    name: 'Nebula',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'earth-space',
    name: 'Earth View',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'moon-surface',
    name: 'Moon',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'saturn-rings',
    name: 'Saturn',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'starfield',
    name: 'Starfield',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80',
    category: 'space'
  },
  // ==================== FORESTS ====================
  {
    id: 'forest',
    name: 'Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'autumn-forest',
    name: 'Autumn Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'misty-forest',
    name: 'Misty Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'redwood',
    name: 'Redwood',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'bamboo-forest',
    name: 'Bamboo',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'spring-forest',
    name: 'Spring Woods',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'snow-forest',
    name: 'Snowy Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1920&q=80',
    category: 'forest'
  },
  // ==================== JUNGLE & TROPICAL ====================
  {
    id: 'jungle',
    name: 'Jungle',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'tropical-plants',
    name: 'Tropical Leaves',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920&q=80',
    category: 'jungle'
  },
  // ==================== MOUNTAINS ====================
  {
    id: 'mountains',
    name: 'Mountains',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'alps',
    name: 'Alpine',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'mountain-lake',
    name: 'Mountain Lake',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'snowy-peaks',
    name: 'Snowy Peaks',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'mountain-sunset',
    name: 'Mountain Sunset',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    category: 'mountains'
  },
  // ==================== NATURE ====================
  {
    id: 'waterfall',
    name: 'Waterfall',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'japanese-garden',
    name: 'Zen Garden',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'lavender-field',
    name: 'Lavender',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'sunflower-field',
    name: 'Sunflowers',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'meadow',
    name: 'Meadow',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    category: 'nature'
  },
  // ==================== DESERT & SAVANNA ====================
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'sahara',
    name: 'Sahara',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'savanna',
    name: 'Savanna',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'desert-sunset',
    name: 'Desert Sunset',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
    category: 'desert'
  },
  // ==================== COZY ====================
  {
    id: 'rainy-window',
    name: 'Rainy Day',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'snowy-cabin',
    name: 'Snow Cabin',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'cozy-rain',
    name: 'Cozy Rain',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'candle-light',
    name: 'Candlelight',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    category: 'cozy'
  },
  // ==================== CITY ====================
  {
    id: 'night-city',
    name: 'City Night',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'new-york',
    name: 'New York',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'paris',
    name: 'Paris',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    category: 'city'
  },
  // ==================== WORLD LANDMARKS ====================
  {
    id: 'great-wall',
    name: 'Great Wall',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'santorini',
    name: 'Santorini',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'iceland',
    name: 'Iceland',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'norway-fjord',
    name: 'Norway Fjord',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&q=80',
    category: 'world'
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

// Group backgrounds by category for organized display
const CATEGORY_ORDER = ['medical', 'default', 'custom', 'beach', 'underwater', 'space', 'forest', 'jungle', 'mountains', 'nature', 'desert', 'cozy', 'city', 'world'];
const CATEGORY_LABELS: Record<string, string> = {
  medical: 'Study',
  default: '⬜ None',
  custom: '📷 Custom',
  beach: 'Beach & Ocean',
  underwater: 'Underwater',
  space: 'Space & Cosmos',
  forest: 'Forests',
  jungle: 'Jungle & Tropical',
  mountains: 'Mountains',
  nature: '🌿 Nature',
  desert: '🏜️ Desert & Savanna',
  cozy: 'Cozy',
  city: 'Cities',
  world: 'World Landmarks'
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
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
          showPanel || selectedBackground !== 'none'
            ? isDark
              ? 'bg-teal-900/50 text-tribe-sage-400'
              : 'bg-tribe-sage-100 text-tribe-sage-700'
            : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span>{currentBg?.emoji || <SparklesIcon className="w-4 h-4" />}</span>
        <span className="hidden sm:inline">Scene</span>
      </button>

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
