'use client';

import { useEffect } from 'react';
import type { ClinicalVignette, DecisionNode, Choice } from '@/types';
import { ChoiceButtons } from './ChoiceButtons';

interface VignetteViewerProps {
  vignette: ClinicalVignette;
  currentNode: DecisionNode;
  nodeIndex: number;
  totalNodes: number;
  onMakeChoice: (choiceId: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  selectedChoice: Choice | null;
  showFeedback: boolean;
  isComplete: boolean;
}

export function VignetteViewer({
  vignette,
  currentNode,
  nodeIndex,
  totalNodes,
  onMakeChoice,
  onContinue,
  onBack,
  selectedChoice,
  showFeedback,
  isComplete
}: VignetteViewerProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && showFeedback) {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, onContinue]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main card */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Scenario content */}
        <div className="p-6 md:p-8">
          {/* Initial scenario (first node only) */}
          {nodeIndex === 1 && (
            <div className="mb-6">
              <p className="text-[15px] text-slate-700 leading-[1.7] font-light">
                {vignette.initialScenario}
              </p>
            </div>
          )}

          {/* Current node content */}
          <div className="space-y-5">
            {/* Node content */}
            {currentNode.content && (
              <p className="text-[15px] text-slate-700 leading-[1.7] font-light">
                {currentNode.content}
              </p>
            )}

            {/* Media if present */}
            {currentNode.media && (
              <div className="my-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={currentNode.media.data}
                    alt={currentNode.media.caption || 'Clinical image'}
                    className="w-full max-h-72 object-contain"
                  />
                  {currentNode.media.caption && (
                    <p className="px-4 py-2 text-sm text-slate-500 bg-slate-100 border-t border-slate-200">
                      {currentNode.media.caption}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Question and Choices */}
            {currentNode.question && currentNode.type === 'decision' && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-800 mb-4">
                  {currentNode.question}
                </h3>

                {currentNode.choices && (
                  <ChoiceButtons
                    choices={currentNode.choices}
                    onSelect={onMakeChoice}
                    disabled={showFeedback}
                    selectedChoiceId={selectedChoice?.id}
                  />
                )}
              </div>
            )}

            {/* Outcome node */}
            {currentNode.type === 'outcome' && (
              <div className={`
                mt-5 p-5 rounded-xl border
                ${selectedChoice?.isOptimal
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : selectedChoice?.isAcceptable
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-red-50/50 border-red-200'
                }
              `}>
                <div className="flex items-start gap-3">
                  {selectedChoice?.isOptimal ? (
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1 text-sm">Outcome</h4>
                    <p className="text-[15px] text-slate-600 leading-relaxed font-light">
                      {currentNode.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback panel */}
        {showFeedback && selectedChoice && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8">
            {/* Feedback badge and text */}
            <div className="mb-4">
              <span className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3
                ${selectedChoice.isOptimal
                  ? 'bg-emerald-100 text-emerald-700'
                  : selectedChoice.isAcceptable
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }
              `}>
                {selectedChoice.isOptimal ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Optimal
                  </>
                ) : selectedChoice.isAcceptable ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                    </svg>
                    Acceptable
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Suboptimal
                  </>
                )}
              </span>
              <p className="text-[15px] text-slate-600 leading-relaxed font-light">
                {selectedChoice.feedback}
              </p>
            </div>

            {/* Consequence (if present) */}
            {selectedChoice.consequence && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 mb-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Result:</span> {selectedChoice.consequence}
                </p>
              </div>
            )}

            {/* Clinical pearl */}
            {currentNode.clinicalPearl && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl mb-5">
                <div className="flex items-start gap-2.5">
                  <span className="text-base">💡</span>
                  <div>
                    <h5 className="font-medium text-indigo-900 text-sm mb-1">Clinical Pearl</h5>
                    <p className="text-sm text-indigo-800/80 leading-relaxed font-light">
                      {currentNode.clinicalPearl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="
                w-full py-3.5 px-6
                bg-gradient-to-r from-indigo-500 to-purple-500
                hover:from-indigo-600 hover:to-purple-600
                text-white font-medium rounded-xl
                shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <span>{isComplete ? 'View Outcome' : 'Continue'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
