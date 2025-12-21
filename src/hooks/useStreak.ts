'use client';

import { useState, useEffect, useCallback } from 'react';

const STREAK_STORAGE_KEY = 'tribewellmd_streak';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO date string (date only, no time)
  todayXP: number;
  dailyGoalXP: number;
  totalXP: number;
  level: number;
  streakFreezes: number;
  usedFreezeToday: boolean;
  weeklyActivity: boolean[]; // Last 7 days, index 0 = today
  achievements: string[];
  // Village points from study activities
  totalVillagePoints: number;
  weeklyVillagePoints: number;
  lastVillagePointsReset: string | null;
}

const DEFAULT_DAILY_GOAL = 50; // XP needed per day

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday);
};

const calculateLevel = (totalXP: number): number => {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
  let level = 1;
  let xpRequired = 0;
  while (totalXP >= xpRequired) {
    level++;
    xpRequired += level * 50;
  }
  return level - 1;
};

const getXPForNextLevel = (level: number): number => {
  let xpRequired = 0;
  for (let i = 1; i <= level; i++) {
    xpRequired += i * 50;
  }
  return xpRequired;
};

const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - dayOfWeek;
  const weekStart = new Date(now.setDate(diff));
  return getDateString(weekStart);
};

const createDefaultStreak = (): StreakData => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  todayXP: 0,
  dailyGoalXP: DEFAULT_DAILY_GOAL,
  totalXP: 0,
  level: 1,
  streakFreezes: 2, // Start with 2 free streak freezes
  usedFreezeToday: false,
  weeklyActivity: [false, false, false, false, false, false, false],
  achievements: [],
  totalVillagePoints: 0,
  weeklyVillagePoints: 0,
  lastVillagePointsReset: getWeekStart()
});

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load and validate streak data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STREAK_STORAGE_KEY);
    let data: StreakData;

    if (saved) {
      data = JSON.parse(saved);
      const today = getDateString();
      const yesterday = getYesterday();

      // Check if we need to update the streak
      if (data.lastActivityDate !== today) {
        // Reset today's XP and freeze usage
        data.todayXP = 0;
        data.usedFreezeToday = false;

        // Shift weekly activity (new day)
        if (data.lastActivityDate) {
          const daysSinceActivity = Math.floor(
            (new Date(today).getTime() - new Date(data.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceActivity === 1) {
            // Normal progression - shift array
            data.weeklyActivity = [false, ...data.weeklyActivity.slice(0, 6)];
          } else if (daysSinceActivity > 1) {
            // Missed days - check if we should use freeze or break streak
            if (daysSinceActivity === 2 && data.streakFreezes > 0 && data.currentStreak > 0) {
              // Auto-use streak freeze for yesterday
              data.streakFreezes--;
              data.usedFreezeToday = false;
              data.weeklyActivity = [false, true, ...data.weeklyActivity.slice(0, 5)]; // Yesterday marked as frozen
            } else {
              // Streak broken
              data.currentStreak = 0;
              // Fill missed days with false
              const missedDays = Math.min(daysSinceActivity, 7);
              data.weeklyActivity = Array(missedDays).fill(false).concat(data.weeklyActivity).slice(0, 7);
            }
          }
        }
      }

      // Update level based on total XP
      data.level = calculateLevel(data.totalXP);
    } else {
      data = createDefaultStreak();
    }

    setStreakData(data);
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (streakData && typeof window !== 'undefined') {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
    }
  }, [streakData]);

  // Add XP (called when user completes activities)
  const addXP = useCallback((amount: number, source?: string) => {
    setStreakData(prev => {
      if (!prev) return prev;

      const today = getDateString();
      const wasGoalComplete = prev.todayXP >= prev.dailyGoalXP;
      const newTodayXP = prev.todayXP + amount;
      const isGoalComplete = newTodayXP >= prev.dailyGoalXP;
      const newTotalXP = prev.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);

      let newStreak = prev.currentStreak;
      let newLongestStreak = prev.longestStreak;
      const newWeeklyActivity = [...prev.weeklyActivity];
      const newAchievements = [...prev.achievements];

      // If this is the first activity today and goal wasn't complete before
      if (prev.lastActivityDate !== today || !wasGoalComplete) {
        if (isGoalComplete && !wasGoalComplete) {
          // Goal just completed - update streak
          if (prev.lastActivityDate === getYesterday() || prev.lastActivityDate === today) {
            newStreak = prev.currentStreak + (prev.lastActivityDate === today ? 0 : 1);
          } else if (prev.lastActivityDate === null) {
            newStreak = 1;
          }

          if (newStreak > newLongestStreak) {
            newLongestStreak = newStreak;
          }

          // Mark today as active
          newWeeklyActivity[0] = true;

          // Check for streak achievements
          if (newStreak === 7 && !newAchievements.includes('week-warrior')) {
            newAchievements.push('week-warrior');
          }
          if (newStreak === 30 && !newAchievements.includes('month-master')) {
            newAchievements.push('month-master');
          }
          if (newStreak === 100 && !newAchievements.includes('century-scholar')) {
            newAchievements.push('century-scholar');
          }
        }
      }

      // Check for level-up achievements
      if (newLevel > prev.level) {
        if (newLevel >= 5 && !newAchievements.includes('level-5')) {
          newAchievements.push('level-5');
        }
        if (newLevel >= 10 && !newAchievements.includes('level-10')) {
          newAchievements.push('level-10');
        }
      }

      // First activity achievement
      if (prev.totalXP === 0 && !newAchievements.includes('first-steps')) {
        newAchievements.push('first-steps');
      }

      // Calculate village points (study activities contribute to charity pool)
      // 10 XP = 1 village point (studying helps the community!)
      const villagePointsEarned = Math.floor(amount / 10);

      // Check if we need to reset weekly village points
      const currentWeekStart = getWeekStart();
      const shouldResetWeekly = prev.lastVillagePointsReset !== currentWeekStart;

      const newWeeklyVillagePoints = shouldResetWeekly
        ? villagePointsEarned
        : prev.weeklyVillagePoints + villagePointsEarned;

      return {
        ...prev,
        todayXP: newTodayXP,
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
        weeklyActivity: newWeeklyActivity,
        achievements: newAchievements,
        totalVillagePoints: prev.totalVillagePoints + villagePointsEarned,
        weeklyVillagePoints: newWeeklyVillagePoints,
        lastVillagePointsReset: currentWeekStart
      };
    });
  }, []);

  // Use a streak freeze manually
  const useStreakFreeze = useCallback(() => {
    setStreakData(prev => {
      if (!prev || prev.streakFreezes <= 0 || prev.usedFreezeToday) return prev;

      return {
        ...prev,
        streakFreezes: prev.streakFreezes - 1,
        usedFreezeToday: true
      };
    });
  }, []);

  // Add a streak freeze (earned through activities or purchases)
  const addStreakFreeze = useCallback(() => {
    setStreakData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        streakFreezes: Math.min(prev.streakFreezes + 1, 5) // Max 5 freezes
      };
    });
  }, []);

  // Set daily goal
  const setDailyGoal = useCallback((xp: number) => {
    setStreakData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        dailyGoalXP: Math.max(10, Math.min(200, xp)) // Between 10 and 200
      };
    });
  }, []);

  // Get progress percentage for daily goal
  const getDailyProgress = useCallback((): number => {
    if (!streakData) return 0;
    return Math.min(100, Math.round((streakData.todayXP / streakData.dailyGoalXP) * 100));
  }, [streakData]);

  // Get XP needed for next level
  const getXPToNextLevel = useCallback((): { current: number; needed: number; progress: number } => {
    if (!streakData) return { current: 0, needed: 100, progress: 0 };

    const currentLevelXP = getXPForNextLevel(streakData.level - 1);
    const nextLevelXP = getXPForNextLevel(streakData.level);
    const xpInCurrentLevel = streakData.totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    return {
      current: xpInCurrentLevel,
      needed: xpNeededForLevel,
      progress: Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
    };
  }, [streakData]);

  // Check if goal is complete for today
  const isGoalComplete = useCallback((): boolean => {
    if (!streakData) return false;
    return streakData.todayXP >= streakData.dailyGoalXP;
  }, [streakData]);

  return {
    streakData,
    isLoading,
    addXP,
    useStreakFreeze,
    addStreakFreeze,
    setDailyGoal,
    getDailyProgress,
    getXPToNextLevel,
    isGoalComplete
  };
}
