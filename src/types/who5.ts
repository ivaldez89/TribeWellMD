// WHO-5 Well-Being Index Types
// The WHO-5 is a short, self-reported measure of current mental well-being
// Validated across diverse populations and widely used in clinical research

export type WHO5Response = 0 | 1 | 2 | 3 | 4 | 5;

export interface WHO5Assessment {
  id: string;
  userId: string;
  timestamp: string;
  responses: {
    q1: WHO5Response; // Cheerful and in good spirits
    q2: WHO5Response; // Calm and relaxed
    q3: WHO5Response; // Active and vigorous
    q4: WHO5Response; // Fresh and rested
    q5: WHO5Response; // Interesting daily life
  };
  rawScore: number;      // 0-25
  percentScore: number;  // 0-100
  category: WHO5Category;
  notes?: string;
}

export type WHO5Category = 'poor' | 'low' | 'moderate' | 'high';

// WHO-5 Questions (validated instrument - do not modify wording)
export const WHO5_QUESTIONS = [
  {
    id: 'q1',
    text: 'I have felt cheerful and in good spirits',
    shortText: 'Cheerful'
  },
  {
    id: 'q2',
    text: 'I have felt calm and relaxed',
    shortText: 'Calm'
  },
  {
    id: 'q3',
    text: 'I have felt active and vigorous',
    shortText: 'Active'
  },
  {
    id: 'q4',
    text: 'I woke up feeling fresh and rested',
    shortText: 'Rested'
  },
  {
    id: 'q5',
    text: 'My daily life has been filled with things that interest me',
    shortText: 'Engaged'
  }
] as const;

// Response options (Over the last two weeks...)
export const WHO5_RESPONSE_OPTIONS = [
  { value: 5, label: 'All of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 3, label: 'More than half of the time' },
  { value: 2, label: 'Less than half of the time' },
  { value: 1, label: 'Some of the time' },
  { value: 0, label: 'At no time' }
] as const;

// Score interpretation thresholds
export const WHO5_THRESHOLDS = {
  poor: { min: 0, max: 28, label: 'Poor wellbeing', color: 'red', description: 'Consider speaking with a healthcare provider' },
  low: { min: 29, max: 50, label: 'Low wellbeing', color: 'orange', description: 'May benefit from additional support' },
  moderate: { min: 51, max: 70, label: 'Moderate wellbeing', color: 'yellow', description: 'Doing okay, room for improvement' },
  high: { min: 71, max: 100, label: 'High wellbeing', color: 'green', description: 'Excellent mental wellbeing' }
} as const;

// Scoring functions
export function calculateWHO5RawScore(responses: WHO5Assessment['responses']): number {
  return responses.q1 + responses.q2 + responses.q3 + responses.q4 + responses.q5;
}

export function calculateWHO5PercentScore(rawScore: number): number {
  // Multiply raw score by 4 to get percentage (0-25 → 0-100)
  return rawScore * 4;
}

export function getWHO5Category(percentScore: number): WHO5Category {
  if (percentScore <= 28) return 'poor';
  if (percentScore <= 50) return 'low';
  if (percentScore <= 70) return 'moderate';
  return 'high';
}

export function getWHO5Interpretation(category: WHO5Category) {
  return WHO5_THRESHOLDS[category];
}

// Create a new WHO-5 assessment
export function createWHO5Assessment(
  userId: string,
  responses: WHO5Assessment['responses'],
  notes?: string
): WHO5Assessment {
  const rawScore = calculateWHO5RawScore(responses);
  const percentScore = calculateWHO5PercentScore(rawScore);
  const category = getWHO5Category(percentScore);

  return {
    id: `who5-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    timestamp: new Date().toISOString(),
    responses,
    rawScore,
    percentScore,
    category,
    notes
  };
}

// Helper to check if user should be prompted for check-in (once per day)
export function shouldPromptWHO5CheckIn(lastAssessment: WHO5Assessment | null): boolean {
  if (!lastAssessment) return true;

  const lastDate = new Date(lastAssessment.timestamp);
  const today = new Date();

  // Check if it's a different day
  return (
    lastDate.getFullYear() !== today.getFullYear() ||
    lastDate.getMonth() !== today.getMonth() ||
    lastDate.getDate() !== today.getDate()
  );
}

// Calculate trend direction over last N assessments
export function calculateWHO5Trend(
  assessments: WHO5Assessment[],
  count: number = 7
): 'improving' | 'stable' | 'declining' | 'insufficient_data' {
  if (assessments.length < 2) return 'insufficient_data';

  const recent = assessments.slice(0, Math.min(count, assessments.length));

  if (recent.length < 2) return 'insufficient_data';

  // Calculate average of first half vs second half
  const midpoint = Math.floor(recent.length / 2);
  const olderHalf = recent.slice(midpoint);
  const newerHalf = recent.slice(0, midpoint);

  const olderAvg = olderHalf.reduce((sum, a) => sum + a.percentScore, 0) / olderHalf.length;
  const newerAvg = newerHalf.reduce((sum, a) => sum + a.percentScore, 0) / newerHalf.length;

  const difference = newerAvg - olderAvg;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

// Get average score over time period
export function getAverageWHO5Score(
  assessments: WHO5Assessment[],
  days: number = 30
): number | null {
  if (assessments.length === 0) return null;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const relevantAssessments = assessments.filter(
    a => new Date(a.timestamp) >= cutoffDate
  );

  if (relevantAssessments.length === 0) return null;

  return Math.round(
    relevantAssessments.reduce((sum, a) => sum + a.percentScore, 0) / relevantAssessments.length
  );
}

// Points awarded for completing a check-in
export const WHO5_POINTS_REWARD = 15;
export const WHO5_XP_REWARD = 20;

// Streak bonuses
export const WHO5_STREAK_BONUSES = {
  7: { points: 50, xp: 75, badge: '7-Day Wellness Streak' },
  14: { points: 100, xp: 150, badge: '2-Week Wellness Warrior' },
  30: { points: 250, xp: 400, badge: 'Monthly Mindfulness Master' },
  90: { points: 750, xp: 1200, badge: 'Quarterly Wellness Champion' }
} as const;
