'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Flashcard, Rating, ReviewSession, ReviewRecord, DeckFilter, TopicPerformance, MedicalSystem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  fetchFlashcards,
  createFlashcard as createFlashcardApi,
  createFlashcards as createFlashcardsApi,
  updateFlashcard as updateFlashcardApi,
  updateFlashcardSR,
  deleteFlashcard as deleteFlashcardApi,
  startReviewSession,
  endReviewSession,
  recordReview,
} from '@/lib/supabase/flashcards';
import {
  getFlashcards as getLocalFlashcards,
  saveFlashcard as saveLocalFlashcard,
  saveFlashcards as saveLocalFlashcards,
  seedFlashcards,
  saveSession as saveLocalSession,
  getFilters,
  saveFilters
} from '@/lib/storage/localStorage';
import {
  migrateLocalStorageToSupabase,
  hasLocalStorageData,
  isMigrationComplete
} from '@/lib/storage/migration';
import {
  scheduleCard,
  getDueCards,
  calculateStats,
  previewSchedule
} from '@/lib/spaced-repetition/fsrs';
import {
  flashcardLogger,
  sessionLogger,
  metrics,
  METRIC_NAMES,
  withRetry,
  checkCircuitBreaker,
  recordSuccess,
  recordFailure,
} from '@/lib/observability';

interface UseFlashcardsReturn {
  // State
  cards: Flashcard[];
  dueCards: Flashcard[];
  filteredDueCards: Flashcard[];
  currentCard: Flashcard | null;
  currentIndex: number;
  isRevealed: boolean;
  isLoading: boolean;
  stats: ReturnType<typeof calculateStats>;
  session: ReviewSession | null;
  intervalPreview: Record<Rating, number> | null;

  // Filter state
  filters: DeckFilter;
  availableTags: string[];
  availableSystems: MedicalSystem[];
  topicPerformance: TopicPerformance[];

  // Actions
  revealAnswer: () => void;
  rateCard: (rating: Rating) => void;
  nextCard: () => void;
  previousCard: () => void;
  goToCard: (index: number) => void;
  startSession: () => void;
  endSession: () => void;
  addCard: (card: Omit<Flashcard, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>) => void;
  addCards: (cards: Flashcard[]) => void;
  updateCard: (card: Flashcard) => void;
  deleteCard: (id: string) => void;
  refreshCards: () => void;

  // Filter actions
  setFilters: (filters: DeckFilter) => void;
  clearFilters: () => void;
  toggleTag: (tag: string) => void;
  toggleSystem: (system: MedicalSystem) => void;
}

const defaultFilters: DeckFilter = {
  tags: [],
  systems: [],
  rotations: [],
  states: [],
  difficulties: []
};

// Circuit breaker names
const CB_FLASHCARD_WRITE = 'flashcard-write';
const CB_SESSION = 'session';

export function useFlashcards(): UseFlashcardsReturn {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewStartTime, setReviewStartTime] = useState<number | null>(null);
  const [intervalPreview, setIntervalPreview] = useState<Record<Rating, number> | null>(null);
  const [filters, setFiltersState] = useState<DeckFilter>(defaultFilters);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const sessionStartTimeRef = useRef<number | null>(null);

  // Load cards on mount - checks auth and handles migration
  useEffect(() => {
    const loadData = async () => {
      const loadStart = performance.now();
      setIsLoading(true);
      flashcardLogger.info('Loading flashcards');

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsAuthenticated(true);
          flashcardLogger.debug('User authenticated', { userId: user.id });

          // Check if migration is needed
          if (hasLocalStorageData() && !isMigrationComplete()) {
            flashcardLogger.info('Migration needed, starting...');
            const result = await migrateLocalStorageToSupabase();
            if (result.success) {
              flashcardLogger.info('Migration complete', {
                count: result.migratedCount,
                metadata: { skipped: result.skippedCount, failed: result.failedCount },
              });
            } else {
              flashcardLogger.error('Migration failed', { error: result.error });
            }
          }

          // Fetch cards from Supabase with retry
          const fetchResult = await withRetry(
            'fetchFlashcards',
            async () => fetchFlashcards(),
            { maxRetries: 2 }
          );

          if (fetchResult.success && fetchResult.result) {
            setCards(fetchResult.result);
            setDueCards(getDueCards(fetchResult.result));
            recordSuccess(CB_FLASHCARD_WRITE);
            const duration = Math.round(performance.now() - loadStart);
            metrics.record(METRIC_NAMES.FLASHCARD_LOAD, duration, { count: fetchResult.result.length });
            flashcardLogger.info('Loaded cards from Supabase', {
              count: fetchResult.result.length,
              duration,
            });
          } else {
            recordFailure(CB_FLASHCARD_WRITE);
            flashcardLogger.warn('Supabase fetch failed, falling back to localStorage', {
              error: fetchResult.error?.message,
            });
            // Fallback to localStorage if Supabase fails
            const localCards = getLocalFlashcards();
            setCards(localCards);
            setDueCards(getDueCards(localCards));
          }
        } else {
          setIsAuthenticated(false);
          flashcardLogger.debug('User not authenticated, using localStorage');
          // Not authenticated - use localStorage
          seedFlashcards();
          const loadedCards = getLocalFlashcards();
          setCards(loadedCards);
          setDueCards(getDueCards(loadedCards));
        }

        // Load saved filters
        const savedFilters = getFilters();
        if (savedFilters) {
          setFiltersState(savedFilters);
        }
      } catch (err) {
        flashcardLogger.error('Error loading flashcards', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        // Fallback to localStorage
        seedFlashcards();
        const loadedCards = getLocalFlashcards();
        setCards(loadedCards);
        setDueCards(getDueCards(loadedCards));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Extract available tags and systems from cards
  const availableTags = Array.from(
    new Set(cards.flatMap(c => c.metadata.tags))
  ).sort();

  const availableSystems = Array.from(
    new Set(cards.map(c => c.metadata.system))
  ).sort() as MedicalSystem[];

  // Calculate topic performance
  const topicPerformance: TopicPerformance[] = (() => {
    const topicMap = new Map<string, {
      system: MedicalSystem;
      cards: Flashcard[];
    }>();

    cards.forEach(card => {
      const key = card.metadata.topic;
      if (!topicMap.has(key)) {
        topicMap.set(key, { system: card.metadata.system, cards: [] });
      }
      topicMap.get(key)!.cards.push(card);
    });

    return Array.from(topicMap.entries()).map(([topic, data]) => {
      const totalCards = data.cards.length;
      const reviewedCards = data.cards.filter(c => c.spacedRepetition.reps > 0);
      const correctCount = reviewedCards.reduce((sum, c) => sum + c.spacedRepetition.reps, 0);
      const incorrectCount = reviewedCards.reduce((sum, c) => sum + c.spacedRepetition.lapses, 0);
      const averageEase = reviewedCards.length > 0
        ? reviewedCards.reduce((sum, c) => sum + c.spacedRepetition.ease, 0) / reviewedCards.length
        : 2.5;

      const totalAttempts = correctCount + incorrectCount;
      const retentionRate = totalAttempts > 0 ? correctCount / totalAttempts : 0;

      let strength: 'strong' | 'moderate' | 'weak' | 'new';
      if (reviewedCards.length === 0) {
        strength = 'new';
      } else if (retentionRate >= 0.8) {
        strength = 'strong';
      } else if (retentionRate >= 0.6) {
        strength = 'moderate';
      } else {
        strength = 'weak';
      }

      return {
        topic,
        system: data.system,
        totalCards,
        reviewedCards: reviewedCards.length,
        correctCount,
        incorrectCount,
        averageEase,
        retentionRate,
        strength
      };
    }).sort((a, b) => a.retentionRate - b.retentionRate); // Weakest first
  })();

  // Apply filters to due cards
  const filteredDueCards = dueCards.filter(card => {
    // If no filters set, show all
    if (
      filters.tags.length === 0 &&
      filters.systems.length === 0 &&
      filters.rotations.length === 0 &&
      filters.states.length === 0 &&
      filters.difficulties.length === 0
    ) {
      return true;
    }

    // Check tag filter (card must have at least one matching tag)
    if (filters.tags.length > 0) {
      const hasMatchingTag = card.metadata.tags.some(t => filters.tags.includes(t));
      if (!hasMatchingTag) return false;
    }

    // Check system filter
    if (filters.systems.length > 0 && !filters.systems.includes(card.metadata.system)) {
      return false;
    }

    // Check rotation filter
    if (filters.rotations.length > 0 && card.metadata.rotation && !filters.rotations.includes(card.metadata.rotation)) {
      return false;
    }

    // Check state filter
    if (filters.states.length > 0 && !filters.states.includes(card.spacedRepetition.state)) {
      return false;
    }

    // Check difficulty filter
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(card.metadata.difficulty)) {
      return false;
    }

    return true;
  });

  // Current card from filtered list
  const currentCard = filteredDueCards[currentIndex] || null;

  // Calculate interval preview when card changes
  useEffect(() => {
    if (currentCard && isRevealed) {
      setIntervalPreview(previewSchedule(currentCard));
    } else {
      setIntervalPreview(null);
    }
  }, [currentCard, isRevealed]);

  // Calculate stats
  const stats = calculateStats(cards);

  // Refresh cards from storage
  const refreshCards = useCallback(async () => {
    flashcardLogger.debug('Refreshing cards');

    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_FLASHCARD_WRITE);
      if (!canRetry) {
        flashcardLogger.warn('Circuit breaker open, using cached cards');
        return;
      }

      const refreshResult = await withRetry(
        'refreshFlashcards',
        async () => fetchFlashcards(),
        { maxRetries: 2 }
      );

      if (refreshResult.success && refreshResult.result) {
        setCards(refreshResult.result);
        setDueCards(getDueCards(refreshResult.result));
        recordSuccess(CB_FLASHCARD_WRITE);
        flashcardLogger.debug('Cards refreshed', { count: refreshResult.result.length });
      } else {
        recordFailure(CB_FLASHCARD_WRITE);
        flashcardLogger.error('Error refreshing cards', {
          error: refreshResult.error?.message,
        });
      }
    } else {
      const loadedCards = getLocalFlashcards();
      setCards(loadedCards);
      setDueCards(getDueCards(loadedCards));
    }
  }, [isAuthenticated]);

  // Filter actions
  const setFilters = useCallback((newFilters: DeckFilter) => {
    setFiltersState(newFilters);
    saveFilters(newFilters);
    setCurrentIndex(0);
    setIsRevealed(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters]);

  const toggleTag = useCallback((tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter(t => t !== tag)
        : [...filters.tags, tag]
    });
  }, [filters, setFilters]);

  const toggleSystem = useCallback((system: MedicalSystem) => {
    setFilters({
      ...filters,
      systems: filters.systems.includes(system)
        ? filters.systems.filter(s => s !== system)
        : [...filters.systems, system]
    });
  }, [filters, setFilters]);

  // Reveal answer
  const revealAnswer = useCallback(() => {
    setIsRevealed(true);
    setReviewStartTime(Date.now());
  }, []);

  // Rate card and schedule next review
  const rateCard = useCallback(async (rating: Rating) => {
    if (!currentCard) return;

    const reviewStart = performance.now();
    flashcardLogger.debug('Rating card', {
      operation: 'rateCard',
      metadata: { cardId: currentCard.id, rating },
    });

    // Calculate new scheduling
    const result = scheduleCard(currentCard, rating);

    const previousState = currentCard.spacedRepetition.state;
    const srBefore = {
      interval: currentCard.spacedRepetition.interval,
      ease: currentCard.spacedRepetition.ease
    };

    // Update the card
    const updatedCard: Flashcard = {
      ...currentCard,
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        state: result.state,
        interval: result.interval,
        ease: result.ease,
        reps: currentCard.spacedRepetition.reps + (rating !== 'again' ? 1 : 0),
        lapses: currentCard.spacedRepetition.lapses + (rating === 'again' ? 1 : 0),
        nextReview: result.nextReview.toISOString(),
        lastReview: new Date().toISOString(),
        stability: result.stability,
        difficulty: result.difficulty
      }
    };

    // Save to appropriate storage
    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_FLASHCARD_WRITE);

      if (!canRetry) {
        flashcardLogger.warn('Circuit breaker open, saving to localStorage', {
          metadata: { cardId: currentCard.id },
        });
        saveLocalFlashcard(updatedCard);
      } else {
        const saveResult = await withRetry(
          'updateFlashcardSR',
          async () => {
            await updateFlashcardSR(currentCard.id, updatedCard.spacedRepetition);

            // Record review if session active
            if (sessionId && reviewStartTime) {
              const timeSpentMs = Date.now() - reviewStartTime;
              await recordReview(
                sessionId,
                currentCard.id,
                rating,
                timeSpentMs,
                previousState,
                result.state,
                srBefore,
                { interval: result.interval, ease: result.ease }
              );
            }
          },
          { maxRetries: 2 }
        );

        if (saveResult.success) {
          recordSuccess(CB_FLASHCARD_WRITE);
          const duration = Math.round(performance.now() - reviewStart);
          metrics.record(METRIC_NAMES.FLASHCARD_REVIEW, duration, { rating });
          flashcardLogger.debug('Card rated successfully', {
            duration,
            metadata: { cardId: currentCard.id, rating, newState: result.state },
          });
        } else {
          recordFailure(CB_FLASHCARD_WRITE);
          flashcardLogger.warn('Supabase save failed, falling back to localStorage', {
            error: saveResult.error?.message,
            metadata: { cardId: currentCard.id },
          });
          // Fallback to localStorage
          saveLocalFlashcard(updatedCard);
        }
      }
    } else {
      saveLocalFlashcard(updatedCard);
    }

    // Update session if active
    if (session && reviewStartTime) {
      const reviewRecord: ReviewRecord = {
        cardId: currentCard.id,
        rating,
        reviewedAt: new Date().toISOString(),
        timeSpent: Date.now() - reviewStartTime,
        previousState: currentCard.spacedRepetition.state,
        newState: result.state
      };

      const updatedSession: ReviewSession = {
        ...session,
        cardsReviewed: session.cardsReviewed + 1,
        cardsCorrect: session.cardsCorrect + (rating !== 'again' ? 1 : 0),
        cardsFailed: session.cardsFailed + (rating === 'again' ? 1 : 0),
        reviews: [...session.reviews, reviewRecord]
      };

      setSession(updatedSession);
      if (!isAuthenticated) {
        saveLocalSession(updatedSession);
      }
    }

    // Update local state
    const updatedCards = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
    setCards(updatedCards);

    // Remove from due cards if no longer due (or move to end if still learning)
    if (result.state === 'learning' || result.state === 'relearning') {
      // Keep in queue but move to end
      const newDue = [...dueCards];
      const idx = newDue.findIndex(c => c.id === currentCard.id);
      if (idx >= 0) {
        newDue.splice(idx, 1);
        newDue.push(updatedCard);
      }
      setDueCards(newDue);
    } else {
      // Remove from due cards
      const newDue = dueCards.filter(c => c.id !== currentCard.id);
      setDueCards(newDue);

      // Adjust index if needed
      if (currentIndex >= filteredDueCards.length - 1 && filteredDueCards.length > 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }

    // Reset for next card
    setIsRevealed(false);
    setReviewStartTime(null);
  }, [currentCard, cards, dueCards, filteredDueCards, currentIndex, session, sessionId, reviewStartTime, isAuthenticated]);

  // Navigation
  const nextCard = useCallback(() => {
    if (currentIndex < filteredDueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    }
  }, [currentIndex, filteredDueCards.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsRevealed(false);
    }
  }, [currentIndex]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < filteredDueCards.length) {
      setCurrentIndex(index);
      setIsRevealed(false);
    }
  }, [filteredDueCards.length]);

  // Session management
  const startSession = useCallback(async () => {
    sessionStartTimeRef.current = Date.now();
    sessionLogger.info('Starting review session');
    metrics.record(METRIC_NAMES.SESSION_START, 1);

    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_SESSION);

      if (canRetry) {
        const sessionResult = await withRetry(
          'startReviewSession',
          async () => startReviewSession('review'),
          { maxRetries: 2 }
        );

        if (sessionResult.success && sessionResult.result) {
          setSessionId(sessionResult.result);
          recordSuccess(CB_SESSION);
          sessionLogger.info('Supabase session started', {
            metadata: { sessionId: sessionResult.result },
          });
        } else {
          recordFailure(CB_SESSION);
          sessionLogger.warn('Failed to start Supabase session', {
            error: sessionResult.error?.message,
          });
        }
      } else {
        sessionLogger.warn('Circuit breaker open, session not tracked in Supabase');
      }
    }

    const newSession: ReviewSession = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      cardsReviewed: 0,
      cardsCorrect: 0,
      cardsFailed: 0,
      reviews: []
    };
    setSession(newSession);
    setCurrentIndex(0);
    setIsRevealed(false);
  }, [isAuthenticated]);

  const endSessionFn = useCallback(async () => {
    if (session) {
      const totalTimeMs = sessionStartTimeRef.current
        ? Date.now() - sessionStartTimeRef.current
        : 0;

      sessionLogger.info('Ending review session', {
        duration: totalTimeMs,
        metadata: {
          cardsReviewed: session.cardsReviewed,
          cardsCorrect: session.cardsCorrect,
          cardsFailed: session.cardsFailed,
        },
      });
      metrics.record(METRIC_NAMES.SESSION_END, totalTimeMs, {
        cardsReviewed: session.cardsReviewed,
      });

      const endedSession: ReviewSession = {
        ...session,
        endedAt: new Date().toISOString()
      };

      if (isAuthenticated && sessionId) {
        const endResult = await withRetry(
          'endReviewSession',
          async () => endReviewSession(sessionId, {
            cardsReviewed: session.cardsReviewed,
            cardsCorrect: session.cardsCorrect,
            cardsFailed: session.cardsFailed,
            totalTimeMs
          }),
          { maxRetries: 2 }
        );

        if (endResult.success) {
          recordSuccess(CB_SESSION);
          sessionLogger.info('Session ended in Supabase');
        } else {
          recordFailure(CB_SESSION);
          sessionLogger.warn('Failed to end Supabase session, saving locally', {
            error: endResult.error?.message,
          });
          saveLocalSession(endedSession);
        }
      } else {
        saveLocalSession(endedSession);
      }
    }
    setSession(null);
    setSessionId(null);
    sessionStartTimeRef.current = null;
  }, [session, sessionId, isAuthenticated]);

  // Add new card
  const addCard = useCallback(async (
    cardData: Omit<Flashcard, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>
  ) => {
    const saveStart = performance.now();
    const now = new Date().toISOString();
    const newCard: Flashcard = {
      ...cardData,
      id: crypto.randomUUID(),
      schemaVersion: '1.0',
      createdAt: now,
      updatedAt: now
    };

    flashcardLogger.debug('Adding new card', {
      operation: 'addCard',
      metadata: { cardId: newCard.id },
    });

    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_FLASHCARD_WRITE);

      if (!canRetry) {
        flashcardLogger.warn('Circuit breaker open, saving to localStorage');
        saveLocalFlashcard(newCard);
        const updatedCards = [...cards, newCard];
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
        return;
      }

      const createResult = await withRetry(
        'createFlashcard',
        async () => createFlashcardApi(newCard),
        { maxRetries: 2 }
      );

      if (createResult.success && createResult.result) {
        recordSuccess(CB_FLASHCARD_WRITE);
        const duration = Math.round(performance.now() - saveStart);
        metrics.record(METRIC_NAMES.FLASHCARD_SAVE, duration);
        flashcardLogger.info('Card created in Supabase', {
          duration,
          metadata: { cardId: createResult.result.id },
        });
        const updatedCards = [...cards, createResult.result];
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      } else {
        recordFailure(CB_FLASHCARD_WRITE);
        flashcardLogger.warn('Supabase create failed, saving to localStorage', {
          error: createResult.error?.message,
        });
        // Fallback to localStorage
        saveLocalFlashcard(newCard);
        const updatedCards = [...cards, newCard];
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      }
    } else {
      saveLocalFlashcard(newCard);
      const updatedCards = [...cards, newCard];
      setCards(updatedCards);
      setDueCards(getDueCards(updatedCards));
    }
  }, [cards, isAuthenticated]);

  // Add multiple cards (merge without duplicates)
  const addCards = useCallback(async (newCards: Flashcard[]) => {
    const existingIds = new Set(cards.map(c => c.id));
    const existingContent = new Set(cards.map(c => c.content.front.toLowerCase().trim()));

    const uniqueNewCards = newCards.filter(newCard => {
      const isDuplicateId = existingIds.has(newCard.id);
      const isDuplicateContent = existingContent.has(newCard.content.front.toLowerCase().trim());
      return !isDuplicateId && !isDuplicateContent;
    });

    if (uniqueNewCards.length === 0) {
      flashcardLogger.debug('No new unique cards to add');
      return;
    }

    flashcardLogger.info('Adding multiple cards', {
      count: uniqueNewCards.length,
      metadata: { total: newCards.length, duplicates: newCards.length - uniqueNewCards.length },
    });

    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_FLASHCARD_WRITE);

      if (!canRetry) {
        flashcardLogger.warn('Circuit breaker open, saving to localStorage');
        const mergedCards = [...cards, ...uniqueNewCards];
        saveLocalFlashcards(mergedCards);
        setCards(mergedCards);
        setDueCards(getDueCards(mergedCards));
        return;
      }

      const createResult = await withRetry(
        'createFlashcards',
        async () => createFlashcardsApi(uniqueNewCards),
        { maxRetries: 2 }
      );

      if (createResult.success && createResult.result) {
        recordSuccess(CB_FLASHCARD_WRITE);
        flashcardLogger.info('Cards created in Supabase', {
          count: createResult.result.length,
        });
        const mergedCards = [...cards, ...createResult.result];
        setCards(mergedCards);
        setDueCards(getDueCards(mergedCards));
      } else {
        recordFailure(CB_FLASHCARD_WRITE);
        flashcardLogger.warn('Supabase batch create failed, saving to localStorage', {
          error: createResult.error?.message,
        });
        // Fallback to localStorage
        const mergedCards = [...cards, ...uniqueNewCards];
        saveLocalFlashcards(mergedCards);
        setCards(mergedCards);
        setDueCards(getDueCards(mergedCards));
      }
    } else {
      const mergedCards = [...cards, ...uniqueNewCards];
      saveLocalFlashcards(mergedCards);
      setCards(mergedCards);
      setDueCards(getDueCards(mergedCards));
      flashcardLogger.debug('Cards saved to localStorage', { count: uniqueNewCards.length });
    }
  }, [cards, isAuthenticated]);

  // Update existing card
  const updateCard = useCallback(async (updatedCard: Flashcard) => {
    const updated = { ...updatedCard, updatedAt: new Date().toISOString() };

    flashcardLogger.debug('Updating card', {
      operation: 'updateCard',
      metadata: { cardId: updatedCard.id },
    });

    if (isAuthenticated) {
      const { canRetry } = checkCircuitBreaker(CB_FLASHCARD_WRITE);

      if (!canRetry) {
        flashcardLogger.warn('Circuit breaker open, saving to localStorage');
        saveLocalFlashcard(updated);
        const updatedCards = cards.map(c => c.id === updated.id ? updated : c);
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
        return;
      }

      const updateResult = await withRetry(
        'updateFlashcard',
        async () => updateFlashcardApi(updatedCard.id, updated),
        { maxRetries: 2 }
      );

      if (updateResult.success && updateResult.result) {
        recordSuccess(CB_FLASHCARD_WRITE);
        flashcardLogger.debug('Card updated in Supabase', {
          metadata: { cardId: updateResult.result.id },
        });
        const updatedCards = cards.map(c => c.id === updateResult.result!.id ? updateResult.result! : c);
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      } else {
        recordFailure(CB_FLASHCARD_WRITE);
        flashcardLogger.warn('Supabase update failed, saving to localStorage', {
          error: updateResult.error?.message,
        });
        // Fallback to localStorage
        saveLocalFlashcard(updated);
        const updatedCards = cards.map(c => c.id === updated.id ? updated : c);
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      }
    } else {
      saveLocalFlashcard(updated);
      const updatedCards = cards.map(c => c.id === updated.id ? updated : c);
      setCards(updatedCards);
      setDueCards(getDueCards(updatedCards));
    }
  }, [cards, isAuthenticated]);

  // Delete card
  const deleteCard = useCallback(async (id: string) => {
    flashcardLogger.debug('Deleting card', {
      operation: 'deleteCard',
      metadata: { cardId: id },
    });

    if (isAuthenticated) {
      const deleteResult = await withRetry(
        'deleteFlashcard',
        async () => deleteFlashcardApi(id),
        { maxRetries: 2 }
      );

      if (deleteResult.success) {
        recordSuccess(CB_FLASHCARD_WRITE);
        flashcardLogger.debug('Card deleted from Supabase', {
          metadata: { cardId: id },
        });
      } else {
        recordFailure(CB_FLASHCARD_WRITE);
        flashcardLogger.warn('Supabase delete failed', {
          error: deleteResult.error?.message,
          metadata: { cardId: id },
        });
      }
    }

    const updatedCards = cards.filter(c => c.id !== id);
    if (!isAuthenticated) {
      saveLocalFlashcards(updatedCards);
    }
    setCards(updatedCards);
    setDueCards(getDueCards(updatedCards));
  }, [cards, isAuthenticated]);

  return {
    cards,
    dueCards,
    filteredDueCards,
    currentCard,
    currentIndex,
    isRevealed,
    isLoading,
    stats,
    session,
    intervalPreview,
    filters,
    availableTags,
    availableSystems,
    topicPerformance,
    revealAnswer,
    rateCard,
    nextCard,
    previousCard,
    goToCard,
    startSession,
    endSession: endSessionFn,
    addCard,
    addCards,
    updateCard,
    deleteCard,
    refreshCards,
    setFilters,
    clearFilters,
    toggleTag,
    toggleSystem
  };
}
