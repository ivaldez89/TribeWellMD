/**
 * QBank Question Validation Script
 *
 * This script validates QBank questions to ensure they have proper explanation data
 * for the inline UI. It checks for:
 * - Missing explanations
 * - Missing 'Why Not' breakdown for all 5 options (A-E)
 * - Incomplete distractor analysis
 *
 * Severity Levels:
 * - HIGH: Missing distractor analysis for all options (breaks inline UI)
 * - MEDIUM: Missing distractor analysis for some options
 * - LOW: Minor issues (short explanations, missing cognitive error)
 *
 * Usage:
 *   npx ts-node scripts/validate-qbank.ts
 *
 * Or add to package.json:
 *   "scripts": {
 *     "validate:qbank": "ts-node scripts/validate-qbank.ts"
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface Question {
  id: string;
  question_id: string;
  concept_id: string;
  batch: string;
  system: string;
  stem: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  cognitive_error: string | null;
  status: string;
}

interface ValidationError {
  questionId: string;
  batchSystem: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  details: string;
}

// Patterns to detect option-specific explanations
const OPTION_PATTERNS = [
  /^([A-E])[\.\):\s]/i,                          // "A." or "A)" or "A:"
  /^\(([A-E])\)/i,                               // "(A)"
  /^(?:Option|Choice)\s*([A-E])[\.\):\s]?/i,     // "Option A" or "Choice A"
  /^([A-E])\s*[-–—]\s*/i,                        // "A -" or "A –"
  /\b([A-E])\s+(?:is|would be)\s+(?:incorrect|wrong|correct)/i, // "A is incorrect"
];

// Check if explanation contains distractor analysis for a specific option
function hasDistractorForOption(explanation: string, label: string, optionText: string): boolean {
  // Check for explicit label patterns
  for (const pattern of OPTION_PATTERNS) {
    const regex = new RegExp(pattern.source.replace('[A-E]', label), pattern.flags);
    if (regex.test(explanation)) {
      return true;
    }
  }

  // Check if the option text (first word/phrase) is mentioned
  const keyTerm = optionText.split(/[,.(]/)[0]?.trim().toLowerCase();
  if (keyTerm && keyTerm.length > 3) {
    const escapedTerm = keyTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const termRegex = new RegExp(escapedTerm, 'i');
    if (termRegex.test(explanation)) {
      return true;
    }
  }

  return false;
}

// Parse explanation to find which options have distractor analysis
function analyzeDistractors(explanation: string, options: { label: string; text: string }[]): {
  found: string[];
  missing: string[];
} {
  const found: string[] = [];
  const missing: string[] = [];

  for (const option of options) {
    if (hasDistractorForOption(explanation, option.label, option.text)) {
      found.push(option.label);
    } else {
      missing.push(option.label);
    }
  }

  return { found, missing };
}

// Validate a single question
function validateQuestion(question: Question): ValidationError[] {
  const errors: ValidationError[] = [];
  const batchSystem = `${question.batch}/${question.system}`;

  // Check 1: Missing explanation entirely
  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'HIGH',
      issue: 'Missing explanation',
      details: 'Question has no explanation text. Inline UI will be empty.'
    });
    return errors; // No point checking further
  }

  // Check 2: Very short explanation (likely incomplete)
  if (question.explanation.length < 50) {
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'LOW',
      issue: 'Very short explanation',
      details: `Explanation is only ${question.explanation.length} characters.`
    });
  }

  // Check 3: Missing options array
  if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'HIGH',
      issue: 'Missing options',
      details: 'Question has no answer options defined.'
    });
    return errors;
  }

  // Check 4: Wrong number of options (should be 5 for A-E)
  if (question.options.length !== 5) {
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'MEDIUM',
      issue: 'Unexpected option count',
      details: `Question has ${question.options.length} options instead of 5 (A-E).`
    });
  }

  // Check 5: Distractor analysis for all options
  const { found, missing } = analyzeDistractors(question.explanation, question.options);

  if (missing.length === question.options.length) {
    // HIGH SEVERITY: No distractor analysis found at all
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'HIGH',
      issue: 'Missing all distractor analysis',
      details: `No 'Why Not' breakdown found for any option (${missing.join(', ')}). Inline explanations will show generic fallback text.`
    });
  } else if (missing.length > 0) {
    // MEDIUM: Some options missing
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'MEDIUM',
      issue: 'Incomplete distractor analysis',
      details: `Missing analysis for options: ${missing.join(', ')}. Found for: ${found.join(', ')}.`
    });
  }

  // Check 6: Missing cognitive error (nice to have)
  if (!question.cognitive_error) {
    errors.push({
      questionId: question.question_id,
      batchSystem,
      severity: 'LOW',
      issue: 'Missing cognitive error',
      details: 'No cognitive error tag defined for this question.'
    });
  }

  return errors;
}

// Main validation function
async function validateQBankQuestions() {
  console.log('🔍 QBank Question Validation Script');
  console.log('====================================\n');

  // Fetch only QBank questions (questions table with status = 'active')
  // The questions table is specifically for QBank - flashcards and cases are in separate tables
  console.log('📊 Fetching QBank questions from Supabase...\n');

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'active')
    .order('batch')
    .order('question_id');

  if (error) {
    console.error('❌ Failed to fetch questions:', error.message);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log('⚠️ No active QBank questions found.');
    process.exit(0);
  }

  console.log(`Found ${questions.length} active QBank questions.\n`);

  // Validate all questions
  const allErrors: ValidationError[] = [];

  for (const question of questions) {
    const errors = validateQuestion(question as Question);
    allErrors.push(...errors);
  }

  // Group by severity
  const highErrors = allErrors.filter(e => e.severity === 'HIGH');
  const mediumErrors = allErrors.filter(e => e.severity === 'MEDIUM');
  const lowErrors = allErrors.filter(e => e.severity === 'LOW');

  // Summary
  console.log('📋 VALIDATION SUMMARY');
  console.log('======================\n');
  console.log(`Total Questions Validated: ${questions.length}`);
  console.log(`Total Issues Found: ${allErrors.length}`);
  console.log('');
  console.log(`🔴 HIGH Severity:   ${highErrors.length}`);
  console.log(`🟡 MEDIUM Severity: ${mediumErrors.length}`);
  console.log(`🟢 LOW Severity:    ${lowErrors.length}`);
  console.log('');

  // Detailed HIGH severity issues (these break the UI)
  if (highErrors.length > 0) {
    console.log('🔴 HIGH SEVERITY ISSUES (UI Breaking)');
    console.log('=====================================\n');

    for (const error of highErrors) {
      console.log(`  Question: ${error.questionId}`);
      console.log(`  Location: ${error.batchSystem}`);
      console.log(`  Issue:    ${error.issue}`);
      console.log(`  Details:  ${error.details}`);
      console.log('');
    }
  }

  // Detailed MEDIUM severity issues
  if (mediumErrors.length > 0) {
    console.log('🟡 MEDIUM SEVERITY ISSUES');
    console.log('=========================\n');

    // Group by batch/system for easier review
    const grouped: Record<string, ValidationError[]> = {};
    for (const error of mediumErrors) {
      if (!grouped[error.batchSystem]) {
        grouped[error.batchSystem] = [];
      }
      grouped[error.batchSystem].push(error);
    }

    for (const [batchSystem, errors] of Object.entries(grouped)) {
      console.log(`  📁 ${batchSystem} (${errors.length} issues)`);
      for (const error of errors.slice(0, 5)) { // Show first 5
        console.log(`     - ${error.questionId}: ${error.issue}`);
        console.log(`       ${error.details}`);
      }
      if (errors.length > 5) {
        console.log(`     ... and ${errors.length - 5} more`);
      }
      console.log('');
    }
  }

  // LOW severity just count by type
  if (lowErrors.length > 0) {
    console.log('🟢 LOW SEVERITY ISSUES (Summary)');
    console.log('================================\n');

    const issueCounts: Record<string, number> = {};
    for (const error of lowErrors) {
      issueCounts[error.issue] = (issueCounts[error.issue] || 0) + 1;
    }

    for (const [issue, count] of Object.entries(issueCounts)) {
      console.log(`  ${issue}: ${count} questions`);
    }
    console.log('');
  }

  // Exit with error code if HIGH severity issues found
  if (highErrors.length > 0) {
    console.log('❌ Validation FAILED - HIGH severity issues found that will break the inline UI.');
    console.log('   Please fix these issues before deploying.\n');
    process.exit(1);
  } else if (mediumErrors.length > 0) {
    console.log('⚠️ Validation completed with warnings. Review MEDIUM severity issues.');
    process.exit(0);
  } else {
    console.log('✅ Validation PASSED - All QBank questions have valid explanation data.\n');
    process.exit(0);
  }
}

// Run validation
validateQBankQuestions().catch((err) => {
  console.error('❌ Validation script error:', err);
  process.exit(1);
});
