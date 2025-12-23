'use client';

import { useEffect } from 'react';
import type { Rating } from '@/types';
import { formatInterval } from '@/lib/spaced-repetition/fsrs';

interface AnswerButtonsProps {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
  intervalPreview?: Record<Rating, number> | null;
}

interface ButtonConfig {
  rating: Rating;
  label: string;
  shortcut: string;
  bgClass: string;
  hoverClass: string;
  textClass: string;
  ringClass: string;
}

const buttonConfigs: ButtonConfig[] = [
  {
    rating: 'again',
    label: 'Again',
    shortcut: '1',
    bgClass: 'bg-red-500',
    hoverClass: 'hover:bg-red-600',
    textClass: 'text-white',
    ringClass: 'focus:ring-red-500/50'
  },
  {
    rating: 'hard',
    label: 'Hard',
    shortcut: '2',
    bgClass: 'bg-amber-500',
    hoverClass: 'hover:bg-amber-600',
    textClass: 'text-white',
    ringClass: 'focus:ring-amber-500/50'
  },
  {
    rating: 'good',
    label: 'Good',
    shortcut: '3',
    bgClass: 'bg-tribe-sage-500',
    hoverClass: 'hover:bg-tribe-sage-600',
    textClass: 'text-white',
    ringClass: 'focus:ring-tribe-sage-500/50'
  },
  {
    rating: 'easy',
    label: 'Easy',
    shortcut: '4',
    bgClass: 'bg-blue-500',
    hoverClass: 'hover:bg-blue-600',
    textClass: 'text-white',
    ringClass: 'focus:ring-blue-500/50'
  }
];

export function AnswerButtons({ onRate, disabled, intervalPreview }: AnswerButtonsProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    if (disabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Rating> = {
        '1': 'again',
        '2': 'hard',
        '3': 'good',
        '4': 'easy'
      };
      
      if (keyMap[e.key]) {
        e.preventDefault();
        onRate(keyMap[e.key]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onRate]);

  if (disabled) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {/* Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-slate-500">
          How well did you remember? Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">1-4</kbd> or click
        </p>
      </div>
      
      {/* Button grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {buttonConfigs.map((config) => (
          <button
            key={config.rating}
            onClick={() => onRate(config.rating)}
            className={`
              relative flex flex-col items-center justify-center
              py-4 px-4 rounded-xl
              ${config.bgClass} ${config.hoverClass} ${config.textClass}
              shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
              focus:outline-none focus:ring-4 ${config.ringClass}
            `}
          >
            {/* Keyboard shortcut badge */}
            <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-white/20 rounded text-xs font-mono">
              {config.shortcut}
            </span>
            
            {/* Label */}
            <span className="text-lg font-semibold">{config.label}</span>
            
            {/* Interval preview */}
            {intervalPreview && (
              <span className="text-sm opacity-80 mt-1">
                {formatInterval(intervalPreview[config.rating])}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-red-600">Again:</span>
            <span className="text-slate-600 ml-1">Complete blackout</span>
          </div>
          <div>
            <span className="font-medium text-amber-600">Hard:</span>
            <span className="text-slate-600 ml-1">Significant difficulty</span>
          </div>
          <div>
            <span className="font-medium text-tribe-sage-600">Good:</span>
            <span className="text-slate-600 ml-1">Correct with effort</span>
          </div>
          <div>
            <span className="font-medium text-blue-600">Easy:</span>
            <span className="text-slate-600 ml-1">Perfect recall</span>
          </div>
        </div>
      </div>
    </div>
  );
}
