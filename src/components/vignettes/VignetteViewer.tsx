'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClinicalVignette, DecisionNode, Choice } from '@/types';
import { ChoiceButtons } from './ChoiceButtons';

// History entry for progressive display
interface HistoryEntry {
  nodeId: string;
  node: DecisionNode;
  selectedChoice: Choice | null;
}

interface VignetteViewerProps {
  vignette: ClinicalVignette;
  currentNode: DecisionNode;
  nodeIndex: number;
  totalNodes: number;
  onMakeChoice: (choiceId: string) => void;
  onContinue: () => void;
  onRetry?: () => void;
  onBack?: () => void;
  selectedChoice: Choice | null;
  showFeedback: boolean;
  isComplete: boolean;
  history?: HistoryEntry[];
}

// Collapsible history card component
function CollapsibleHistoryCard({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const choice = entry.selectedChoice;

  if (!choice) return null;

  const isOptimal = choice.isOptimal;
  const isAcceptable = choice.isAcceptable;

  return (
    <div className={`
      rounded-xl overflow-hidden transition-all duration-300
      ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
      ${isOptimal
        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
        : isAcceptable
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
      }
    `}>
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Step badge */}
          <span className={`
            flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
            ${isOptimal
              ? 'bg-tribe-sage-500 text-white'
              : isAcceptable
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
            }
          `}>
            {index + 1}
          </span>

          {/* Answer summary */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700 truncate">
              {choice.text}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {entry.node.question}
            </p>
          </div>
        </div>

        {/* Status & expand icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`
            px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide
            ${isOptimal
              ? 'bg-tribe-sage-100 text-tribe-sage-700'
              : isAcceptable
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }
          `}>
            {isOptimal ? '✓ Optimal' : isAcceptable ? '~ Acceptable' : '✗ Suboptimal'}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-200/50">
          {/* Full scenario text */}
          {entry.node.content && (
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              {entry.node.content}
            </p>
          )}

          {/* Media if present */}
          {entry.node.media && (
            <div className="mb-3">
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={entry.node.media.data}
                  alt={entry.node.media.caption || 'Clinical image'}
                  className="w-full max-h-40 object-contain"
                />
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className={`
            p-3 rounded-lg mb-2
            ${isOptimal
              ? 'bg-tribe-sage-100/50'
              : isAcceptable
                ? 'bg-amber-100/50'
                : 'bg-red-100/50'
            }
          `}>
            <p className="text-sm text-slate-700 italic">
              {choice.feedback}
            </p>
          </div>

          {/* Clinical pearl */}
          {entry.node.clinicalPearl && (
            <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm">💡</span>
              <p className="text-xs text-indigo-800 leading-relaxed">
                {entry.node.clinicalPearl}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VignetteViewer({
  vignette,
  currentNode,
  nodeIndex,
  totalNodes,
  onMakeChoice,
  onContinue,
  onRetry,
  onBack,
  selectedChoice,
  showFeedback,
  isComplete,
  history = []
}: VignetteViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && showFeedback && (selectedChoice?.isOptimal || selectedChoice?.isAcceptable)) {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, onContinue, selectedChoice]);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [history.length, showFeedback, currentNode.id]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Initial scenario card - always prominent */}
      <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200 overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Case Presentation</h2>
              <p className="text-xs text-slate-500">{vignette.metadata.system} • {vignette.metadata.topic}</p>
            </div>
          </div>

          <p className="text-[17px] text-slate-800 leading-[1.8] font-normal">
            {vignette.initialScenario}
          </p>
        </div>
      </div>

      {/* Previous nodes - collapsible summary cards */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1">
            Your Clinical Decisions
          </p>
          {history.map((entry, index) => (
            <CollapsibleHistoryCard key={entry.nodeId} entry={entry} index={index} />
          ))}
        </div>
      )}

      {/* Current node - the active decision point */}
      <div className={`
        relative bg-white rounded-2xl overflow-hidden transition-all duration-500
        ${showFeedback
          ? selectedChoice?.isOptimal
            ? 'shadow-xl shadow-emerald-100/50 border-2 border-emerald-300'
            : selectedChoice?.isAcceptable
              ? 'shadow-xl shadow-amber-100/50 border-2 border-amber-300'
              : 'shadow-xl shadow-red-100/50 border-2 border-red-300'
          : 'shadow-xl shadow-indigo-100/50 border-2 border-indigo-200'
        }
      `}>
        {/* Active indicator header */}
        <div className={`
          px-5 py-3 border-b transition-colors duration-300
          ${showFeedback
            ? selectedChoice?.isOptimal
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
              : selectedChoice?.isAcceptable
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-100'
          }
        `}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {!showFeedback ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-indigo-700">Decision Point</span>
                </>
              ) : (
                <>
                  {selectedChoice?.isOptimal ? (
                    <svg className="w-5 h-5 text-tribe-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : selectedChoice?.isAcceptable ? (
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm font-semibold ${
                    selectedChoice?.isOptimal
                      ? 'text-tribe-sage-700'
                      : selectedChoice?.isAcceptable
                        ? 'text-amber-700'
                        : 'text-red-700'
                  }`}>
                    {selectedChoice?.isOptimal ? 'Excellent Choice!' : selectedChoice?.isAcceptable ? 'Acceptable Choice' : 'Not Quite Right'}
                  </span>
                </>
              )}
            </span>
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-medium
              ${showFeedback
                ? selectedChoice?.isOptimal
                  ? 'bg-tribe-sage-100 text-tribe-sage-700'
                  : selectedChoice?.isAcceptable
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                : 'bg-white/80 text-indigo-600'
              }
            `}>
              Step {history.length + 1}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Node content */}
          {currentNode.content && (
            <p className="text-[17px] text-slate-800 leading-[1.8]">
              {currentNode.content}
            </p>
          )}

          {/* Media if present */}
          {currentNode.media && (
            <div className="my-5">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
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

          {/* Question and Choices - only show when not showing feedback */}
          {currentNode.question && currentNode.type === 'decision' && !showFeedback && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">?</span>
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
              mt-5 p-5 rounded-xl border-2
              ${selectedChoice?.isOptimal
                ? 'bg-tribe-sage-50 border-emerald-200'
                : selectedChoice?.isAcceptable
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
              }
            `}>
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${selectedChoice?.isOptimal
                    ? 'bg-tribe-sage-500'
                    : selectedChoice?.isAcceptable
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }
                `}>
                  {selectedChoice?.isOptimal ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Patient Outcome</h4>
                  <p className="text-[15px] text-slate-700 leading-relaxed">
                    {currentNode.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback panel - appears after answering */}
        {showFeedback && selectedChoice && (
          <div className={`
            border-t-2 p-6 md:p-8
            ${selectedChoice.isOptimal
              ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-100'
              : selectedChoice.isAcceptable
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-100'
                : 'bg-gradient-to-b from-red-50/80 to-white border-red-100'
            }
          `}>
            {/* Your answer */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Answer</p>
              <div className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                ${selectedChoice.isOptimal
                  ? 'bg-tribe-sage-100 text-emerald-800 border border-emerald-200'
                  : selectedChoice.isAcceptable
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }
              `}>
                {selectedChoice.isOptimal && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {selectedChoice.text}
              </div>
            </div>

            {/* Explanation */}
            <div className={`
              p-4 rounded-xl mb-5
              ${selectedChoice.isOptimal
                ? 'bg-tribe-sage-100/50 border border-emerald-200'
                : selectedChoice.isAcceptable
                  ? 'bg-amber-100/50 border border-amber-200'
                  : 'bg-red-100/50 border border-red-200'
              }
            `}>
              <p className="text-[15px] text-slate-700 leading-relaxed">
                {selectedChoice.feedback}
              </p>
            </div>

            {/* Consequence */}
            {selectedChoice.consequence && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 mb-5">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Clinical Result:</span> {selectedChoice.consequence}
                </p>
              </div>
            )}

            {/* Clinical pearl */}
            {currentNode.clinicalPearl && (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-indigo-900 text-sm mb-1">Clinical Pearl</h5>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      {currentNode.clinicalPearl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {/* Retry button - only for wrong answers */}
              {!selectedChoice.isOptimal && !selectedChoice.isAcceptable && onRetry && (
                <button
                  onClick={onRetry}
                  className="
                    flex-1 py-4 px-6
                    bg-white hover:bg-slate-50
                    border-2 border-slate-300 hover:border-slate-400
                    text-slate-700 font-semibold rounded-xl
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              )}

              {/* Continue button - styled differently based on result */}
              <button
                onClick={onContinue}
                className={`
                  flex-1 py-4 px-6
                  font-semibold rounded-xl
                  shadow-lg transition-all duration-200
                  flex items-center justify-center gap-3
                  group
                  ${selectedChoice.isOptimal
                    ? 'bg-gradient-to-r from-tribe-sage-500 to-teal-500 hover:from-emerald-600 hover:to-tribe-sage-600 text-white shadow-emerald-200'
                    : selectedChoice.isAcceptable
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-slate-200'
                  }
                `}
              >
                <span>{isComplete ? 'View Outcome' : 'Continue'}</span>
                {/* Modern down arrow indicating content builds below */}
                <svg
                  className="w-5 h-5 group-hover:translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
