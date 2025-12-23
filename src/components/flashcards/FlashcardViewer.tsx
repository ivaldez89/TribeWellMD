'use client';

import { useState, useEffect } from 'react';
import type { Flashcard } from '@/types';

interface FlashcardViewerProps {
  card: Flashcard;
  isRevealed: boolean;
  onReveal: () => void;
  onEdit?: () => void;
  onBack?: () => void;
  cardNumber: number;
  totalCards: number;
}

export function FlashcardViewer({
  card,
  isRevealed,
  onReveal,
  onEdit,
  onBack,
  cardNumber,
  totalCards
}: FlashcardViewerProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRevealed) {
        e.preventDefault();
        onReveal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, onReveal]);
  
  const handleReveal = () => {
    setIsFlipping(true);
    setTimeout(() => {
      onReveal();
      setIsFlipping(false);
    }, 150);
  };

  // Get difficulty color
  const difficultyColors = {
    easy: 'bg-tribe-sage-100 text-tribe-sage-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-red-100 text-red-700 border-red-200'
  };
  
  // Get state badge
  const stateBadges = {
    new: { label: 'New', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    learning: { label: 'Learning', class: 'bg-purple-100 text-purple-700 border-purple-200' },
    review: { label: 'Review', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    relearning: { label: 'Relearning', class: 'bg-orange-100 text-orange-700 border-orange-200' }
  };
  
  const stateBadge = stateBadges[card.spacedRepetition.state];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress bar and navigation - always visible */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* State and difficulty badges - only show after reveal */}
          {isRevealed && (
            <>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${stateBadge.class}`}>
                {stateBadge.label}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColors[card.metadata.difficulty]}`}>
                {card.metadata.difficulty}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="font-medium">{cardNumber} / {totalCards}</span>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-tribe-sage-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${(cardNumber / totalCards) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Card container */}
      <div 
        className={`
          relative perspective-1000 transition-transform duration-150
          ${isFlipping ? 'scale-95' : 'scale-100'}
        `}
      >
        <div 
          className={`
            bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200
            overflow-hidden transition-all duration-300
            ${isRevealed ? 'ring-2 ring-tribe-sage-500/20' : ''}
          `}
        >
          {/* System tag header - only show after reveal */}
          {isRevealed && (
            <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {card.metadata.system}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500">
                    {card.metadata.topic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {card.metadata.clinicalVignette && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                      Clinical Vignette
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Question (Front) */}
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-tribe-sage-100 flex items-center justify-center">
                <span className="text-tribe-sage-600 font-bold text-sm">Q</span>
              </div>
              <div className="flex-1">
                <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {card.content.front}
                </p>
                {/* Images for question */}
                {card.content.images && card.content.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {card.content.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img}
                        alt={`Question image ${idx + 1}`}
                        className="max-w-xs rounded-lg border border-slate-200 shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Divider with reveal button */}
          {!isRevealed && (
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <button
                onClick={handleReveal}
                className="
                  w-full py-4 px-6 
                  bg-gradient-to-r from-tribe-sage-500 to-teal-500
                  hover:from-emerald-600 hover:to-tribe-sage-600
                  text-white font-semibold rounded-xl
                  shadow-lg shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <span>Reveal Answer</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-xs font-mono">
                  Space
                </kbd>
              </button>
            </div>
          )}
          
          {/* Answer (Back) */}
          {isRevealed && (
            <div className="border-t border-slate-200">
              <div className="p-6 md:p-8 bg-gradient-to-b from-emerald-50/50 to-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-tribe-sage-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {card.content.back}
                    </div>
                    
                    {card.content.explanation && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {card.content.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tags and Edit button row - only show after reveal */}
      {isRevealed && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex flex-wrap gap-2">
            {card.metadata.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
