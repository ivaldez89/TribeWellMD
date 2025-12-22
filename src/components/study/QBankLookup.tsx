'use client';

import { useState, useCallback } from 'react';
import { lookupQBankCode, getMappingStats } from '@/data/qbank-lookup';
import type { QBankLookupResult, ClinicalConcept, Flashcard } from '@/types';

interface QBankLookupProps {
  onAddToStudyQueue?: (cards: Flashcard[]) => void;
  variant?: 'full' | 'compact';
}

export function QBankLookup({ onAddToStudyQueue, variant = 'full' }: QBankLookupProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<QBankLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentLookups, setRecentLookups] = useState<string[]>([]);

  const stats = getMappingStats();

  const handleLookup = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter a UWorld QID or AMBOSS code');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate async lookup (in real app this might hit an API)
    setTimeout(() => {
      const lookupResult = lookupQBankCode(input.trim());

      if (lookupResult) {
        setResult(lookupResult);
        setError(null);
        // Add to recent lookups
        setRecentLookups(prev => {
          const filtered = prev.filter(id => id !== input.trim());
          return [input.trim(), ...filtered].slice(0, 5);
        });
      } else {
        setResult(null);
        setError(`No concepts found for "${input}". This question may not be mapped yet.`);
      }

      setIsLoading(false);
    }, 300);
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const handleAddCards = () => {
    if (result?.suggestedCards && onAddToStudyQueue) {
      onAddToStudyQueue(result.suggestedCards);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="UWorld QID or AMBOSS code..."
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Looking...' : 'Lookup'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {result && (
          <div className="mt-3 text-sm">
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              Found {result.concepts.length} concept{result.concepts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">QBank Concept Lookup</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter a missed question ID to find the clinical decision being tested
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{stats.uworldQIDCount.toLocaleString()} UWorld QIDs</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{stats.ambossCodeCount.toLocaleString()} AMBOSS codes</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{stats.conceptCount} clinical concepts</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 4911 (UWorld) or z5ar5O (AMBOSS)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {input && (
              <button
                onClick={() => { setInput(''); setResult(null); setError(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleLookup}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Looking up...
              </span>
            ) : (
              'Lookup Concept'
            )}
          </button>
        </div>

        {/* Recent lookups */}
        {recentLookups.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Recent:</span>
            {recentLookups.map((id) => (
              <button
                key={id}
                onClick={() => { setInput(id); }}
                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Try entering just the numeric ID (e.g., &quot;4911&quot; not &quot;UW4911&quot;)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.source === 'uworld'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                }`}>
                  {result.source === 'uworld' ? 'UWorld' : 'AMBOSS'} #{result.qid}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {result.concepts.length} concept{result.concepts.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Concepts List */}
            {result.concepts.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Clinical Decision Points
                </h3>
                {result.concepts.map((concept) => (
                  <ConceptCard key={concept.code} concept={concept} />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This question ID is mapped in AnKing but we haven&apos;t created specific understanding cards yet.
                </p>
              </div>
            )}

            {/* Suggested Cards */}
            {result.suggestedCards.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Understanding Cards ({result.suggestedCards.length})
                  </h3>
                  {onAddToStudyQueue && (
                    <button
                      onClick={handleAddCards}
                      className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      Add to Study Queue
                    </button>
                  )}
                </div>
                <div className="grid gap-3">
                  {result.suggestedCards.map((card) => (
                    <FlashcardPreview key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      {!result && !error && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How it works:</h4>
            <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
              <li>1. Enter the question ID from a missed UWorld or AMBOSS question</li>
              <li>2. We&apos;ll show you the clinical concept being tested</li>
              <li>3. Study the understanding-based cards to master the &quot;password&quot;</li>
              <li>4. Next time you see this concept, you&apos;ll know exactly what to do</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Concept Card Component
function ConceptCard({ concept }: { concept: ClinicalConcept }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              concept.highYield
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {concept.highYield ? 'HIGH YIELD' : concept.system}
            </span>
            <span className="text-xs text-slate-400">{concept.topic}</span>
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{concept.name}</h4>
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
            {concept.clinicalDecision}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">How This Gets Tested:</h5>
            <ul className="space-y-1">
              {concept.testableAngles.map((angle, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-teal-500 mt-1">-</span>
                  {angle}
                </li>
              ))}
            </ul>
          </div>
          {concept.relatedConcepts.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">Related Concepts:</h5>
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map((code) => (
                  <span key={code} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Flashcard Preview Component
function FlashcardPreview({ card }: { card: Flashcard }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div
      className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
      onClick={() => setShowBack(!showBack)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            card.metadata.difficulty === 'hard'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : card.metadata.difficulty === 'medium'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          }`}>
            {card.metadata.difficulty}
          </span>
          <span className="text-xs text-slate-400">{card.metadata.topic}</span>
        </div>
        <span className="text-xs text-slate-400">
          {showBack ? 'Click to hide' : 'Click to reveal'}
        </span>
      </div>

      <div className="text-sm text-slate-700 dark:text-slate-300">
        {showBack ? (
          <div className="space-y-2">
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <p className="font-medium text-teal-800 dark:text-teal-200 whitespace-pre-wrap">
                {card.content.back.substring(0, 200)}...
              </p>
            </div>
            {card.content.explanation && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {card.content.explanation.substring(0, 150)}...
              </p>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{card.content.front.substring(0, 200)}...</p>
        )}
      </div>
    </div>
  );
}

export default QBankLookup;
