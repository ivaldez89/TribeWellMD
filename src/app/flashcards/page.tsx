'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES } from '@/components/layout/ThreeColumnLayout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { getShelfIcon, getSystemIcon } from '@/components/icons/MedicalIcons';
import { getFlashcards, saveFlashcards } from '@/lib/storage/localStorage';
import type { Rotation, MedicalSystem, Flashcard } from '@/types';

// Shelf categories for browsing
const SHELF_CATEGORIES: { id: Rotation; name: string; color: string }[] = [
  { id: 'Internal Medicine', name: 'Internal Medicine', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'Surgery', name: 'Surgery', color: 'from-[#8B7355] to-[#A89070]' },
  { id: 'Pediatrics', name: 'Pediatrics', color: 'from-[#7FA08F] to-[#9FBFAF]' },
  { id: 'OB/GYN', name: 'OB/GYN', color: 'from-[#C4A77D] to-[#D4B78D]' },
  { id: 'Psychiatry', name: 'Psychiatry', color: 'from-[#6B8B7D] to-[#8BA89A]' },
  { id: 'Family Medicine', name: 'Family Medicine', color: 'from-[#5B7B6D] to-[#7FA08F]' },
  { id: 'Neurology', name: 'Neurology', color: 'from-[#8B7355] to-[#C4A77D]' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine', color: 'from-[#C4A77D] to-[#8B7355]' },
];

// System categories for browsing
const SYSTEM_CATEGORIES: { id: MedicalSystem; name: string }[] = [
  { id: 'Cardiology', name: 'Cardiology' },
  { id: 'Pulmonology', name: 'Pulmonology' },
  { id: 'Gastroenterology', name: 'Gastroenterology' },
  { id: 'Neurology', name: 'Neurology' },
  { id: 'Endocrinology', name: 'Endocrinology' },
  { id: 'Nephrology', name: 'Nephrology' },
  { id: 'Rheumatology', name: 'Rheumatology' },
  { id: 'Hematology/Oncology', name: 'Hematology/Oncology' },
  { id: 'Infectious Disease', name: 'Infectious Disease' },
  { id: 'Dermatology', name: 'Dermatology' },
  { id: 'Psychiatry', name: 'Psychiatry' },
  { id: 'Pediatrics', name: 'Pediatrics' },
  { id: 'OB/GYN', name: 'OB/GYN' },
  { id: 'Surgery', name: 'Surgery' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine' },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const {
    cards,
    dueCards,
    stats,
    filters,
    setFilters,
    topicPerformance,
    refreshCards,
    isLoading,
  } = useFlashcards();

  // Browse dropdown states
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);

  // Force refresh cards on mount to pick up any newly saved pearls from QBank
  useEffect(() => {
    // Small delay to ensure localStorage writes from QBank are complete
    const timer = setTimeout(() => {
      refreshCards();
    }, 100);
    return () => clearTimeout(timer);
  }, [refreshCards]);

  // Migrate old saved pearls from legacy storage to new flashcard storage (runs once)
  useEffect(() => {
    try {
      // Check if migration already completed
      const migrationDone = localStorage.getItem('qbank-pearls-migrated');
      if (migrationDone) return;

      const oldPearlsRaw = localStorage.getItem('qbank-saved-pearls');
      if (!oldPearlsRaw) {
        // No old pearls, mark migration as done
        localStorage.setItem('qbank-pearls-migrated', 'true');
        return;
      }

      const oldPearls = JSON.parse(oldPearlsRaw) as Array<{
        id: string;
        pearl: string;
        questionId: string;
        system: string;
        createdAt: string;
      }>;

      if (oldPearls.length === 0) {
        localStorage.setItem('qbank-pearls-migrated', 'true');
        localStorage.removeItem('qbank-saved-pearls');
        return;
      }

      // Get existing flashcards
      const existingCards = getFlashcards();

      // Convert old pearls to new flashcard format
      const newCards: Flashcard[] = oldPearls.map(pearl => ({
        id: pearl.id,
        schemaVersion: '1.0',
        createdAt: pearl.createdAt,
        updatedAt: pearl.createdAt,
        userId: 'local',
        content: {
          front: `Clinical Pearl: ${pearl.system}`,
          back: pearl.pearl,
          explanation: `From QBank question ${pearl.questionId}`
        },
        metadata: {
          tags: ['qbank-pearl', 'clinical-pearl', pearl.system.toLowerCase().replace(/\s+/g, '-')],
          system: pearl.system as MedicalSystem,
          topic: pearl.system,
          difficulty: 'medium',
          clinicalVignette: false,
          source: 'qbank',
          conceptCode: pearl.questionId
        },
        spacedRepetition: {
          state: 'new',
          interval: 0,
          ease: 2.5,
          reps: 0,
          lapses: 0,
          nextReview: pearl.createdAt
        }
      }));

      // Filter out duplicates (by checking if pearl ID already exists)
      const existingIds = new Set(existingCards.map(c => c.id));
      const uniqueNewCards = newCards.filter(c => !existingIds.has(c.id));

      if (uniqueNewCards.length > 0) {
        // Save migrated cards
        saveFlashcards([...existingCards, ...uniqueNewCards]);
        console.log(`Migrated ${uniqueNewCards.length} pearls from legacy storage`);
        // Refresh the cards in the hook
        setTimeout(() => refreshCards(), 100);
      }

      // Mark migration as complete and clear old storage
      localStorage.setItem('qbank-pearls-migrated', 'true');
      localStorage.removeItem('qbank-saved-pearls');
    } catch (e) {
      console.warn('Failed to migrate legacy pearls:', e);
    }
  }, [refreshCards]);

  // Get cards by system
  const getCardsBySystem = (system: MedicalSystem) => {
    return cards.filter(c => c.metadata.system === system);
  };

  // Get cards by rotation
  const getCardsByRotation = (rotation: Rotation) => {
    return cards.filter(c => c.metadata.rotation === rotation);
  };

  // Calculate weak topics (topics with low retention)
  const weakTopics = useMemo(() => {
    return topicPerformance
      .filter(t => t.strength === 'weak' || t.strength === 'moderate')
      .slice(0, 3);
  }, [topicPerformance]);

  // Get AI-generated cards count
  const aiGeneratedCards = useMemo(() => {
    return cards.filter(c => c.metadata.tags.includes('ai-generated'));
  }, [cards]);

  // Get QBank pearls (clinical pearls saved from QBank questions)
  const qbankPearls = useMemo(() => {
    return cards.filter(c => c.metadata.tags.includes('qbank-pearl'));
  }, [cards]);

  // Get platform cards (our internal cards - no special source tag)
  const platformCards = useMemo(() => {
    return cards.filter(c =>
      !c.metadata.tags.includes('qbank-pearl') &&
      !c.metadata.tags.includes('ai-generated') &&
      c.metadata.source !== 'imported'
    );
  }, [cards]);

  // Get imported cards
  const importedCards = useMemo(() => {
    return cards.filter(c => c.metadata.source === 'imported');
  }, [cards]);

  // Library tab state
  const [activeLibraryTab, setActiveLibraryTab] = useState<'all' | 'platform' | 'qbank' | 'ai' | 'imported'>('all');

  // Calculate progress percentage
  const progressPercentage = stats.totalCards > 0
    ? Math.round(((stats.totalCards - stats.newCards) / stats.totalCards) * 100)
    : 0;

  // Handle starting study session
  const handleStartStudy = () => {
    router.push('/flashcards/study');
  };

  // Handle shelf selection
  const handleShelfSelect = (rotation: Rotation) => {
    setFilters({
      ...filters,
      rotations: [rotation],
      systems: [],
    });
    setShowShelfDropdown(false);
    router.push('/flashcards/study');
  };

  // Handle system selection
  const handleSystemSelect = (system: MedicalSystem) => {
    setFilters({
      ...filters,
      systems: [system],
      rotations: [],
    });
    setShowSystemDropdown(false);
    router.push('/flashcards/study');
  };

  // Handle weak topic selection
  const handleWeakTopicSelect = (system: MedicalSystem) => {
    setFilters({
      ...filters,
      systems: [system],
      rotations: [],
    });
    router.push('/flashcards/study');
  };

  // Handle AI-generated cards study
  const handleStudyAICards = () => {
    setFilters({
      ...filters,
      tags: ['ai-generated'],
      systems: [],
      rotations: [],
    });
    router.push('/flashcards/study');
  };

  // Handle QBank pearls study
  const handleStudyQBankPearls = () => {
    setFilters({
      ...filters,
      tags: ['qbank-pearl'],
      systems: [],
      rotations: [],
    });
    router.push('/flashcards/study');
  };

  // Handle studying cards by source
  const handleStudyBySource = (source: 'all' | 'platform' | 'qbank' | 'ai' | 'imported') => {
    let newFilters = { ...filters, systems: [], rotations: [], tags: [] as string[] };

    switch (source) {
      case 'qbank':
        newFilters.tags = ['qbank-pearl'];
        break;
      case 'ai':
        newFilters.tags = ['ai-generated'];
        break;
      case 'imported':
        // For imported, we'll need to filter differently
        newFilters.tags = ['imported'];
        break;
      case 'platform':
        // Platform cards don't have special tags
        newFilters.tags = ['platform'];
        break;
      default:
        // All cards
        break;
    }

    setFilters(newFilters);
    router.push('/flashcards/study');
  };

  // Get cards for current library tab
  const getCardsForTab = (tab: 'all' | 'platform' | 'qbank' | 'ai' | 'imported') => {
    switch (tab) {
      case 'platform':
        return platformCards;
      case 'qbank':
        return qbankPearls;
      case 'ai':
        return aiGeneratedCards;
      case 'imported':
        return importedCards;
      default:
        return cards;
    }
  };

  // Mobile Header Card
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Flashcards</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats.totalCards} total cards</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#C4A77D]">{stats.dueToday}</p>
            <p className="text-[10px] text-slate-400">Due</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#5B7B6D]">{stats.reviewCards}</p>
            <p className="text-[10px] text-slate-400">Reviewed</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Sidebar Content
  const leftSidebar = (
    <>
      {/* Stats Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        {/* Header gradient */}
        <div className="h-16 bg-gradient-to-br from-[#C4A77D] via-[#D4B78D] to-[#8B7355] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Flashcards</h2>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{stats.totalCards}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#8B7355]">{stats.dueToday}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Due Today</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{stats.reviewCards}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Reviewed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span className="font-medium text-[#5B7B6D]">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Start Study Button */}
          {dueCards.length > 0 && (
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Studying</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCards.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Actions</h3>
        <nav className="space-y-1">
          <Link href="/generate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">AI Generator</span>
          </Link>

          <Link href="/import" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">Import Cards</span>
          </Link>

          <Link href="/study/rapid-review" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-500">Rapid Review</span>
          </Link>
        </nav>
      </div>

      {/* AI Generated Cards Section - Always render for consistency across browsers */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Generated
        </h3>
        {aiGeneratedCards.length > 0 ? (
          <button
            onClick={handleStudyAICards}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-[#C4A77D]/10 to-[#D4B78D]/10 hover:from-[#C4A77D]/20 hover:to-[#D4B78D]/20 transition-colors border border-[#C4A77D]/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700 dark:text-slate-200">{aiGeneratedCards.length} cards</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Study AI-created content</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <Link
            href="/generate"
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A77D]/50 to-[#D4B78D]/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700 dark:text-slate-200">No AI cards yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generate cards with AI</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* QBank Clinical Pearls Section - Always render for consistency across browsers */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          QBank Pearls
        </h3>
        {qbankPearls.length > 0 ? (
          <button
            onClick={handleStudyQBankPearls}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-colors border border-amber-200 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700 dark:text-slate-200">{qbankPearls.length} pearls</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Clinical pearls from QBank</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <Link
            href="/qbank"
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/50 to-orange-500/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700 dark:text-slate-200">No pearls yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Save pearls from QBank</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Needs Practice
          </h3>
          <div className="space-y-2">
            {weakTopics.map((topic) => (
              <button
                key={topic.topic}
                onClick={() => handleWeakTopicSelect(topic.system)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.topic}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B7355]/10 text-[#8B7355]">
                  {Math.round(topic.retentionRate * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar Content
  const rightSidebar = (
    <>
      {/* Study Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          Study Tips
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#5B7B6D]">Spaced Repetition:</span> Cards appear at optimal intervals for long-term retention.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-[#C4A77D]">Active Recall:</span> Try to answer before flipping for better learning.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">This Week</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Cards studied</span>
            <span className="font-semibold text-[#5B7B6D]">{stats.reviewCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">New cards</span>
            <span className="font-semibold text-[#C4A77D]">{stats.newCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Learning</span>
            <span className="font-semibold text-[#8B7355]">{stats.learningCards}</span>
          </div>
        </div>
      </div>
    </>
  );

  // Show loading state
  if (isLoading) {
    return (
      <ThreeColumnLayout
        mobileHeader={mobileHeader}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
      >
        <div className={CARD_STYLES.containerWithPadding + ' text-center py-12'}>
          <div className="w-12 h-12 border-4 border-[#5B7B6D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading flashcards...</p>
        </div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Mobile: Start Study Card */}
      <div className="lg:hidden">
        {dueCards.length > 0 && (
          <div className={CARD_STYLES.containerWithPadding}>
            <button
              onClick={handleStartStudy}
              className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start Studying</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{dueCards.length} due</span>
            </button>
          </div>
        )}
      </div>

      {/* Browse Cards Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Browse Cards</h2>
        </div>

        {/* Dropdown Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Shelf Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShelfDropdown(!showShelfDropdown);
                setShowSystemDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] rounded-xl transition-colors text-sm font-medium text-white"
            >
              <span>By Shelf Exam</span>
              <svg className={`w-4 h-4 transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Shelf Dropdown Menu */}
            {showShelfDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowShelfDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 z-[110] max-h-64 overflow-y-auto">
                  {SHELF_CATEGORIES.map((shelf) => {
                    const count = getCardsByRotation(shelf.id).length;
                    return (
                      <button
                        key={shelf.id}
                        onClick={() => handleShelfSelect(shelf.id)}
                        disabled={count === 0}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                          count > 0
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = getShelfIcon(shelf.id); return <Icon className="w-5 h-5" />; })()}
                          <span className="text-sm font-medium">{shelf.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          count > 0
                            ? 'bg-[#5B7B6D]/10 text-[#5B7B6D]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* System Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSystemDropdown(!showSystemDropdown);
                setShowShelfDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] hover:from-[#B39870] hover:to-[#C4A77D] rounded-xl transition-colors text-sm font-medium text-white"
            >
              <span>By System</span>
              <svg className={`w-4 h-4 transition-transform ${showSystemDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* System Dropdown Menu */}
            {showSystemDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowSystemDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 z-[110] max-h-64 overflow-y-auto">
                  {SYSTEM_CATEGORIES.map((sys) => {
                    const count = getCardsBySystem(sys.id).length;
                    return (
                      <button
                        key={sys.id}
                        onClick={() => handleSystemSelect(sys.id)}
                        disabled={count === 0}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left first:rounded-t-xl last:rounded-b-xl ${
                          count > 0
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = getSystemIcon(sys.id); return <Icon className="w-5 h-5" />; })()}
                          <span className="text-sm font-medium">{sys.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          count > 0
                            ? 'bg-[#C4A77D]/10 text-[#C4A77D]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* My Library Section - Card Sources - Always show */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Library</h2>
        </div>

        {/* Source Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveLibraryTab('all')}
            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeLibraryTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            All ({cards.length})
          </button>
          <button
            onClick={() => setActiveLibraryTab('platform')}
            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeLibraryTab === 'platform'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Platform ({platformCards.length})
          </button>
          <button
            onClick={() => setActiveLibraryTab('qbank')}
            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeLibraryTab === 'qbank'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            QBank ({qbankPearls.length})
          </button>
          <button
            onClick={() => setActiveLibraryTab('ai')}
            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeLibraryTab === 'ai'
                ? 'bg-white dark:bg-slate-700 text-[#C4A77D] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            AI ({aiGeneratedCards.length})
          </button>
          <button
            onClick={() => setActiveLibraryTab('imported')}
            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeLibraryTab === 'imported'
                ? 'bg-white dark:bg-slate-700 text-[#5B7B6D] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Imported ({importedCards.length})
          </button>
        </div>

        {/* Study CTA - Clean, scannable, no card previews */}
        {getCardsForTab(activeLibraryTab).length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {activeLibraryTab === 'qbank' && 'Save Clinical Pearls from QBank questions to see them here.'}
              {activeLibraryTab === 'ai' && 'Generate flashcards with AI to see them here.'}
              {activeLibraryTab === 'imported' && 'Import your own flashcard decks to see them here.'}
              {activeLibraryTab === 'platform' && 'Platform cards will appear here.'}
              {activeLibraryTab === 'all' && 'No cards in your library yet.'}
            </p>
          </div>
        ) : (
          <button
            onClick={() => handleStudyBySource(activeLibraryTab)}
            className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Start Studying</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{getCardsForTab(activeLibraryTab).length} cards</span>
          </button>
        )}
      </div>

      {/* Empty state if no cards */}
      {stats.totalCards === 0 && (
        <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-8') + ' text-center'}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C4A77D]/20 to-[#D4B78D]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Flashcards Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
            Get started by generating cards with AI or importing your own deck.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/generate"
              className="px-4 py-2 bg-gradient-to-r from-[#C4A77D] to-[#D4B78D] hover:from-[#B39870] hover:to-[#C4A77D] text-white font-semibold rounded-xl shadow-md transition-all text-sm"
            >
              Generate with AI
            </Link>
            <Link
              href="/import"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all text-sm"
            >
              Import Cards
            </Link>
          </div>
        </div>
      )}
    </ThreeColumnLayout>
  );
}
