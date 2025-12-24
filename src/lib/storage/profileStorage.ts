// User Profile Types and Storage

export type UserRole = 'premed' | 'medical-student' | 'resident' | 'fellow' | 'attending' | 'institution';

// Wellness Wheel dimensions
export type WellnessDimension =
  | 'emotional'
  | 'environmental'
  | 'financial'
  | 'intellectual'
  | 'occupational'
  | 'physical'
  | 'social'
  | 'spiritual';

export const WELLNESS_DIMENSIONS: { id: WellnessDimension; label: string; description: string; icon: string }[] = [
  { id: 'emotional', label: 'Emotional', description: 'Managing stress, expressing feelings, self-care', icon: 'Heart' },
  { id: 'environmental', label: 'Environmental', description: 'Healthy living spaces, sustainability, nature', icon: 'Leaf' },
  { id: 'financial', label: 'Financial', description: 'Budgeting, debt management, financial planning', icon: 'DollarSign' },
  { id: 'intellectual', label: 'Intellectual', description: 'Learning, creativity, critical thinking', icon: 'Brain' },
  { id: 'occupational', label: 'Occupational', description: 'Career satisfaction, work-life balance', icon: 'Briefcase' },
  { id: 'physical', label: 'Physical', description: 'Exercise, nutrition, sleep, preventive care', icon: 'Activity' },
  { id: 'social', label: 'Social', description: 'Relationships, community, communication', icon: 'Users' },
  { id: 'spiritual', label: 'Spiritual', description: 'Purpose, meaning, values, mindfulness', icon: 'Sparkles' },
];

// General interest categories (non-medical)
export const GENERAL_INTERESTS = [
  'Reading & Writing',
  'Music & Arts',
  'Sports & Fitness',
  'Cooking & Food',
  'Travel & Adventure',
  'Technology & Gaming',
  'Movies & TV',
  'Photography',
  'Volunteering',
  'Hiking & Outdoors',
  'Yoga & Meditation',
  'Languages & Culture',
  'Pets & Animals',
  'Podcasts',
  'Board Games',
  'Fashion & Style',
  'DIY & Crafts',
  'Investing',
  'Startups & Entrepreneurship',
  'Comedy & Humor',
];

// Village membership (charity association)
export interface VillageMembership {
  villageId: string; // Charity ID from charities.ts
  joinedAt: string;
  totalPointsContributed: number; // Points contributed to this village (stays even if user leaves)
  isActive: boolean; // Current active membership
}

export interface UserProfile {
  id: string;
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string; // Base64 or URL
  emailVerified?: boolean; // Has user verified their .edu email

  // Role (primary user type)
  role?: UserRole;

  // Academic Info
  school?: string; // School display name (for backward compatibility)
  schoolId?: string; // Reference to school in schools.ts
  schoolType?: 'md' | 'do' | 'undergrad' | 'caribbean' | 'international';
  graduationYear?: number;
  currentYear?: 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'Resident' | 'Fellow' | 'Attending' | 'Pre-Med' | 'Other';

  // Resident/Fellow specific
  pgyYear?: string;

  // Institution specific
  jobTitle?: string;

  // Village Membership (charity affiliation)
  currentVillageId?: string; // Current active village
  villageHistory?: VillageMembership[]; // History of all village memberships

  // Interests - Expanded for connection matching
  wellnessInterests?: WellnessDimension[]; // Which wellness dimensions they focus on
  interestedSpecialties?: string[]; // Medical specialties
  interestedResidencies?: string[]; // Residency programs of interest
  generalInterests?: string[]; // Non-medical hobbies and interests

  studyPreferences?: {
    preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    studyGoalMinutes?: number;
    prefersDarkMode?: boolean;
  };

  // Onboarding completion tracking
  onboardingCompleted?: boolean;
  onboardingStep?: 'role' | 'details' | 'village' | 'interests' | 'complete';

  // Social
  bio?: string;
  linkedIn?: string;
  twitter?: string;

  // Privacy Settings
  profileVisibility: 'public' | 'connections' | 'private';
  showStudyStats: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalCardsStudied: number;
  totalCasesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyMinutes: number;
  joinedDate: string;
}

const PROFILE_STORAGE_KEY_PREFIX = 'tribewellmd_user_profile_';
const STATS_STORAGE_KEY_PREFIX = 'tribewellmd_user_stats_';
const CURRENT_USER_KEY = 'tribewellmd_current_user_id';

// Legacy keys (for migration)
const LEGACY_PROFILE_KEY = 'tribewellmd_user_profile';
const LEGACY_STATS_KEY = 'tribewellmd_user_stats';

// Get the current user's storage key
function getProfileStorageKey(userId?: string): string {
  if (typeof window === 'undefined') return PROFILE_STORAGE_KEY_PREFIX;
  const id = userId || localStorage.getItem(CURRENT_USER_KEY);
  return id ? `${PROFILE_STORAGE_KEY_PREFIX}${id}` : LEGACY_PROFILE_KEY;
}

function getStatsStorageKey(userId?: string): string {
  if (typeof window === 'undefined') return STATS_STORAGE_KEY_PREFIX;
  const id = userId || localStorage.getItem(CURRENT_USER_KEY);
  return id ? `${STATS_STORAGE_KEY_PREFIX}${id}` : LEGACY_STATS_KEY;
}

// Set the current user ID (call this on login/signup)
export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

// Get the current user ID
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

// Clear current user session (call this on logout)
export function clearCurrentUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Clear legacy profile data (one-time cleanup)
export function clearLegacyProfileData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_PROFILE_KEY);
  localStorage.removeItem(LEGACY_STATS_KEY);
}

// Medical specialties for selection
export const MEDICAL_SPECIALTIES = [
  'Internal Medicine',
  'Family Medicine',
  'Pediatrics',
  'Surgery',
  'Emergency Medicine',
  'Psychiatry',
  'OB/GYN',
  'Neurology',
  'Radiology',
  'Anesthesiology',
  'Dermatology',
  'Ophthalmology',
  'Orthopedics',
  'Cardiology',
  'Oncology',
  'Pathology',
  'PM&R',
  'Urology',
  'ENT',
  'Undecided'
];

// Academic year options
export const ACADEMIC_YEARS = [
  { value: 'Pre-Med', label: 'Pre-Med' },
  { value: 'MS1', label: 'MS1 (First Year)' },
  { value: 'MS2', label: 'MS2 (Second Year)' },
  { value: 'MS3', label: 'MS3 (Third Year)' },
  { value: 'MS4', label: 'MS4 (Fourth Year)' },
  { value: 'Resident', label: 'Resident' },
  { value: 'Fellow', label: 'Fellow' },
  { value: 'Attending', label: 'Attending' },
  { value: 'Other', label: 'Other' },
];

// Create a default profile for new users
export function createDefaultProfile(): UserProfile {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    email: '',
    profileVisibility: 'connections',
    showStudyStats: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Get user profile from localStorage
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = getProfileStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

// Save user profile to localStorage
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = getProfileStorageKey();
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
}

// Update specific profile fields
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
  const currentProfile = getUserProfile();
  if (!currentProfile) {
    // Create new profile with updates
    const newProfile = { ...createDefaultProfile(), ...updates };
    saveUserProfile(newProfile);
    return newProfile;
  }

  const updatedProfile = { ...currentProfile, ...updates };
  saveUserProfile(updatedProfile);
  return updatedProfile;
}

// Get user stats from localStorage
export function getUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const storageKey = getStatsStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return getDefaultStats();
  } catch (error) {
    console.error('Error loading stats:', error);
    return getDefaultStats();
  }
}

function getDefaultStats(): UserStats {
  return {
    totalCardsStudied: 0,
    totalCasesCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyMinutes: 0,
    joinedDate: new Date().toISOString(),
  };
}

// Save user stats
export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = getStatsStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

// Check if user has completed profile setup
export function hasCompletedProfile(): boolean {
  const profile = getUserProfile();
  if (!profile) return false;
  return !!(profile.firstName && profile.lastName);
}

// Get user's display name
export function getDisplayName(): string {
  const profile = getUserProfile();
  if (!profile) return 'Student';
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  if (profile.firstName) return profile.firstName;
  return 'Student';
}

// Get user's initials for avatar
export function getUserInitials(): string {
  const profile = getUserProfile();
  if (!profile) return 'S';

  const first = profile.firstName?.[0] || '';
  const last = profile.lastName?.[0] || '';

  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  return 'S';
}

// ============================================
// Village (Charity) Membership Functions
// ============================================

// Join a village (charity) - points stay with village even if user leaves
export function joinVillage(villageId: string): boolean {
  const profile = getUserProfile();
  if (!profile) return false;

  const now = new Date().toISOString();
  const villageHistory = profile.villageHistory || [];

  // If user is already in this village, just make sure it's active
  const existingMembership = villageHistory.find(v => v.villageId === villageId);
  if (existingMembership) {
    // Reactivate if previously left
    existingMembership.isActive = true;
  } else {
    // Create new membership
    villageHistory.push({
      villageId,
      joinedAt: now,
      totalPointsContributed: 0,
      isActive: true,
    });
  }

  // Deactivate any other village memberships
  villageHistory.forEach(v => {
    if (v.villageId !== villageId) {
      v.isActive = false;
    }
  });

  updateUserProfile({
    currentVillageId: villageId,
    villageHistory,
  });

  return true;
}

// Leave current village (points stay behind)
export function leaveVillage(): boolean {
  const profile = getUserProfile();
  if (!profile || !profile.currentVillageId) return false;

  const villageHistory = profile.villageHistory || [];
  villageHistory.forEach(v => {
    if (v.villageId === profile.currentVillageId) {
      v.isActive = false;
    }
  });

  updateUserProfile({
    currentVillageId: undefined,
    villageHistory,
  });

  return true;
}

// Switch to a different village (points stay with old village)
export function switchVillage(newVillageId: string): boolean {
  const profile = getUserProfile();
  if (!profile) return false;

  // Just join the new village - it will handle deactivating the old one
  return joinVillage(newVillageId);
}

// Add points to current village
export function addPointsToVillage(points: number): boolean {
  const profile = getUserProfile();
  if (!profile || !profile.currentVillageId) return false;

  const villageHistory = profile.villageHistory || [];
  const currentMembership = villageHistory.find(v => v.villageId === profile.currentVillageId && v.isActive);

  if (currentMembership) {
    currentMembership.totalPointsContributed += points;
    updateUserProfile({ villageHistory });
    return true;
  }

  return false;
}

// Get user's current village ID
export function getCurrentVillageId(): string | undefined {
  const profile = getUserProfile();
  return profile?.currentVillageId;
}

// Get total points contributed to a specific village
export function getVillagePoints(villageId: string): number {
  const profile = getUserProfile();
  if (!profile) return 0;

  const membership = profile.villageHistory?.find(v => v.villageId === villageId);
  return membership?.totalPointsContributed || 0;
}

// Get total points contributed across all villages
export function getTotalPointsContributed(): number {
  const profile = getUserProfile();
  if (!profile || !profile.villageHistory) return 0;

  return profile.villageHistory.reduce((total, v) => total + v.totalPointsContributed, 0);
}

// Check if user has completed onboarding (including village selection)
export function hasCompletedOnboarding(): boolean {
  const profile = getUserProfile();
  if (!profile) return false;
  return profile.onboardingCompleted === true && !!profile.currentVillageId;
}
