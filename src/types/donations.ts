// Donation and Impact Tracking Types

export interface DonationMilestone {
  id: string;
  villageId: string;
  pointsRequired: number;
  dollarsEquivalent: number;
  title: string;
  description: string;
  icon: string;
  celebrationMessage: string;
  unlockedAt?: string;
}

export interface DonationTransaction {
  id: string;
  villageId: string;
  userId: string;
  points: number;
  dollars: number;
  source: string;
  timestamp: string;
  isProcessed: boolean;
  processedAt?: string;
}

export interface VillageDonationStats {
  villageId: string;
  villageName: string;
  charityEIN: string;
  totalPointsEarned: number;
  totalDonated: number;
  pendingDonation: number;
  lastDonationDate?: string;
  memberCount: number;
  impactStatement?: string;
}

export interface UserDonationHistory {
  userId: string;
  totalPointsContributed: number;
  totalDonationsGenerated: number;
  villageContributions: {
    villageId: string;
    villageName: string;
    points: number;
    dollars: number;
  }[];
  milestonesUnlocked: string[];
  recentActivity: DonationTransaction[];
}

// Milestone definitions - unlocked as total platform donations grow
export const GLOBAL_MILESTONES: Omit<DonationMilestone, 'villageId' | 'unlockedAt'>[] = [
  {
    id: 'first-dollar',
    pointsRequired: 1000,
    dollarsEquivalent: 1,
    title: 'First Dollar',
    description: 'The community raised its first dollar!',
    icon: 'Sparkles',
    celebrationMessage: 'Every journey begins with a single step. You helped raise our first dollar!'
  },
  {
    id: 'ten-dollars',
    pointsRequired: 10000,
    dollarsEquivalent: 10,
    title: 'Building Momentum',
    description: '$10 donated to charity',
    icon: 'TrendingUp',
    celebrationMessage: 'Momentum is building! $10 going to amazing causes.'
  },
  {
    id: 'fifty-dollars',
    pointsRequired: 50000,
    dollarsEquivalent: 50,
    title: 'Making an Impact',
    description: '$50 donated to charity',
    icon: 'Heart',
    celebrationMessage: "That's real impact! $50 helping those in need."
  },
  {
    id: 'hundred-dollars',
    pointsRequired: 100000,
    dollarsEquivalent: 100,
    title: 'Century Club',
    description: '$100 donated to charity',
    icon: 'Award',
    celebrationMessage: 'Welcome to the Century Club! $100 donated and counting.'
  },
  {
    id: 'five-hundred-dollars',
    pointsRequired: 500000,
    dollarsEquivalent: 500,
    title: 'Community Champion',
    description: '$500 donated to charity',
    icon: 'Trophy',
    celebrationMessage: 'You are a Community Champion! $500 changing lives.'
  },
  {
    id: 'thousand-dollars',
    pointsRequired: 1000000,
    dollarsEquivalent: 1000,
    title: 'Philanthropist',
    description: '$1,000 donated to charity',
    icon: 'Star',
    celebrationMessage: 'Incredible! $1,000 donated through wellness activities.'
  },
  {
    id: 'five-thousand-dollars',
    pointsRequired: 5000000,
    dollarsEquivalent: 5000,
    title: 'Village Hero',
    description: '$5,000 donated to charity',
    icon: 'Crown',
    celebrationMessage: 'You are a Village Hero! $5,000 making a difference.'
  },
  {
    id: 'ten-thousand-dollars',
    pointsRequired: 10000000,
    dollarsEquivalent: 10000,
    title: 'Legend',
    description: '$10,000 donated to charity',
    icon: 'Zap',
    celebrationMessage: 'LEGENDARY! $10,000 donated through TribeWellMD!'
  }
];

// Personal milestones based on individual contribution
export const PERSONAL_MILESTONES: Omit<DonationMilestone, 'villageId' | 'unlockedAt'>[] = [
  {
    id: 'personal-first',
    pointsRequired: 100,
    dollarsEquivalent: 0.10,
    title: 'First Contribution',
    description: 'You earned your first 100 points',
    icon: 'Sparkles',
    celebrationMessage: 'Every point counts! You just started your impact journey.'
  },
  {
    id: 'personal-1k',
    pointsRequired: 1000,
    dollarsEquivalent: 1,
    title: 'Dollar Maker',
    description: 'Your points converted to $1',
    icon: 'DollarSign',
    celebrationMessage: 'Your wellness activities just generated $1 for charity!'
  },
  {
    id: 'personal-5k',
    pointsRequired: 5000,
    dollarsEquivalent: 5,
    title: 'High Five',
    description: '$5 generated from your points',
    icon: 'Hand',
    celebrationMessage: 'High five! $5 donated thanks to your dedication.'
  },
  {
    id: 'personal-10k',
    pointsRequired: 10000,
    dollarsEquivalent: 10,
    title: 'Ten Dollar Champion',
    description: '$10 generated from your points',
    icon: 'Award',
    celebrationMessage: 'Champion! You personally generated $10 for your Village.'
  },
  {
    id: 'personal-25k',
    pointsRequired: 25000,
    dollarsEquivalent: 25,
    title: 'Quarter Century',
    description: '$25 generated from your points',
    icon: 'Medal',
    celebrationMessage: '$25 and counting! Your wellness journey is changing lives.'
  },
  {
    id: 'personal-50k',
    pointsRequired: 50000,
    dollarsEquivalent: 50,
    title: 'Half Century',
    description: '$50 generated from your points',
    icon: 'Star',
    celebrationMessage: 'Amazing! $50 donated through your personal efforts.'
  },
  {
    id: 'personal-100k',
    pointsRequired: 100000,
    dollarsEquivalent: 100,
    title: 'Centurion',
    description: '$100 generated from your points',
    icon: 'Crown',
    celebrationMessage: 'You are a Centurion! $100 from your wellness activities.'
  }
];

// Conversion rate
export const POINTS_PER_DOLLAR = 1000;

// Helper functions
export function pointsToDollars(points: number): number {
  return points / POINTS_PER_DOLLAR;
}

export function dollarsToPoints(dollars: number): number {
  return dollars * POINTS_PER_DOLLAR;
}

export function formatDonation(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-US').format(points);
}

export function getNextMilestone(
  currentPoints: number,
  milestones: Omit<DonationMilestone, 'villageId' | 'unlockedAt'>[]
): Omit<DonationMilestone, 'villageId' | 'unlockedAt'> | null {
  const sorted = [...milestones].sort((a, b) => a.pointsRequired - b.pointsRequired);
  return sorted.find(m => m.pointsRequired > currentPoints) || null;
}

export function getUnlockedMilestones(
  currentPoints: number,
  milestones: Omit<DonationMilestone, 'villageId' | 'unlockedAt'>[]
): Omit<DonationMilestone, 'villageId' | 'unlockedAt'>[] {
  return milestones.filter(m => m.pointsRequired <= currentPoints);
}

export function getMilestoneProgress(
  currentPoints: number,
  milestone: Omit<DonationMilestone, 'villageId' | 'unlockedAt'>
): number {
  return Math.min((currentPoints / milestone.pointsRequired) * 100, 100);
}
