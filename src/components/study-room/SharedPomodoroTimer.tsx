'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerMode, TIMER_MODE_LABELS } from '@/types/studyRoom';

interface SharedPomodoroTimerProps {
  mode: TimerMode;
  remaining: number;
  duration: number;
  isRunning: boolean;
  progress: number;
  sessionsCompleted: number;
  isHost: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  onDurationChange?: (mode: TimerMode, minutes: number) => void;
  formatTime: (seconds: number) => string;
}

// Preset options for focus time (in minutes)
const FOCUS_PRESETS = [15, 25, 30, 45, 50, 60, 90];
const SHORT_BREAK_PRESETS = [5, 10, 15];
const LONG_BREAK_PRESETS = [15, 20, 30];

export function SharedPomodoroTimer({
  mode,
  remaining,
  duration,
  isRunning,
  progress,
  sessionsCompleted,
  isHost,
  onStart,
  onPause,
  onReset,
  onModeChange,
  onDurationChange,
  formatTime,
}: SharedPomodoroTimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get current duration in minutes
  const currentMinutes = Math.round(duration / 60);

  // Get colors based on mode
  const getModeColors = () => {
    switch (mode) {
      case 'focus':
        return {
          bg: 'from-rose-500 to-red-600',
          ring: 'stroke-rose-500',
          text: 'text-rose-500',
          tab: 'bg-rose-500',
        };
      case 'shortBreak':
        return {
          bg: 'from-emerald-500 to-green-600',
          ring: 'stroke-emerald-500',
          text: 'text-emerald-500',
          tab: 'bg-emerald-500',
        };
      case 'longBreak':
        return {
          bg: 'from-blue-500 to-indigo-600',
          ring: 'stroke-blue-500',
          text: 'text-blue-500',
          tab: 'bg-blue-500',
        };
    }
  };

  const colors = getModeColors();

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  }, []);

  // Play sound when timer completes
  useEffect(() => {
    if (remaining === 0 && !isRunning) {
      playNotificationSound();
    }
  }, [remaining, isRunning, playNotificationSound]);

  // SVG circle properties
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => isHost && onModeChange(m)}
            disabled={!isHost || isRunning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? `${colors.tab} text-white shadow-md`
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            } ${!isHost || isRunning ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {TIMER_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Background circle */}
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${colors.ring} transition-all duration-1000`}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${colors.text} dark:text-white tabular-nums`}>
              {formatTime(remaining)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {TIMER_MODE_LABELS[mode]}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-4">
        {isHost ? (
          <>
            {isRunning ? (
              <button
                onClick={onPause}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </button>
            ) : (
              <button
                onClick={onStart}
                className={`px-6 py-3 bg-gradient-to-r ${colors.bg} text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start
              </button>
            )}

            <button
              onClick={onReset}
              disabled={isRunning}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Timer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </>
        ) : (
          <div className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-sm">
            {isRunning ? 'Timer running...' : 'Waiting for host to start'}
          </div>
        )}
      </div>

      {/* Session Counter & Settings */}
      <div className="flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
          <span>🍅</span>
          <span>{sessionsCompleted} Pomodoro{sessionsCompleted !== 1 ? 's' : ''}</span>
        </span>

        {isHost && onDurationChange && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isRunning}
            className={`p-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Timer Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isHost && onDurationChange && !isRunning && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Timer Duration
          </h4>

          {/* Focus Time */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
              Focus Time
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    onDurationChange('focus', mins);
                    if (mode === 'focus') onReset();
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    mode === 'focus' && currentMinutes === mins
                      ? 'bg-rose-500 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Short Break */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
              Short Break
            </label>
            <div className="flex flex-wrap gap-2">
              {SHORT_BREAK_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    onDurationChange('shortBreak', mins);
                    if (mode === 'shortBreak') onReset();
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    mode === 'shortBreak' && currentMinutes === mins
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Long Break */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
              Long Break
            </label>
            <div className="flex flex-wrap gap-2">
              {LONG_BREAK_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    onDurationChange('longBreak', mins);
                    if (mode === 'longBreak') onReset();
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    mode === 'longBreak' && currentMinutes === mins
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Host indicator */}
      {!isHost && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
          Only the host can control the timer
        </p>
      )}
    </div>
  );
}
