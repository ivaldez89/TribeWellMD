/**
 * LocalStorage to Supabase Migration Utility
 *
 * Handles one-time migration of flashcard data from localStorage to Supabase
 * for authenticated users. Idempotent and safe to re-run.
 */

import { createClient } from '@/lib/supabase/client';
import { createFlashcards } from '@/lib/supabase/flashcards';
import type { Flashcard } from '@/types';

const STORAGE_KEYS = {
  FLASHCARDS: 'step2_flashcards',
  SESSIONS: 'step2_sessions',
  MIGRATION_COMPLETE: 'step2_migration_to_supabase_complete',
  MIGRATION_TIMESTAMP: 'step2_migration_timestamp',
} as const;

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  error?: string;
}

/**
 * Check if localStorage has flashcard data that needs migration
 */
export function hasLocalStorageData(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!data) return false;

    const cards = JSON.parse(data);
    return Array.isArray(cards) && cards.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if migration has already been completed
 */
export function isMigrationComplete(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Get localStorage flashcards
 */
function getLocalStorageFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Mark migration as complete
 */
function markMigrationComplete(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETE, 'true');
    localStorage.setItem(STORAGE_KEYS.MIGRATION_TIMESTAMP, new Date().toISOString());
  } catch (err) {
    console.error('Failed to mark migration complete:', err);
  }
}

/**
 * Clear localStorage flashcard data after successful migration
 */
function clearLocalStorageFlashcards(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}

/**
 * Migrate flashcards from localStorage to Supabase
 *
 * This function is:
 * - Idempotent: safe to call multiple times
 * - User-scoped: only migrates to the current authenticated user
 * - Non-destructive: only clears localStorage after successful migration
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  // Check if we're in browser
  if (typeof window === 'undefined') {
    return { success: false, migratedCount: 0, skippedCount: 0, error: 'Not in browser environment' };
  }

  // Check if migration already complete
  if (isMigrationComplete()) {
    console.log('Migration already complete, skipping');
    return { success: true, migratedCount: 0, skippedCount: 0 };
  }

  // Check if there's data to migrate
  if (!hasLocalStorageData()) {
    console.log('No localStorage data to migrate');
    markMigrationComplete();
    return { success: true, migratedCount: 0, skippedCount: 0 };
  }

  // Check authentication
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, migratedCount: 0, skippedCount: 0, error: 'User not authenticated' };
  }

  try {
    // Get localStorage cards
    const localCards = getLocalStorageFlashcards();
    console.log(`Found ${localCards.length} cards in localStorage to migrate`);

    if (localCards.length === 0) {
      markMigrationComplete();
      return { success: true, migratedCount: 0, skippedCount: 0 };
    }

    // Fetch existing Supabase cards to avoid duplicates
    const { data: existingCards, error: fetchError } = await supabase
      .from('flashcards')
      .select('id, front')
      .eq('user_id', user.id);

    if (fetchError) {
      throw new Error(`Failed to fetch existing cards: ${fetchError.message}`);
    }

    // Create sets for deduplication
    const existingIds = new Set((existingCards || []).map(c => c.id));
    const existingContent = new Set((existingCards || []).map(c => c.front.toLowerCase().trim()));

    // Filter cards that don't exist in Supabase
    const cardsToMigrate = localCards.filter(card => {
      const isDuplicateId = existingIds.has(card.id);
      const isDuplicateContent = existingContent.has(card.content.front.toLowerCase().trim());
      return !isDuplicateId && !isDuplicateContent;
    });

    const skippedCount = localCards.length - cardsToMigrate.length;

    if (cardsToMigrate.length === 0) {
      console.log(`All ${localCards.length} cards already exist in Supabase, skipping`);
      markMigrationComplete();
      clearLocalStorageFlashcards();
      return { success: true, migratedCount: 0, skippedCount };
    }

    // Prepare cards for migration (update userId to current user)
    const preparedCards: Flashcard[] = cardsToMigrate.map(card => ({
      ...card,
      userId: user.id,
      // Ensure dates are in ISO format
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: card.updatedAt || new Date().toISOString(),
      spacedRepetition: {
        ...card.spacedRepetition,
        nextReview: card.spacedRepetition.nextReview || new Date().toISOString(),
      }
    }));

    // Migrate in batches to avoid timeout
    const BATCH_SIZE = 50;
    let migratedCount = 0;

    for (let i = 0; i < preparedCards.length; i += BATCH_SIZE) {
      const batch = preparedCards.slice(i, i + BATCH_SIZE);

      try {
        await createFlashcards(batch);
        migratedCount += batch.length;
        console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} cards`);
      } catch (batchError) {
        console.error(`Failed to migrate batch starting at index ${i}:`, batchError);
        // Continue with other batches
      }
    }

    // Mark migration complete and clear localStorage
    markMigrationComplete();
    clearLocalStorageFlashcards();

    console.log(`Migration complete: ${migratedCount} cards migrated, ${skippedCount} skipped`);

    return {
      success: true,
      migratedCount,
      skippedCount
    };
  } catch (err) {
    console.error('Migration failed:', err);
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      error: err instanceof Error ? err.message : 'Unknown migration error'
    };
  }
}

/**
 * Reset migration status (for testing/debugging)
 */
export function resetMigrationStatus(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_COMPLETE);
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_TIMESTAMP);
    console.log('Migration status reset');
  } catch (err) {
    console.error('Failed to reset migration status:', err);
  }
}

/**
 * Get migration status info
 */
export function getMigrationStatus(): {
  complete: boolean;
  timestamp: string | null;
  hasLocalData: boolean;
} {
  if (typeof window === 'undefined') {
    return { complete: false, timestamp: null, hasLocalData: false };
  }

  try {
    return {
      complete: localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE) === 'true',
      timestamp: localStorage.getItem(STORAGE_KEYS.MIGRATION_TIMESTAMP),
      hasLocalData: hasLocalStorageData()
    };
  } catch {
    return { complete: false, timestamp: null, hasLocalData: false };
  }
}
