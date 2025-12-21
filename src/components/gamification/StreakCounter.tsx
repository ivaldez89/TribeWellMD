'use client';

import { useState, useRef, useEffect } from 'react';
import { useStreak } from '@/hooks/useStreak';

interface StreakCounterProps {
  variant?: 'compact' | 'full';
  showDropdown?: boolean;
}

export function StreakCounter({ variant = 'compact', showDropdown = true }: StreakCounterProps) {
  const { streakData, isLoading, getDailyProgress, getXPToNextLevel, isGoalComplete } = useStreak();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading || !streakData) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const dailyProgress = getDailyProgress();
  const levelProgress = getXPToNextLevel();
  const goalComplete = isGoalComplete();

  // Determine streak status for styling
  const hasStreak = streakData.currentStreak > 0;
  const isOnFire = streakData.currentStreak >= 7;

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => showDropdown && setIsOpen(!isOpen)}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
            hasStreak
              ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 hover:from-orange-200 hover:to-amber-200 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {/* Fire icon with animation */}
          <div className={`relative ${isOnFire ? 'animate-pulse' : ''}`}>
            <span className={`text-lg ${hasStreak ? '' : 'grayscale opacity-50'}`}>
              {isOnFire ? '🔥' : '🔥'}
            </span>
            {isOnFire && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
          </div>

          {/* Streak count */}
          <span className={`text-sm font-bold ${
            hasStreak
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-slate-400 dark:text-slate-500'
          }`}>
            {streakData.currentStreak}
          </span>

          {/* Daily progress ring (mini) */}
          <div className="relative w-5 h-5">
            <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${dailyProgress * 0.5} 50`}
                strokeLinecap="round"
                className={goalComplete ? 'text-green-500' : 'text-amber-500'}
              />
            </svg>
            {goalComplete && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px]">✓</span>
            )}
          </div>
        </button>

        {/* Dropdown panel */}
        {isOpen && showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
            {/* Header with streak */}
            <div className={`p-4 ${
              hasStreak
                ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className={`text-4xl ${isOnFire ? 'animate-bounce' : ''}`}>
                    🔥
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{streakData.currentStreak}</div>
                    <div className="text-sm opacity-90">day streak</div>
                  </div>
                </div>
                {streakData.longestStreak > 0 && (
                  <div className="text-right">
                    <div className="text-xs opacity-75">Best</div>
                    <div className="text-lg font-bold">{streakData.longestStreak}</div>
                  </div>
                )}
              </div>

              {/* Weekly activity dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                  const dayIndex = 6 - index; // Reverse to show current day last
                  const isActive = streakData.weeklyActivity[dayIndex];
                  const isToday = dayIndex === 0;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/70">{day}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? 'bg-white text-orange-500'
                          : isToday
                            ? 'bg-white/30 text-white border-2 border-white/50'
                            : 'bg-white/20 text-white/50'
                      }`}>
                        {isActive ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Goal</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {streakData.todayXP} / {streakData.dailyGoalXP} XP
                </span>
              </div>
              <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    goalComplete
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500'
                  }`}
                  style={{ width: `${dailyProgress}%` }}
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
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{streakData.level}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Level {streakData.level}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {levelProgress.current} / {levelProgress.needed} XP
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${levelProgress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Freezes */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧊</span>
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Streak Freezes</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Protect your streak</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                        i < streakData.streakFreezes
                          ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {i < streakData.streakFreezes ? '❄️' : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats footer */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
              <div className="flex items-center justify-around text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{streakData.totalXP.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total XP</div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{streakData.achievements.length}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Achievements</div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{streakData.longestStreak}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Best Streak</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant (for profile page, etc.)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Same content as dropdown but always visible */}
      <div className={`p-6 ${
        hasStreak
          ? 'bg-gradient-to-br from-orange-500 to-amber-500'
          : 'bg-gradient-to-br from-slate-400 to-slate-500'
      }`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className={`text-5xl ${isOnFire ? 'animate-bounce' : ''}`}>
              🔥
            </div>
            <div>
              <div className="text-4xl font-bold">{streakData.currentStreak}</div>
              <div className="text-sm opacity-90">day streak</div>
            </div>
          </div>
          {streakData.longestStreak > 0 && (
            <div className="text-right">
              <div className="text-xs opacity-75">Personal Best</div>
              <div className="text-2xl font-bold">{streakData.longestStreak}</div>
            </div>
          )}
        </div>

        {/* Weekly activity dots */}
        <div className="flex justify-center gap-2 mt-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            const dayIndex = 6 - index;
            const isActive = streakData.weeklyActivity[dayIndex];
            const isToday = dayIndex === 0;

            return (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-white/70">{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? 'bg-white text-orange-500'
                    : isToday
                      ? 'bg-white/30 text-white border-2 border-white/50'
                      : 'bg-white/20 text-white/50'
                }`}>
                  {isActive ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest of the content */}
      <div className="p-6 space-y-6">
        {/* Daily Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">Daily Goal</span>
            <span className="text-slate-500 dark:text-slate-400">
              {streakData.todayXP} / {streakData.dailyGoalXP} XP
            </span>
          </div>
          <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                goalComplete
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>

        {/* Level & XP */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{streakData.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Level {streakData.level}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {levelProgress.current} / {levelProgress.needed} XP
              </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress.progress}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {streakData.totalXP.toLocaleString()} total XP
            </div>
          </div>
        </div>

        {/* Streak Freezes */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧊</span>
            <div>
              <div className="font-medium text-slate-700 dark:text-slate-300">Streak Freezes</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Auto-protect your streak</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  i < streakData.streakFreezes
                    ? 'bg-cyan-100 dark:bg-cyan-900/50'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                {i < streakData.streakFreezes ? '❄️' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
