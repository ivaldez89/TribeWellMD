'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type WHO5Assessment,
  WHO5_POINTS_REWARD,
  WHO5_XP_REWARD,
  WHO5_STREAK_BONUSES,
  shouldPromptWHO5CheckIn
} from '@/types/who5';

const WHO5_STORAGE_KEY = 'tribewellmd_who5_assessments';
const WHO5_STREAK_KEY = 'tribewellmd_who5_streak';

interface WHO5Streak {
  current: number;
  longest: number;
  lastCheckInDate: string | null;
}

export function useWHO5(userId: string | null) {
  const [assessments, setAssessments] = useState<WHO5Assessment[]>([]);
  const [streak, setStreak] = useState<WHO5Streak>({ current: 0, longest: 0, lastCheckInDate: null });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      const storageKey = `${WHO5_STORAGE_KEY}_${userId}`;
      const streakKey = `${WHO5_STREAK_KEY}_${userId}`;

      const savedAssessments = localStorage.getItem(storageKey);
      const savedStreak = localStorage.getItem(streakKey);

      if (savedAssessments) {
        setAssessments(JSON.parse(savedAssessments));
      }

      if (savedStreak) {
        const parsedStreak = JSON.parse(savedStreak) as WHO5Streak;
        // Check if streak should be reset (missed a day)
        const updatedStreak = checkAndUpdateStreak(parsedStreak);
        setStreak(updatedStreak);
        localStorage.setItem(streakKey, JSON.stringify(updatedStreak));
      }

      setIsLoading(false);
    }
  }, [userId]);

  // Check if streak should be reset
  const checkAndUpdateStreak = (currentStreak: WHO5Streak): WHO5Streak => {
    if (!currentStreak.lastCheckInDate) return currentStreak;

    const lastDate = new Date(currentStreak.lastCheckInDate);
    const today = new Date();

    // Reset to start of day for comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    // If more than 1 day has passed, reset streak
    if (diffDays > 1) {
      return {
        ...currentStreak,
        current: 0
      };
    }

    return currentStreak;
  };

  // Save assessment
  const saveAssessment = useCallback((assessment: WHO5Assessment) => {
    if (!userId) return { points: 0, xp: 0, streakBonus: null };

    const storageKey = `${WHO5_STORAGE_KEY}_${userId}`;
    const streakKey = `${WHO5_STREAK_KEY}_${userId}`;

    // Update assessments
    const newAssessments = [assessment, ...assessments];
    setAssessments(newAssessments);
    localStorage.setItem(storageKey, JSON.stringify(newAssessments));

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    let newStreak = { ...streak };

    if (streak.lastCheckInDate) {
      const lastDate = new Date(streak.lastCheckInDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak.current += 1;
        newStreak.longest = Math.max(newStreak.longest, newStreak.current);
      } else if (diffDays === 0) {
        // Same day - no change to streak (already checked in)
      } else {
        // Missed days - reset streak to 1
        newStreak.current = 1;
      }
    } else {
      // First check-in
      newStreak.current = 1;
      newStreak.longest = 1;
    }

    newStreak.lastCheckInDate = todayStr;
    setStreak(newStreak);
    localStorage.setItem(streakKey, JSON.stringify(newStreak));

    // Calculate rewards
    let points = WHO5_POINTS_REWARD;
    let xp = WHO5_XP_REWARD;
    let streakBonus: { points: number; xp: number; badge: string } | null = null;

    // Check for streak bonuses
    const streakMilestones = [90, 30, 14, 7] as const;
    for (const milestone of streakMilestones) {
      if (newStreak.current === milestone) {
        const bonus = WHO5_STREAK_BONUSES[milestone];
        points += bonus.points;
        xp += bonus.xp;
        streakBonus = bonus;
        break;
      }
    }

    return { points, xp, streakBonus };
  }, [userId, assessments, streak]);

  // Get latest assessment
  const getLatestAssessment = useCallback((): WHO5Assessment | null => {
    return assessments.length > 0 ? assessments[0] : null;
  }, [assessments]);

  // Check if should prompt for check-in
  const shouldPrompt = useCallback((): boolean => {
    return shouldPromptWHO5CheckIn(getLatestAssessment());
  }, [getLatestAssessment]);

  // Get assessments for a date range
  const getAssessmentsInRange = useCallback((days: number): WHO5Assessment[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return assessments.filter(a => new Date(a.timestamp) >= cutoffDate);
  }, [assessments]);

  // Delete all data (for account deletion)
  const clearAllData = useCallback(() => {
    if (!userId) return;

    const storageKey = `${WHO5_STORAGE_KEY}_${userId}`;
    const streakKey = `${WHO5_STREAK_KEY}_${userId}`;

    localStorage.removeItem(storageKey);
    localStorage.removeItem(streakKey);
    setAssessments([]);
    setStreak({ current: 0, longest: 0, lastCheckInDate: null });
  }, [userId]);

  return {
    assessments,
    streak,
    isLoading,
    saveAssessment,
    getLatestAssessment,
    shouldPrompt,
    getAssessmentsInRange,
    clearAllData
  };
}
