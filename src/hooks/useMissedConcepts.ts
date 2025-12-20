'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ClinicalConcept, Flashcard } from '@/types';
import { getConceptByCode, allConcepts } from '@/data/concept-taxonomy';
import { getCardsByConceptCode, understandingCards } from '@/data/understanding-cards';

// Interface for tracking missed concepts
interface MissedConceptRecord {
  conceptCode: string;
  qbankIds: string[]; // UWorld/AMBOSS IDs that led to this concept
  missCount: number;
  lastMissedAt: string;
  nextReviewAt: string;
  reviewInterval: number; // in days
  mastered: boolean;
}

// Storage key
const STORAGE_KEY = 'tribewellmd-missed-concepts';

// Default intervals for spaced repetition (in days)
const INTERVALS = {
  new: 1,        // 1 day for new missed concept
  learning: 3,   // 3 days if missed again
  review: 7,     // 7 days if seen again
  mastered: 14   // 14 days if passing consistently
};

export function useMissedConcepts() {
  const [missedConcepts, setMissedConcepts] = useState<MissedConceptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMissedConcepts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading missed concepts:', error);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(missedConcepts));
      } catch (error) {
        console.error('Error saving missed concepts:', error);
      }
    }
  }, [missedConcepts, isLoading]);

  // Record a missed concept (called when user looks up a QBank ID)
  const recordMissedConcept = useCallback((conceptCode: string, qbankId?: string) => {
    setMissedConcepts(prev => {
      const existing = prev.find(mc => mc.conceptCode === conceptCode);
      const now = new Date().toISOString();

      if (existing) {
        // Concept already tracked - increment miss count and reset interval
        return prev.map(mc => {
          if (mc.conceptCode === conceptCode) {
            const newMissCount = mc.missCount + 1;
            return {
              ...mc,
              qbankIds: qbankId && !mc.qbankIds.includes(qbankId)
                ? [...mc.qbankIds, qbankId]
                : mc.qbankIds,
              missCount: newMissCount,
              lastMissedAt: now,
              nextReviewAt: new Date(Date.now() + INTERVALS.new * 24 * 60 * 60 * 1000).toISOString(),
              reviewInterval: INTERVALS.new,
              mastered: false // Reset mastery if missed again
            };
          }
          return mc;
        });
      } else {
        // New missed concept
        return [...prev, {
          conceptCode,
          qbankIds: qbankId ? [qbankId] : [],
          missCount: 1,
          lastMissedAt: now,
          nextReviewAt: new Date(Date.now() + INTERVALS.new * 24 * 60 * 60 * 1000).toISOString(),
          reviewInterval: INTERVALS.new,
          mastered: false
        }];
      }
    });
  }, []);

  // Mark concept as reviewed (passed)
  const markConceptReviewed = useCallback((conceptCode: string, passed: boolean) => {
    setMissedConcepts(prev => {
      return prev.map(mc => {
        if (mc.conceptCode === conceptCode) {
          if (passed) {
            // Increase interval if passed
            const newInterval = Math.min(mc.reviewInterval * 2, INTERVALS.mastered);
            return {
              ...mc,
              nextReviewAt: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString(),
              reviewInterval: newInterval,
              mastered: newInterval >= INTERVALS.mastered
            };
          } else {
            // Reset interval if failed
            return {
              ...mc,
              missCount: mc.missCount + 1,
              lastMissedAt: new Date().toISOString(),
              nextReviewAt: new Date(Date.now() + INTERVALS.new * 24 * 60 * 60 * 1000).toISOString(),
              reviewInterval: INTERVALS.new,
              mastered: false
            };
          }
        }
        return mc;
      });
    });
  }, []);

  // Get concepts due for review today
  const getDueConceptsToday = useCallback((): MissedConceptRecord[] => {
    const now = new Date();
    return missedConcepts.filter(mc => {
      const reviewDate = new Date(mc.nextReviewAt);
      return reviewDate <= now && !mc.mastered;
    }).sort((a, b) => {
      // Sort by miss count (most missed first), then by last missed date
      if (b.missCount !== a.missCount) {
        return b.missCount - a.missCount;
      }
      return new Date(b.lastMissedAt).getTime() - new Date(a.lastMissedAt).getTime();
    });
  }, [missedConcepts]);

  // Get cards for due concepts
  const getDueCards = useCallback((): Flashcard[] => {
    const dueConcepts = getDueConceptsToday();
    const cards: Flashcard[] = [];

    for (const mc of dueConcepts) {
      const conceptCards = getCardsByConceptCode(mc.conceptCode);
      cards.push(...conceptCards);
    }

    return cards;
  }, [getDueConceptsToday]);

  // Get full concept details for a missed concept
  const getConceptDetails = useCallback((conceptCode: string): ClinicalConcept | undefined => {
    return getConceptByCode(conceptCode);
  }, []);

  // Get high-priority missed concepts (most missed, not yet mastered)
  const getHighPriorityConcepts = useCallback((limit: number = 5): (MissedConceptRecord & { concept: ClinicalConcept | undefined })[] => {
    return missedConcepts
      .filter(mc => !mc.mastered)
      .sort((a, b) => b.missCount - a.missCount)
      .slice(0, limit)
      .map(mc => ({
        ...mc,
        concept: getConceptByCode(mc.conceptCode)
      }));
  }, [missedConcepts]);

  // Get statistics
  const getStats = useCallback(() => {
    const total = missedConcepts.length;
    const mastered = missedConcepts.filter(mc => mc.mastered).length;
    const dueToday = getDueConceptsToday().length;
    const totalMisses = missedConcepts.reduce((sum, mc) => sum + mc.missCount, 0);

    // Get system breakdown
    const systemCounts: Record<string, number> = {};
    for (const mc of missedConcepts) {
      const concept = getConceptByCode(mc.conceptCode);
      if (concept) {
        systemCounts[concept.system] = (systemCounts[concept.system] || 0) + mc.missCount;
      }
    }

    // Find weakest system
    let weakestSystem = '';
    let maxMisses = 0;
    for (const [system, count] of Object.entries(systemCounts)) {
      if (count > maxMisses) {
        maxMisses = count;
        weakestSystem = system;
      }
    }

    return {
      totalTracked: total,
      mastered,
      dueToday,
      totalMisses,
      weakestSystem,
      systemBreakdown: systemCounts
    };
  }, [missedConcepts, getDueConceptsToday]);

  // Remove a concept from tracking
  const removeConcept = useCallback((conceptCode: string) => {
    setMissedConcepts(prev => prev.filter(mc => mc.conceptCode !== conceptCode));
  }, []);

  // Clear all tracking
  const clearAll = useCallback(() => {
    setMissedConcepts([]);
  }, []);

  return {
    missedConcepts,
    isLoading,
    recordMissedConcept,
    markConceptReviewed,
    getDueConceptsToday,
    getDueCards,
    getConceptDetails,
    getHighPriorityConcepts,
    getStats,
    removeConcept,
    clearAll
  };
}

export default useMissedConcepts;
