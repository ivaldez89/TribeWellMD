/**
 * QBank Attempt Model
 *
 * Manages the persistent state of a QBank practice/test attempt.
 * Attempts persist independently of tutor/test mode - mode is a VIEW flag only.
 */

export interface QuestionAnswer {
  selectedAnswer: string | null;
  isLocked: boolean;        // Once locked, cannot be changed
  isCorrect: boolean | null;
  lockedAt: number | null;  // Timestamp when locked
}

export interface AttemptState {
  id: string;                              // Unique attempt ID
  questionIds: string[];                   // Ordered list of question IDs
  answers: Record<string, QuestionAnswer>; // Answer state per question
  isMarked: Record<string, boolean>;       // Flagged for review
  currentMode: 'tutor' | 'test';           // Current view mode (can be switched)
  timeLimitSeconds: number;                // Total time = questions × 90
  timeRemainingSeconds: number;            // Countdown timer
  currentIndex: number;                    // Current question position
  isCompleted: boolean;                    // True when attempt is finalized
  completedAt: number | null;              // Timestamp when completed
  createdAt: number;                       // Timestamp when created
  lastUpdatedAt: number;                   // Timestamp of last update

  // Filters used to create this attempt (for display purposes)
  batches: string[];
  systems: string[];
}

// Storage key prefix
const ATTEMPT_KEY_PREFIX = 'qbank-attempt-';

/**
 * Generate a unique attempt ID
 */
export function generateAttemptId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the storage key for an attempt
 */
export function getAttemptKey(attemptId: string): string {
  return `${ATTEMPT_KEY_PREFIX}${attemptId}`;
}

/**
 * Create a new attempt
 */
export function createAttempt(
  questionIds: string[],
  mode: 'tutor' | 'test',
  batches: string[] = [],
  systems: string[] = []
): AttemptState {
  const now = Date.now();
  const timeLimitSeconds = questionIds.length * 90;

  return {
    id: generateAttemptId(),
    questionIds,
    answers: {},
    isMarked: {},
    currentMode: mode,
    timeLimitSeconds,
    timeRemainingSeconds: timeLimitSeconds,
    currentIndex: 0,
    isCompleted: false,
    completedAt: null,
    createdAt: now,
    lastUpdatedAt: now,
    batches,
    systems,
  };
}

/**
 * Save attempt to localStorage
 */
export function saveAttempt(attempt: AttemptState): void {
  try {
    const key = getAttemptKey(attempt.id);
    const updated = { ...attempt, lastUpdatedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save attempt:', e);
  }
}

/**
 * Load attempt from localStorage
 */
export function loadAttempt(attemptId: string): AttemptState | null {
  try {
    const key = getAttemptKey(attemptId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as AttemptState;
  } catch (e) {
    console.error('Failed to load attempt:', e);
    return null;
  }
}

/**
 * Delete attempt from localStorage
 */
export function deleteAttempt(attemptId: string): void {
  try {
    const key = getAttemptKey(attemptId);
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to delete attempt:', e);
  }
}

/**
 * Find all active (non-completed) attempts
 */
export function findActiveAttempts(): AttemptState[] {
  const attempts: AttemptState[] = [];
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ATTEMPT_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const attempt = JSON.parse(stored) as AttemptState;
            // Include non-completed attempts that are less than 7 days old
            if (!attempt.isCompleted && (now - attempt.lastUpdatedAt) < maxAge) {
              attempts.push(attempt);
            }
          }
        } catch (e) {
          console.warn('Failed to parse attempt:', key, e);
        }
      }
    }
  } catch (e) {
    console.error('Failed to find active attempts:', e);
  }

  // Sort by last updated (most recent first)
  return attempts.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
}

/**
 * Select an answer for a question (only if not locked)
 */
export function selectAnswer(
  attempt: AttemptState,
  questionId: string,
  answer: string
): AttemptState {
  const existingAnswer = attempt.answers[questionId];

  // If already locked, cannot change
  if (existingAnswer?.isLocked) {
    return attempt;
  }

  return {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: {
        selectedAnswer: answer,
        isLocked: false,
        isCorrect: null,
        lockedAt: null,
      },
    },
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Lock an answer (submit it)
 * In test mode: locks immediately on selection
 * In tutor mode: locks after showing explanation
 */
export function lockAnswer(
  attempt: AttemptState,
  questionId: string,
  correctAnswer: string
): AttemptState {
  const existingAnswer = attempt.answers[questionId];

  // If already locked or no answer selected, return unchanged
  if (existingAnswer?.isLocked || !existingAnswer?.selectedAnswer) {
    return attempt;
  }

  const isCorrect = existingAnswer.selectedAnswer === correctAnswer;

  return {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: {
        ...existingAnswer,
        isLocked: true,
        isCorrect,
        lockedAt: Date.now(),
      },
    },
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Switch mode (tutor <-> test)
 * Does NOT reset answers, locked states, or timer
 */
export function switchMode(
  attempt: AttemptState,
  newMode: 'tutor' | 'test'
): AttemptState {
  // Cannot switch mode on completed attempts
  if (attempt.isCompleted) {
    return attempt;
  }

  return {
    ...attempt,
    currentMode: newMode,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Update timer
 */
export function updateTimer(
  attempt: AttemptState,
  timeRemainingSeconds: number
): AttemptState {
  return {
    ...attempt,
    timeRemainingSeconds: Math.max(0, timeRemainingSeconds),
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Navigate to a question
 */
export function navigateToQuestion(
  attempt: AttemptState,
  index: number
): AttemptState {
  if (index < 0 || index >= attempt.questionIds.length) {
    return attempt;
  }

  return {
    ...attempt,
    currentIndex: index,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Toggle marked/flagged status for a question
 */
export function toggleMarked(
  attempt: AttemptState,
  questionId: string
): AttemptState {
  return {
    ...attempt,
    isMarked: {
      ...attempt.isMarked,
      [questionId]: !attempt.isMarked[questionId],
    },
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Complete/finalize the attempt ("Pass Exam")
 * Locks all remaining unanswered questions as unanswered
 * Makes the attempt read-only
 */
export function completeAttempt(attempt: AttemptState): AttemptState {
  if (attempt.isCompleted) {
    return attempt;
  }

  const now = Date.now();

  // Lock all questions that haven't been answered yet
  const updatedAnswers = { ...attempt.answers };
  for (const questionId of attempt.questionIds) {
    if (!updatedAnswers[questionId]) {
      updatedAnswers[questionId] = {
        selectedAnswer: null,
        isLocked: true,
        isCorrect: false, // Unanswered = incorrect
        lockedAt: now,
      };
    } else if (!updatedAnswers[questionId].isLocked) {
      // Lock any answer that was selected but not submitted
      updatedAnswers[questionId] = {
        ...updatedAnswers[questionId],
        isLocked: true,
        isCorrect: false, // Treat as incorrect if not submitted properly
        lockedAt: now,
      };
    }
  }

  return {
    ...attempt,
    answers: updatedAnswers,
    isCompleted: true,
    completedAt: now,
    timeRemainingSeconds: 0, // Stop the timer
    lastUpdatedAt: now,
  };
}

/**
 * Get attempt statistics
 */
export function getAttemptStats(attempt: AttemptState): {
  totalQuestions: number;
  answeredCount: number;
  lockedCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentComplete: number;
  percentCorrect: number;
} {
  const totalQuestions = attempt.questionIds.length;
  let answeredCount = 0;
  let lockedCount = 0;
  let correctCount = 0;

  for (const questionId of attempt.questionIds) {
    const answer = attempt.answers[questionId];
    if (answer) {
      if (answer.selectedAnswer !== null) {
        answeredCount++;
      }
      if (answer.isLocked) {
        lockedCount++;
        if (answer.isCorrect) {
          correctCount++;
        }
      }
    }
  }

  const incorrectCount = lockedCount - correctCount;
  const unansweredCount = totalQuestions - answeredCount;
  const percentComplete = totalQuestions > 0 ? Math.round((lockedCount / totalQuestions) * 100) : 0;
  const percentCorrect = lockedCount > 0 ? Math.round((correctCount / lockedCount) * 100) : 0;

  return {
    totalQuestions,
    answeredCount,
    lockedCount,
    correctCount,
    incorrectCount,
    unansweredCount,
    percentComplete,
    percentCorrect,
  };
}

/**
 * Format time as MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get maximum question count based on mode
 */
export function getMaxQuestionCount(mode: 'tutor' | 'test'): number {
  return mode === 'tutor' ? 40 : 110;
}

/**
 * Migrate old session format to new attempt format
 * This is for backwards compatibility with existing sessions
 */
export function migrateOldSession(
  oldSessionKey: string,
  questionIds: string[],
  questionStates: Record<string, { selectedAnswer: string | null; isSubmitted: boolean; isCorrect: boolean | null }>,
  isMarked: Record<string, boolean>,
  currentIndex: number,
  timeRemaining: number | undefined,
  mode: 'tutor' | 'timed',
  batches: string[],
  systems: string[]
): AttemptState {
  const now = Date.now();
  const timeLimitSeconds = questionIds.length * 90;

  // Convert old question states to new answer format
  const answers: Record<string, QuestionAnswer> = {};
  for (const [qid, state] of Object.entries(questionStates)) {
    answers[qid] = {
      selectedAnswer: state.selectedAnswer,
      isLocked: state.isSubmitted,
      isCorrect: state.isCorrect,
      lockedAt: state.isSubmitted ? now : null,
    };
  }

  return {
    id: generateAttemptId(),
    questionIds,
    answers,
    isMarked,
    currentMode: mode === 'timed' ? 'test' : 'tutor',
    timeLimitSeconds,
    timeRemainingSeconds: timeRemaining ?? timeLimitSeconds,
    currentIndex,
    isCompleted: false,
    completedAt: null,
    createdAt: now,
    lastUpdatedAt: now,
    batches,
    systems,
  };
}
