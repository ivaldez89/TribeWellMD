// Core flashcard types for Step 2 CK study platform

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MedicalSystem = 
  | 'Cardiology'
  | 'Pulmonology'
  | 'Gastroenterology'
  | 'Nephrology'
  | 'Neurology'
  | 'Endocrinology'
  | 'Hematology/Oncology'
  | 'Infectious Disease'
  | 'Rheumatology'
  | 'Dermatology'
  | 'Psychiatry'
  | 'OB/GYN'
  | 'Pediatrics'
  | 'Surgery'
  | 'Emergency Medicine'
  | 'Preventive Medicine'
  | 'General';

// Rotation/Exam types for deck filtering
export type Rotation = 
  | 'Ambulatory'
  | 'Internal Medicine'
  | 'Surgery'
  | 'OB/GYN'
  | 'Pediatrics'
  | 'Psychiatry'
  | 'Family Medicine'
  | 'Neurology'
  | 'Emergency Medicine';

export interface CardContent {
  front: string;
  back: string;
  explanation?: string;
  references?: string[];
  images?: string[];
}

export interface CardMetadata {
  tags: string[];
  system: MedicalSystem;
  topic: string;
  difficulty: Difficulty;
  clinicalVignette: boolean;
  source?: string;
  usmleStep?: 1 | 2 | 3;
  rotation?: Rotation; // Which rotation/exam this card belongs to
  // Concept-based learning additions
  conceptCode?: string; // Unique identifier for the clinical decision point
  clinicalDecision?: string; // The "password" being tested (e.g., "CHA2DS2-VASc ≥2 for anticoagulation")
  qbankCodes?: {
    uworld?: string[]; // UWorld question IDs that test this concept
    amboss?: string[]; // AMBOSS article codes
  };
  relatedConcepts?: string[]; // Links to related concept codes
}

export interface SpacedRepetitionData {
  state: CardState;
  interval: number; // days until next review
  ease: number; // easiness factor (typically 1.3 - 2.5)
  reps: number; // number of successful reviews
  lapses: number; // number of times card was forgotten
  nextReview: string; // ISO date string
  lastReview?: string; // ISO date string
  stability?: number; // FSRS stability parameter
  difficulty?: number; // FSRS difficulty parameter (0-1)
}

export interface Flashcard {
  id: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  content: CardContent;
  metadata: CardMetadata;
  spacedRepetition: SpacedRepetitionData;
}

export interface ReviewSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  cardsReviewed: number;
  cardsCorrect: number;
  cardsFailed: number;
  reviews: ReviewRecord[];
}

export interface ReviewRecord {
  cardId: string;
  rating: Rating;
  reviewedAt: string;
  timeSpent: number; // milliseconds
  previousState: CardState;
  newState: CardState;
}

export interface StudyStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  dueToday: number;
  streakDays: number;
  totalReviews: number;
  averageEase: number;
  retentionRate: number;
}

// Topic performance analytics
export interface TopicPerformance {
  topic: string;
  system: MedicalSystem;
  totalCards: number;
  reviewedCards: number;
  correctCount: number;
  incorrectCount: number;
  averageEase: number;
  retentionRate: number;
  strength: 'strong' | 'moderate' | 'weak' | 'new';
}

// Filter settings for deck view
export interface DeckFilter {
  tags: string[];
  systems: MedicalSystem[];
  rotations: Rotation[];
  states: CardState[];
  difficulties: Difficulty[];
}

export interface FSRSParameters {
  requestRetention: number;
  maximumInterval: number;
  w: number[]; // FSRS weights
}

// Concept-based learning types for clinical decision points
export interface ClinicalConcept {
  code: string; // Unique identifier (e.g., "afib-anticoag-threshold")
  name: string; // Human-readable name
  clinicalDecision: string; // The "password" - what's being tested
  system: MedicalSystem;
  topic: string;
  highYield: boolean;
  testableAngles: string[]; // Different ways this concept is tested
  relatedConcepts: string[]; // Links to related concept codes
  qbankMapping: {
    uworld: string[];
    amboss: string[];
  };
}

// QBank lookup result
export interface QBankLookupResult {
  qid: string;
  source: 'uworld' | 'amboss';
  concepts: ClinicalConcept[];
  suggestedCards: Flashcard[];
}

// ============================================
// Interactive Clinical Vignette (ICV) Types
// ============================================

// Core vignette structure
export interface ClinicalVignette {
  id: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  initialScenario: string;
  rootNodeId: string;
  nodes: Record<string, DecisionNode>;
  metadata: VignetteMetadata;
}

export interface VignetteMetadata {
  system: MedicalSystem;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  conceptCodes: string[];
  estimatedMinutes: number;
  tags: string[];
}

export type DecisionNodeType = 'decision' | 'outcome' | 'information';

export interface DecisionNode {
  id: string;
  type: DecisionNodeType;
  content: string;
  question?: string;
  choices?: Choice[];
  media?: {
    type: 'imaging' | 'labs' | 'pathology' | 'ecg';
    data: string; // base64 or URL
    caption?: string;
  };
  clinicalPearl?: string;
}

export interface Choice {
  id: string;
  text: string;
  isOptimal: boolean;
  isAcceptable: boolean;
  feedback: string;
  consequence: string;
  nextNodeId: string | null; // null = terminal
  conceptCode?: string;
}

// Progress tracking
export type VignetteMastery = 'learning' | 'familiar' | 'mastered';

export interface VignetteProgress {
  vignetteId: string;
  completions: number;
  lastCompleted: string | null;
  nodePerformance: Record<string, NodePerformance>;
  overallMastery: VignetteMastery;
  nextReview: string;
}

export interface NodePerformance {
  attempts: number;
  optimalChoices: number;
  acceptableChoices: number;
  avgTimeMs: number;
}

// Session tracking
export interface VignetteSession {
  id: string;
  vignetteId: string;
  startedAt: string;
  endedAt?: string;
  decisions: DecisionRecord[];
  completedOptimally: boolean;
}

export interface DecisionRecord {
  nodeId: string;
  choiceId: string;
  wasOptimal: boolean;
  wasAcceptable: boolean;
  timeSpentMs: number;
  timestamp: string;
}
