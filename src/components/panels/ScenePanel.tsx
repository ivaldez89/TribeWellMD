'use client';

import { useState } from 'react';
import { STUDY_BACKGROUNDS, getBackgroundUrl } from '@/data/scene-catalog';
import { useScene } from '@/contexts/SceneContext';
import { ToolPanel } from '@/components/panels/ToolPanel';

interface ScenePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Group backgrounds by category for organized display
const CATEGORY_ORDER = ['medical', 'beach', 'underwater', 'space', 'forest', 'jungle', 'mountains', 'nature', 'desert', 'cozy', 'city', 'world'];
const CATEGORY_LABELS: Record<string, string> = {
  medical: 'Study Scenes',
  beach: 'Beach & Ocean',
  underwater: 'Underwater',
  space: 'Space & Cosmos',
  forest: 'Forests',
  jungle: 'Jungle & Tropical',
  mountains: 'Mountains',
  nature: 'Nature',
  desert: 'Desert & Savanna',
  cozy: 'Cozy',
  city: 'Cities',
  world: 'World Landmarks'
};

// Header icon (matches ToolPanel canonical style)
const SceneIcon = () => (
  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export function ScenePanel({ isOpen, onClose }: ScenePanelProps) {
  const { selectedBackground, setSelectedBackground, opacity, setOpacity, customBackgroundUrl, setCustomBackgroundUrl } = useScene();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('medical');
  const [isUploading, setIsUploading] = useState(false);

  const currentBg = STUDY_BACKGROUNDS.find(b => b.id === selectedBackground);
  const currentBgUrl = getBackgroundUrl(selectedBackground, customBackgroundUrl);

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
      setCustomBackgroundUrl(base64);
      setSelectedBackground('custom');
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Custom footer with opacity slider when background is selected
  const customFooter = (
    <>
      {/* Opacity Slider */}
      {selectedBackground !== 'none' && (
        <div className="px-4 py-3 border-t border-border bg-surface-muted/30">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-secondary">Background Intensity</label>
            <span className="text-xs text-content-muted">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-indigo-500"
          />
          <p className="mt-1 text-[10px] text-content-muted">
            30% = subtle, 100% = full intensity
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30 flex items-center justify-between">
        <p className="text-[10px] text-content-muted">
          {STUDY_BACKGROUNDS.length - 2} backgrounds available
        </p>
        <p className="text-[10px] text-content-muted">
          <kbd className="px-1 py-0.5 bg-surface border border-border rounded font-mono text-[9px]">B</kbd> toggle
        </p>
      </div>
    </>
  );

  return (
    <ToolPanel
      isOpen={isOpen}
      onClose={onClose}
      title="TribeWell Scene"
      subtitle="Study environment backgrounds"
      icon={<SceneIcon />}
      showFooter={false}
      footer={customFooter}
    >
      {/* Current Selection Preview */}
      <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
        {selectedBackground !== 'none' && currentBg ? (
          <div className="flex items-center gap-3">
            {currentBgUrl ? (
              <div
                className="w-16 h-10 rounded-lg bg-cover bg-center border border-border"
                style={{ backgroundImage: `url(${currentBgUrl})` }}
              />
            ) : (
              <div className="w-16 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-2xl">
                {currentBg.emoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary truncate">{currentBg.name}</p>
              <p className="text-[10px] text-content-muted">Intensity: {Math.round(opacity * 100)}%</p>
            </div>
            <button
              onClick={() => setSelectedBackground('none')}
              className="p-1.5 text-content-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear background"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg bg-surface-muted flex items-center justify-center">
              <svg className="w-5 h-5 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary">No background</p>
              <p className="text-[10px] text-content-muted">Select a scene below</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedBackground('none')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedBackground === 'none'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500'
                : 'bg-surface-muted text-content-muted hover:bg-border'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            None
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              selectedBackground === 'custom'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500'
                : 'bg-surface-muted text-content-muted hover:bg-border'
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
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            Upload
          </label>
        </div>
      </div>

      {/* Categories */}
      <div className="p-2">
        {CATEGORY_ORDER.map((category) => {
          const categoryBgs = STUDY_BACKGROUNDS.filter(bg => bg.category === category);
          if (categoryBgs.length === 0) return null;

          const isExpanded = expandedCategory === category;
          const hasSelected = categoryBgs.some(bg => bg.id === selectedBackground);

          return (
            <div key={category} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  hasSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'text-secondary hover:bg-surface-muted'
                }`}
              >
                <span className="font-medium">{CATEGORY_LABELS[category] || category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-content-muted">{categoryBgs.length}</span>
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

              {/* Category Items */}
              {isExpanded && (
                <div className="grid grid-cols-3 gap-2 mt-2 px-1 pb-2">
                  {categoryBgs.map((bg) => {
                    const bgUrl = getBackgroundUrl(bg.id, customBackgroundUrl);
                    return (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                          selectedBackground === bg.id
                            ? 'ring-2 ring-indigo-500 ring-offset-2'
                            : 'hover:ring-2 hover:ring-border'
                        }`}
                        title={bg.name}
                      >
                        {bgUrl ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-surface-muted flex items-center justify-center text-xl">
                            {bg.emoji}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-0.5 left-0 right-0 text-[8px] text-white text-center font-medium px-1 truncate">
                          {bg.name}
                        </span>
                        {selectedBackground === bg.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToolPanel>
  );
}

export default ScenePanel;
