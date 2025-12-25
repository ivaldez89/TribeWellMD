/**
 * LocalStorage to Supabase Migration Utility
 *
 * Handles one-time migration of flashcard data from localStorage to Supabase
 * for authenticated users. Idempotent and safe to re-run.
 */

import { createClient } from '@/lib/supabase/client';
import { createFlashcards } from '@/lib/supabase/flashcards';
import { migrationLogger, metrics, METRIC_NAMES } from '@/lib/observability';
import type { Flashcard } from '@/types';

// Migration version - increment when migration logic changes
const MIGRATION_VERSION = 1;

const STORAGE_KEYS = {
  FLASHCARDS: 'step2_flashcards',
  SESSIONS: 'step2_sessions',
  MIGRATION_COMPLETE: 'step2_migration_to_supabase_complete',
  MIGRATION_TIMESTAMP: 'step2_migration_timestamp',
  MIGRATION_VERSION: 'step2_migration_version',
  MIGRATION_USER_ID: 'step2_migration_user_id',
} as const;

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  failedCount: number;
  error?: string;
  duration?: number;
  version: number;
}

export interface MigrationStatus {
  complete: boolean;
  timestamp: string | null;
  version: number | null;
  userId: string | null;
  hasLocalData: boolean;
  localCardCount: number;
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
 * Get count of localStorage flashcards
 */
export function getLocalStorageCardCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!data) return 0;

    const cards = JSON.parse(data);
    return Array.isArray(cards) ? cards.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Check if migration has already been completed for the current user
 */
export function isMigrationComplete(userId?: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const complete = localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE) === 'true';
    const version = parseInt(localStorage.getItem(STORAGE_KEYS.MIGRATION_VERSION) || '0', 10);
    const migratedUserId = localStorage.getItem(STORAGE_KEYS.MIGRATION_USER_ID);

    // Migration is complete if:
    // 1. Flag is set
    // 2. Version matches current version
    // 3. If userId provided, it matches the migrated user
    if (!complete) return false;
    if (version < MIGRATION_VERSION) return false;
    if (userId && migratedUserId && migratedUserId !== userId) return false;

    return true;
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
  } catch (err) {
    migrationLogger.error('Failed to parse localStorage flashcards', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    return [];
  }
}

/**
 * Mark migration as complete with version and user tracking
 */
function markMigrationComplete(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETE, 'true');
    localStorage.setItem(STORAGE_KEYS.MIGRATION_TIMESTAMP, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.MIGRATION_VERSION, String(MIGRATION_VERSION));
    localStorage.setItem(STORAGE_KEYS.MIGRATION_USER_ID, userId);

    migrationLogger.info('Migration marked complete', {
      userId,
      metadata: { version: MIGRATION_VERSION },
    });
  } catch (err) {
    migrationLogger.error('Failed to mark migration complete', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
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
    migrationLogger.info('localStorage flashcard data cleared');
  } catch (err) {
    migrationLogger.error('Failed to clear localStorage', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

/**
 * Migrate flashcards from localStorage to Supabase
 *
 * This function is:
 * - Idempotent: safe to call multiple times
 * - User-scoped: only migrates to the current authenticated user
 * - Version-aware: re-runs if migration version increases
 * - Non-destructive: only clears localStorage after successful migration
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  const startTime = performance.now();

  // Check if we're in browser
  if (typeof window === 'undefined') {
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      error: 'Not in browser environment',
      version: MIGRATION_VERSION,
    };
  }

  migrationLogger.info('Starting migration check');

  // Check authentication
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    migrationLogger.warn('Migration skipped: user not authenticated');
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      error: 'User not authenticated',
      version: MIGRATION_VERSION,
    };
  }

  // Check if migration already complete for this user
  if (isMigrationComplete(user.id)) {
    migrationLogger.debug('Migration already complete for user', { userId: user.id });
    return {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      version: MIGRATION_VERSION,
    };
  }

  // Check if there's data to migrate
  if (!hasLocalStorageData()) {
    migrationLogger.info('No localStorage data to migrate');
    markMigrationComplete(user.id);
    return {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      version: MIGRATION_VERSION,
    };
  }

  try {
    // Get localStorage cards
    const localCards = getLocalStorageFlashcards();
    migrationLogger.info('Found localStorage cards to migrate', {
      count: localCards.length,
    });

    if (localCards.length === 0) {
      markMigrationComplete(user.id);
      return {
        success: true,
        migratedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        version: MIGRATION_VERSION,
      };
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

    if (skippedCount > 0) {
      migrationLogger.info('Skipping duplicate cards', { count: skippedCount });
    }

    if (cardsToMigrate.length === 0) {
      migrationLogger.info('All cards already exist in Supabase');
      markMigrationComplete(user.id);
      clearLocalStorageFlashcards();

      const duration = Math.round(performance.now() - startTime);
      metrics.record(METRIC_NAMES.MIGRATION_TOTAL, duration, { skippedCount });

      return {
        success: true,
        migratedCount: 0,
        skippedCount,
        failedCount: 0,
        duration,
        version: MIGRATION_VERSION,
      };
    }

    // Prepare cards for migration (update userId to current user)
    const preparedCards: Flashcard[] = cardsToMigrate.map(card => ({
      ...card,
      userId: user.id,
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: card.updatedAt || new Date().toISOString(),
      spacedRepetition: {
        ...card.spacedRepetition,
        nextReview: card.spacedRepetition.nextReview || new Date().toISOString(),
      },
    }));

    // Migrate in batches to avoid timeout
    const BATCH_SIZE = 50;
    let migratedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < preparedCards.length; i += BATCH_SIZE) {
      const batch = preparedCards.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(preparedCards.length / BATCH_SIZE);
      const batchStart = performance.now();

      try {
        await createFlashcards(batch);
        migratedCount += batch.length;

        const batchDuration = Math.round(performance.now() - batchStart);
        metrics.record(METRIC_NAMES.MIGRATION_BATCH, batchDuration, {
          batchNumber,
          batchSize: batch.length,
        });

        migrationLogger.info(`Migrated batch ${batchNumber}/${totalBatches}`, {
          count: batch.length,
          duration: batchDuration,
        });
      } catch (batchError) {
        failedCount += batch.length;
        migrationLogger.error(`Failed to migrate batch ${batchNumber}/${totalBatches}`, {
          error: batchError instanceof Error ? batchError.message : 'Unknown error',
          count: batch.length,
        });
        // Continue with other batches
      }
    }

    // Only mark complete and clear if at least some cards migrated
    if (migratedCount > 0 || (failedCount === 0 && skippedCount > 0)) {
      markMigrationComplete(user.id);

      // Only clear if all cards successfully migrated or skipped
      if (failedCount === 0) {
        clearLocalStorageFlashcards();
      }
    }

    const duration = Math.round(performance.now() - startTime);
    metrics.record(METRIC_NAMES.MIGRATION_TOTAL, duration, {
      migratedCount,
      skippedCount,
      failedCount,
    });

    migrationLogger.info('Migration complete', {
      count: migratedCount,
      duration,
      metadata: { skippedCount, failedCount },
    });

    return {
      success: failedCount === 0,
      migratedCount,
      skippedCount,
      failedCount,
      duration,
      version: MIGRATION_VERSION,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : 'Unknown migration error';

    migrationLogger.error('Migration failed', {
      error: errorMessage,
      duration,
    });

    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      error: errorMessage,
      duration,
      version: MIGRATION_VERSION,
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
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_VERSION);
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_USER_ID);
    migrationLogger.info('Migration status reset');
  } catch (err) {
    migrationLogger.error('Failed to reset migration status', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

/**
 * Get detailed migration status
 */
export function getMigrationStatus(): MigrationStatus {
  if (typeof window === 'undefined') {
    return {
      complete: false,
      timestamp: null,
      version: null,
      userId: null,
      hasLocalData: false,
      localCardCount: 0,
    };
  }

  try {
    return {
      complete: localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE) === 'true',
      timestamp: localStorage.getItem(STORAGE_KEYS.MIGRATION_TIMESTAMP),
      version: parseInt(localStorage.getItem(STORAGE_KEYS.MIGRATION_VERSION) || '0', 10) || null,
      userId: localStorage.getItem(STORAGE_KEYS.MIGRATION_USER_ID),
      hasLocalData: hasLocalStorageData(),
      localCardCount: getLocalStorageCardCount(),
    };
  } catch {
    return {
      complete: false,
      timestamp: null,
      version: null,
      userId: null,
      hasLocalData: false,
      localCardCount: 0,
    };
  }
}

/**
 * Check if migration is needed for a user
 */
export function needsMigration(userId: string): boolean {
  return hasLocalStorageData() && !isMigrationComplete(userId);
}
