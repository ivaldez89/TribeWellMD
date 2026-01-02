'use client';

import { useState, useCallback, useEffect } from 'react';

export type ContextPanelTab = 'labs' | 'audio' | 'scene';

export interface LabValue {
  labId: string;
  value: number;
}

export interface ContextPanelState {
  // Panel visibility
  isOpen: boolean;
  activeTab: ContextPanelTab;

  // Labs state
  pinnedLabs: string[];
  labSearchQuery: string;
  selectedCategory: string | null;
  showAbnormalOnly: boolean;
  questionLabValues: LabValue[];

  // Audio state
  isAudioPlaying: boolean;
  currentAudioId: string | null;
  audioVolume: number;

  // Scene state
  selectedBackground: string;
  backgroundOpacity: number;
}

const STORAGE_KEY = 'context-panel-state';
const PINNED_LABS_KEY = 'context-panel-pinned-labs';

// Default pinned labs for quick access
const DEFAULT_PINNED_LABS = [
  'sodium',
  'potassium',
  'creatinine',
  'hemoglobin',
  'wbc',
  'platelets',
  'glucose-fasting',
  'inr',
];

export function useContextPanel() {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ContextPanelTab>('labs');

  // Labs state
  const [pinnedLabs, setPinnedLabs] = useState<string[]>(DEFAULT_PINNED_LABS);
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);
  const [questionLabValues, setQuestionLabValues] = useState<LabValue[]>([]);

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.3);

  // Scene state
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.3);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const savedPinnedLabs = localStorage.getItem(PINNED_LABS_KEY);
      if (savedPinnedLabs) {
        setPinnedLabs(JSON.parse(savedPinnedLabs));
      }

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.audioVolume !== undefined) setAudioVolume(parsed.audioVolume);
        if (parsed.selectedBackground) setSelectedBackground(parsed.selectedBackground);
        if (parsed.backgroundOpacity !== undefined) setBackgroundOpacity(parsed.backgroundOpacity);
      }
    } catch (e) {
      console.error('Failed to load context panel state:', e);
    }
  }, []);

  // Persist pinned labs
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_LABS_KEY, JSON.stringify(pinnedLabs));
    } catch (e) {
      console.error('Failed to save pinned labs:', e);
    }
  }, [pinnedLabs]);

  // Persist other settings
  useEffect(() => {
    try {
      const stateToSave = {
        audioVolume,
        selectedBackground,
        backgroundOpacity,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save context panel state:', e);
    }
  }, [audioVolume, selectedBackground, backgroundOpacity]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // L - Toggle Labs panel
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveTab('labs');
        } else if (activeTab === 'labs') {
          setIsOpen(false);
        } else {
          setActiveTab('labs');
        }
      }

      // M - Toggle Audio panel
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveTab('audio');
        } else if (activeTab === 'audio') {
          setIsOpen(false);
        } else {
          setActiveTab('audio');
        }
      }

      // B - Toggle Scene/Background panel
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveTab('scene');
        } else if (activeTab === 'scene') {
          setIsOpen(false);
        } else {
          setActiveTab('scene');
        }
      }

      // Escape - Close panel
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab]);

  // Panel actions
  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openPanel = useCallback((tab?: ContextPanelTab) => {
    setIsOpen(true);
    if (tab) setActiveTab(tab);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Lab actions
  const togglePinLab = useCallback((labId: string) => {
    setPinnedLabs(prev => {
      if (prev.includes(labId)) {
        return prev.filter(id => id !== labId);
      }
      return [...prev, labId];
    });
  }, []);

  const isLabPinned = useCallback(
    (labId: string) => pinnedLabs.includes(labId),
    [pinnedLabs]
  );

  const resetPinnedLabs = useCallback(() => {
    setPinnedLabs(DEFAULT_PINNED_LABS);
  }, []);

  // Set lab values from question (for highlighting abnormals)
  const setQuestionLabs = useCallback((values: LabValue[]) => {
    setQuestionLabValues(values);
  }, []);

  const clearQuestionLabs = useCallback(() => {
    setQuestionLabValues([]);
  }, []);

  return {
    // Panel state
    isOpen,
    activeTab,
    setActiveTab,
    togglePanel,
    openPanel,
    closePanel,

    // Labs state
    pinnedLabs,
    labSearchQuery,
    setLabSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showAbnormalOnly,
    setShowAbnormalOnly,
    questionLabValues,
    setQuestionLabs,
    clearQuestionLabs,
    togglePinLab,
    isLabPinned,
    resetPinnedLabs,

    // Audio state
    isAudioPlaying,
    setIsAudioPlaying,
    currentAudioId,
    setCurrentAudioId,
    audioVolume,
    setAudioVolume,

    // Scene state
    selectedBackground,
    setSelectedBackground,
    backgroundOpacity,
    setBackgroundOpacity,
  };
}

// Context for sharing state across components
import { createContext, useContext } from 'react';

export type ContextPanelContextType = ReturnType<typeof useContextPanel>;

export const ContextPanelContext = createContext<ContextPanelContextType | null>(null);

export function useContextPanelContext() {
  const context = useContext(ContextPanelContext);
  if (!context) {
    throw new Error('useContextPanelContext must be used within a ContextPanelProvider');
  }
  return context;
}
