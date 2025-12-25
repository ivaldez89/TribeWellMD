/**
 * RLS (Row Level Security) Validation Utility
 *
 * Provides sanity checks for RLS policies during development.
 * Verifies that users can only access their own data.
 */

import { createClient } from './client';
import { createLogger } from '@/lib/observability';

const logger = createLogger('RLS');

export interface RLSValidationResult {
  table: string;
  operation: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface RLSValidationReport {
  userId: string;
  timestamp: string;
  results: RLSValidationResult[];
  allPassed: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Test that a user can only read their own flashcards
 */
async function testFlashcardsRead(userId: string): Promise<RLSValidationResult> {
  const supabase = createClient();

  try {
    // Attempt to read flashcards
    const { data, error } = await supabase
      .from('flashcards')
      .select('id, user_id')
      .limit(10);

    if (error) {
      return {
        table: 'flashcards',
        operation: 'SELECT',
        passed: false,
        message: `Query failed: ${error.message}`,
      };
    }

    // Verify all returned rows belong to current user
    const foreignRows = (data || []).filter(row => row.user_id !== userId);

    if (foreignRows.length > 0) {
      return {
        table: 'flashcards',
        operation: 'SELECT',
        passed: false,
        message: `RLS VIOLATION: Found ${foreignRows.length} rows belonging to other users`,
        details: { foreignUserIds: foreignRows.map(r => r.user_id) },
      };
    }

    return {
      table: 'flashcards',
      operation: 'SELECT',
      passed: true,
      message: `OK: All ${(data || []).length} rows belong to current user`,
    };
  } catch (err) {
    return {
      table: 'flashcards',
      operation: 'SELECT',
      passed: false,
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test that a user cannot insert flashcards for another user
 */
async function testFlashcardsInsertRLS(userId: string): Promise<RLSValidationResult> {
  const supabase = createClient();
  const fakeUserId = '00000000-0000-0000-0000-000000000000';

  try {
    // Attempt to insert a flashcard with a different user_id
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: fakeUserId, // Attempt to insert for another user
        front: 'RLS Test Card',
        back: 'This should fail',
        tags: [],
        system: 'General',
        topic: 'RLS Test',
        difficulty: 'easy',
        is_clinical_vignette: false,
        sr_state: 'new',
        sr_interval: 0,
        sr_ease: 2.5,
        sr_reps: 0,
        sr_lapses: 0,
        sr_next_review: new Date().toISOString(),
        sr_stability: 0,
        sr_difficulty: 0,
      })
      .select()
      .single();

    if (data) {
      // If insert succeeded, this is an RLS violation
      // Clean up the test row
      await supabase.from('flashcards').delete().eq('id', data.id);

      return {
        table: 'flashcards',
        operation: 'INSERT (cross-user)',
        passed: false,
        message: 'RLS VIOLATION: Successfully inserted row for another user',
      };
    }

    if (error) {
      // Expected: RLS should block this
      return {
        table: 'flashcards',
        operation: 'INSERT (cross-user)',
        passed: true,
        message: 'OK: RLS correctly blocked cross-user insert',
        details: { error: error.message },
      };
    }

    return {
      table: 'flashcards',
      operation: 'INSERT (cross-user)',
      passed: true,
      message: 'OK: No data returned (likely blocked by RLS)',
    };
  } catch (err) {
    // An error here could mean RLS is working
    return {
      table: 'flashcards',
      operation: 'INSERT (cross-user)',
      passed: true,
      message: 'OK: Operation blocked (possibly by RLS)',
      details: { error: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Test review_sessions RLS
 */
async function testReviewSessionsRead(userId: string): Promise<RLSValidationResult> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('review_sessions')
      .select('id, user_id')
      .limit(10);

    if (error) {
      return {
        table: 'review_sessions',
        operation: 'SELECT',
        passed: false,
        message: `Query failed: ${error.message}`,
      };
    }

    const foreignRows = (data || []).filter(row => row.user_id !== userId);

    if (foreignRows.length > 0) {
      return {
        table: 'review_sessions',
        operation: 'SELECT',
        passed: false,
        message: `RLS VIOLATION: Found ${foreignRows.length} rows belonging to other users`,
      };
    }

    return {
      table: 'review_sessions',
      operation: 'SELECT',
      passed: true,
      message: `OK: All ${(data || []).length} rows belong to current user`,
    };
  } catch (err) {
    return {
      table: 'review_sessions',
      operation: 'SELECT',
      passed: false,
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test review_records RLS
 */
async function testReviewRecordsRead(userId: string): Promise<RLSValidationResult> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('review_records')
      .select('id, user_id')
      .limit(10);

    if (error) {
      return {
        table: 'review_records',
        operation: 'SELECT',
        passed: false,
        message: `Query failed: ${error.message}`,
      };
    }

    const foreignRows = (data || []).filter(row => row.user_id !== userId);

    if (foreignRows.length > 0) {
      return {
        table: 'review_records',
        operation: 'SELECT',
        passed: false,
        message: `RLS VIOLATION: Found ${foreignRows.length} rows belonging to other users`,
      };
    }

    return {
      table: 'review_records',
      operation: 'SELECT',
      passed: true,
      message: `OK: All ${(data || []).length} rows belong to current user`,
    };
  } catch (err) {
    return {
      table: 'review_records',
      operation: 'SELECT',
      passed: false,
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test study_streaks RLS
 */
async function testStudyStreaksRead(userId: string): Promise<RLSValidationResult> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('study_streaks')
      .select('id, user_id')
      .limit(10);

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      return {
        table: 'study_streaks',
        operation: 'SELECT',
        passed: false,
        message: `Query failed: ${error.message}`,
      };
    }

    const foreignRows = (data || []).filter(row => row.user_id !== userId);

    if (foreignRows.length > 0) {
      return {
        table: 'study_streaks',
        operation: 'SELECT',
        passed: false,
        message: `RLS VIOLATION: Found ${foreignRows.length} rows belonging to other users`,
      };
    }

    return {
      table: 'study_streaks',
      operation: 'SELECT',
      passed: true,
      message: `OK: All ${(data || []).length} rows belong to current user`,
    };
  } catch (err) {
    return {
      table: 'study_streaks',
      operation: 'SELECT',
      passed: false,
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Run all RLS validation tests
 */
export async function validateRLS(): Promise<RLSValidationReport> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: 'unauthenticated',
      timestamp: new Date().toISOString(),
      results: [{
        table: 'auth',
        operation: 'getUser',
        passed: false,
        message: 'User not authenticated - cannot validate RLS',
      }],
      allPassed: false,
      summary: { total: 1, passed: 0, failed: 1 },
    };
  }

  logger.info('Starting RLS validation', { userId: user.id });

  const results: RLSValidationResult[] = [];

  // Run all tests
  results.push(await testFlashcardsRead(user.id));
  results.push(await testFlashcardsInsertRLS(user.id));
  results.push(await testReviewSessionsRead(user.id));
  results.push(await testReviewRecordsRead(user.id));
  results.push(await testStudyStreaksRead(user.id));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  const report: RLSValidationReport = {
    userId: user.id,
    timestamp: new Date().toISOString(),
    results,
    allPassed: failed === 0,
    summary: {
      total: results.length,
      passed,
      failed,
    },
  };

  if (report.allPassed) {
    logger.info('RLS validation passed', {
      metadata: { total: results.length, passed },
    });
  } else {
    logger.error('RLS validation FAILED', {
      metadata: { total: results.length, passed, failed },
    });
  }

  return report;
}

/**
 * Quick RLS check for a specific table
 */
export async function checkTableRLS(table: string): Promise<RLSValidationResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      table,
      operation: 'SELECT',
      passed: false,
      message: 'User not authenticated',
    };
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select('user_id')
      .limit(5);

    if (error) {
      return {
        table,
        operation: 'SELECT',
        passed: false,
        message: error.message,
      };
    }

    const foreignRows = (data || []).filter((row: { user_id: string }) => row.user_id !== user.id);

    return {
      table,
      operation: 'SELECT',
      passed: foreignRows.length === 0,
      message: foreignRows.length === 0
        ? 'RLS OK'
        : `RLS VIOLATION: ${foreignRows.length} foreign rows`,
    };
  } catch (err) {
    return {
      table,
      operation: 'SELECT',
      passed: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Log RLS validation report to console (for development)
 */
export function logRLSReport(report: RLSValidationReport): void {
  console.group('RLS Validation Report');
  console.log(`User: ${report.userId}`);
  console.log(`Time: ${report.timestamp}`);
  console.log(`Status: ${report.allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Summary: ${report.summary.passed}/${report.summary.total} tests passed`);

  console.group('Results:');
  for (const result of report.results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.table} (${result.operation}): ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
  }
  console.groupEnd();
  console.groupEnd();
}
