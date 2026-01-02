'use client';

import React, { useState, useRef, useEffect } from 'react';

interface QuestionState {
  selectedAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
}

interface QuestionNavigationGridProps {
  totalQuestions: number;
  currentIndex: number;
  questionStates: Record<string, QuestionState>;
  isMarked: Record<string, boolean>;
  questionIds: string[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigationGrid({
  totalQuestions,
  currentIndex,
  questionStates,
  isMarked,
  questionIds,
  onNavigate,
}: QuestionNavigationGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Calculate stats
  const answeredCount = questionIds.filter(id => questionStates[id]?.isSubmitted).length;
  const correctCount = questionIds.filter(id => questionStates[id]?.isCorrect === true).length;
  const incorrectCount = questionIds.filter(id => questionStates[id]?.isCorrect === false).length;
  const flaggedCount = questionIds.filter(id => isMarked[id]).length;

  return (
    <div className="relative">
      {/* Navigation Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
          isOpen
            ? 'bg-surface-muted text-secondary'
            : 'text-content-muted hover:text-secondary hover:bg-surface-muted'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {/* Mini progress squares */}
          <div className="flex gap-0.5">
            {[...Array(Math.min(5, totalQuestions))].map((_, i) => {
              const idx = Math.floor((currentIndex / totalQuestions) * 5) + i - 2;
              if (idx < 0 || idx >= totalQuestions) return null;
              const qId = questionIds[idx];
              const state = questionStates[qId];
              const marked = isMarked[qId];
              const isCurrent = idx === currentIndex;

              let bgColor = 'bg-gray-200 dark:bg-gray-700';
              if (state?.isSubmitted) {
                bgColor = state.isCorrect ? 'bg-green-500' : 'bg-red-500';
              } else if (marked) {
                bgColor = 'bg-yellow-500';
              } else if (isCurrent) {
                bgColor = 'bg-blue-500';
              }

              return (
                <span
                  key={i}
                  className={`w-1.5 h-3 rounded-sm ${bgColor} ${isCurrent ? 'ring-1 ring-blue-400' : ''}`}
                />
              );
            })}
          </div>
          <span className="font-medium tabular-nums">{currentIndex + 1}/{totalQuestions}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Navigation Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden"
        >
          {/* Header with legend */}
          <div className="px-4 py-3 border-b border-border bg-surface-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-secondary">Question Navigator</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-content-muted hover:text-secondary p-1 rounded-lg hover:bg-surface-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Legend - using TribeWell colors */}
            <div className="flex flex-wrap gap-3 text-xs text-content-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500" />
                Unanswered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-gray-300 dark:bg-gray-500 ring-2 ring-[#5B7B6D]" />
                Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#5B7B6D]" />
                Correct
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#8B5A5A]" />
                Incorrect
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#C4A77D]" />
                Flagged
              </span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="p-3 max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {[...Array(totalQuestions)].map((_, idx) => {
                const qId = questionIds[idx];
                const state = questionStates[qId];
                const marked = isMarked[qId];
                const isCurrent = idx === currentIndex;

                // Determine button style based on state - using TribeWell colors
                // Forest green: #5B7B6D, Forest red: #8B5A5A (muted earthy red)
                let buttonClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600';

                if (state?.isSubmitted) {
                  if (state.isCorrect) {
                    // TribeWell forest green
                    buttonClass = 'bg-[#5B7B6D] text-white border-[#4A6A5C] hover:bg-[#4A6A5C]';
                  } else {
                    // TribeWell earthy red (complementary to forest green)
                    buttonClass = 'bg-[#8B5A5A] text-white border-[#7A4949] hover:bg-[#7A4949]';
                  }
                } else if (marked) {
                  buttonClass = 'bg-[#C4A77D]/20 dark:bg-[#C4A77D]/30 text-[#8B7355] dark:text-[#C4A77D] border-[#C4A77D]/50 hover:bg-[#C4A77D]/30';
                }

                if (isCurrent) {
                  buttonClass += ' ring-2 ring-[#5B7B6D] ring-offset-1';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(idx);
                      setIsOpen(false);
                    }}
                    className={`w-7 h-7 rounded-md font-medium text-[10px] border transition-all ${buttonClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Footer - using TribeWell colors */}
          <div className="px-3 py-2.5 border-t border-border bg-surface-muted/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5B7B6D]" />
                  <span className="text-content-muted">{correctCount} correct</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8B5A5A]" />
                  <span className="text-content-muted">{incorrectCount} incorrect</span>
                </span>
                {flaggedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#C4A77D]" />
                    <span className="text-content-muted">{flaggedCount} flagged</span>
                  </span>
                )}
              </div>
              <span className="font-medium text-secondary">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionNavigationGrid;
