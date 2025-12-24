// Progressive Question Sets for Connection Matching
// Inspired by Arthur Aron's "36 Questions to Fall in Love" research
// Adapted for building meaningful friendships in medicine

export type QuestionLevel = 1 | 2 | 3 | 4 | 5;

export interface ConnectionQuestion {
  id: string;
  level: QuestionLevel;
  question: string;
  category: 'icebreaker' | 'values' | 'experiences' | 'dreams' | 'vulnerability';
  followUp?: string; // Optional follow-up prompt
}

// Level descriptions for users
export const LEVEL_DESCRIPTIONS: Record<QuestionLevel, { name: string; description: string; unlockText: string }> = {
  1: {
    name: 'Icebreakers',
    description: 'Fun, light questions to get to know each other',
    unlockText: 'Start here! Answer these to begin your connection.',
  },
  2: {
    name: 'Getting to Know You',
    description: 'Learn about each other\'s backgrounds and interests',
    unlockText: 'Unlocked after completing Level 1 questions.',
  },
  3: {
    name: 'Values & Beliefs',
    description: 'Explore what matters most to each of you',
    unlockText: 'Unlocked after completing Level 2 questions.',
  },
  4: {
    name: 'Dreams & Challenges',
    description: 'Share your aspirations and the hurdles you\'ve faced',
    unlockText: 'Unlocked after completing Level 3 questions.',
  },
  5: {
    name: 'Deeper Connection',
    description: 'Build true understanding through meaningful sharing',
    unlockText: 'Unlocked after completing Level 4 questions.',
  },
};

// Questions for each level - users answer in pairs
export const CONNECTION_QUESTIONS: ConnectionQuestion[] = [
  // ============================================
  // LEVEL 1: ICEBREAKERS (Light & Fun)
  // ============================================
  {
    id: 'l1-1',
    level: 1,
    question: 'If you could have dinner with any physician (living or historical), who would it be and why?',
    category: 'icebreaker',
  },
  {
    id: 'l1-2',
    level: 1,
    question: 'What\'s your go-to study snack or comfort food during exam season?',
    category: 'icebreaker',
  },
  {
    id: 'l1-3',
    level: 1,
    question: 'What specialty are you most interested in right now, and what drew you to it?',
    category: 'icebreaker',
  },
  {
    id: 'l1-4',
    level: 1,
    question: 'What\'s something you do to unwind after a long day of studying or clinical work?',
    category: 'icebreaker',
  },
  {
    id: 'l1-5',
    level: 1,
    question: 'If medicine didn\'t exist, what career do you think you\'d pursue?',
    category: 'icebreaker',
  },
  {
    id: 'l1-6',
    level: 1,
    question: 'What\'s a hidden talent or hobby most people don\'t know you have?',
    category: 'icebreaker',
  },

  // ============================================
  // LEVEL 2: GETTING TO KNOW YOU
  // ============================================
  {
    id: 'l2-1',
    level: 2,
    question: 'What moment in your life first made you think about becoming a physician?',
    category: 'experiences',
    followUp: 'Has that motivation changed since you started training?',
  },
  {
    id: 'l2-2',
    level: 2,
    question: 'What\'s been the most surprising thing about medical school/training so far?',
    category: 'experiences',
  },
  {
    id: 'l2-3',
    level: 2,
    question: 'Describe a patient interaction (without identifying details) that really stuck with you.',
    category: 'experiences',
  },
  {
    id: 'l2-4',
    level: 2,
    question: 'What do you wish you had known before starting this journey?',
    category: 'experiences',
  },
  {
    id: 'l2-5',
    level: 2,
    question: 'Who has been your biggest mentor or influence in medicine, and what did they teach you?',
    category: 'experiences',
  },
  {
    id: 'l2-6',
    level: 2,
    question: 'What\'s something you\'re currently trying to get better at, professionally or personally?',
    category: 'experiences',
  },

  // ============================================
  // LEVEL 3: VALUES & BELIEFS
  // ============================================
  {
    id: 'l3-1',
    level: 3,
    question: 'What does "being a good doctor" mean to you? What qualities matter most?',
    category: 'values',
  },
  {
    id: 'l3-2',
    level: 3,
    question: 'How do you define success in your career? Has that definition changed over time?',
    category: 'values',
    followUp: 'What would your life look like if you achieved that success?',
  },
  {
    id: 'l3-3',
    level: 3,
    question: 'What aspect of healthcare do you think needs the most change, and why?',
    category: 'values',
  },
  {
    id: 'l3-4',
    level: 3,
    question: 'How do you balance ambition with self-care? Is it something you struggle with?',
    category: 'values',
  },
  {
    id: 'l3-5',
    level: 3,
    question: 'What role do relationships and community play in your life?',
    category: 'values',
    followUp: 'Do you feel you have enough meaningful connections?',
  },
  {
    id: 'l3-6',
    level: 3,
    question: 'What\'s a belief you held strongly that has changed during your medical training?',
    category: 'values',
  },

  // ============================================
  // LEVEL 4: DREAMS & CHALLENGES
  // ============================================
  {
    id: 'l4-1',
    level: 4,
    question: 'What\'s your biggest fear about your future in medicine?',
    category: 'dreams',
    followUp: 'How do you cope with that fear?',
  },
  {
    id: 'l4-2',
    level: 4,
    question: 'If you could change one thing about medical education or training, what would it be?',
    category: 'dreams',
  },
  {
    id: 'l4-3',
    level: 4,
    question: 'Describe a time when you felt truly proud of yourself in your medical journey.',
    category: 'experiences',
  },
  {
    id: 'l4-4',
    level: 4,
    question: 'What\'s the hardest sacrifice you\'ve made for your career?',
    category: 'experiences',
    followUp: 'Do you feel it was worth it?',
  },
  {
    id: 'l4-5',
    level: 4,
    question: 'Where do you see yourself in 10 years? What kind of life do you want to be living?',
    category: 'dreams',
  },
  {
    id: 'l4-6',
    level: 4,
    question: 'What\'s something you\'re currently struggling with that you don\'t often talk about?',
    category: 'vulnerability',
  },

  // ============================================
  // LEVEL 5: DEEPER CONNECTION
  // ============================================
  {
    id: 'l5-1',
    level: 5,
    question: 'Have you ever questioned whether medicine was the right path for you? What happened?',
    category: 'vulnerability',
    followUp: 'What helped you through that doubt?',
  },
  {
    id: 'l5-2',
    level: 5,
    question: 'What\'s the most important lesson you\'ve learned about yourself through your training?',
    category: 'vulnerability',
  },
  {
    id: 'l5-3',
    level: 5,
    question: 'If you could go back and give advice to yourself on day one of medical school, what would you say?',
    category: 'dreams',
  },
  {
    id: 'l5-4',
    level: 5,
    question: 'What does friendship mean to you, especially in the context of medicine where time is so limited?',
    category: 'values',
    followUp: 'What makes a friend truly close to you?',
  },
  {
    id: 'l5-5',
    level: 5,
    question: 'Share something you\'ve never told anyone in medicine before.',
    category: 'vulnerability',
  },
  {
    id: 'l5-6',
    level: 5,
    question: 'What do you hope this connection between us could become? What would make it meaningful?',
    category: 'vulnerability',
  },
];

// Get questions for a specific level
export function getQuestionsForLevel(level: QuestionLevel): ConnectionQuestion[] {
  return CONNECTION_QUESTIONS.filter(q => q.level === level);
}

// Get a random question from a level
export function getRandomQuestionFromLevel(level: QuestionLevel): ConnectionQuestion | null {
  const questions = getQuestionsForLevel(level);
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

// Get next unanswered question for a connection pair
export function getNextQuestion(
  level: QuestionLevel,
  answeredQuestionIds: string[]
): ConnectionQuestion | null {
  const questions = getQuestionsForLevel(level);
  const unanswered = questions.filter(q => !answeredQuestionIds.includes(q.id));
  if (unanswered.length === 0) return null;
  return unanswered[0];
}

// Check if a level is complete
export function isLevelComplete(level: QuestionLevel, answeredQuestionIds: string[]): boolean {
  const questions = getQuestionsForLevel(level);
  const answeredInLevel = questions.filter(q => answeredQuestionIds.includes(q.id));
  // Need to answer at least 4 questions to complete a level
  return answeredInLevel.length >= 4;
}

// Get completion progress for a level
export function getLevelProgress(level: QuestionLevel, answeredQuestionIds: string[]): { answered: number; total: number; required: number } {
  const questions = getQuestionsForLevel(level);
  const answeredInLevel = questions.filter(q => answeredQuestionIds.includes(q.id));
  return {
    answered: answeredInLevel.length,
    total: questions.length,
    required: 4, // Need 4 to unlock next level
  };
}

// ============================================
// Connection Match Types
// ============================================

export interface ConnectionMatch {
  id: string;
  participantIds: [string, string]; // Two user IDs
  villageId: string; // Both must be in same village
  createdAt: string;
  status: 'active' | 'paused' | 'completed' | 'ended';
  currentLevel: QuestionLevel;
  answeredQuestions: {
    questionId: string;
    answers: {
      odId: string;
      answer: string;
      answeredAt: string;
    }[];
  }[];
  // Mutual consent tracking
  levelUnlockConsent: {
    level: QuestionLevel;
    userId: string;
    wantsToContinue: boolean;
    respondedAt: string;
  }[];
  // If one person doesn't want to continue
  endedBy?: string; // User ID who ended (not shown to other)
  endedAt?: string;
  endReason?: 'not_interested' | 'too_busy' | 'other';
}

// Graceful exit messages (shown to the other person)
export const GRACEFUL_EXIT_MESSAGES = [
  "Your partner is taking a break from connections right now. We'll match you with someone new!",
  "Your partner's schedule has gotten busy. Let's find you another connection!",
  "Time for a new connection! We're finding someone great for you.",
  "Your partner is focusing on other things right now. New match coming up!",
];

// Get a random graceful exit message
export function getGracefulExitMessage(): string {
  return GRACEFUL_EXIT_MESSAGES[Math.floor(Math.random() * GRACEFUL_EXIT_MESSAGES.length)];
}

// ============================================
// Matching Algorithm Helpers
// ============================================

export interface MatchScore {
  userId: string;
  score: number;
  commonInterests: string[];
}

// Calculate match score between two users based on interests
export function calculateMatchScore(
  user1Interests: {
    wellness: string[];
    specialties: string[];
    general: string[];
  },
  user2Interests: {
    wellness: string[];
    specialties: string[];
    general: string[];
  }
): { score: number; commonInterests: string[] } {
  const commonWellness = user1Interests.wellness.filter(w => user2Interests.wellness.includes(w));
  const commonSpecialties = user1Interests.specialties.filter(s => user2Interests.specialties.includes(s));
  const commonGeneral = user1Interests.general.filter(g => user2Interests.general.includes(g));

  const allCommon = [...commonWellness, ...commonSpecialties, ...commonGeneral];

  // Weighted scoring: general interests matter most for friendship
  const score =
    commonWellness.length * 2 +
    commonSpecialties.length * 1.5 +
    commonGeneral.length * 3;

  return {
    score,
    commonInterests: allCommon,
  };
}
