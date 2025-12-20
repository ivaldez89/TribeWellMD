// Library-specific progress tracking
// Separate from user-imported cards to keep TribeWellMD progress distinct

import { useState, useEffect, useCallback } from 'react';

interface CardReviewRecord {
  cardId: string;
  subcategoryId: string;
  reviewedAt: string;
  correct: boolean;
  reviewCount: number;
  consecutiveCorrect: number;
}

interface DailyProgress {
  date: string;
  cardsReviewed: number;
  correct: number;
  incorrect: number;
  subcategoriesStudied: string[];
}

interface SubcategoryProgress {
  subcategoryId: string;
  totalCards: number;
  cardsStudied: number;
  mastered: number; // 3+ consecutive correct
  learning: number; // reviewed but not mastered
  lastStudied: string | null;
}

interface LibraryProgressState {
  cardReviews: Record<string, CardReviewRecord>;
  dailyProgress: DailyProgress[];
  totalCardsReviewed: number;
  totalCorrect: number;
  streak: number;
  lastStudyDate: string | null;
}

const STORAGE_KEY = 'tribewellmd_library_progress';

const initialState: LibraryProgressState = {
  cardReviews: {},
  dailyProgress: [],
  totalCardsReviewed: 0,
  totalCorrect: 0,
  streak: 0,
  lastStudyDate: null
};

function loadProgress(): LibraryProgressState {
  if (typeof window === 'undefined') return initialState;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading library progress:', e);
  }
  return initialState;
}

function saveProgress(state: LibraryProgressState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving library progress:', e);
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function useLibraryProgress() {
  const [progress, setProgress] = useState<LibraryProgressState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
    setIsLoaded(true);
  }, []);

  // Save whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      saveProgress(progress);
    }
  }, [progress, isLoaded]);

  // Record a card review
  const recordCardReview = useCallback((cardId: string, subcategoryId: string, correct: boolean) => {
    setProgress(prev => {
      const today = getToday();
      const now = new Date().toISOString();

      // Update card review record
      const existingReview = prev.cardReviews[cardId];
      const newReview: CardReviewRecord = {
        cardId,
        subcategoryId,
        reviewedAt: now,
        correct,
        reviewCount: (existingReview?.reviewCount || 0) + 1,
        consecutiveCorrect: correct
          ? (existingReview?.consecutiveCorrect || 0) + 1
          : 0
      };

      // Update daily progress
      const dailyIndex = prev.dailyProgress.findIndex(d => d.date === today);
      let updatedDaily: DailyProgress[];

      if (dailyIndex >= 0) {
        updatedDaily = prev.dailyProgress.map((d, i) => {
          if (i === dailyIndex) {
            return {
              ...d,
              cardsReviewed: d.cardsReviewed + 1,
              correct: d.correct + (correct ? 1 : 0),
              incorrect: d.incorrect + (correct ? 0 : 1),
              subcategoriesStudied: d.subcategoriesStudied.includes(subcategoryId)
                ? d.subcategoriesStudied
                : [...d.subcategoriesStudied, subcategoryId]
            };
          }
          return d;
        });
      } else {
        updatedDaily = [
          ...prev.dailyProgress,
          {
            date: today,
            cardsReviewed: 1,
            correct: correct ? 1 : 0,
            incorrect: correct ? 0 : 1,
            subcategoriesStudied: [subcategoryId]
          }
        ];
      }

      // Calculate streak
      let streak = prev.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (prev.lastStudyDate === today) {
        // Already studied today, streak unchanged
      } else if (prev.lastStudyDate === yesterdayStr) {
        // Studied yesterday, increment streak
        streak += 1;
      } else if (!prev.lastStudyDate) {
        // First time studying
        streak = 1;
      } else {
        // Streak broken
        streak = 1;
      }

      return {
        cardReviews: {
          ...prev.cardReviews,
          [cardId]: newReview
        },
        dailyProgress: updatedDaily,
        totalCardsReviewed: prev.totalCardsReviewed + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        streak,
        lastStudyDate: today
      };
    });
  }, []);

  // Get progress for a specific subcategory
  const getSubcategoryProgress = useCallback((subcategoryId: string): SubcategoryProgress | null => {
    const cardReviews = Object.values(progress.cardReviews).filter(
      r => r.subcategoryId === subcategoryId
    );

    if (cardReviews.length === 0) {
      return null;
    }

    const mastered = cardReviews.filter(r => r.consecutiveCorrect >= 3).length;
    const learning = cardReviews.filter(r => r.consecutiveCorrect < 3).length;
    const lastReview = cardReviews.sort((a, b) =>
      new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    )[0];

    return {
      subcategoryId,
      totalCards: 0, // Would need to be passed in
      cardsStudied: cardReviews.length,
      mastered,
      learning,
      lastStudied: lastReview?.reviewedAt || null
    };
  }, [progress.cardReviews]);

  // Get overall stats
  const getOverallStats = useCallback(() => {
    const allReviews = Object.values(progress.cardReviews);
    const mastered = allReviews.filter(r => r.consecutiveCorrect >= 3).length;

    return {
      totalCardsStudied: allReviews.length,
      totalReviews: progress.totalCardsReviewed,
      accuracy: progress.totalCardsReviewed > 0
        ? Math.round((progress.totalCorrect / progress.totalCardsReviewed) * 100)
        : 0,
      mastered,
      learning: allReviews.length - mastered,
      streak: progress.streak,
      lastStudyDate: progress.lastStudyDate
    };
  }, [progress]);

  // Get daily progress for calendar view
  const getDailyProgress = useCallback((days: number = 30): DailyProgress[] => {
    const result: DailyProgress[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existing = progress.dailyProgress.find(d => d.date === dateStr);
      result.push(existing || {
        date: dateStr,
        cardsReviewed: 0,
        correct: 0,
        incorrect: 0,
        subcategoriesStudied: []
      });
    }

    return result;
  }, [progress.dailyProgress]);

  // Get cards due for review (simple spaced repetition)
  const getCardsDueForReview = useCallback((subcategoryId?: string): string[] => {
    const now = new Date();
    const dueCards: string[] = [];

    Object.values(progress.cardReviews).forEach(review => {
      if (subcategoryId && review.subcategoryId !== subcategoryId) {
        return;
      }

      // Simple spacing: review again after 1 day * consecutiveCorrect (max 7 days)
      const lastReview = new Date(review.reviewedAt);
      const daysToWait = Math.min(review.consecutiveCorrect || 1, 7);
      lastReview.setDate(lastReview.getDate() + daysToWait);

      if (now >= lastReview) {
        dueCards.push(review.cardId);
      }
    });

    return dueCards;
  }, [progress.cardReviews]);

  // Reset progress (for testing or user request)
  const resetProgress = useCallback(() => {
    setProgress(initialState);
  }, []);

  return {
    isLoaded,
    progress,
    recordCardReview,
    getSubcategoryProgress,
    getOverallStats,
    getDailyProgress,
    getCardsDueForReview,
    resetProgress
  };
}
