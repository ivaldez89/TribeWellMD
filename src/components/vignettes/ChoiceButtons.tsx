'use client';

import { useEffect } from 'react';
import type { Choice } from '@/types';

interface ChoiceButtonsProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
  selectedChoiceId?: string | null;
}

export function ChoiceButtons({
  choices,
  onSelect,
  disabled = false,
  selectedChoiceId = null
}: ChoiceButtonsProps) {
  // Handle keyboard shortcuts (1-9 for choices)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= choices.length) {
        e.preventDefault();
        onSelect(choices[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, onSelect, disabled]);

  return (
    <div className="space-y-2.5">
      {choices.map((choice, index) => {
        const isSelected = selectedChoiceId === choice.id;
        const showResult = isSelected && selectedChoiceId !== null;

        return (
          <button
            key={choice.id}
            onClick={() => !disabled && onSelect(choice.id)}
            disabled={disabled}
            className={`
              w-full p-3.5 text-left rounded-xl border transition-all duration-200
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.005]'}
              ${isSelected
                ? choice.isOptimal
                  ? 'border-emerald-400 bg-emerald-50/80'
                  : choice.isAcceptable
                    ? 'border-amber-400 bg-amber-50/80'
                    : 'border-red-400 bg-red-50/80'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Letter badge */}
              <div
                className={`
                  flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-medium text-sm
                  ${isSelected
                    ? choice.isOptimal
                      ? 'bg-emerald-500 text-white'
                      : choice.isAcceptable
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                  }
                `}
              >
                {String.fromCharCode(65 + index)}
              </div>

              {/* Choice text */}
              <div className="flex-1 pt-0.5">
                <p className={`
                  text-[15px] leading-relaxed font-light
                  ${isSelected
                    ? choice.isOptimal
                      ? 'text-emerald-800'
                      : choice.isAcceptable
                        ? 'text-amber-800'
                        : 'text-red-800'
                    : 'text-slate-700'
                  }
                `}>
                  {choice.text}
                </p>

                {/* Result indicator */}
                {showResult && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {choice.isOptimal ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium text-emerald-700">Optimal</span>
                      </>
                    ) : choice.isAcceptable ? (
                      <>
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                        </svg>
                        <span className="text-xs font-medium text-amber-700">Acceptable</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-xs font-medium text-red-700">Suboptimal</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Keyboard shortcut hint */}
              {!disabled && !isSelected && (
                <kbd className="hidden sm:flex flex-shrink-0 items-center justify-center w-5 h-5 text-[10px] font-mono bg-slate-100 text-slate-400 rounded">
                  {index + 1}
                </kbd>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
