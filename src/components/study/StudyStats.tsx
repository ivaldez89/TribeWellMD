'use client';

import { useState, useEffect } from 'react';

// Types
interface StudyStats {
  currentStreak: number;
  longestStreak: number;
  totalCardsReviewed: number;
  totalStudyDays: number;
  lastStudyDate: string | null;
  weeklyActivity: number[]; // Last 7 days card counts
  achievements: Achievement[];
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string | null;
  requirement: number;
  type: 'cards' | 'streak' | 'days' | 'pomodoro';
}

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Card milestones
  { id: 'cards_10', name: 'Getting Started', description: 'Review 10 cards', emoji: '🌱', requirement: 10, type: 'cards' },
  { id: 'cards_50', name: 'Warming Up', description: 'Review 50 cards', emoji: '🔥', requirement: 50, type: 'cards' },
  { id: 'cards_100', name: 'Century Club', description: 'Review 100 cards', emoji: '💯', requirement: 100, type: 'cards' },
  { id: 'cards_250', name: 'Dedicated Learner', description: 'Review 250 cards', emoji: '📚', requirement: 250, type: 'cards' },
  { id: 'cards_500', name: 'Knowledge Seeker', description: 'Review 500 cards', emoji: '🎓', requirement: 500, type: 'cards' },
  { id: 'cards_1000', name: 'Card Master', description: 'Review 1,000 cards', emoji: '👑', requirement: 1000, type: 'cards' },
  { id: 'cards_2500', name: 'Legend', description: 'Review 2,500 cards', emoji: '🏆', requirement: 2500, type: 'cards' },
  
  // Streak milestones
  { id: 'streak_3', name: 'Three-peat', description: '3 day streak', emoji: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', emoji: '⚡', requirement: 7, type: 'streak' },
  { id: 'streak_14', name: 'Fortnight Focus', description: '14 day streak', emoji: '💪', requirement: 14, type: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', emoji: '🌟', requirement: 30, type: 'streak' },
  { id: 'streak_60', name: 'Unstoppable', description: '60 day streak', emoji: '🚀', requirement: 60, type: 'streak' },
  { id: 'streak_100', name: 'Centurion', description: '100 day streak', emoji: '👑', requirement: 100, type: 'streak' },
  
  // Study days
  { id: 'days_7', name: 'First Week', description: 'Study 7 total days', emoji: '📅', requirement: 7, type: 'days' },
  { id: 'days_30', name: 'Monthly Habit', description: 'Study 30 total days', emoji: '🗓️', requirement: 30, type: 'days' },
  
  // Pomodoro
  { id: 'pomo_1', name: 'Focused', description: 'Complete 1 pomodoro', emoji: '🍅', requirement: 1, type: 'pomodoro' },
  { id: 'pomo_10', name: 'Deep Work', description: 'Complete 10 pomodoros', emoji: '🧠', requirement: 10, type: 'pomodoro' },
  { id: 'pomo_50', name: 'Flow State', description: 'Complete 50 pomodoros', emoji: '🌊', requirement: 50, type: 'pomodoro' },
];

const XP_PER_CARD = 10;
const XP_PER_STREAK_DAY = 50;
const XP_PER_ACHIEVEMENT = 100;
const LEVEL_BASE_XP = 100;
const LEVEL_MULTIPLIER = 1.5;

function calculateLevel(xp: number): { level: number; currentLevelXp: number; xpToNext: number } {
  let level = 1;
  let totalXpNeeded = LEVEL_BASE_XP;
  let xpForCurrentLevel = 0;
  
  while (xp >= totalXpNeeded) {
    xpForCurrentLevel = totalXpNeeded;
    level++;
    totalXpNeeded += Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }
  
  const xpIntoCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1));
  
  return {
    level,
    currentLevelXp: xpIntoCurrentLevel,
    xpToNext: xpNeededForNextLevel
  };
}

// Get stats from localStorage
export function getStudyStats(): StudyStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }
  
  const stored = localStorage.getItem('step2_study_stats');
  if (stored) {
    return JSON.parse(stored);
  }
  return getDefaultStats();
}

function getDefaultStats(): StudyStats {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalCardsReviewed: 0,
    totalStudyDays: 0,
    lastStudyDate: null,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    achievements: ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
    level: 1,
    xp: 0,
    xpToNextLevel: LEVEL_BASE_XP
  };
}

// Save stats to localStorage
export function saveStudyStats(stats: StudyStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('step2_study_stats', JSON.stringify(stats));
  }
}

// Update stats when a card is reviewed
export function recordCardReview(): { stats: StudyStats; newAchievements: Achievement[] } {
  const stats = getStudyStats();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Update card count
  stats.totalCardsReviewed++;
  stats.xp += XP_PER_CARD;
  
  // Update streak
  if (stats.lastStudyDate === today) {
    // Already studied today, just increment cards
  } else if (stats.lastStudyDate === yesterday) {
    // Continuing streak
    stats.currentStreak++;
    stats.xp += XP_PER_STREAK_DAY;
    stats.totalStudyDays++;
  } else if (stats.lastStudyDate !== today) {
    // New streak or first time
    if (stats.lastStudyDate === null) {
      stats.currentStreak = 1;
    } else {
      // Streak broken
      stats.currentStreak = 1;
    }
    stats.totalStudyDays++;
  }
  
  stats.lastStudyDate = today;
  
  // Update longest streak
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  
  // Update weekly activity
  const dayOfWeek = new Date().getDay();
  stats.weeklyActivity[dayOfWeek]++;
  
  // Check for new achievements
  const newAchievements: Achievement[] = [];
  
  stats.achievements = stats.achievements.map(achievement => {
    if (achievement.unlockedAt) return achievement;
    
    let unlocked = false;
    
    switch (achievement.type) {
      case 'cards':
        unlocked = stats.totalCardsReviewed >= achievement.requirement;
        break;
      case 'streak':
        unlocked = stats.currentStreak >= achievement.requirement;
        break;
      case 'days':
        unlocked = stats.totalStudyDays >= achievement.requirement;
        break;
    }
    
    if (unlocked) {
      const unlockedAchievement = { ...achievement, unlockedAt: new Date().toISOString() };
      newAchievements.push(unlockedAchievement);
      stats.xp += XP_PER_ACHIEVEMENT;
      return unlockedAchievement;
    }
    
    return achievement;
  });
  
  // Recalculate level
  const levelInfo = calculateLevel(stats.xp);
  stats.level = levelInfo.level;
  stats.xpToNextLevel = levelInfo.xpToNext;
  
  saveStudyStats(stats);
  
  return { stats, newAchievements };
}

// Component to display stats
export function StudyStatsDisplay() {
  const [stats, setStats] = useState<StudyStats>(getDefaultStats());
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    setStats(getStudyStats());
  }, []);

  const unlockedAchievements = stats.achievements.filter(a => a.unlockedAt);
  const lockedAchievements = stats.achievements.filter(a => !a.unlockedAt);
  const levelInfo = calculateLevel(stats.xp);
  const levelProgress = (levelInfo.currentLevelXp / levelInfo.xpToNext) * 100;

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  
  // Reorder to show last 7 days ending with today
  const orderedActivity = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    orderedActivity.push({
      label: dayLabels[dayIndex],
      count: stats.weeklyActivity[dayIndex],
      isToday: i === 0
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Header with level */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            📊 Your Progress
          </h3>
          <p className="text-sm text-slate-500">Keep up the great work!</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">Lv.{stats.level}</span>
            <span className="text-sm text-slate-500">{stats.xp} XP</span>
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Level {stats.level}</span>
          <span>Level {stats.level + 1}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1 text-center">
          {levelInfo.currentLevelXp} / {levelInfo.xpToNext} XP to next level
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-600">
            {stats.currentStreak}
            {stats.currentStreak > 0 && <span className="text-base ml-1">🔥</span>}
          </p>
          <p className="text-xs text-slate-600">Day Streak</p>
        </div>
        <div className="text-center p-3 bg-tribe-sage-50 rounded-xl">
          <p className="text-2xl font-bold text-tribe-sage-600">{stats.totalCardsReviewed}</p>
          <p className="text-xs text-slate-600">Cards Reviewed</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{stats.totalStudyDays}</p>
          <p className="text-xs text-slate-600">Study Days</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-xl">
          <p className="text-2xl font-bold text-purple-600">{stats.longestStreak}</p>
          <p className="text-xs text-slate-600">Best Streak</p>
        </div>
      </div>

      {/* Weekly activity */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-2">This Week</h4>
        <div className="flex justify-between gap-1">
          {orderedActivity.map((day, i) => (
            <div key={i} className="flex-1 text-center">
              <div 
                className={`h-16 rounded-lg flex items-end justify-center pb-1 transition-all ${
                  day.count === 0 
                    ? 'bg-slate-100' 
                    : day.count < 10 
                      ? 'bg-emerald-200' 
                      : day.count < 30 
                        ? 'bg-emerald-400' 
                        : 'bg-tribe-sage-600'
                }`}
              >
                {day.count > 0 && (
                  <span className={`text-xs font-medium ${day.count >= 30 ? 'text-white' : 'text-emerald-900'}`}>
                    {day.count}
                  </span>
                )}
              </div>
              <span className={`text-xs ${day.isToday ? 'font-bold text-tribe-sage-600' : 'text-slate-400'}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-slate-700">
            Achievements ({unlockedAchievements.length}/{stats.achievements.length})
          </h4>
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            {showAllAchievements ? 'Show less' : 'Show all'}
          </button>
        </div>
        
        {/* Unlocked achievements */}
        <div className="flex flex-wrap gap-2 mb-2">
          {unlockedAchievements.map(achievement => (
            <div
              key={achievement.id}
              className="group relative px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full text-sm"
              title={achievement.description}
            >
              <span>{achievement.emoji} {achievement.name}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {achievement.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Locked achievements (when expanded) */}
        {showAllAchievements && lockedAchievements.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
            {lockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="group relative px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-400"
                title={achievement.description}
              >
                <span>🔒 {achievement.name}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {achievement.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Achievement unlock notification component
export function AchievementNotification({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
        <span className="text-4xl">{achievement.emoji}</span>
        <div>
          <p className="font-bold">Achievement Unlocked!</p>
          <p className="text-sm">{achievement.name}</p>
          <p className="text-xs opacity-75">{achievement.description}</p>
        </div>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}
