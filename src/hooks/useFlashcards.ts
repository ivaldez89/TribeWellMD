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
      setIsLoading(true);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsAuthenticated(true);

          // Check if migration is needed
          if (hasLocalStorageData() && !isMigrationComplete()) {
            console.log('Starting localStorage to Supabase migration...');
            const result = await migrateLocalStorageToSupabase();
            if (result.success) {
              console.log(`Migration complete: ${result.migratedCount} cards migrated`);
            } else {
              console.error('Migration failed:', result.error);
            }
          }

          // Fetch cards from Supabase
          try {
            const fetchedCards = await fetchFlashcards();
            setCards(fetchedCards);
            setDueCards(getDueCards(fetchedCards));
          } catch (err) {
            console.error('Failed to fetch from Supabase, falling back to localStorage:', err);
            // Fallback to localStorage if Supabase fails
            const localCards = getLocalFlashcards();
            setCards(localCards);
            setDueCards(getDueCards(localCards));
          }
        } else {
          setIsAuthenticated(false);
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
        console.error('Error loading flashcards:', err);
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
    if (isAuthenticated) {
      try {
        const fetchedCards = await fetchFlashcards();
        setCards(fetchedCards);
        setDueCards(getDueCards(fetchedCards));
      } catch (err) {
        console.error('Error refreshing cards:', err);
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
      try {
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
      } catch (err) {
        console.error('Error saving to Supabase:', err);
        // Fallback to localStorage
        saveLocalFlashcard(updatedCard);
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

    if (isAuthenticated) {
      try {
        const newSessionId = await startReviewSession('review');
        setSessionId(newSessionId);
      } catch (err) {
        console.error('Error starting Supabase session:', err);
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
      const endedSession: ReviewSession = {
        ...session,
        endedAt: new Date().toISOString()
      };

      if (isAuthenticated && sessionId) {
        try {
          const totalTimeMs = sessionStartTimeRef.current
            ? Date.now() - sessionStartTimeRef.current
            : 0;

          await endReviewSession(sessionId, {
            cardsReviewed: session.cardsReviewed,
            cardsCorrect: session.cardsCorrect,
            cardsFailed: session.cardsFailed,
            totalTimeMs
          });
        } catch (err) {
          console.error('Error ending Supabase session:', err);
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
    const now = new Date().toISOString();
    const newCard: Flashcard = {
      ...cardData,
      id: crypto.randomUUID(),
      schemaVersion: '1.0',
      createdAt: now,
      updatedAt: now
    };

    if (isAuthenticated) {
      try {
        const createdCard = await createFlashcardApi(newCard);
        const updatedCards = [...cards, createdCard];
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      } catch (err) {
        console.error('Error creating card in Supabase:', err);
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
      console.log('No new unique cards to add');
      return;
    }

    if (isAuthenticated) {
      try {
        const createdCards = await createFlashcardsApi(uniqueNewCards);
        const mergedCards = [...cards, ...createdCards];
        setCards(mergedCards);
        setDueCards(getDueCards(mergedCards));
        console.log(`Added ${createdCards.length} new cards to Supabase`);
      } catch (err) {
        console.error('Error creating cards in Supabase:', err);
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
      console.log(`Added ${uniqueNewCards.length} new cards to localStorage`);
    }
  }, [cards, isAuthenticated]);

  // Update existing card
  const updateCard = useCallback(async (updatedCard: Flashcard) => {
    const updated = { ...updatedCard, updatedAt: new Date().toISOString() };

    if (isAuthenticated) {
      try {
        const result = await updateFlashcardApi(updatedCard.id, updated);
        const updatedCards = cards.map(c => c.id === result.id ? result : c);
        setCards(updatedCards);
        setDueCards(getDueCards(updatedCards));
      } catch (err) {
        console.error('Error updating card in Supabase:', err);
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
    if (isAuthenticated) {
      try {
        await deleteFlashcardApi(id);
      } catch (err) {
        console.error('Error deleting card from Supabase:', err);
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
