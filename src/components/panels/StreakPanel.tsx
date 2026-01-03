'use client';

import { useEffect } from 'react';
import { useStreak } from '@/hooks/useStreak';
import { Icons } from '@/components/ui/Icons';
import { CheckCircleIcon } from '@/components/icons/MedicalIcons';

interface StreakPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StreakPanel({ isOpen, onClose }: StreakPanelProps) {
  const { streakData, isLoading, getDailyProgress, getXPToNextLevel, isGoalComplete } = useStreak();

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (isLoading || !streakData) {
    return (
      <aside
        className={`fixed top-12 right-0 bottom-12 w-full sm:w-[380px] bg-surface border-l border-border shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </aside>
    );
  }

  const dailyProgress = getDailyProgress();
  const levelProgress = getXPToNextLevel();
  const goalComplete = isGoalComplete();

  const hasStreak = streakData.currentStreak > 0;
  const isOnFire = streakData.currentStreak >= 7;

  return (
    <aside
      className={`fixed top-12 right-0 bottom-12 w-full sm:w-[380px] bg-surface border-l border-border shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-border ${
        hasStreak
          ? 'bg-gradient-to-r from-orange-500 to-amber-500'
          : 'bg-gradient-to-r from-slate-400 to-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${isOnFire ? 'animate-pulse' : ''}`}>
            <Icons.Fire />
          </div>
          <div className="text-white">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="text-2xl">{streakData.currentStreak}</span>
              <span className="text-xs opacity-90">day streak</span>
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title="Close (Esc)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Weekly Activity */}
      <div className={`px-4 py-4 ${
        hasStreak
          ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}>
        <div className="flex justify-center gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const dayIndex = 6 - index;
            const isActive = streakData.weeklyActivity[dayIndex];
            const isToday = dayIndex === 0;

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] ${hasStreak ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : isToday
                      ? 'bg-orange-200 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400 border-2 border-orange-400'
                      : 'bg-white dark:bg-slate-700 text-slate-400'
                }`}>
                  {isActive && <CheckCircleIcon className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
        {streakData.longestStreak > 0 && (
          <p className="text-center mt-2 text-xs text-orange-600 dark:text-orange-400">
            Personal best: {streakData.longestStreak} days
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Daily Goal Progress */}
        <div className="p-4 bg-surface-muted rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary">Daily Goal</span>
            <span className="text-sm text-content-muted">
              {streakData.todayXP} / {streakData.dailyGoalXP} XP
            </span>
          </div>
          <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                goalComplete
                  ? 'bg-gradient-to-r from-green-400 to-tribe-sage-500'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(dailyProgress, 100)}%` }}
            />
          </div>
          {goalComplete && (
            <div className="flex items-center gap-1.5 mt-2 text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Goal complete! Great job!</span>
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="p-4 bg-surface-muted rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">{streakData.level}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-secondary">Level {streakData.level}</span>
                <span className="text-xs text-content-muted">
                  {levelProgress.current} / {levelProgress.needed} XP
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Village Points */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 text-tribe-sage-500"><Icons.HeartHand /></span>
              <div>
                <div className="text-sm font-medium text-secondary">Village Points</div>
                <div className="text-xs text-content-muted">Your study helps the community</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-tribe-sage-600 dark:text-tribe-sage-400">
                {(streakData.weeklyVillagePoints || 0).toLocaleString()}
              </div>
              <div className="text-xs text-content-muted">this week</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-content-muted">
            Every 10 XP = 1 Village Point toward charity
          </p>
        </div>

        {/* Streak Freezes */}
        <div className="p-4 bg-surface-muted rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 text-cyan-500"><Icons.Snowflake /></span>
              <div>
                <div className="text-sm font-medium text-secondary">Streak Freezes</div>
                <div className="text-xs text-content-muted">Protect your streak</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    i < streakData.streakFreezes
                      ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {i < streakData.streakFreezes && <Icons.Snowflake />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-surface-muted rounded-xl">
          <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-3">
            Lifetime Stats
          </h4>
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-xl font-bold text-secondary">{streakData.totalXP.toLocaleString()}</div>
              <div className="text-xs text-content-muted">Total XP</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="text-xl font-bold text-secondary">{streakData.achievements.length}</div>
              <div className="text-xs text-content-muted">Achievements</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="text-xl font-bold text-secondary">{streakData.longestStreak}</div>
              <div className="text-xs text-content-muted">Best Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30 flex items-center justify-between">
        <p className="text-[10px] text-content-muted">
          Keep studying to grow your streak
        </p>
        <p className="text-[10px] text-content-muted">
          <kbd className="px-1 py-0.5 bg-surface border border-border rounded font-mono text-[9px]">X</kbd> toggle
        </p>
      </div>
    </aside>
  );
}

export default StreakPanel;
