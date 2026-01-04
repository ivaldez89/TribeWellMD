'use client';

import { useStreak } from '@/hooks/useStreak';
import { Icons } from '@/components/ui/Icons';
import { CheckCircleIcon } from '@/components/icons/MedicalIcons';
import { ToolPanel } from '@/components/panels/ToolPanel';

interface StreakPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Header icon (matches ToolPanel canonical style - green-600/green-400)
const StreakIcon = () => (
  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
  </svg>
);

export function StreakPanel({ isOpen, onClose }: StreakPanelProps) {
  const { streakData, isLoading, getDailyProgress, getXPToNextLevel, isGoalComplete } = useStreak();

  if (isLoading || !streakData) {
    return (
      <ToolPanel
        isOpen={isOpen}
        onClose={onClose}
        title="Streak"
        subtitle="Loading..."
        icon={<StreakIcon />}
        showFooter={false}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </ToolPanel>
    );
  }

  const dailyProgress = getDailyProgress();
  const levelProgress = getXPToNextLevel();
  const goalComplete = isGoalComplete();

  const hasStreak = streakData.currentStreak > 0;
  const isOnFire = streakData.currentStreak >= 7;

  return (
    <ToolPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Streak"
      subtitle={`${streakData.currentStreak} day streak`}
      icon={<StreakIcon />}
      shortcutKey="X"
      footerText="Keep studying to grow your streak"
    >
      {/* Weekly Activity */}
      <div className={`px-4 py-4 ${
        hasStreak
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}>
        <div className="flex justify-center gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const dayIndex = 6 - index;
            const isActive = streakData.weeklyActivity[dayIndex];
            const isToday = dayIndex === 0;

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] ${hasStreak ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}>{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : isToday
                      ? 'bg-green-200 dark:bg-green-800/50 text-green-700 dark:text-green-400 border-2 border-green-600'
                      : 'bg-white dark:bg-slate-700 text-slate-400'
                }`}>
                  {isActive && <CheckCircleIcon className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
        {streakData.longestStreak > 0 && (
          <p className="text-center mt-2 text-xs text-green-700 dark:text-green-400">
            Personal best: {streakData.longestStreak} days
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
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
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-green-600"
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
        <div className="p-4 bg-green-50 dark:bg-surface-muted rounded-xl border border-green-200 dark:border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
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
                  className="h-full bg-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Village Points */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 text-green-700 dark:text-green-400"><Icons.HeartHand /></span>
              <div>
                <div className="text-sm font-medium text-secondary">Village Points</div>
                <div className="text-xs text-content-muted">Your study helps the community</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
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
              <span className="w-6 h-6 text-green-600 dark:text-green-400"><Icons.Snowflake /></span>
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
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
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
    </ToolPanel>
  );
}

export default StreakPanel;
